import { DevnetTokens, MainnetTokens } from "./tokens";
import { ClusterEnvs } from './types'
import { DevnetMarkets, MainnetMarkets, TestnetMarkets } from "./markets";

 const _default: ClusterEnvs = {
  devnet: {
    tokens: DevnetTokens,
    optionMarkets: DevnetMarkets,
  },
  mainnet: {
    tokens: MainnetTokens,
    optionMarkets: MainnetMarkets,
  },
  testnet: {
    tokens: [],
    optionMarkets: TestnetMarkets,
  }
}

export default _default;
