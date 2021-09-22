import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

/**
 * Get the deterministic address for an Option based on its properties.
 */
export const deriveOptionKeyFromParams = async ({
  expirationUnixTimestamp,
  programId,
  quoteAmountPerContract,
  quoteMint,
  underlyingAmountPerContract,
  underlyingMint,
}: {
  expirationUnixTimestamp: BN;
  programId: PublicKey;
  quoteAmountPerContract: BN;
  quoteMint: PublicKey;
  underlyingAmountPerContract: BN;
  underlyingMint: PublicKey;
}): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [
      underlyingMint.toBuffer(),
      quoteMint.toBuffer(),
      underlyingAmountPerContract.toArrayLike(Buffer, "le", 8),
      quoteAmountPerContract.toArrayLike(Buffer, "le", 8),
      expirationUnixTimestamp.toArrayLike(Buffer, "le", 8),
    ],
    programId
  );
};
