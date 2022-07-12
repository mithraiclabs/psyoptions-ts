import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { default as axios } from "axios";
import * as fs from "fs";
import { SolscanTokenHolder, SolscanTokenHolderRes } from "./types";
import { getNonSystemOwnedAccounts } from "./utils";

export function throttleAsync(fn: Function, wait: number) {
    let lastRun = 0;

    async function throttled(...args) {
        const currentWait = lastRun + wait - Date.now();
        const shouldRun = currentWait <= 0;

        if (shouldRun) {
            lastRun = Date.now();
            return await fn(...args);
        } else {
            return await new Promise(function (resolve) {
                setTimeout(function () {
                    resolve(throttled(...args));
                }, currentWait);
            });
        }
    }

    return throttled;
}


const getTokenOwners = async (offset: number, limit: number, token: string): Promise<SolscanTokenHolderRes> => {
    const res = await axios
        .get(
            `https://public-api.solscan.io/token/holders?tokenAddress=${token}&offset=${offset}&limit=${limit}`
        );
    return res.data;
}

// Make 2 requests per second
const throttledGetTokenOwners: (...args: any[]) => Promise<SolscanTokenHolderRes> = throttleAsync(getTokenOwners, 500);

const connection = new Connection("https://api.mainnet-beta.solana.com");
(async () => {

    // TODO: Fix potential big number errors

    const MIN_TOKEN_AMOUNT = 1_000;
    const MAX_TOKEN_AMOUNT = undefined;
    const token = "PsyFiqqjiv41G7o5SMRzDJCu4psptThNR2GtfeGHfSq"; // change this for a different token ID

    const ownerMap: Record<string, SolscanTokenHolder> = {};
    let offset = 0;
    // Solscan has a max limit size of 100
    const STEP = 100;
    const response = await throttledGetTokenOwners(0, 1, token);
    const MAX_HOLDERS = response.total;

    while (offset <= MAX_HOLDERS) {
        const response = await throttledGetTokenOwners(offset, STEP, token);
        const holders = response.data;
        for (let x = 0; x < holders.length; x++) {
            if (!ownerMap[holders[x].owner]) {
                ownerMap[holders[x].owner] = holders[x];
            }
        }
        offset += STEP;
    }
    let ownerKeys = Object.keys(ownerMap);
    console.log(`Total owners from Solscan: ${ownerKeys.length}`);

    // Filter for by an amount range
    ownerKeys.forEach(owner => {
        const holderInfo = ownerMap[owner];
        const humanAmount = holderInfo.amount / Math.pow(10, holderInfo.decimals);
        if (MIN_TOKEN_AMOUNT && humanAmount < MIN_TOKEN_AMOUNT) {
            delete ownerMap[owner];
        } else if (MAX_TOKEN_AMOUNT && humanAmount > MAX_TOKEN_AMOUNT) {
            delete ownerMap[owner];
        }
    })
    

    // Filter by owner's root account owner (ensuring only the SystemProgram owns 
    //  the account to remove Atrix pools or other non-human pools)
    const ownerPubkeys: PublicKey[] = Object.keys(ownerMap).map(x => new PublicKey(x));
    const ownersToRemove = await getNonSystemOwnedAccounts(connection, ownerPubkeys);
    ownersToRemove.forEach(x => {
        delete ownerMap[x];   
    });

    console.log(`Total owners after filters: ${Object.keys(ownerMap).length}`);

    // Write results to file
    const OUTPUT_DIR = "./outputs";
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR);
    }
    fs.writeFileSync(`${OUTPUT_DIR}/${token}_hodlrs.json`, JSON.stringify(ownerMap), {encoding: "utf-8"});
})();