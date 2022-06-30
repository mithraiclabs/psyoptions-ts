import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { default as axios } from "axios";
import * as fs from "fs";
import { SolscanTokenHolder, SolscanTokenHolderRes } from "./types";
import { chunkArray } from "./utils";

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

    const ownerMap: Record<string, SolscanTokenHolder> = {};
    let offset = 0;
    // Solscan has a max limit size of 100
    const STEP = 100;
    // change this number to change the limit of owners you want to get. Undefined pulls all holders before filtering
    const LIMIT = undefined;
    const token = "PsyFiqqjiv41G7o5SMRzDJCu4psptThNR2GtfeGHfSq"; // change this for a different token ID
    const response = await throttledGetTokenOwners(0, 1, token);
    const MAX_HOLDERS = response.total;
    const limit = typeof LIMIT === "number" && LIMIT < MAX_HOLDERS ? LIMIT : MAX_HOLDERS;

    while (offset <= limit) {
        const response = await throttledGetTokenOwners(offset, STEP, token);
        const holders = response.data;
        for (let x = 0; x < holders.length; x++) {
            if (!ownerMap[holders[x].owner]) {
                ownerMap[holders[x].owner] = holders[x];
            }
        }
        offset += STEP;
    }
    console.log(`Total owners from Solscan: ${Object.keys(ownerMap).length}`);

    // TODO: Filter for by an amount range

    // Filter by owner's root account owner (ensuring only the SystemProgram owns 
    //  the account to remove Atrix pools or other non-human pools)
    const ownerKeys: PublicKey[] = Object.keys(ownerMap).map(x => new PublicKey(x));

    const ownersToRemove: string[] = [];
    await Promise.all(chunkArray(ownerKeys, 100).map(async group => {
        const accountInfos = await connection.getMultipleAccountsInfo(group, "confirmed");
        accountInfos.forEach((info, index) => {
            if (!info) {
                // NOTE: Looks like this can occur if the account was not rent exempt and there is 
                //  not SOL for rent.

                // console.log(`No info found for ${group[index].toString()}`)
            } else if (info.owner.toString() != SystemProgram.programId.toString()) {
                ownersToRemove.push(group[index].toString())
            }
        })
    }))

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