import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

/**
 * This is needed for the permissioned serum markets.
 *
 * TODO can we replace this with PublicKey.findProgramAddress
 *
 * @param marketPublicKey
 * @param dexProgramId
 * @returns
 */
export const getVaultOwnerAndNonce = async (
  marketPublicKey: PublicKey,
  dexProgramId: PublicKey
) => {
  const nonce = new BN(0);
  while (nonce.toNumber() < 255) {
    try {
      const vaultOwner = await PublicKey.createProgramAddress(
        [marketPublicKey.toBuffer(), nonce.toArrayLike(Buffer, "le", 8)],
        dexProgramId
      );
      return [vaultOwner, nonce];
    } catch (e) {
      nonce.iaddn(1);
    }
  }
  throw new Error("Unable to find nonce");
};
