#!/usr/bin/env bash
set -e
echo $TEST_VAR

# Change to the crank directory
cd $CRANK_DIRECTORY
PATH=$ADD_PATH:$PATH

solana config set --keypair $PAYER_KEYPAIR
solana config set --url $CLUSTER_URL


# Get the payer's wallets
BASE_WALLET=$(spl-token accounts --verbose  --url $CLUSTER_URL --owner $PAYER_KEYPAIR $BASE_MINT | tail -1 | cut -d' ' -f1)
QUOTE_WALLET=$(spl-token accounts --verbose  --url $CLUSTER_URL --owner $PAYER_KEYPAIR $QUOTE_MINT | tail -1 | cut -d' ' -f1)
valid='0-9a-zA-Z'
if [[ $BASE_WALLET =~ [^$valid] ]]; then
  # The base wallet does not match a valid public key, create a new account
  echo "Creating account for mint: $BASE_MINT"
  spl-token create-account --url $CLUSTER_URL --owner $PAYER_KEYPAIR $BASE_MINT
  BASE_WALLET=$(spl-token accounts --verbose  --url $CLUSTER_URL --owner $PAYER_KEYPAIR $BASE_MINT | tail -1 | cut -d' ' -f1)
fi
if [[ $QUOTE_WALLET =~ [^$valid] ]]; then
  # The quote wallet does not match a valid public key, create a new account
echo "Creating account for mint: $QUOTE_MINT"
  spl-token create-account --url $CLUSTER_URL --owner $PAYER_KEYPAIR $QUOTE_MINT
  BASE_WALLET=$(spl-token accounts --verbose  --url $CLUSTER_URL --owner $PAYER_KEYPAIR $QUOTE_MINT | tail -1 | cut -d' ' -f1)
fi

# run the crank
cargo run -- $CLUSTER_URL consume-events --dex-program-id $DEX_PROGRAM_ID --payer $PAYER_KEYPAIR --market $SERUM_MARKET --coin-wallet $BASE_WALLET --pc-wallet $QUOTE_WALLET --num-workers 1 --events-per-worker 5 --log-directory $LOG_PATH