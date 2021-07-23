const { Market } = require("@mithraic-labs/serum/lib/market")
const { MintLayout } = require("@solana/spl-token")

exports.batchSerumMarkets = async (
  connection,
  marketIds,
  options
) => {
  // Load all of the MarketState data
  const marketInfos = await connection.getMultipleAccountsInfo(marketIds.map(m => m.key))
  if (!marketInfos || !marketInfos.length) {
    throw new Error('Markets not found')
  }
  // decode all of the markets
  const decoded = marketInfos.map((accountInfo, index) =>
    Market.getLayout(marketIds[index].programId).decode(accountInfo.data),
  )

  // Load all of the SPL Token Mint data and orderbook data for the markets
  const mintKeys = []
  decoded.forEach((d) => {
    mintKeys.push(d.baseMint)
    mintKeys.push(d.quoteMint)
  })
  const [mintInfos, orderBookInfos] = await Promise.all([
    connection.getMultipleAccountsInfo(mintKeys),
  ])
  const mints = mintInfos?.map((mintInfo) => MintLayout.decode(mintInfo.data))

  // instantiate the many markets
  const serumMarkets = decoded.map((d, index) => {
    const { decimals: baseMintDecimals } = mints?.[index * 2]
    const { decimals: quoteMintDecimals } = mints?.[index * 2 + 1]
    const market = new Market(
      d,
      baseMintDecimals,
      quoteMintDecimals,
      options,
      marketIds[index].programId,
    )
    return market
  })

  return serumMarkets
}