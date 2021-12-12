import { Program } from "@project-serum/anchor";
import { PublicKey, Transaction } from "@solana/web3.js";
import { marketLoader } from "./marketLoader";
import { deriveMarketAuthority } from "../serumUtils";
import { initOpenOrdersInstruction } from "./initOpenOrders";
import { OrderParamsWithFeeRate } from "../types";

const textEncoder = new TextEncoder();

/**
 * Create a new order proxied through the Psy American Protocol
 *
 * @param program - Anchor Psy American program
 * @param optionMarketKey - The OptionMarket address
 * @param dexProgramId - The Serum DEX program ID
 * @param serumMarketKey - The Serum market address
 * @param orderArguments - The Serum OrderParams
 * @param marketAuthorityBump - OPTIONAL: pass in the market authority bump seed
 * @returns
 */
export const newOrderInstruction = async (
  program: Program,
  optionMarketKey: PublicKey,
  dexProgramId: PublicKey,
  serumMarketKey: PublicKey,
  orderArguments: OrderParamsWithFeeRate<PublicKey>,
  marketAuthorityBump: number | undefined = undefined
): Promise<{ openOrdersKey: PublicKey; tx: Transaction }> => {
  const transaction = new Transaction();
  let _openOrdersKey = orderArguments.openOrdersAddressKey;
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

  // create OpenOrders account
  if (!_openOrdersKey) {
    // Check that the OpenOrders account does not exist
    [_openOrdersKey] = await PublicKey.findProgramAddress(
      [
        textEncoder.encode("open-orders"),
        dexProgramId.toBuffer(),
        marketProxy.market.address.toBuffer(),
        program.provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );
    const accountInfo = await program.provider.connection.getAccountInfo(
      _openOrdersKey,
      "recent"
    );
    orderArguments.openOrdersAddressKey = _openOrdersKey;
    if (!accountInfo) {
      const { ix } = await initOpenOrdersInstruction(
        program,
        program.provider.wallet.publicKey,
        optionMarketKey,
        dexProgramId,
        serumMarketKey,
        _marketAuthorityBump
      );
      transaction.add(ix);
    }
  }

  if (orderArguments.feeRate) {
    orderArguments.price = orderArguments.price * (1 + orderArguments.feeRate);
  }

  const ix = marketProxy.instruction.newOrderV3(orderArguments);
  transaction.add(ix);
  return { openOrdersKey: _openOrdersKey, tx: transaction };
};
