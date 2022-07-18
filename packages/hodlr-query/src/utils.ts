import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";

/**
 * Returns an array with arrays of the given size.
 *
 * @param myArray {Array} Array to split
 * @param chunkSize {Integer} Size of every group
 */
export const chunkArray = <T>(myArray: T[], chunkSize: number): T[][] => {
  var index = 0;
  var arrayLength = myArray.length;
  var tempArray = [];

  for (index = 0; index < arrayLength; index += chunkSize) {
    const myChunk = myArray.slice(index, index + chunkSize);
    tempArray.push(myChunk);
  }

  return tempArray;
};

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


export const getNonSystemOwnedAccounts = async (
  connection: Connection,
  ownerPubkeys: PublicKey[]
) => {
  const ownersToRemove: string[] = [];
  await Promise.all(
    chunkArray(ownerPubkeys, 100).map(async (group) => {
      const accountInfos = await connection.getMultipleAccountsInfo(
        group,
        "confirmed"
      );
      accountInfos.forEach((info, index) => {
        if (!info) {
          // NOTE: Looks like this can occur if the account was not rent exempt and there is
          //  not SOL for rent.
          ownersToRemove.push(group[index].toString());
          // console.log(`No info found for ${group[index].toString()}`)
        } else if (
          info.owner.toString() != SystemProgram.programId.toString()
        ) {
          ownersToRemove.push(group[index].toString());
        }
      });
    })
  );
  return ownersToRemove;
};

export const wait = (delayMS: number) =>
  new Promise((resolve) => setTimeout(resolve, delayMS));
