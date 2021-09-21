import { BN, Program } from "@project-serum/anchor";
import { PublicKey, Transaction } from "@solana/web3.js";
import { OrderParams } from "@project-serum/serum/lib/market";
import { marketLoader } from "./marketLoader";
import { getMarketAndAuthorityInfo } from "../instructions";
import { initOpenOrdersInstruction } from "./initOpenOrders";

const textEncoder = new TextEncoder();

/**
 * Create a new order proxied through the Psy American Protocol
 * 
 * @param program 
 * @param optionMarketKey 
 * @param dexProgramId 
 * @param marketKey 
 * @param orderArguments 
 * @param marketAuthorityBump 
 * @returns 
 */
export const newOrderInstruction = async (
  program: Program,
  optionMarketKey: PublicKey,
  dexProgramId: PublicKey,
  marketKey: PublicKey,
  orderArguments: OrderParams<PublicKey>,
  marketAuthorityBump: number|undefined = undefined,
): Promise<Transaction> => {
  const transaction = new Transaction();
  let _marketAuthorityBump = marketAuthorityBump;
  if (!marketAuthorityBump) {
    ({ marketAuthorityBump: _marketAuthorityBump } = await getMarketAndAuthorityInfo(program, optionMarketKey, dexProgramId));
  }

  const marketProxy = await marketLoader(
    program,
    optionMarketKey,
    _marketAuthorityBump,
    dexProgramId,
    marketKey
  )

  // create OpenOrders account
  if (!orderArguments.openOrdersAddressKey) {
    const {ix} = await initOpenOrdersInstruction(program, program.provider.wallet.publicKey, optionMarketKey, dexProgramId, marketKey, _marketAuthorityBump)
    const [openOrdersAddressKey, openOrdersBump] = await PublicKey.findProgramAddress(
      [
        textEncoder.encode("open-orders"),
        dexProgramId.toBuffer(),
        marketProxy.market.address.toBuffer(),
        program.provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );
    orderArguments.openOrdersAddressKey = openOrdersAddressKey;
    transaction.add(ix)
  }

  const ix = marketProxy.instruction.newOrderV3(orderArguments)
  transaction.add(ix);
  return transaction
}