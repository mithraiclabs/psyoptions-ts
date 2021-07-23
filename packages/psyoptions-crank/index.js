const { MarketMeta } = require('@mithraic-labs/market-meta')
const { spawn } = require('child_process')
const { Connection, PublicKey,  } = require('@solana/web3.js')
const yargs = require('yargs')

const { batchSerumMarkets } = require('./src/helpers/serum')
const { wait } = require('./src/helpers/utils')

const argv = yargs
  .scriptName('serum-vial')
  .strict()

  .option('dex-directory', {
    type: 'string',
    describe: 'Directory where the serum-dex repository lives',
    default: undefined
  })
  .help()
  .version()
  .usage('$0 [options]')
  .example(`$0 --dex-directory /Users/tommy/repositories/serum-dex`)
  .detectLocale(false).argv

const CLUSTER_URL = 'https://api.devnet.solana.com'
const ADD_PATH = `${process.env.HOME}/.local/share/solana/install/active_release/bin:${process.env.HOME}/.cargo/bin`
const CRANK_DIRECTORY = `${argv['dex-directory']}/dex/crank`
const DEX_PROGRAM_ID = 'DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY'
const PAYER_KEYPAIR = `${process.env.HOME}/.config/solana/id.json`
const LOG_DIR = `/var/logs/serum`

const connection = new Connection(CLUSTER_URL)

const activeMarkets = MarketMeta.devnet.optionMarkets.filter(marketMeta => 
  marketMeta.expiration * 1000 > new Date().getTime()
)

// Loop one by one via reduce to wait a few seconds to avoid rate limiting
const starterPromise = Promise.resolve(null);
const crankSerumMarkets = async (serumMarkets) => {
  await serumMarkets.reduce(async (accumulator, serumMarket) => {
    await accumulator;
    const proc = spawn('bash', ['./scripts/crank_market.sh'], {
      env: {
        BASE_MINT: serumMarket.baseMintAddress.toString(),
        CLUSTER_URL,
        CRANK_DIRECTORY,
        DEX_PROGRAM_ID,
        PAYER_KEYPAIR,
        QUOTE_MINT: serumMarket.quoteMintAddress.toString(),
        SERUM_MARKET: serumMarket.address.toString(),
        ADD_PATH,
        LOG_PATH: `${LOG_DIR}/crank_${serumMarket.address.toString()}.log`
      },
      detached: true,
      shell: true,
      // kill the process after 1 minute
      timeout: 60*1000,
    })
    proc.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
  
    proc.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    
    proc.on('close', (code) => {
      console.log(`child process for market ${serumMarket.address.toString()} exited with code ${code}`);
    });
    return (async () => {
      // wait 1 minute to allow the crank to run through the event queue
      await wait(60_000)
      // kill the child process of the child process
      process.kill(-proc.pid)
    })()
  }, starterPromise)
}

;(async () => {
  const marketIds = activeMarkets.map(market => ({
    key: new PublicKey(market.serumMarketAddress),
    programId: new PublicKey(market.serumProgramId)
  }))
  const serumMarkets = await batchSerumMarkets(connection, marketIds, {})
  while (true) {
    await crankSerumMarkets(serumMarkets)
    await wait(60*60*1000)
  }
})();


