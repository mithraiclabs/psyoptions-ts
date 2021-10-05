import { Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { getMarketAndAuthorityInfo } from "../serumUtils";
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
  program: Program,
  optionMarketKey: PublicKey,
  dexProgramId: PublicKey,
  serumMarketKey: PublicKey,
  baseWallet: PublicKey,
  quoteWallet: PublicKey,
  serumReferralKey: PublicKey, // TODO: This should probably be abstracted
  openOrdersKey: PublicKey,
  marketAuthorityBump: number|undefined,
) => {
  let _marketAuthorityBump = marketAuthorityBump;
  if (!marketAuthorityBump) {
    ({ marketAuthorityBump: _marketAuthorityBump } = await getMarketAndAuthorityInfo(program, optionMarketKey, dexProgramId));
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
    program.provider.wallet.publicKey,
    baseWallet,
    quoteWallet,
    serumReferralKey
  )
}