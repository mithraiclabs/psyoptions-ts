import { BN, Program } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, SYSVAR_CLOCK_PUBKEY, TransactionInstruction } from "@solana/web3.js";
import { OptionMarketWithKey } from "../types";

/**
 * After a market has expired, burn WriterTokens to get the underlying assets back from 
 * the contract(s).
 * 
 * @param program - Anchor Program for Psy American
 * @param size - The amount of options to exercise
 * @param optionMarket - The OptionMarket data from the chain for the options to exercise
 * @param writerTokenSrc - The SPL Token address holding the WriterTokens
 * @param underlyingAssetDest - The SPL Token address where the underlying assets will be sent
 */
export const closePostExpirationInstruction = (
  program: Program,
  size: BN,
  optionMarket: OptionMarketWithKey,
  writerTokenSrc: PublicKey,
  underlyingAssetDest: PublicKey
): TransactionInstruction => {
  return program.instruction.closePostExpiration(size, {
    accounts: {
      userAuthority: program.provider.wallet.publicKey,
      optionMarket: optionMarket.key,
      writerTokenMint: optionMarket.writerTokenMint,
      writerTokenSrc,
      underlyingAssetPool: optionMarket.underlyingAssetPool,
      underlyingAssetDest,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
    },
  });
}