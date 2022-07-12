import axios from "axios";
import { SolscanTokenHolder, SolscanTokenHolderRes } from "./types";
import { throttleAsync } from "./utils";

export const getSolscanTokenHolders = async (
  tokenMint: string,
  filters: {
    minTokenAmount?: number,
    maxTokenAmount?: number,  
  }
) => {
  const ownerMap: Record<string, SolscanTokenHolder> = {};
  let offset = 0;
  // Solscan has a max limit size of 100
  const STEP = 100;
  const response = await throttledGetTokenOwners(0, 1, tokenMint);
  const MAX_HOLDERS = response.total;

  while (offset <= MAX_HOLDERS) {
    const response = await throttledGetTokenOwners(offset, STEP, tokenMint);
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
  ownerKeys.forEach((owner) => {
    const holderInfo = ownerMap[owner];
    const humanAmount = holderInfo.amount / Math.pow(10, holderInfo.decimals);
    if (filters.minTokenAmount && humanAmount < filters.minTokenAmount) {
      delete ownerMap[owner];
    } else if (filters.maxTokenAmount && humanAmount > filters.maxTokenAmount) {
      delete ownerMap[owner];
    }
  });
  return ownerMap;
};

const getTokenOwners = async (
  offset: number,
  limit: number,
  token: string
): Promise<SolscanTokenHolderRes> => {
  const res = await axios.get(
    `https://public-api.solscan.io/token/holders?tokenAddress=${token}&offset=${offset}&limit=${limit}`
  );
  return res.data;
};

// Make 2 requests per second
const throttledGetTokenOwners: (
  ...args: any[]
) => Promise<SolscanTokenHolderRes> = throttleAsync(getTokenOwners, 500);
