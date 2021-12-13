import { Program } from "@project-serum/anchor";
import { OpenOrders } from "@project-serum/serum";
import { AccountInfo, PublicKey } from "@solana/web3.js";
import { chunkArray } from "./utils";

const textEncoder = new TextEncoder();
// b"open-orders-init"
const OPEN_ORDERS_INIT_SEED = textEncoder.encode("open-orders-init");
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
  const [openOrdersAddressKey, openOrdersBump] =
    await PublicKey.findProgramAddress(
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
        offset: OpenOrders.getLayout(dexProgramId).offsetOf("market"),
        bytes: serumMarketAddress.toBase58(),
      },
    },
    {
      memcmp: {
        offset: OpenOrders.getLayout(dexProgramId).offsetOf("owner"),
        bytes: openOrdersAddressKey.toBase58(),
      },
    },
    {
      dataSize: OpenOrders.getLayout(dexProgramId).span,
    },
  ];
  const accounts = await program.provider.connection.getProgramAccounts(
    dexProgramId,
    {
      filters,
    }
  );

  return accounts.map(({ pubkey, account }) =>
    OpenOrders.fromAccountInfo(pubkey, account, dexProgramId)
  );
};

/**
 * Load all the open orders for a user based on the Serum DEX and the option market keys.
 *
 * @param program - Anchor Psy American program
 * @param serumProgramId - Serum DEX program id
 * @param optionMarketKeys - Keys for the Psy American OptionMarket's to load the open orders from
 * @returns
 */
export const findOpenOrdersForOptionMarkets = async (
  program: Program,
  serumProgramId: PublicKey,
  optionMarketKeys: PublicKey[],
  priceCurrencyKey: PublicKey
) => {
  const openOrdersKeys = await Promise.all(
    optionMarketKeys.map(async (optionMarketKey) => {
      // Derive the serum market address from the OptionMarket key
      const [serumMarketKey, _serumMarketBump] = await deriveSerumMarketAddress(
        program,
        optionMarketKey,
        priceCurrencyKey
      );

      // Derive the user's OpenOrders account address from the Serum market data
      const [openOrdersAddressKey, openOrdersBump] =
        await PublicKey.findProgramAddress(
          [
            textEncoder.encode("open-orders"),
            serumProgramId.toBuffer(),
            serumMarketKey.toBuffer(),
            program.provider.wallet.publicKey.toBuffer(),
          ],
          program.programId
        );
      return openOrdersAddressKey;
    })
  );

  // Batch load the raw OpenOrders data
  const groupOfOpenOrdersKeys: PublicKey[][] = chunkArray(openOrdersKeys, 100);
  const getMultipleAccountsForOpenOrdersKeys: Promise<AccountInfo<Buffer>[]>[] =
    groupOfOpenOrdersKeys.map((openOrdersKeys) => {
      return program.provider.connection.getMultipleAccountsInfo(
        openOrdersKeys
      );
    });
  const results = await Promise.all(getMultipleAccountsForOpenOrdersKeys);
  const openOrdersInfos: AccountInfo<Buffer>[] = results.flat();

  // Deserialize the OpenOrders info
  const openOrders: OpenOrders[] = [];
  openOrdersInfos.forEach((info, index) => {
    if (!info) return;

    openOrders.push(
      new OpenOrders(
        openOrdersKeys[index],
        OpenOrders.getLayout(serumProgramId).decode(info.data),
        serumProgramId
      )
    );
  });

  return openOrders;
};

export const deriveSerumMarketAddress = async (
  program: Program,
  optionMarketKey: PublicKey,
  priceCurrencyKey: PublicKey
) => {
  return PublicKey.findProgramAddress(
    [
      optionMarketKey.toBuffer(),
      priceCurrencyKey.toBuffer(),
      textEncoder.encode("serumMarket"),
    ],
    program.programId
  );
};

export const deriveMarketAuthority = async (
  program: Program,
  dexProgramId: PublicKey,
  serumMarketKey: PublicKey
) =>
  PublicKey.findProgramAddress(
    [OPEN_ORDERS_INIT_SEED, dexProgramId.toBuffer(), serumMarketKey.toBuffer()],
    program.programId
  );


export const deriveRequestQueue = (
  program: Program,
  optionMarketKey: PublicKey,
  priceCurrencyKey: PublicKey,
) => PublicKey.findProgramAddress(
    [
      optionMarketKey.toBuffer(),
      priceCurrencyKey.toBuffer(),
      textEncoder.encode("requestQueue"),
    ],
    program.programId
  );

export const deriveCoinVault = (
  program: Program,
  optionMarketKey: PublicKey,
  priceCurrencyKey: PublicKey,
) =>  PublicKey.findProgramAddress(
    [
      optionMarketKey.toBuffer(),
      priceCurrencyKey.toBuffer(),
      textEncoder.encode("coinVault"),
    ],
    program.programId
  );

export const derivePCVault = (
  program: Program,
  optionMarketKey: PublicKey,
  priceCurrencyKey: PublicKey,
) => PublicKey.findProgramAddress(
    [
      optionMarketKey.toBuffer(),
      priceCurrencyKey.toBuffer(),
      textEncoder.encode("pcVault"),
    ],
    program.programId
  );
/**
 * Given an OptionMarket address and DEX program, generate the Serum market key,
 * market authority, and authority bump seed.
 *
 * @param {Program} program - PsyOptions American V1 Anchor program
 * @param {PublicKey} optionMarketKey - The key for the OptionMarket
 * @param {PublicKey} dexProgramId - Serum DEX public key
 * @returns
 */
export const getMarketAndAuthorityInfo = async (
  program: Program,
  optionMarketKey: PublicKey,
  dexProgramId: PublicKey,
  priceCurrencyKey: PublicKey
): Promise<{
  serumMarketKey: PublicKey;
  marketAuthority: PublicKey;
  marketAuthorityBump: number;
}> => {
  const [serumMarketKey, _serumMarketBump] = await deriveSerumMarketAddress(
    program,
    optionMarketKey,
    priceCurrencyKey
  );

  const [marketAuthority, marketAuthorityBump] = await deriveMarketAuthority(
    program,
    dexProgramId,
    serumMarketKey
  );

  return { serumMarketKey, marketAuthority, marketAuthorityBump };
};
