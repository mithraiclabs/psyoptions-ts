import { Program } from "@project-serum/anchor"
import { Order } from "@project-serum/serum/lib/market";
import { PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js"
import { getMarketAndAuthorityInfo } from "../instructions";
import { marketLoader } from "./marketLoader";

/**
 * 
 * @param program - Anchor Program for Psy American
 * @param optionMarketKey - The address of the OptionMarket for the option in the Seurm Market
 * @param dexProgramId - The PublicKey of the DEX program
 * @param serumMarketKey - The PublicKey of the Serum market
 * @param order - The Serum Order to cancel
 * @param marketAuthorityBump - Optional: bump seed for the Serum market
 * @returns 
 */
export const cancelOrderInstructionV2 = async (
  program: Program,
  optionMarketKey: PublicKey,
  dexProgramId: PublicKey,
  serumMarketKey: PublicKey,
  order: Order,
  marketAuthorityBump: number|undefined = undefined,
): Promise<TransactionInstruction> => {
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
  return marketProxy.instruction.cancelOrder(program.provider.wallet.publicKey, order);
}

/**
 * 
 * @param program - Anchor Program for Psy American
 * @param optionMarketKey - The address of the OptionMarket for the option in the Seurm Market
 * @param dexProgramId - The PublicKey of the DEX program
 * @param serumMarketKey - The PublicKey of the Serum market
 * @param order - The Serum Order to cancel
 * @param marketAuthorityBump - Optional: bump seed for the Serum market
 * @returns 
 */
export const cancelOrderByClientId = async (
  program: Program,
  optionMarketKey: PublicKey,
  dexProgramId: PublicKey,
  serumMarketKey: PublicKey,
  order: Order,
  marketAuthorityBump: number|undefined = undefined,
): Promise<TransactionInstruction> => {
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
  return marketProxy.instruction.cancelOrderByClientId(program.provider.wallet.publicKey, order.openOrdersAddress, order.clientId);
}