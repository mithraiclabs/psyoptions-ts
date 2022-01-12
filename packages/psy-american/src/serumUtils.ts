import { Program } from "@project-serum/anchor";
import { OpenOrders } from "@project-serum/serum";
import { AccountInfo, PublicKey } from "@solana/web3.js";
import { PsyAmerican } from "./psyAmericanTypes";
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
  program: Program<PsyAmerican>,
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
 * @param priceCurrencyKey - Key of the pc (aka quote currency) from the serum markets
 * @param optionMetaList - Optional list of option meta data to pull serum market data from instead of deriving
 * the address. This is for backwards compatibility
 * @returns
 */
export const findOpenOrdersForOptionMarkets = async (
  program: Program<PsyAmerican>,
  serumProgramId: PublicKey,
  optionMarketKeys: PublicKey[],
  priceCurrencyKey: PublicKey,
  optionMetaList?: {
    expiration: number;
    optionMarketAddress: string;
    optionContractMintAddress: string;
    optionWriterTokenMintAddress: string;
    quoteAssetMint: string;
    quoteAssetPoolAddress: string;
    underlyingAssetMint: string;
    underlyingAssetPoolAddress: string;
    underlyingAssetPerContract: string;
    quoteAssetPerContract: string;
    serumMarketAddress: string;
    serumProgramId: string;
    psyOptionsProgramId: string;
  }[]
) => {
  const openOrdersKeys = await Promise.all(
    optionMarketKeys.map(async (optionMarketKey) => {
      // TODO check if option market key exists on market meta
      let serumMarketKey: PublicKey;
      if (optionMetaList) {
        // default to the serum address in the provided list of options.
        // This is necessary to keep backwards compatibility for option
        // markets in 2021.
        const serumMarketAddress = optionMetaList.find(
          (option) => option.optionMarketAddress === optionMarketKey.toString()
        )?.serumMarketAddress;
        if (serumMarketAddress) {
          serumMarketKey = new PublicKey(serumMarketAddress);
        }
      }
      if (!serumMarketKey) {
        // Derive the serum market address from the OptionMarket key
        const [_serumMarketKey, _serumMarketBump] =
          await deriveSerumMarketAddress(
            program,
            optionMarketKey,
            priceCurrencyKey
          );
        serumMarketKey = _serumMarketKey;
      }

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

  const openOrdersByOptionMarket: Record<string, OpenOrders> = {};
  // Deserialize the OpenOrders info and store mapped by Option key
  openOrdersInfos.forEach((info, index) => {
    if (!info) return;
    openOrdersByOptionMarket[optionMarketKeys[index].toString()] =
      new OpenOrders(
        openOrdersKeys[index],
        OpenOrders.getLayout(serumProgramId).decode(info.data),
        serumProgramId
      );
  });

  return openOrdersByOptionMarket;
};

export const deriveSerumMarketAddress = async (
  program: Program<PsyAmerican>,
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
  program: Program<PsyAmerican>,
  dexProgramId: PublicKey,
  serumMarketKey: PublicKey
) =>
  PublicKey.findProgramAddress(
    [OPEN_ORDERS_INIT_SEED, dexProgramId.toBuffer(), serumMarketKey.toBuffer()],
    program.programId
  );

export const deriveRequestQueue = (
  program: Program<PsyAmerican>,
  optionMarketKey: PublicKey,
  priceCurrencyKey: PublicKey
) =>
  PublicKey.findProgramAddress(
    [
      optionMarketKey.toBuffer(),
      priceCurrencyKey.toBuffer(),
      textEncoder.encode("requestQueue"),
    ],
    program.programId
  );

export const deriveCoinVault = (
  program: Program<PsyAmerican>,
  optionMarketKey: PublicKey,
  priceCurrencyKey: PublicKey
) =>
  PublicKey.findProgramAddress(
    [
      optionMarketKey.toBuffer(),
      priceCurrencyKey.toBuffer(),
      textEncoder.encode("coinVault"),
    ],
    program.programId
  );

export const derivePCVault = (
  program: Program<PsyAmerican>,
  optionMarketKey: PublicKey,
  priceCurrencyKey: PublicKey
) =>
  PublicKey.findProgramAddress(
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
  program: Program<PsyAmerican>,
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
