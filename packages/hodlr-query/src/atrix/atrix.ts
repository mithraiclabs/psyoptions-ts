import { AnchorProvider, BN, Idl, Program } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import FarmIdl from "./farmIdl.json";

export const ATRIX_FARM_ID = new PublicKey(
  "BLDDrex4ZSWBgPYaaH6CQCzkJXWfzCiiur9cSFJT8t3x"
);

/**
 * 
 * Pull staker accounts from Atrix Farms that meet a minimum LP token staked amount
 * 
 * Usage Example 
 * const connection = new Connection("https://api.mainnet-beta.solana.com");
 * (async () => {
 *   const accounts = await getFarmLps(
 *     connection,
 *     ATRIX_FARM_ID,
 *     new PublicKey("6nXkH5BYSu5cCCh2h6FEKkYsLrrDDPL7AWnqhbMANshm"),
 *     new BN(60_000_000_000)
 *   );
 * })();
 * 
 * 
 * @param connection 
 * @param atrixFarmProgramId 
 * @param alpMint 
 * @param minimumFarmAmount 
 * @returns 
 */
export const getFarmLps = async (
  connection: Connection,
  atrixFarmProgramId: PublicKey,
  alpMint: PublicKey,
  minimumFarmAmount: BN = new BN(0)
) => {
  // @ts-ignore:  TODO fix dummy wallet
  const anchorProvider = new AnchorProvider(connection, {}, {});
  const atrixFarmProgram = new Program(
    FarmIdl as unknown as Idl,
    atrixFarmProgramId,
    anchorProvider
  );
  const farmAccount = (
    await atrixFarmProgram.account.farmAccount.all([
      {
        memcmp: {
          offset: 33 + 8,
          bytes: alpMint.toString(),
        },
      },
    ])
  )[0];

  // Load all the CropAccounts for the authority
  const stakerAccounts = (await atrixFarmProgram.account.stakerAccount.all([
    {
      memcmp: {
        offset: 1 + 8,
        bytes: farmAccount.publicKey.toBase58(),
      },
    },
  ])) as any;

  // Callers can determine how many farm tokens an address needs to qualify
  return stakerAccounts.filter((stakeAccount) =>
    minimumFarmAmount.lt(stakeAccount.account.stakedAmount)
  );
};

/**
 *
 * Extract the owner addresses from an array of stakerAccounts
 *
 * @param stakerAccounts
 * @returns
 */
 export const getOwnersFromStakerAccounts = (
    stakerAccounts: any[]
  ): PublicKey[] => stakerAccounts.map((x) => x.account.authority);

  export const getOwnersMapFromStakers = (stakerAccounts: any[]): Record<string, boolean> => {
    const res = {};
    stakerAccounts.reduce((acc, curr) => {
      acc[curr.account.authority.toString()] = true;
      return acc;
    }, res);
    return res;
  }