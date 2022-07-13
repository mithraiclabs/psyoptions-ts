import { BN, ProgramAccount } from "@project-serum/anchor";
import {
  getGovernanceAccounts,
  pubkeyFilter,
  TokenOwnerRecord,
} from "@solana/spl-governance";
import { Connection, PublicKey } from "@solana/web3.js";

/**
 * 
 * Get Token Owner Records from the SPL Token Program
 * 
 * Example usage script
 * const PSY_REALM = new PublicKey("FiG6YoqWnVzUmxFNukcRVXZC51HvLr6mts8nxcm7ScR8");
 * const PSY_GOVERNANCE_PROGRAM = new PublicKey(
 *   "GovHgfDPyQ1GwazJTDY2avSVY8GGcpmCapmmCsymRaGe"
 * );
 * 
 * const connection = new Connection("https://api.mainnet-beta.solana.com");
 * (async () => {
 *   const accounts = getGovernanceStakedTokens(
 *     connection,
 *     PSY_REALM,
 *     PSY_GOVERNANCE_PROGRAM,
 *     new PublicKey("PsyFiqqjiv41G7o5SMRzDJCu4psptThNR2GtfeGHfSq")
 *   );
 * })();
 * 
 * @param connection 
 * @param realm 
 * @param governanceProgramId 
 * @param tokenMint 
 * @param minimumDeposited 
 * @returns 
 */
export const getGovernanceStakedTokens = async (
  connection: Connection,
  realm: PublicKey,
  governanceProgramId: PublicKey,
  tokenMint: PublicKey,
  minimumDeposited: BN = new BN(0)
) => {
  // load all token owner records
  const tokenOwnerRecords = await getGovernanceAccounts(
    connection,
    governanceProgramId,
    TokenOwnerRecord,
    [pubkeyFilter(1, realm)!, pubkeyFilter(1 + 32, tokenMint)!]
  );

  // Filter minimum amount deposited
  return tokenOwnerRecords.filter((x) =>
    minimumDeposited.lt(x.account.governingTokenDepositAmount)
  );
};

export const getOwnersFromTokenDepositRecords = (tokenOwnerRecords: ProgramAccount<TokenOwnerRecord>[]): PublicKey[] => 
  tokenOwnerRecords.map(x => x.account.governingTokenOwner)