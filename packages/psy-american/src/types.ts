import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export enum ClusterName {
  devnet = 'Devnet',
  mainnet = 'Mainnet',
  testnet = 'Testnet',
  localhost = 'localhost',
}

export type NetworkInfo = {
  feeOwnerKey: PublicKey;
  serumReferrerId: PublicKey;
}

export type OptionMarket = {
  key: PublicKey;
  optionMint: PublicKey;
  writerTokenMint: PublicKey;
  underlyingAssetMint: PublicKey;
  quoteAssetMint: PublicKey;
  underlyingAssetPool: PublicKey;
  quoteAssetPool: PublicKey;
  mintFeeAccount: PublicKey;
  exerciseFeeAccount: PublicKey;
  underlyingAmountPerContract: anchor.BN;
  quoteAmountPerContract: anchor.BN;
  expirationUnixTimestamp: anchor.BN;
  expired: boolean;
  bumpSeed: number;
};

/**
 * An enumeration to keep track of the different program versions released.
 */
export enum ProgramVersions {
  V1,
  V1_1
}