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

///////// Governance & VSR Types //////////
interface LockupKind {
  none: object
  daily: object
  monthly: object
  cliff: object
  constant: object
}

interface Lockup {
  endTs: BN
  kind: LockupKind
  startTs: BN
}

export interface Deposit {
  allowClawback: boolean
  amountDepositedNative: BN
  amountInitiallyLockedNative: BN
  isUsed: boolean
  lockup: Lockup
  votingMintConfigIdx: number
}

export interface DepositWithWallet {
  voter: web3.PublicKey
  wallet: web3.PublicKey
  deposit: Deposit
}

export interface Voter {
  voterAuthority: web3.PublicKey;
  registrar: web3.PublicKey;
  deposits: Deposit[];
  voter_bump: number;
  voter_weight_record_bump: number;
}

export interface votingMint {
  baselineVoteWeightScaledFactor: BN
  digitShift: number
  grantAuthority: web3.PublicKey
  lockupSaturationSecs: BN
  maxExtraLockupVoteWeightScaledFactor: BN
  mint: web3.PublicKey
}

export interface Registrar {
  governanceProgramId: web3.PublicKey
  realm: web3.PublicKey
  realmAuthority: web3.PublicKey
  realmGoverningTokenMint: web3.PublicKey
  votingMints: votingMint[]
}