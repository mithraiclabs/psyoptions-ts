import { DevnetTokens, MainnetTokens } from "./tokens";
import { ClusterEnvs } from './types'
import { DevnetMarkets, MainnetMarkets, TestnetMarkets } from "./markets";

 export const MarketMeta: ClusterEnvs = {
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
