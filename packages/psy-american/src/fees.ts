import * as anchor from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

// TODO: does this need to change based on network?
/** The fee owner key for the Psy American program */
export const FEE_OWNER_KEY = new PublicKey(
  "6c33US7ErPmLXZog9SyChQUYUrrJY51k4GmzdhrbhNnD"
);

/** The number of lamports the protocol takes as a fee when minting or 
 * exercising an option on an asset that cannot take a 5bps fee. E.g a minting 
 * a call option on an NFT */
export const NFT_MINT_LAMPORTS = LAMPORTS_PER_SOL / 2;

/**
 * Get the protocol's fee amount when minting or exercising. When minting this
 * should be the underlingAmountPerContract. When exercising this should be
 * the quoteAmountPerContract.
 * 
 * @param assetQuantity - Quantity of the asset being used to mint or exercise
 * @returns 
 */
export const feeAmountPerContract = (assetQuantity: anchor.BN) => {
  return assetQuantity.div(new anchor.BN(10_000 / 5));
};
