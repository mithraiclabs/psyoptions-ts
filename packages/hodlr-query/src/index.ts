import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { default as axios } from "axios";
import * as fs from "fs";
import { getSolscanTokenHolders } from "./splToken";
import { SolscanTokenHolder, SolscanTokenHolderRes } from "./types";
import { getNonSystemOwnedAccounts } from "./utils";

const connection = new Connection("https://api.mainnet-beta.solana.com");
(async () => {
  // TODO: Fix potential big number errors

  const MIN_TOKEN_AMOUNT = 1_000;
  const MAX_TOKEN_AMOUNT = undefined;
  const token = "PsyFiqqjiv41G7o5SMRzDJCu4psptThNR2GtfeGHfSq"; // change this for a different token ID

  const ownerMap = await getSolscanTokenHolders(token, {
    minTokenAmount: MIN_TOKEN_AMOUNT,
    maxTokenAmount: MAX_TOKEN_AMOUNT,
  });

  // Filter by owner's root account owner (ensuring only the SystemProgram owns
  //  the account to remove Atrix pools or other non-human pools)
  const ownerPubkeys: PublicKey[] = Object.keys(ownerMap).map(
    (x) => new PublicKey(x)
  );
  const ownersToRemove = await getNonSystemOwnedAccounts(
    connection,
    ownerPubkeys
  );
  ownersToRemove.forEach((x) => {
    delete ownerMap[x];
  });

  // Write results to file
  const OUTPUT_DIR = "./outputs";
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }
  fs.writeFileSync(
    `${OUTPUT_DIR}/${token}_hodlrs.json`,
    JSON.stringify(ownerMap),
    { encoding: "utf-8" }
  );
})();
