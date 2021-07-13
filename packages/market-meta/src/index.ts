import { DevnetTokens, MainnetTokens } from "./tokens";
import { ClusterEnvs } from './types'

 const _default: ClusterEnvs = {
  devnet: {
    tokens: DevnetTokens,
  },
  mainnet: {
    tokens: MainnetTokens,
  },
  testnet: {
    tokens: [],
  }
}

export default _default;
