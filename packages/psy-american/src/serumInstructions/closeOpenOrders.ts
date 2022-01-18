import { Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { PsyAmerican } from "../psyAmericanTypes";
import { deriveMarketAuthority } from "../serumUtils";
import { marketLoader } from "./marketLoader";

/**
 * Create instruction to close OpenOrders account.
 * 
 * @param program - Anchor Psy American Program
 * @param optionMarketKey - The OptionMarket address
 * @param dexProgramId - The Serum DEX program ID
 * @param serumMarketKey - The Serum market address
 * @param openOrdersKey - The open orders key for the account we're closing
 * @param marketAuthorityBump - OPTIONAL: pass in the market authority bump seed
 * @param solWallet - OPTIONAL: pass in a different address to send the unlocked Sol to
 * @returns 
 */
export const closeOpenOrdersInstruction = async (
  program: Program<PsyAmerican>,
  optionMarketKey: PublicKey,
  dexProgramId: PublicKey,
  serumMarketKey: PublicKey,
  openOrdersKey: PublicKey,
  marketAuthorityBump: number | undefined,
  solWallet?: PublicKey
) => {
  let _marketAuthorityBump = marketAuthorityBump;
  if (!marketAuthorityBump) {
    const [, bump] = await deriveMarketAuthority(
      program,
      dexProgramId,
      serumMarketKey
    );
    _marketAuthorityBump = bump;
  }
  const marketProxy = await marketLoader(
    program,
    optionMarketKey,
    _marketAuthorityBump,
    dexProgramId,
    serumMarketKey
  );
  return marketProxy.instruction.closeOpenOrders(
    openOrdersKey,
    program.provider.wallet.publicKey,
    solWallet ?? program.provider.wallet.publicKey
  );
};
