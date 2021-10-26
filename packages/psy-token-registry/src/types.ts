export enum ENV {
  MainnetBeta = 101,
  Testnet = 102,
  Devnet = 103,
}

export type Token = {
  chainId: ENV;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  tags: string[];
  extensions: Record<string, string>;
};

export type ClusterEnv = Record<string, Token>;

enum Clusters {
  devnet = "devnet",
  mainnet = "mainnet",
  testnet = "testnet",
}

export type ClusterEnvs = Record<Clusters, ClusterEnv>;
