import { Program, ProgramAccount } from "@project-serum/anchor";
import { PsyAmerican } from "./psyAmericanTypes";
import { OptionMarket, OptionMarketWithKey } from "./types";

/**
 * Load all OptionMarkets owned by the given program from the blockchain.
 * 
 * @param program - Anchor Psy American program 
 * @returns 
 */
export const getAllOptionAccounts = async (program: Program<PsyAmerican>): Promise<OptionMarketWithKey[]> => {
  const accts = (await program.account.optionMarket.all()) as unknown as ProgramAccount<OptionMarket>[]
  return accts.map(acct => ({
    ...acct.account,
    key: acct.publicKey
  }))
}
