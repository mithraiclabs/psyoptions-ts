import { Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { getMarketAndAuthorityInfo } from "../instructions";
import { marketLoader } from "./marketLoader";

/**
 * 
 * @param program 
 * @param optionMarketKey 
 * @param dexProgramId 
 * @param serumMarketKey 
 * @param baseWallet 
 * @param quoteWallet 
 * @param serumReferralKey 
 * @param marketAuthorityBump 
 * @param openOrdersKey 
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
    marketAuthorityBump,
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