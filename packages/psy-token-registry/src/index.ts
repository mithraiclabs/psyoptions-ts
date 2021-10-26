import { ClusterEnvs } from "./types";
import { devnet } from "./devnet";
import { mainnet } from "./mainnet";

export * from "./types";

export const Tokens: ClusterEnvs = {
  devnet,
  mainnet,
  testnet: {},
};
