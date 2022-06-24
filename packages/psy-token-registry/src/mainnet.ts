import { ClusterEnv } from "./types";

export const mainnet: ClusterEnv = {
  PsyFiqqjiv41G7o5SMRzDJCu4psptThNR2GtfeGHfSq: {
    chainId: 101,
    address: "PsyFiqqjiv41G7o5SMRzDJCu4psptThNR2GtfeGHfSq",
    symbol: "PSY",
    name: "PsyOptions",
    decimals: 6,
    logoURI:
      "https://uploads-ssl.webflow.com/6158e3591ba06d14de4fd0df/61f900784e63439a5a052fed_PsyOptions.svg",
    tags: ["options", "defi"],
    extensions: {
      // TODO add these
      // serumV3Usdc: "",
      // serumV3Usdt: "",
      coingeckoId: "psyoptions",
    },
  },
  "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E": {
    chainId: 101,
    address: "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
    symbol: "BTC",
    name: "Wrapped Bitcoin (Sollet)",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png",
    tags: ["wrapped-sollet", "bitcoin"],
    extensions: {
      bridgeContract:
        "https://etherscan.io/address/0xeae57ce9cc1984f202e15e038b964bb8bdf7229a",
      serumV3Usdc: "A8YFbxQYFVqKZaoYJLLUVcQiWP7G2MeEgW5wsAQgMvFw",
      serumV3Usdt: "C1EuT9VokAKLiW7i2ASnZUvxDoKuKkCpDDeNxAptuNe4",
      coingeckoId: "bitcoin",
    },
  },
  "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk": {
    chainId: 101,
    address: "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk",
    symbol: "ETH",
    name: "Wrapped Ethereum (Sollet)",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk/logo.png",
    tags: ["wrapped-sollet", "ethereum"],
    extensions: {
      bridgeContract:
        "https://etherscan.io/address/0xeae57ce9cc1984f202e15e038b964bb8bdf7229a",
      serumV3Usdc: "4tSvZvnbyzHXLMTiFonMyxZoHmFqau1XArcRCVHLZ5gX",
      serumV3Usdt: "7dLVkUfBVfCGkFhSXDCq1ukM9usathSgS716t643iFGF",
      coingeckoId: "ethereum",
    },
  },
  So11111111111111111111111111111111111111112: {
    chainId: 101,
    address: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Wrapped SOL",
    decimals: 9,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    tags: [],
    extensions: {
      website: "https://solana.com/",
      serumV3Usdc: "9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT",
      serumV3Usdt: "HWHvQhFmJB3NUcu1aihKmrKegfVxBEHzwVX6yZCKEsi1",
      coingeckoId: "solana",
    },
  },
  mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: {
    chainId: 101,
    address: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    symbol: "mSOL",
    name: "Marinade staked SOL (mSOL)",
    decimals: 9,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png",
    extensions: {
      coingeckoId: "msol",
      discord: "https://discord.gg/mGqZA5pjRN",
      github: "https://github.com/marinade-finance",
      medium: "https://medium.com/marinade-finance",
      serumV3Usdc: "6oGsL2puUgySccKzn9XA9afqF217LfxP5ocq4B3LWsjy",
      twitter: "https://twitter.com/MarinadeFinance",
      website: "https://marinade.finance",
    },
    tags: [],
  },
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
    chainId: 101,
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    tags: ["stablecoin"],
    extensions: {
      website: "https://www.centre.io/",
      coingeckoId: "usd-coin",
      serumV3Usdt: "77quYg4MGneUdjgXCunt9GgM1usmrxKY31twEy3WHwcS",
    },
  },
  Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS: {
    chainId: 101,
    address: "Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS",
    symbol: "PAI",
    name: "PAI (Parrot USD)",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS/logo.svg",
    tags: ["utility-token", "stablecoin"],
    extensions: {
      coingeckoId: "parrot-usd",
      discord: "https://discord.gg/gopartyparrot",
      medium: "https://gopartyparrot.medium.com/",
      telegram: "https://t.me/gopartyparrot",
      twitter: "https://twitter.com/gopartyparrot",
      website: "https://parrot.fi",
    },
  },
  GePFQaZKHcWE5vpxHfviQtH5jgxokSs51Y5Q4zgBiMDs: {
    chainId: 101,
    address: "GePFQaZKHcWE5vpxHfviQtH5jgxokSs51Y5Q4zgBiMDs",
    symbol: "JFI",
    name: "Jungle DeFi",
    decimals: 9,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/GePFQaZKHcWE5vpxHfviQtH5jgxokSs51Y5Q4zgBiMDs/logo.png",
    tags: ["governance-token"],
    extensions: {
      discord: "https://discord.gg/2DWjx5NywE",
      medium: "https://medium.com/@JungleDeFi",
      twitter: "https://twitter.com/JungleDeFi",
      website: "https://jungledefi.io/",
    },
  },
  "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm": {
    chainId: 101,
    address: "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm",
    symbol: "scnSOL",
    name: "Socean staked SOL",
    decimals: 9,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm/logo.png",
    tags: ["stake-pool"],
    extensions: {
      coingeckoId: "socean-staked-sol",
      discord: "https://discord.gg/k8ZcW27bq9",
      medium: "https://medium.com/@soceanfinance",
      serumV3Usdc: "D52sefGCWho2nd5UGxWd7wCftAzeNEMNYZkdEPGEdQTb",
      twitter: "https://twitter.com/soceanfinance",
      website: "https://socean.fi/",
    },
  },
  "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": {
    chainId: 101,
    address: "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj",
    symbol: "stSOL",
    name: "Lido Staked SOL",
    decimals: 9,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj/logo.png",
    tags: ["stake-pool"],
    extensions: {
      coingeckoId: "lido-staked-sol",
      coinmarketcap: "https://coinmarketcap.com/currencies/lido-for-solana/",
      discord: "https://discord.gg/w9pXXgQPu8",
      github: "https://github.com/ChorusOne/solido",
      serumV3Usdc: "5F7LGsP1LPtaRV7vVKgxwNYX4Vf22xvuzyXjyar7jJqp",
      twitter: "https://twitter.com/LidoFinance",
      website: "https://solana.lido.fi/",
    },
  },
  SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt: {
    chainId: 101,
    address: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
    symbol: "SRM",
    name: "Serum",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt/logo.png",
    tags: [],
    extensions: {
      coingeckoId: "serum",
      serumV3Usdc: "ByRys5tuUWDgL73G8JBAEfkdFf8JWBzPBDHsBVQ5vbQA",
      serumV3Usdt: "AtNnsY1AyRERWJ8xCskfz38YdvruWVJQUVXgScC1iPb",
      waterfallbot: "https://bit.ly/SRMwaterfall",
      website: "https://projectserum.com/",
    },
  },
  SLNDpmoWTVADgEdndyvWzroNL7zSi1dF9PC3xHGtPwp: {
    chainId: 101,
    address: "SLNDpmoWTVADgEdndyvWzroNL7zSi1dF9PC3xHGtPwp",
    symbol: "SLND",
    name: "Solend",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SLNDpmoWTVADgEdndyvWzroNL7zSi1dF9PC3xHGtPwp/logo.png",
    tags: ["solend", "lending"],
    extensions: {
      coingeckoId: "solend",
      serumV3Usdc: "F9y9NM83kBMzBmMvNT18mkcFuNAPhNRhx7pnz9EDWwfv",
      twitter: "https://twitter.com/solendprotocol",
      website: "https://solend.fi",
    },
  },
  CzXF8oUJSsB9ADKV99WAi2TgytqAyKvQw6EihwiL9em4: {
    chainId: 101,
    address: "CzXF8oUJSsB9ADKV99WAi2TgytqAyKvQw6EihwiL9em4",
    symbol: "DRGNZ",
    name: "Boryoku Genesis Dragonz Index",
    decimals: 2,
    logoURI: "https://i.imgur.com/AzJI7FQ.png",
    tags: ["bridgesplit-fraction", "boryoku-genesis", "fraction-index", "fnft"],
    extensions: {
      discord: "https://discord.gg/bridgesplit",
      twitter: "https://twitter.com/bridgesplit",
      vault:
        "https://app.bridgesplit.com/fractions/CzXF8oUJSsB9ADKV99WAi2TgytqAyKvQw6EihwiL9em4",
    },
  },
};
