import { BN, Program } from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { AccountMeta, PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY, TransactionInstruction } from "@solana/web3.js";
import { PsyAmerican } from "../psyAmericanTypes";
import { feeAmountPerContract, FEE_OWNER_KEY } from "../fees";
import { OptionMarketWithKey } from "../types"


/**
 * Exercise OptionTokens you're holding
 * 
 * @param program - Anchor Program for Psy American
 * @param size - The amount of options to exercise
 * @param optionMarket - The OptionMarket data from the chain for the options to exercise
 * @param exerciserOptionTokenSrc - The SPL Token address holding the OptionTokens
 * @param underlyingAssetDest - The SPL Token address where the underlying assets will be sent
 * @param quoteAssetSrc - The SPL Token address holding the quote asset used to exercise
 * @param opts 
 * @returns 
 */
export const exerciseOptionsInstruction = async (
  program: Program<PsyAmerican>,
  size: BN,
  optionMarket: OptionMarketWithKey,
  exerciserOptionTokenSrc: PublicKey,
  underlyingAssetDest: PublicKey,
  quoteAssetSrc: PublicKey,
  opts: {
    /** The authority account that owns the options */
    optionAuthority?: PublicKey
  } = {}
): Promise<TransactionInstruction> => {
  let exerciseFeeKey: PublicKey;
  let remainingAccounts: AccountMeta[] = [];

  const exerciseFeePerContract = feeAmountPerContract(optionMarket.quoteAmountPerContract);
  if (exerciseFeePerContract.gtn(0)) {
    exerciseFeeKey = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      optionMarket.quoteAssetMint,
      FEE_OWNER_KEY
    );
    remainingAccounts = [
      {
        pubkey: exerciseFeeKey,
        isWritable: true,
        isSigner: false,
      },
    ];
  }
  return program.instruction.exerciseOption(size, {
    accounts: {
      // @ts-ignore
      userAuthority: program.provider.wallet.publicKey,
      // @ts-ignore
      optionAuthority: opts.optionAuthority || program.provider.wallet.publicKey,
      optionMarket: optionMarket.key,
      optionMint: optionMarket.optionMint,
      exerciserOptionTokenSrc,
      underlyingAssetPool: optionMarket.underlyingAssetPool,
      underlyingAssetDest,
      quoteAssetPool: optionMarket.quoteAssetPool,
      quoteAssetSrc,
      feeOwner: FEE_OWNER_KEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      clock: SYSVAR_CLOCK_PUBKEY,
    },
    remainingAccounts,
  });
}


/**
 * Exercise OptionTokens you're holding without fees!
 * 
 * @param program - Anchor Program for Psy American
 * @param size - The amount of options to exercise
 * @param optionMarket - The OptionMarket data from the chain for the options to exercise
 * @param exerciserOptionTokenSrc - The SPL Token address holding the OptionTokens
 * @param underlyingAssetDest - The SPL Token address where the underlying assets will be sent
 * @param quoteAssetSrc - The SPL Token address holding the quote asset used to exercise
 * @param opts 
 * @returns 
 */
 export const exerciseOptionsV2Instruction = (
  program: Program<PsyAmerican>,
  size: BN,
  optionMarket: OptionMarketWithKey,
  exerciserOptionTokenSrc: PublicKey,
  underlyingAssetDest: PublicKey,
  quoteAssetSrc: PublicKey,
  opts: {
    /** The authority account that owns the options */
    optionAuthority?: PublicKey
  } = {}
): TransactionInstruction => {

  return program.instruction.exerciseOptionV2(size, {
    accounts: {
      // @ts-ignore
      userAuthority: program.provider.wallet.publicKey,
      // @ts-ignore
      optionAuthority: opts.optionAuthority || program.provider.wallet.publicKey,
      optionMarket: optionMarket.key,
      optionMint: optionMarket.optionMint,
      exerciserOptionTokenSrc,
      underlyingAssetPool: optionMarket.underlyingAssetPool,
      underlyingAssetDest,
      quoteAssetPool: optionMarket.quoteAssetPool,
      quoteAssetSrc,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });
}