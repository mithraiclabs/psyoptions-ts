import { AnchorProvider } from "@project-serum/anchor";
import * as american from "./psyAmerican";
import * as tokenizedEuros from "./psyTokenizedEuros";

export const getAllTvlTokenMap = async (provider: AnchorProvider) => {
    const mintAmountMap = await american.getLockedTokensMap(provider);
    const tokenizedEuroMintMap = await tokenizedEuros.getLockedTokensMap(provider);
    Object.keys(tokenizedEuroMintMap).forEach(mintAddress => {
        if (mintAmountMap[mintAddress]) {
            mintAmountMap[mintAddress] += tokenizedEuroMintMap[mintAddress]
        } else {
            mintAmountMap[mintAddress] = tokenizedEuroMintMap[mintAddress]
        }
    });
    return mintAmountMap
}

export {american, tokenizedEuros};