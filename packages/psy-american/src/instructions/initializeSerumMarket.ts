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
import { deriveCoinVault, derivePCVault, deriveRequestQueue, getMarketAndAuthorityInfo } from "../serumUtils";
import { getVaultOwnerAndNonce } from "../utils";

const textEncoder = new TextEncoder();

/**
 * 
 * @param program - Anchor Psy American Program
 * @param param1 
 * @returns 
 */
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
    /** The address for the new Serum market's eventual Event Queue */
    eventQueue?: PublicKey;
    /** The address for the new Serum market's bids */
    bids?: PublicKey;
    /** The address for the new Serum market's asks */
    asks?: PublicKey;
    /** The OptionMarket address that owns the OptionToken mint */
    optionMarketKey: PublicKey;
    /** The OptionToken's Mint address. This is the base token for the Serum market */
    optionMint: PublicKey;
    /** Serum market's dust threshold for the price currency */
    pcDustThreshold: BN;
    /** Serum market's price currency lot size */
    pcLotSize: BN;
    /** The Serum's price currency mint */
    pcMint: PublicKey;
    /** The Serum DEX program ID */
    serumProgramKey: PublicKey;
  }
): Promise<{
  marketAuthority: PublicKey;
  serumMarketKey: PublicKey;
  tx: string;
}> => {
  
  const [requestQueue] = await deriveRequestQueue(program, optionMarketKey, pcMint);
  
  const [coinVault] = await deriveCoinVault(program, optionMarketKey, pcMint);

  const [pcVault] = await derivePCVault(program, optionMarketKey, pcMint);

  const { serumMarketKey, marketAuthority } =
    await getMarketAndAuthorityInfo(program, optionMarketKey, serumProgramKey, pcMint);
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
