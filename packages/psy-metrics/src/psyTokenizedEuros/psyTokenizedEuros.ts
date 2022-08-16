import { AnchorProvider, BN, Spl, web3 } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import { divideBnToNumber, getMultipleMintInfos } from "../utils";
import { MintInfo, TokenAccount } from "../types";

// TODO: Polyfill this so the package supports Hermes
const textEncoder = new TextEncoder();

export const getLockedTokensMap = async (anchorProvider: AnchorProvider) => {
  const splToken = Spl.token(anchorProvider);
  const programId = new web3.PublicKey(
    "FASQhaZQT53W9eT9wWnPoBFw8xzZDey9TbMmJj6jCQTs"
  );
  const [poolAuthority] = await web3.PublicKey.findProgramAddress(
    [textEncoder.encode("poolAuthority")],
    programId
  );
  const tokenProgramAccounts =
    await anchorProvider.connection.getTokenAccountsByOwner(poolAuthority, {
      programId: TOKEN_PROGRAM_ID,
    });
  const mintTokenAccountsMap: Record<string, web3.PublicKey[]> = {};
  const mintKeys: Record<string, boolean> = {};
  const tokenInfos: TokenAccount[] = [];
  tokenProgramAccounts.value.forEach((tokenProgramAccount) => {
    // Decode the account data buffer
    const dataBuffer = tokenProgramAccount.account.data;
    const decoded = splToken.account.token.coder.accounts.decode(
      "token",
      dataBuffer
    ) as TokenAccount;
    tokenInfos.push(decoded);
    const mintAddress = decoded.mint.toBase58();
    // Add the mint to the mint keys object
    mintKeys[mintAddress] = true;
    // Add the token account to the mintTokenAccountsMap
    if (Array.isArray(mintTokenAccountsMap[mintAddress])) {
      mintTokenAccountsMap[mintAddress].push(tokenProgramAccount.pubkey);
    } else {
      mintTokenAccountsMap[mintAddress] = [tokenProgramAccount.pubkey];
    }
  });

  const mintPubkeys = Object.keys(mintKeys).map((x) => new web3.PublicKey(x));
  const mintInfos = await getMultipleMintInfos(anchorProvider, mintPubkeys);
  const mintMap = mintInfos.reduce((acc: Record<string, MintInfo>, curr) => {
    acc[curr.publicKey.toString()] = curr.account;
    return acc;
  }, {});

  const res: Record<string, number> = {};
  // consolidate the mints and amounts
  tokenInfos.forEach((tokenAccount) => {
    const mintKey = tokenAccount.mint;
    const mintInfo = mintMap[mintKey.toString()];
    if (!mintInfo) {
        // This could happen for old accounts where the option meta data is on chain, but the mint
        //  was closed
        return;
    }
    const amountFp = divideBnToNumber(
      tokenAccount.amount,
      new BN(Math.pow(10, mintInfo.decimals))
    );
    if (res[mintKey.toString()]) {
      res[mintKey.toString()] += amountFp;
    } else {
      res[mintKey.toString()] = amountFp;
    }
  });

  return res;
}
