import { Program } from "@project-serum/anchor"
import { PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js"
import { PsyAmerican } from "../psyAmericanTypes";
import { deriveMarketAuthority } from "../serumUtils";
import { marketLoader } from "./marketLoader"

/**
 * Create a proxied InitOpenOrdersInstruction
 * 
 * @param program - Anchor Psy American program
 * @param owner - The user's wallet address
 * @param optionMarketKey - The OptionMarket address key
 * @param dexProgramId - Serum DEX id
 * @param serumMarketKey - The Serum market address
 * @param marketAuthorityBump - OPTIONAL: pass in the market authority bump seed
 * @returns 
 */
export const initOpenOrdersInstruction = async (
  program: Program<PsyAmerican>,
  owner: PublicKey,
  optionMarketKey: PublicKey,
  dexProgramId: PublicKey,
  serumMarketKey: PublicKey,
  marketAuthorityBump: number|undefined = undefined
): Promise<{ix: TransactionInstruction}> => {
  let _marketAuthorityBump = marketAuthorityBump;
  if (!_marketAuthorityBump) {
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
