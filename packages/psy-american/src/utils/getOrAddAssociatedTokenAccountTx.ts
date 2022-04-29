import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { FEE_OWNER_KEY } from "../fees";
import { Provider } from "@project-serum/anchor";

/**
 * Returns a TransactionInstruction for creating the associated token account 
 * if one deos not exist.
 * 
 * @param associatedAddress - The associated token account address
 * @param mintKey - The SPL token mint address
 * @param provider - The Anchor provider that has the wallet
 * @param owner - The user's address that owns the associated token account
 * @returns 
 */
export const getOrAddAssociatedTokenAccountTx = async (
  associatedAddress: PublicKey,
  mintKey: PublicKey,
  provider: Provider,
  owner: PublicKey = FEE_OWNER_KEY
): Promise<TransactionInstruction | null> => {
  // This is the optimum logic, considering TX fee, client-side computation,
  // RPC roundtrips and guaranteed idempotent.
  // Sadly we can't do this atomically;
  const accountInfo = await provider.connection.getAccountInfo(
    associatedAddress
  );
  if (accountInfo) {
    // accountInfo exists, so the associated token account has already
    // been initialized
    return null;
  }

  return Token.createAssociatedTokenAccountInstruction(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mintKey,
    associatedAddress,
    owner,
    // @ts-ignore
    provider.wallet.publicKey
  );
};
