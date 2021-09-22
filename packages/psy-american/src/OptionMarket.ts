import { Program, ProgramAccount } from "@project-serum/anchor";
import { OptionMarket, OptionMarketWithKey } from "./types";

export const getAllOptionAccounts = async (program: Program): Promise<OptionMarketWithKey[]> => {
  const accts = (await program.account.optionMarket.all()) as unknown as ProgramAccount<OptionMarket>[]
  return accts.map(acct => ({
    ...acct.account,
    key: acct.publicKey
  }))
}
