import { BN, Program } from "@project-serum/anchor";
import { MARKET_STATE_LAYOUT_V3 } from "@project-serum/serum";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  Signer,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import { getVaultOwnerAndNonce } from "../utils";

const textEncoder = new TextEncoder();
// b"open-orders-init"
const OPEN_ORDERS_INIT_SEED = textEncoder.encode("open-orders-init");

export const initializeSerumMarket = async (
  program: Program,
  {
    asks,
    bids,
    eventQueue,
    optionMarketKey,
    optionMint,
    pcDustThreshold,
    pcLotSize,
    pcMint,
    serumProgramKey,
  }: {
    eventQueue?: PublicKey;
    bids?: PublicKey;
    asks?: PublicKey;
    optionMarketKey: PublicKey;
    optionMint: PublicKey;
    pcDustThreshold: BN;
    pcLotSize: BN;
    pcMint: PublicKey;
    serumProgramKey: PublicKey;
  }
): Promise<{
  marketAuthority: PublicKey;
  serumMarketKey: PublicKey;
  tx: string;
}> => {
  const [requestQueue] = await PublicKey.findProgramAddress(
    [optionMarketKey.toBuffer(), textEncoder.encode("requestQueue")],
    program.programId
  );
  const [coinVault] = await PublicKey.findProgramAddress(
    [optionMarketKey.toBuffer(), textEncoder.encode("coinVault")],
    program.programId
  );
  const [pcVault] = await PublicKey.findProgramAddress(
    [optionMarketKey.toBuffer(), textEncoder.encode("pcVault")],
    program.programId
  );

  const { serumMarketKey, marketAuthority } =
    await getMarketAndAuthorityInfo(program, optionMarketKey, serumProgramKey);
  const [vaultOwner, vaultSignerNonce] = await getVaultOwnerAndNonce(
    serumMarketKey,
    serumProgramKey
  );

  // Create the optional accounts
  const instructions: TransactionInstruction[] = [];
  const signers: Signer[] = [];
  if (!eventQueue) {
    const eventQueueKeys = new Keypair();
    eventQueue = eventQueueKeys.publicKey;
    const ix = SystemProgram.createAccount({
      fromPubkey: program.provider.wallet.publicKey,
      newAccountPubkey: eventQueue,
      lamports:
        await program.provider.connection.getMinimumBalanceForRentExemption(
          262144 + 12
        ),
      space: 262144 + 12,
      programId: serumProgramKey,
    });
    instructions.push(ix);
    signers.push(eventQueueKeys);
  }

  if (!bids) {
    const bidsKeys = new Keypair();
    bids = bidsKeys.publicKey;
    const ix = SystemProgram.createAccount({
      fromPubkey: program.provider.wallet.publicKey,
      newAccountPubkey: bids,
      lamports:
        await program.provider.connection.getMinimumBalanceForRentExemption(
          65536 + 12
        ),
      space: 65536 + 12,
      programId: serumProgramKey,
    });
    instructions.push(ix);
    signers.push(bidsKeys);
  }

  if (!asks) {
    const asksKeys = new Keypair();
    asks = asksKeys.publicKey;
    const ix = SystemProgram.createAccount({
      fromPubkey: program.provider.wallet.publicKey,
      newAccountPubkey: asks,
      lamports:
        await program.provider.connection.getMinimumBalanceForRentExemption(
          65536 + 12
        ),
      space: 65536 + 12,
      programId: serumProgramKey,
    });
    instructions.push(ix);
    signers.push(asksKeys);
  }

  // Options are only tradeable in increments of 1.
  const coinLotSize = new BN(1);

  const tx = await program.rpc.initSerumMarket(
    new BN(MARKET_STATE_LAYOUT_V3.span),
    vaultSignerNonce,
    coinLotSize,
    pcLotSize,
    pcDustThreshold,
    {
      accounts: {
        userAuthority: program.provider.wallet.publicKey,
        optionMarket: optionMarketKey,
        serumMarket: serumMarketKey,
        dexProgram: serumProgramKey,
        pcMint,
        optionMint,
        requestQueue,
        eventQueue,
        bids,
        asks,
        coinVault,
        pcVault,
        vaultSigner: vaultOwner,
        marketAuthority,
        rent: SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      },
      instructions: instructions.length ? instructions : undefined,
      signers: signers.length ? signers : undefined
    }
  );

  return {
    marketAuthority,
    serumMarketKey,
    tx,
  };
};

/**
 * 
 * @param {Program} program - PsyOptions American V1 Anchor program
 * @param {PublicKey} optionMarketKey - The key for the OptionMarket
 * @param {PublicKey} dexProgramId - Serum DEX public key
 * @returns 
 */
export const getMarketAndAuthorityInfo = async (
  program: Program,
  optionMarketKey: PublicKey,
  dexProgramId: PublicKey
): Promise<{ serumMarketKey: PublicKey, marketAuthority: PublicKey, marketAuthorityBump: number }> => {
  // TODO: This needs to change to be more flexible for many Serum Markets
  const [serumMarketKey, _serumMarketBump] = await PublicKey.findProgramAddress(
    [optionMarketKey.toBuffer(), textEncoder.encode("serumMarket")],
    program.programId
  );
  const [marketAuthority, marketAuthorityBump] =
    await PublicKey.findProgramAddress(
      [
        OPEN_ORDERS_INIT_SEED,
        dexProgramId.toBuffer(),
        serumMarketKey.toBuffer(),
      ],
      program.programId
    );

  return { serumMarketKey, marketAuthority, marketAuthorityBump };
};