import { AnchorProvider, web3 } from "@project-serum/anchor";
import { american, tokenizedEuros } from "../src";

(async () => {
  const connection = new web3.Connection("https://api.mainnet-beta.solana.com");
  const provider = new AnchorProvider(
    connection,
    // @ts-ignore
    {},
    AnchorProvider.defaultOptions()
  );

  const mintAmountMap = await american.getLockedTokensMap(provider);
  console.log("American mint map: ", JSON.stringify(mintAmountMap));

  const tokenizedEuroMintMap = await tokenizedEuros.getLockedTokensMap(provider);
  console.log("Euros mint map: ", JSON.stringify(tokenizedEuroMintMap));
})();
