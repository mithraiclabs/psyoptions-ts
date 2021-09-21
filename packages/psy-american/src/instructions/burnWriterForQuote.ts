import { BN, Program } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { OptionMarket } from "../types";

/**
 * Burn WriterTokens to get the `size * OptionMarket.quoteAmountPerContract` from the 
 * OptionMarket's quote asset pool. This instruction will fail if no one has exercised
 * or the quote assets in the pool have already been claimed.
 * 
 * @param program - Anchor Program for Psy American
 * @param size - The amount of WriterTokens to burn and retrieve the quote assets for
 * @param optionMarket - The deserialized OptionMarket data
 * @param writerTokenSrc - The SPL Token account that holds the WriterTokens
 * @param writerQuoteDest - SPL Token account that is the destination for the quote assets
 */
export const burnWriterForQuote = (
  program: Program,
  size: BN,
  optionMarket: OptionMarket,
  writerTokenSrc: PublicKey,
  writerQuoteDest: PublicKey
): TransactionInstruction => {
  return program.instruction.burnWriterForQuote(size, {
    accounts: {
      userAuthority: program.provider.wallet.publicKey,
      optionMarket: optionMarket.key,
      writerTokenMint: optionMarket.writerTokenMint,
      writerTokenSrc,
      quoteAssetPool: optionMarket.quoteAssetPool,
      writerQuoteDest,
      tokenProgram: TOKEN_PROGRAM_ID,
    }
  });
};