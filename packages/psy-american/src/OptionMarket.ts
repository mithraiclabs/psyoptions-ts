import { Program, ProgramAccount } from "@project-serum/anchor";
import { OptionMarket } from "./types";

export const getAllOptionAccounts = async (program: Program): Promise<ProgramAccount<OptionMarket>[]> => {
  return program.account.optionMarket.all()
}
