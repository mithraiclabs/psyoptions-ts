import * as anchor from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

// TODO does this need to change based on network?
export const FEE_OWNER_KEY = new PublicKey(
  "6c33US7ErPmLXZog9SyChQUYUrrJY51k4GmzdhrbhNnD"
);

export const NFT_MINT_LAMPORTS = LAMPORTS_PER_SOL / 2;

export const feeAmount = (assetQuantity: anchor.BN) => {
  return assetQuantity.div(new anchor.BN(10_000 / 5));
};
