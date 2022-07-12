import {
  FarmLedger,
  FARM_PROGRAMID_TO_VERSION,
  FARM_VERSION_TO_LEDGER_LAYOUT,
  LIQUIDITY_PROGRAMID_TO_VERSION,
  LIQUIDITY_VERSION_TO_STATE_LAYOUT,
} from "@raydium-io/raydium-sdk";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, BN, Spl } from "@project-serum/anchor";
import { getSolscanTokenHolders } from "./splToken";

/**
 *
 * Get the ledger accounts of addresses that have deposited _minimumFarmAmount_ LP tokens into
 * a specifc Raydium Farm.
 *
 * Simple usage example
 *
 * const PSY_USDC_FARM = new PublicKey(
 *   "8Zq81uwAeEUUgoe9fz7g25vXr4F3vJfJT5cZCxHne5NE"
 * );
 *
 * const connection = new Connection("https://api.mainnet-beta.solana.com");
 * (async () => {
 *   const accounts = await getFarmLps(
 *     connection,
 *     FARM_PROGRAM_ID_V5,
 *     PSY_USDC_FARM,
 *     new BN(25_000_000)
 *   );
 * })();
 *
 *
 * @param connection
 * @param raydiumFarmProgramId
 * @param farm
 * @param minimumFarmAmount
 * @returns
 */
export const getFarmLps = async (
  connection: Connection,
  raydiumFarmProgramId: PublicKey,
  farm: PublicKey,
  minimumFarmAmount: BN = new BN(0)
) => {
  // Load all farm ledgers for the Farm id
  const accountInfos = await connection.getProgramAccounts(
    raydiumFarmProgramId,
    {
      commitment: "confirmed",
      filters: [
        {
          memcmp: {
            // filter by farm ledger ID offset https://github.com/raydium-io/raydium-sdk/blob/master/src/farm/layout.ts#L236
            offset: 8,
            bytes: farm.toBase58(),
          },
        },
      ],
    }
  );
  // Deserialize the account data
  const raydiumFarmVersion =
    FARM_PROGRAMID_TO_VERSION[raydiumFarmProgramId.toString()];
  const raydiumFarmLedgerLayout =
    FARM_VERSION_TO_LEDGER_LAYOUT[raydiumFarmVersion];
  const decodedFarmLedgers = accountInfos.map((x) =>
    raydiumFarmLedgerLayout.decode(x.account.data)
  );

  // Callers can determine how many farm tokens an address needs to qualify
  return decodedFarmLedgers.filter((farmLedger) =>
    minimumFarmAmount.lt(farmLedger.deposited)
  );
};

/**
 *
 * Extract the owner addresses from an array of FarmLedgers
 *
 * @param decodedFarmLedgers
 * @returns
 */
export const getOwnersFromFarmLedgers = (
  decodedFarmLedgers: FarmLedger[]
): PublicKey[] => decodedFarmLedgers.map((x) => x.owner);

export const getLps = async (
  lpMint: PublicKey,
  minimumLpAmount: number = 0
) => {
  // Load all SPL TokenAccounts for the LP token mint
  return await getSolscanTokenHolders(lpMint.toString(), {minTokenAmount: minimumLpAmount});
};
