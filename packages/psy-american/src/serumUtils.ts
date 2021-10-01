import { Program } from "@project-serum/anchor";
import { OpenOrders } from "@project-serum/serum";
import { PublicKey } from "@solana/web3.js";

const textEncoder = new TextEncoder();

/**
 * Load the open orders for a user based on the Serum DEX and Serum Market 
 * address.
 * 
 * @param program - Anchor Psy American program 
 * @param dexProgramId - Serum DEX program id
 * @param serumMarketAddress - Serum market address
 * @returns 
 */
export const findOpenOrdersAccountsForOwner = async (
  program: Program,
  dexProgramId: PublicKey,
  serumMarketAddress: PublicKey
) => {
  const [openOrdersAddressKey, openOrdersBump] = await PublicKey.findProgramAddress(
    [
      textEncoder.encode("open-orders"),
      dexProgramId.toBuffer(),
      serumMarketAddress.toBuffer(),
      program.provider.wallet.publicKey.toBuffer(),
    ],
    program.programId
  );
  const filters = [
    {
      memcmp: {
        offset: OpenOrders.getLayout(dexProgramId).offsetOf('market'),
        bytes: serumMarketAddress.toBase58(),
      },
    },
    {
      memcmp: {
        offset: OpenOrders.getLayout(dexProgramId).offsetOf('owner'),
        bytes: openOrdersAddressKey.toBase58(),
      },
    },
    {
      dataSize: OpenOrders.getLayout(dexProgramId).span,
    },
  ];
  const accounts = await program.provider.connection.getProgramAccounts(dexProgramId, {
    filters
  });

  return accounts.map(({ pubkey, account }) =>
    OpenOrders.fromAccountInfo(pubkey, account, dexProgramId),
  );
}