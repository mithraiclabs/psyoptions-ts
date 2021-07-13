/**
 * Stores relevant information about a give SPL Token.
 * 
 * NOTE: We do not include decimals because we want to avoid human error from data entry.
 * Decimals can be retrieved with an on-chain call to the SPL Token program.
 */
export type Token = {
  symbol: String;
  name: String;
  mintAddress: String;
  faucetAddress?: String;
  iconUrl: String;
}

export type OptionMarketMeta = {
  expiration: number
  optionMarketAddress: string
  optionContractMintAddress: string
  optionWriterTokenMintAddress: string
  quoteAssetMint: string
  underlyingAssetMint: string
  underlyingAssetPerContract: string
  quoteAssetPerContract: string
  serumMarketAddress: string
}

export type ClusterEnv = {
  tokens: Token[];
  optionMarkets: OptionMarketMeta[];
}

enum Clusters {
  devnet = 'devnet',
  mainnet = 'mainnet',
  testnet = 'testnet',
}

export type ClusterEnvs = Record<Clusters, ClusterEnv>