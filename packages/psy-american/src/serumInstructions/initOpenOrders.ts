import { Program } from "@project-serum/anchor"
import { PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js"
import { getMarketAndAuthorityInfo } from "../instructions";
import { marketLoader } from "./marketLoader"

/**
 * Create a proxied InitOpenOrdersInstruction
 * 
 * @param program 
 * @param owner 
 * @param optionMarketKey 
 * @param dexProgramId 
 * @param serumMarketKey 
 * @param marketAuthorityBump 
 * @returns 
 */
export const initOpenOrdersInstruction = async (
  program: Program,
  owner: PublicKey,
  optionMarketKey: PublicKey,
  dexProgramId: PublicKey,
  serumMarketKey: PublicKey,
  marketAuthorityBump: number|undefined
): Promise<{ix: TransactionInstruction}> => {
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
  const ix = marketProxy.instruction.initOpenOrders(
    owner,
    marketProxy.market.address,
    // dummy key, Serum middleware replaces it
    SystemProgram.programId,
    // dummy key, Serum middleware replaces it
    SystemProgram.programId,
  );
  return {ix}
}
