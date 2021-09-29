import * as anchor from "@project-serum/anchor"
import { AccountMeta, Signer, PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { OptionMarketWithKey } from "../types"
import { feeAmount, FEE_OWNER_KEY } from "../fees"

/**
 * Execute a transaction to mint _size_ options
 * 
 * @param {anchor.Program} program - Anchor Program for the PsyAmerican program and the minter as the provider wallet
 * @param {PublicKey} minterOptionAcct - Where the OptionTokens will be sent
 * @param {PublicKey} minterWriterAcct - Where the WriterTokens will be sent
 * @param {PublicKey} minterUnderlyingAccount - Where the underlying asset tokens come from
 * @param {anchor.BN} size - The amount of contracts to mint
 * @param {OptionMarketWithKey} optionMarket - The OptionMarket data
 */
export const mintOptionsTx = async (
  program: anchor.Program,
  minterOptionAcct: PublicKey,
  minterWriterAcct: PublicKey,
  minterUnderlyingAccount: PublicKey,
  size: anchor.BN,
  optionMarket: OptionMarketWithKey,
): Promise<{ tx: string; }> => {

  let mintFeeKey: PublicKey,
    remainingAccounts: AccountMeta[] = [];

  // Add the mint fee account if the market requires one
  const mintFee = feeAmount(optionMarket.underlyingAmountPerContract);
  if (mintFee.gtn(0)) {
    mintFeeKey = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      optionMarket.underlyingAssetMint,
      FEE_OWNER_KEY,
    );
    remainingAccounts.push({
      pubkey: mintFeeKey,
      isWritable: true,
      isSigner: false,
    });
  }
  const tx = await program.rpc.mintOption(size, {
    accounts: {
      userAuthority: program.provider.wallet.publicKey,
      underlyingAssetMint: optionMarket.underlyingAssetMint,
      underlyingAssetPool: optionMarket.underlyingAssetPool,
      underlyingAssetSrc: minterUnderlyingAccount,
      optionMint: optionMarket.optionMint,
      mintedOptionDest: minterOptionAcct,
      writerTokenMint: optionMarket.writerTokenMint,
      mintedWriterTokenDest: minterWriterAcct,
      optionMarket: optionMarket.key,
      feeOwner: FEE_OWNER_KEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    },
    remainingAccounts,
  });
  return {
    tx
  }
};

/**
 * Create a TransactionInstruction for minting _size_ option contracts
 * 
 * @param {anchor.Program} program - Anchor Program for the PsyAmerican program and the minter as the provider wallet
 * @param {PublicKey} minterOptionAcct - Where the OptionTokens will be sent
 * @param {PublicKey} minterWriterAcct - Where the WriterTokens will be sent
 * @param {PublicKey} minterUnderlyingAccount - Where the underlying asset tokens come from
 * @param {anchor.BN} size - The amount of contracts to mint
 * @param {OptionMarket} optionMarket - The OptionMarket data
 */
export const mintOptionInstruction = async (
  program: anchor.Program,
  minterOptionAcct: PublicKey,
  minterWriterAcct: PublicKey,
  minterUnderlyingAccount: PublicKey,
  size: anchor.BN,
  optionMarket: OptionMarketWithKey,
) => {
  let mintFeeKey: PublicKey,
    remainingAccounts: AccountMeta[] = [];

  // Add the mint fee account if the market requires one
  const mintFee = feeAmount(optionMarket.underlyingAmountPerContract);
  if (mintFee.gtn(0)) {
    mintFeeKey = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      optionMarket.underlyingAssetMint,
      FEE_OWNER_KEY,
    );
    remainingAccounts.push({
      pubkey: mintFeeKey,
      isWritable: true,
      isSigner: false,
    });
  }
  
  const signers: Signer[] = []
  const ix = program.instruction.mintOption(size, {
    accounts: {
      userAuthority: program.provider.wallet.publicKey,
      underlyingAssetMint: optionMarket.underlyingAssetMint,
      underlyingAssetPool: optionMarket.underlyingAssetPool,
      underlyingAssetSrc: minterUnderlyingAccount,
      optionMint: optionMarket.optionMint,
      mintedOptionDest: minterOptionAcct,
      writerTokenMint: optionMarket.writerTokenMint,
      mintedWriterTokenDest: minterWriterAcct,
      optionMarket: optionMarket.key,
      feeOwner: FEE_OWNER_KEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    },
    remainingAccounts,
  });

  return {ix, signers}
}