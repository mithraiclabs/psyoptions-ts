import { BN } from "@project-serum/anchor";
import { FARM_PROGRAM_ID_V5 } from "@raydium-io/raydium-sdk";
import { Connection, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import {
  ATRIX_FARM_ID,
  getFarmLps as atrixGetFarmLps,
  getOwnersMapFromStakers,
} from "./atrix";
import {
  getFarmLps as rayGetFarmLps,
  getOwnersMapFromFarmLedgers,
} from "./raydium";
import { getGovernanceStakedTokens, getOwnersMapFromTokenDepositRecords } from "./splGovernance";
import { getSolscanTokenHolders } from "./splToken";
import { getNonSystemOwnedAccounts, wait } from "./utils";

const connection = new Connection("https://api.mainnet-beta.solana.com");
(async () => {
  // TODO: Fix potential big number errors

  const MIN_TOKEN_AMOUNT = 100;
  const MAX_TOKEN_AMOUNT = undefined;
  const token = "PsyFiqqjiv41G7o5SMRzDJCu4psptThNR2GtfeGHfSq"; // change this for a different token ID
  const rayLpTokenMint = "Hrip9d8f6iQ4JxfB85JyGGq3u2WgpmqRSXJZursm26hd"; // Change for different token
  const rayFarmId = new PublicKey(
    "8Zq81uwAeEUUgoe9fz7g25vXr4F3vJfJT5cZCxHne5NE"
  );
  const minRayLpTokens = 25;
  const atrixLpTokenMint = "6nXkH5BYSu5cCCh2h6FEKkYsLrrDDPL7AWnqhbMANshm"; // change for different token
  const minAtrixLpTokens = 17;

  const psyTokenHolders = await getSolscanTokenHolders(token, {
    minTokenAmount: MIN_TOKEN_AMOUNT,
    maxTokenAmount: MAX_TOKEN_AMOUNT,
  });

  const raydiumLpMap = await getSolscanTokenHolders(rayLpTokenMint, {
    minTokenAmount: minRayLpTokens,
  });

  // First get the Raydium farmers
  const raydiumFarmers = await rayGetFarmLps(
    connection,
    FARM_PROGRAM_ID_V5,
    rayFarmId,
    new BN(minRayLpTokens * Math.pow(10, 6))
  );
  // Convert them to a Record where the owner string is the key
  const raydiumFarmOwners = getOwnersMapFromFarmLedgers(raydiumFarmers);

  const atrixLpMap = await getSolscanTokenHolders(atrixLpTokenMint, {
    minTokenAmount: minAtrixLpTokens,
  });

  await wait(1_000);
  const atrixFarmers = await atrixGetFarmLps(
    connection,
    ATRIX_FARM_ID,
    new PublicKey(atrixLpTokenMint),
    new BN(minAtrixLpTokens * Math.pow(10, 6))
  );
  const atrixFarmOwners = getOwnersMapFromStakers(atrixFarmers);

  await wait(1_000);
  const PSY_REALM = new PublicKey(
    "FiG6YoqWnVzUmxFNukcRVXZC51HvLr6mts8nxcm7ScR8"
  );
  const PSY_GOVERNANCE_PROGRAM = new PublicKey(
    "GovHgfDPyQ1GwazJTDY2avSVY8GGcpmCapmmCsymRaGe"
  );
  const governoorrrss = await getGovernanceStakedTokens(
    connection,
    PSY_REALM,
    PSY_GOVERNANCE_PROGRAM,
    new PublicKey(token)
  );
  const governoorrrssMap = getOwnersMapFromTokenDepositRecords(governoorrrss)

  const hodlrs = {
    ...psyTokenHolders,
    ...raydiumLpMap,
    ...raydiumFarmOwners,
    ...atrixLpMap,
    ...atrixFarmOwners,
    ...governoorrrssMap
  };

  // Filter by owner's root account owner (ensuring only the SystemProgram owns
  //  the account to remove Atrix pools or other non-human pools)
  const ownerPubkeys: PublicKey[] = Object.keys(hodlrs).map(
    (x) => new PublicKey(x)
  );
  console.log('Filtering out non-system owned accoutns');
  const ownersToRemove = await getNonSystemOwnedAccounts(
    connection,
    ownerPubkeys
  );
  ownersToRemove.forEach((x) => {
    delete hodlrs[x];
  });

  // Write results to file
  const OUTPUT_DIR = "./outputs";
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }
  fs.writeFileSync(
    `${OUTPUT_DIR}/${token}_hodlrs.json`,
    JSON.stringify(Object.keys(hodlrs)),
    { encoding: "utf-8" }
  );
})();
