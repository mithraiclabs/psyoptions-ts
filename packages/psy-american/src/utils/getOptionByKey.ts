import { Program, ProgramAccount } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { OptionMarket, OptionMarketWithKey } from "../types";

export const getOptionByKey = async (
  program: Program,
  key: PublicKey
): Promise<OptionMarketWithKey | null> => {
  try {
    const optionAccount = (await program.account.optionMarket.fetch(
      key
    )) as unknown as OptionMarket;

    return {
      ...optionAccount,
      key,
    };
  } catch (err) {
    return null;
  }
};
