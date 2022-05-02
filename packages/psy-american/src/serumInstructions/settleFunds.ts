import { Program } from "@project-serum/anchor";
import { Market } from "@project-serum/serum";
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { PsyAmerican } from "../psyAmericanTypes";
import { FEE_OWNER_KEY } from "../fees";
import { deriveMarketAuthority } from "../serumUtils";
import { marketLoader } from "./marketLoader";

/**
 * Create a TransactionInstruction for the settleFunds instruction
 * 
 * @param program - Anchor Psy American Program
 * @param optionMarketKey - The OptionMarket address
 * @param dexProgramId - The Serum DEX program ID
 * @param serumMarketKey - The Serum market address
 * @param baseWallet - The wallet address that contains the user's base asset tokens
 * @param quoteWallet - The wallet address that contains the user's quote asset tokens
 * @param serumReferralKey - The Psy American referral address for the quote asset
 * @param openOrdersKey - The open orders keys
 * @param marketAuthorityBump - OPTIONAL: pass in the market authority bump seed
 * @returns 
 */
export const settleFundsInstruction = async (
  program: Program<PsyAmerican>,
  optionMarketKey: PublicKey,
  dexProgramId: PublicKey,
  serumMarketKey: PublicKey,
  baseWallet: PublicKey,
  quoteWallet: PublicKey,
  serumReferralKey: PublicKey,
  openOrdersKey: PublicKey,
  marketAuthorityBump: number|undefined = undefined,
) => {
  let _marketAuthorityBump = marketAuthorityBump;
  if (!marketAuthorityBump) {
    const [marketAuthority, bump] = await deriveMarketAuthority(
      program,
      dexProgramId,
      serumMarketKey
    );
    _marketAuthorityBump = bump;
  }
  const marketProxy = await marketLoader(
    program,
    optionMarketKey,
    _marketAuthorityBump,
    dexProgramId,
    serumMarketKey
  )
  return marketProxy.instruction.settleFunds(
    openOrdersKey,
    // @ts-ignore
    program.provider.wallet.publicKey,
    baseWallet,
    quoteWallet,
    serumReferralKey
  )
}
/**
 * Create a TransactionInstruction for the settleFunds instruction
 * 
 * Note: this API abstracts the complexity of the serumReferralKey away.
 * 
 * @param program - Anchor Psy American Program
 * @param optionMarketKey - The OptionMarket address
 * @param dexProgramId - The Serum DEX program ID
 * @param serumMarket - The Serum market
 * @param baseWallet - The wallet address that contains the user's base asset tokens
 * @param quoteWallet - The wallet address that contains the user's quote asset tokens
 * @param openOrdersKey - The open orders keys
 * @param marketAuthorityBump - OPTIONAL: pass in the market authority bump seed
 * @returns 
 */
export const settleMarketFundsInstruction = async (
  program: Program<PsyAmerican>,
  optionMarketKey: PublicKey,
  dexProgramId: PublicKey,
  serumMarket: Market,
  baseWallet: PublicKey,
  quoteWallet: PublicKey,
  openOrdersKey: PublicKey,
) => {
  // Get the associated address for a referral
  const owner = FEE_OWNER_KEY;
  const associatedAddress = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    serumMarket.quoteMintAddress,
    owner,
  );
  const accountInfo = await program.provider.connection.getAccountInfo(
    associatedAddress,
  );
  if (!accountInfo) {
    throw new Error(
      `Referral account does not exist for ${serumMarket.quoteMintAddress.toString()}. Please create one.`,
    );
  }
  return settleFundsInstruction(
    program,
    optionMarketKey,
    dexProgramId,
    serumMarket.address,
    baseWallet,
    quoteWallet,
    associatedAddress,
    openOrdersKey,
    undefined
  )
}