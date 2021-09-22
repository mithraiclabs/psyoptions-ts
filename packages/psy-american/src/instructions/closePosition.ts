import { BN, Program } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { OptionMarketWithKey } from "../types";

/**
 * Close an option position by burning the OptionTokens and WriterTokens
 * 
 * @param program 
 * @param size 
 * @param optionMarket 
 * @param writerTokenSrc 
 * @param optionTokenSrc 
 * @param underlyingAssetDest 
 */
export const closePositionInstruction = (
  program: Program,
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