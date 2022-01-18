import { BN, Program } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { PsyAmerican } from "../psyAmericanTypes";
import { OptionMarketWithKey } from "../types";

/**
 * Close _size_ option positions by burning the OptionTokens and WriterTokens.
 * 
 * @param program - Anchor Program for Psy American
 * @param size - The amount of OptionTokens and WriterTokens to burn
 * @param optionMarket - The OptionMarket the OptionTokens and WriterTokens belong to
 * @param writerTokenSrc - The SPL Token address that holds the WriterTokens
 * @param optionTokenSrc - The SPL Token address that holds the OptionTokens
 * @param underlyingAssetDest - The SPL Token address destination for the returned underlying assets
 */
export const closePositionInstruction = (
  program: Program<PsyAmerican>,
  size: BN,
  optionMarket: OptionMarketWithKey,
  writerTokenSrc: PublicKey,
  optionTokenSrc: PublicKey,
  underlyingAssetDest: PublicKey
): TransactionInstruction => {
  return program.instruction.closeOptionPosition(size, {
    accounts: {
      userAuthority: program.provider.wallet.publicKey,
      optionMarket: optionMarket.key,
      writerTokenMint: optionMarket.writerTokenMint,
      writerTokenSrc,
      optionTokenMint: optionMarket.optionMint,
      optionTokenSrc,
      underlyingAssetPool: optionMarket.underlyingAssetPool,
      underlyingAssetDest,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });
}