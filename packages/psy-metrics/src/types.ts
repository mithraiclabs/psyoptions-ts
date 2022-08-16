import { BN, web3 } from "@project-serum/anchor";

export type TokenAccount = {
  mint: web3.PublicKey;
  authority: web3.PublicKey;
  amount: BN;
  delegate: null | web3.PublicKey;
  state: number;
  isNative: null | boolean;
  delegatedAmount: BN;
  closeAuthority: null | web3.PublicKey;
};

export type MintInfo = {
  mintAuthority: web3.PublicKey;
  supply: BN;
  decimals: number;
  isInitialized: boolean;
  freezeAuthority: null | web3.PublicKey;
};
