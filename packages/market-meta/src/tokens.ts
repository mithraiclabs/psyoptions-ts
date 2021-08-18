import { Token } from "./types";
/**
 * List of tokens currently available on Devnet
 */
export const DevnetTokens: Token[] = [
  {
    tokenSymbol: 'BTC',
    tokenName: 'Bitcoin',
    mintAddress: 'C6kYXcaRUMqeBF5fhg165RWU7AnpT9z92fvKNoMqjmz6',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png',
    faucetAddress: '97z3NzcDxqRMyE7F73PuHEmAbA72S7eDopjhe7GTymTk',
    decimals: 9,
    defaultContractSize: 0.01,
  },
  {
    tokenSymbol: 'USDC',
    tokenName: 'USDC',
    mintAddress: 'E6Z6zLzk8MWY3TY8E87mr88FhGowEPJTeMWzkqtL6qkF',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/f3ffd0b9ae2165336279ce2f8db1981a55ce30f8/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    faucetAddress: 'E6wQSMPGqHn7dqEMeWcSVfjdkwd8ED5CncQ9BtMNGtUG',
    decimals: 2,
  },
  {
    tokenSymbol: 'PSY',
    tokenName: 'PsyOptions',
    mintAddress: 'BzwRWwr1kCLJVUUM14fQthP6FJKrGpXjw3ZHTZ6PQsYa',
    icon: 'https://docs.psyoptions.io/img/PsyOps.svg',
    faucetAddress: '7jJJnHWagPPG544FtxSVp8eD52FwCsARcqqup1q3XVio',
    decimals: 9,
    defaultContractSize: 100,
  },
  {
    tokenSymbol: 'SOL',
    mintAddress: 'So11111111111111111111111111111111111111112',
    tokenName: 'Solana',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png',
    decimals: 9,
    defaultContractSize: 10,
  },
]

export const MainnetTokens: Token[] = [
  // {
  //   tokenSymbol: "SOL",
  //   tokenName: "Solana",
  //   mintAddress: "So11111111111111111111111111111111111111112",
  //   icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
  //   decimals: 9,
  //   defaultContractSize: 10,
  // },
  {
    tokenSymbol: "BTC",
    tokenName: "Wrapped Bitcoin",
    mintAddress: "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png",
    decimals: 6,
    defaultContractSize: 0.01,
  },
  {
    tokenSymbol: "ETH",
    tokenName: "Wrapped Ethereum",
    mintAddress: "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
    decimals: 6,
    defaultContractSize: 0.1, 
  },
  {
    tokenSymbol: "USDC",
    mintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    tokenName: "USDC",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/f3ffd0b9ae2165336279ce2f8db1981a55ce30f8/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
    decimals: 6,
  },
]
