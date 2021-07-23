const { MarketMeta } = require('@mithraic-labs/market-meta')
const { spawn } = require('child_process')
const { Connection,  } = require('@solana/web3.js')

const CLUSTER_URL = 'https://api.devnet.solana.com'

const connection = new Connection(CLUSTER_URL)

const activeMarkets = MarketMeta.devnet.optionMarkets.filter(marketMeta => 
  marketMeta.expiration * 1000 > new Date().getTime()
)


const serumMarkets = 
activeMarkets.forEach(market => {
  const process = spawn('bash', ['./scripts/crank_market.sh'], {env: {
    BASE_MINT: market.
    CLUSTER_URL,
    CRANK_DIRECTORY: '/Users/tommyjohnson/Documents/personal_dev/crypto/solana_dev/mithraiclabs/serum-dex/dex/crank',
    DEX_PROGRAM_ID: 'DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY',
    PAYER_KEYPAIR: '~/.config/solana/devnet/id.json',
    SERUM_MARKET: '4qQKj8SzLJ96ro5HVASkn56bdrPkWn1W1hWXaKgy7QmQ',
    TEST_VAR: market.serumMarketAddress.toString()
  }})
  process.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  process.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  
  process.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
})


