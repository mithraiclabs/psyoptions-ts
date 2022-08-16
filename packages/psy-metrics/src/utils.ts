import {
  AnchorProvider,
  ProgramAccount,
  Spl,
  web3,
} from "@project-serum/anchor";

export const getMultipleTokenInfo = async (
  provider: AnchorProvider,
  pubKeys: web3.PublicKey[]
) => {
  const splToken = Spl.token(provider);
  let array: ProgramAccount<{}>[] = [];
  var pubList = pubKeys.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / 100);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

  for await (const subPubList of pubList) {
    const info = await splToken.account.token.fetchMultiple(subPubList);
    if (info === null) {
      throw new Error("Failed to find mint account");
    }
    console.log("** token data", info[0]);

    info.forEach((tokenData, index) => {
      if (tokenData != null) {
        const details = {
          pubkey: subPubList[index],
          account: {
            ...tokenData,
          },
        };
        // @ts-ignore
        array.push(details);
      }
    });
  }

  return array;
};

export const getMultipleMintInfos = async (
  provider: AnchorProvider,
  pubKeys: web3.PublicKey[]
) => {
  const splToken = Spl.token(provider);
  let array: ProgramAccount<{}>[] = [];
  var pubList = pubKeys.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / 100);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

  for await (const subPubList of pubList) {
    const info = await splToken.account.mint.fetchMultiple(subPubList);
    if (info === null) {
      throw new Error("Failed to find mint account");
    }
    console.log("** mint data", info[0]);

    info.forEach((mintData, index) => {
      if (mintData != null) {
        const details = {
          pubkey: subPubList[index],
          account: {
            ...mintData,
          },
        };
        // @ts-ignore
        array.push(details);
      }
    });
  }

  return array;
};
