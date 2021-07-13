import { Token } from "./types";
/**
 * List of tokens currently available on Devnet
 */
export const DevnetTokens: Token[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    mintAddress: 'C6kYXcaRUMqeBF5fhg165RWU7AnpT9z92fvKNoMqjmz6',
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png',
    faucetAddress: '97z3NzcDxqRMyE7F73PuHEmAbA72S7eDopjhe7GTymTk',
  },
  {
    symbol: 'USDC',
    name: 'USDC',
    mintAddress: 'E6Z6zLzk8MWY3TY8E87mr88FhGowEPJTeMWzkqtL6qkF',
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/f3ffd0b9ae2165336279ce2f8db1981a55ce30f8/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    faucetAddress: 'E6wQSMPGqHn7dqEMeWcSVfjdkwd8ED5CncQ9BtMNGtUG',
  },
  {
    symbol: 'PSY',
    name: 'PsyOptions',
    mintAddress: 'BzwRWwr1kCLJVUUM14fQthP6FJKrGpXjw3ZHTZ6PQsYa',
    iconUrl: 'https://docs.psyoptions.io/img/PsyOps.svg',
    faucetAddress: '7jJJnHWagPPG544FtxSVp8eD52FwCsARcqqup1q3XVio',
  },
  {
    symbol: 'SOL',
    mintAddress: 'So11111111111111111111111111111111111111112',
    name: 'Solana',
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png',
  },
]

export const MainnetTokens: Token[] = [
  {
    symbol: "SOL",
    name: "Solana",
    mintAddress: "So11111111111111111111111111111111111111112",
    iconUrl: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png"
  },
  {
    symbol: "BTC",
    name: "Wrapped Bitcoin",
    mintAddress: "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
    iconUrl: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png"
  },
  {
    symbol: "ETH",
    name: "Wrapped Ethereum",
    mintAddress: "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk",
    iconUrl: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"
  },
  {
    symbol: "USDC",
    mintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    name: "USDC",
    iconUrl: "https://raw.githubusercontent.com/trustwallet/assets/f3ffd0b9ae2165336279ce2f8db1981a55ce30f8/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
  },
]