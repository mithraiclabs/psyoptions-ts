import {
  AnchorProvider,
  BN,
  ProgramAccount,
  Spl,
  web3,
} from "@project-serum/anchor";
import { MintInfo, TokenAccount } from "./types";

export const wait = (delayMS: number) =>
  new Promise((resolve) => setTimeout(resolve, delayMS));

export const divideBnToNumber = (numerator: BN, denominator: BN): number => {
    const quotient = numerator.div(denominator).toNumber();
    const rem = numerator.umod(denominator);
    const gcd = rem.gcd(denominator);
    return quotient + rem.div(gcd).toNumber() / denominator.div(gcd).toNumber();
  }

export const chunkArray = <T>(array: T[], groupSize: number = 100): T[][] =>
  array.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / groupSize);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

// TODO: Create more elegant connection RPS throttle

export const getMultipleTokenInfo = async (
  provider: AnchorProvider,
  pubKeys: web3.PublicKey[]
): Promise<ProgramAccount<TokenAccount>[]> => {
  const splToken = Spl.token(provider);
  var pubList = chunkArray(pubKeys);
  const res: ProgramAccount<TokenAccount>[] = [];

  await pubList.reduce(async (acc, curr, i) => {
    await acc;
    await wait(750);
    const info = (await splToken.account.token.fetchMultiple(
      curr
    )) as unknown as TokenAccount[];
    if (info === null) {
      throw new Error("Failed to find mint account");
    }
    info.forEach((tokenData, index) => {
      if (tokenData != null) {
        const details = {
          publicKey: curr[index],
          account: {
            ...tokenData,
          },
        };
        res.push(details);
      }
    });
    return null;
  }, Promise.resolve(null));
  return res;
};

export const getMultipleMintInfos = async (
  provider: AnchorProvider,
  pubKeys: web3.PublicKey[]
): Promise<ProgramAccount<MintInfo>[]> => {
  const splToken = Spl.token(provider);
  const res: ProgramAccount<MintInfo>[] = [];
  var pubList = chunkArray(pubKeys);

  await pubList.reduce(async (acc, curr, i) => {
    await acc;
    await wait(750);
    const info = (await splToken.account.mint.fetchMultiple(
      curr
    )) as unknown as MintInfo[];
    if (info === null) {
      throw new Error("Failed to find mint account");
    }
    info.forEach((mintData, index) => {
      if (mintData != null) {
        const details = {
          publicKey: curr[index],
          account: {
            ...mintData,
          },
        };
        res.push(details);
      }
    });
    return null;
  }, Promise.resolve(null));

  return res;
};
