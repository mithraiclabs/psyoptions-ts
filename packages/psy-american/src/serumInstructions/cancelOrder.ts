import { BN, Program } from "@project-serum/anchor";
import { Order } from "@project-serum/serum/lib/market";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { PsyAmerican } from "../psyAmericanTypes";
import {
  deriveMarketAuthority,
  findOpenOrdersAccountsForOwner,
} from "../serumUtils";
import { marketLoader } from "./marketLoader";

/**
 * Create a TransactionInstruction for canceling a specific _order_
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
  program: Program<PsyAmerican>,
  optionMarketKey: PublicKey,
  dexProgramId: PublicKey,
  serumMarketKey: PublicKey,
  order: Order,
  marketAuthorityBump: number | undefined = undefined
): Promise<TransactionInstruction> => {
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
  );
  return marketProxy.instruction.cancelOrder(
    program.provider.wallet.publicKey,
    order
  );
};

/**
 * Generate a `TransactionInstruction` for canceling an open order by the set clientId
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
  program: Program<PsyAmerican>,
  optionMarketKey: PublicKey,
  dexProgramId: PublicKey,
  serumMarketKey: PublicKey,
  order: Order,
  marketAuthorityBump: number | undefined = undefined
): Promise<TransactionInstruction> => {
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
  );
  return marketProxy.instruction.cancelOrderByClientId(
    program.provider.wallet.publicKey,
    order.openOrdersAddress,
    order.clientId
  );
};

const one = new BN(1);

/**
 * Create an array of TransactionInstructions to cancel all of the wallet's orders for a given 
 * OptionMarket and SerumMarket.
 * 
 * NOTE: Current implementation does not account for Transaction packet size limitations. It 
 * is on the client to slice the instructions to be within the limits.
 * 
 * @param program - Anchor Program for Psy American
 * @param optionMarketKey - The address of the OptionMarket for the option in the Seurm Market
 * @param dexProgramId - The PublicKey of the DEX program
 * @param serumMarketKey - The PublicKey of the Serum market
 * @returns 
 */
export const cancelAllOpenOrders = async (
  program: Program<PsyAmerican>,
  optionMarketKey: PublicKey,
  dexProgramId: PublicKey,
  serumMarketKey: PublicKey
): Promise<TransactionInstruction[]> => {
  const instructions: TransactionInstruction[] = [];
  // get the provider's open orders for the market
  const openOrdersAccounts = await findOpenOrdersAccountsForOwner(
    program,
    dexProgramId,
    serumMarketKey
  );

  // create array of instructions to cancel the orders.
  await Promise.all(
    openOrdersAccounts.map(async (openOrders) => {
      await Promise.all(
        openOrders.orders.map(async (orderId, index) => {
          if (!orderId.isZero()) {
            const oneClone = one.clone().shln(index);
            // @ts-ignore: isBidBits issue
            const isAsk = oneClone.and(openOrders.isBidBits).isZero();
            const orderInfo = {
              orderId: orderId,
              openOrdersAddress: openOrders.address,
              openOrdersSlot: index,
              side: isAsk ? "sell" : "buy",
            };
            instructions.push(
              await cancelOrderInstructionV2(
                program,
                optionMarketKey,
                dexProgramId,
                serumMarketKey,
                orderInfo as Order
              )
            );
          }
        })
      );
    })
  );
  return instructions;
};
