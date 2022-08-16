import { PsyAmerican, PsyAmericanIdl } from "@mithraic-labs/psy-american";
import { AnchorProvider, Program, web3 } from "@project-serum/anchor";
import { getMultipleMintInfos } from "../utils";
import { getMultipleTokenInfo } from "../utils";

const getAllOptionAccounts = async (program: Program<PsyAmerican>) => {
  const accts = await program.account.optionMarket.all();
  return accts.map((acct) => ({
    ...acct.account,
    key: acct.publicKey,
  }));
};

const getPsyAmericanTokenAccounts = async (anchorProvider: AnchorProvider) => {
  const program = new Program(
    PsyAmericanIdl,
    new web3.PublicKey("R2y9ip6mxmWUj4pt54jP2hz2dgvMozy9VTSwMWE7evs"),
    anchorProvider
  );
  const optionMarkets = await getAllOptionAccounts(program);
  let mintTokenAccountsMap: Record<string, web3.PublicKey[]> = {};
  const mintKeys: Record<string, boolean> = {};
  const tokenAccounts: web3.PublicKey[] = [];
  optionMarkets.forEach((market) => {
    if (!mintTokenAccountsMap[market.underlyingAssetMint.toBase58()]) {
      mintTokenAccountsMap[market.underlyingAssetMint.toBase58()] = [];
    }
    if (!mintTokenAccountsMap[market.quoteAssetMint.toBase58()]) {
      mintTokenAccountsMap[market.quoteAssetMint.toBase58()] = [];
    }

    if (mintTokenAccountsMap[market.underlyingAssetMint.toBase58()]) {
      mintTokenAccountsMap[market.underlyingAssetMint.toBase58()].push(
        market.underlyingAssetPool
      );
      tokenAccounts.push(market.underlyingAssetPool);
    }

    if (mintTokenAccountsMap[market.quoteAssetMint.toBase58()]) {
      mintTokenAccountsMap[market.quoteAssetMint.toBase58()].push(
        market.quoteAssetPool
      );
      tokenAccounts.push(market.quoteAssetPool);
    }

    if (!mintKeys[market.underlyingAssetMint.toBase58()])
      mintKeys[market.underlyingAssetMint.toBase58()] = true;
    if (!mintKeys[market.quoteAssetMint.toBase58()])
      mintKeys[market.underlyingAssetMint.toBase58()] = true;
  });
  return { mintKeys, mintTokenAccountsMap, tokenAccounts };
};

/**
 * Load all the tokens locked in the PsyAmerican programs. Map the Mint address to the total 
 * number of tokens.
 * 
 * @returns {Promise<Record<string, number>>}
 */
export const getLockedTokensMap = async (provider: AnchorProvider) => {
    const {
        mintKeys,
        mintTokenAccountsMap: protocolAccountMap,
        tokenAccounts,
      }  = await getPsyAmericanTokenAccounts(provider);

    const [tokenInfos, mintInfos] = await Promise.all([
        getMultipleTokenInfo(provider, tokenAccounts),
        getMultipleMintInfos(provider, Object.keys(mintKeys).map(x => new web3.PublicKey(x)))
    ]);
};
