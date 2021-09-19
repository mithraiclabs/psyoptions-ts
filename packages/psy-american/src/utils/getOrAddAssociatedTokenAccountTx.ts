import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { FEE_OWNER_KEY } from "../fees";
import { Provider } from "@project-serum/anchor";

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
    provider.wallet.publicKey
  );
};
