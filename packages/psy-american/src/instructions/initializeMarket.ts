import * as anchor from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  AccountMeta,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import { PsyAmerican } from "../psyAmericanTypes";
import { feeAmountPerContract, FEE_OWNER_KEY } from "../fees";
import {
  deriveOptionKeyFromParams,
  getOrAddAssociatedTokenAccountTx,
} from "../utils";

/**
 * Initialize a new OptionMarket
 *
 * @param program - The Psy American program
 * @param connection - Solana connection
 * @param params
 * @returns
 */
// Should probably dedupe the code between these functions
export const initializeOptionInstruction = async (
  program: anchor.Program<PsyAmerican>,
  {
    expirationUnixTimestamp,
    quoteAmountPerContract,
    quoteMint,
    underlyingAmountPerContract,
    underlyingMint,
  }: {
    /** The option market expiration timestamp in seconds */
    expirationUnixTimestamp: anchor.BN
    /** The quote amount per contract for the OptionMarket
     * Strike price is derived from underlyingAmountPerContract & quoteAmountPerContract */
    quoteAmountPerContract: anchor.BN
    /** The quote asset mint */
    quoteMint: PublicKey
    /** The underlying amount per contract for the OptionMarket. *
     * Strike price is derived from underlyingAmountPerContract & quoteAmountPerContract */
    underlyingAmountPerContract: anchor.BN
    /** The underlying mint address */
    underlyingMint: PublicKey
  }
): Promise<{
  optionMarketKey: PublicKey
  optionMintKey: PublicKey
  quoteAssetPoolKey: PublicKey
  tx: TransactionInstruction
  underlyingAssetPoolKey: PublicKey
  writerMintKey: PublicKey
}> => {
  const textEncoder = new TextEncoder()

  // generate Program Derived Address for the new option
  const [optionMarketKey, bumpSeed] = await deriveOptionKeyFromParams({
    programId: program.programId,
    underlyingMint,
    quoteMint,
    underlyingAmountPerContract,
    quoteAmountPerContract,
    expirationUnixTimestamp,
  })

  // generate Program Derived Address for the Option Token
  const [optionMintKey] = await anchor.web3.PublicKey.findProgramAddress(
    [optionMarketKey.toBuffer(), textEncoder.encode('optionToken')],
    program.programId
  )
  // generate Program Derived Address for the Writer Token
  const [writerMintKey] = await anchor.web3.PublicKey.findProgramAddress(
    [optionMarketKey.toBuffer(), textEncoder.encode('writerToken')],
    program.programId
  )

  // generate Program Derived Address for the vault that will hold the quote asset
  const [quoteAssetPoolKey] = await anchor.web3.PublicKey.findProgramAddress(
    [optionMarketKey.toBuffer(), textEncoder.encode('quoteAssetPool')],
    program.programId
  )

  // generate Program Derived Address for the vault that will hold the underlying asset
  const [
    underlyingAssetPoolKey,
  ] = await anchor.web3.PublicKey.findProgramAddress(
    [optionMarketKey.toBuffer(), textEncoder.encode('underlyingAssetPool')],
    program.programId
  )

  // Determine whether the mint/exercise fee accounts need to be initialized.
  // Add the instructions and necessary accounts if the accounts need to
  // be created.
  const remainingAccounts: AccountMeta[] = []
  const instructions: TransactionInstruction[] = []
  const mintFeePerContract = feeAmountPerContract(underlyingAmountPerContract)
  if (mintFeePerContract.gtn(0)) {
    const mintFeeKey = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      underlyingMint,
      FEE_OWNER_KEY
    )
    remainingAccounts.push({
      pubkey: mintFeeKey,
      isWritable: true,
      isSigner: false,
    })
    const ix = await getOrAddAssociatedTokenAccountTx(
      mintFeeKey,
      underlyingMint,
      program.provider,
      FEE_OWNER_KEY
    )
    if (ix) {
      instructions.push(ix)
    }
  }

  const exerciseFeePerContract = feeAmountPerContract(quoteAmountPerContract)
  if (exerciseFeePerContract.gtn(0)) {
    const exerciseFeeKey = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      quoteMint,
      FEE_OWNER_KEY
    )
    remainingAccounts.push({
      pubkey: exerciseFeeKey,
      isWritable: false,
      isSigner: false,
    })
    const ix = await getOrAddAssociatedTokenAccountTx(
      exerciseFeeKey,
      quoteMint,
      program.provider,
      FEE_OWNER_KEY
    )
    if (ix) {
      instructions.push(ix)
    }
  }

  const tx = await program.instruction.initializeMarket(
    underlyingAmountPerContract,
    quoteAmountPerContract,
    expirationUnixTimestamp,
    bumpSeed,
    {
      accounts: {
        // @ts-ignore
        authority: program.provider.wallet.publicKey,
        feeOwner: FEE_OWNER_KEY,
        optionMarket: optionMarketKey,
        optionMint: optionMintKey,
        quoteAssetMint: quoteMint,
        quoteAssetPool: quoteAssetPoolKey,
        underlyingAssetMint: underlyingMint,
        underlyingAssetPool: underlyingAssetPoolKey,
        writerTokenMint: writerMintKey,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        clock: SYSVAR_CLOCK_PUBKEY,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      instructions: instructions.length ? instructions : undefined,
      remainingAccounts,
    }
  )

  return {
    optionMarketKey,
    optionMintKey,
    quoteAssetPoolKey,
    tx,
    underlyingAssetPoolKey,
    writerMintKey,
  }
}

/**
 * Initialize a new OptionMarket
 *
 * @param program - The Psy American program 
 * @param connection - Solana connection 
 * @param params 
 * @returns
 */
export const initializeMarket = async (
  program: anchor.Program<PsyAmerican>,
  {
    expirationUnixTimestamp,
    quoteAmountPerContract,
    quoteMint,
    underlyingAmountPerContract,
    underlyingMint,
  }: {
    /** The option market expiration timestamp in seconds */
    expirationUnixTimestamp: anchor.BN;
    /** The quote amount per contract for the OptionMarket 
     * Strike price is derived from underlyingAmountPerContract & quoteAmountPerContract */
    quoteAmountPerContract: anchor.BN;
    /** The quote asset mint */
    quoteMint: PublicKey;
    /** The underlying amount per contract for the OptionMarket. *
     * Strike price is derived from underlyingAmountPerContract & quoteAmountPerContract */
    underlyingAmountPerContract: anchor.BN;
    /** The underlying mint address */
    underlyingMint: PublicKey;
  }
): Promise<{
  optionMarketKey: PublicKey;
  optionMintKey: PublicKey;
  quoteAssetPoolKey: PublicKey;
  tx: string;
  underlyingAssetPoolKey: PublicKey;
  writerMintKey: PublicKey;
}> => {
  const textEncoder = new TextEncoder();

  // generate Program Derived Address for the new option
  const [optionMarketKey, bumpSeed] = await deriveOptionKeyFromParams({
    programId: program.programId,
    underlyingMint,
    quoteMint,
    underlyingAmountPerContract,
    quoteAmountPerContract,
    expirationUnixTimestamp,
  });

  // generate Program Derived Address for the Option Token
  const [optionMintKey] = await anchor.web3.PublicKey.findProgramAddress(
    [optionMarketKey.toBuffer(), textEncoder.encode("optionToken")],
    program.programId
  );
  // generate Program Derived Address for the Writer Token
  const [writerMintKey] = await anchor.web3.PublicKey.findProgramAddress(
    [optionMarketKey.toBuffer(), textEncoder.encode("writerToken")],
    program.programId
  );

  // generate Program Derived Address for the vault that will hold the quote asset
  const [quoteAssetPoolKey] = await anchor.web3.PublicKey.findProgramAddress(
    [optionMarketKey.toBuffer(), textEncoder.encode("quoteAssetPool")],
    program.programId
  );

  // generate Program Derived Address for the vault that will hold the underlying asset
  const [underlyingAssetPoolKey] =
    await anchor.web3.PublicKey.findProgramAddress(
      [optionMarketKey.toBuffer(), textEncoder.encode("underlyingAssetPool")],
      program.programId
    );

  // Determine whether the mint/exercise fee accounts need to be initialized.
  // Add the instructions and necessary accounts if the accounts need to
  // be created.
  const remainingAccounts: AccountMeta[] = [];
  const instructions: TransactionInstruction[] = [];
  const mintFeePerContract = feeAmountPerContract(underlyingAmountPerContract);
  if (mintFeePerContract.gtn(0)) {
    const mintFeeKey = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      underlyingMint,
      FEE_OWNER_KEY
    );
    remainingAccounts.push({
      pubkey: mintFeeKey,
      isWritable: true,
      isSigner: false,
    });
    const mintFeeAccount = await program.provider.connection.getAccountInfo(
      mintFeeKey
    );
    if (!mintFeeAccount) {
    }
    const ix = await getOrAddAssociatedTokenAccountTx(
      mintFeeKey,
      underlyingMint,
      program.provider,
      FEE_OWNER_KEY
    );
    if (ix) {
      instructions.push(ix);
    }
  }

  const exerciseFeePerContract = feeAmountPerContract(quoteAmountPerContract);
  if (exerciseFeePerContract.gtn(0)) {
    const exerciseFeeKey = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      quoteMint,
      FEE_OWNER_KEY
    );
    remainingAccounts.push({
      pubkey: exerciseFeeKey,
      isWritable: false,
      isSigner: false,
    });
    const ix = await getOrAddAssociatedTokenAccountTx(
      exerciseFeeKey,
      quoteMint,
      program.provider,
      FEE_OWNER_KEY
    );
    if (ix) {
      instructions.push(ix);
    }
  }

  const tx = await program.rpc.initializeMarket(
    underlyingAmountPerContract,
    quoteAmountPerContract,
    expirationUnixTimestamp,
    bumpSeed,
    {
      accounts: {
        // @ts-ignore
        authority: program.provider.wallet.publicKey,
        feeOwner: FEE_OWNER_KEY,
        optionMarket: optionMarketKey,
        optionMint: optionMintKey,
        quoteAssetMint: quoteMint,
        quoteAssetPool: quoteAssetPoolKey,
        underlyingAssetMint: underlyingMint,
        underlyingAssetPool: underlyingAssetPoolKey,
        writerTokenMint: writerMintKey,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        clock: SYSVAR_CLOCK_PUBKEY,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      instructions: instructions.length ? instructions : undefined,
      remainingAccounts,
    }
  );

  return {
    optionMarketKey,
    optionMintKey,
    quoteAssetPoolKey,
    tx,
    underlyingAssetPoolKey,
    writerMintKey,
  };
};
