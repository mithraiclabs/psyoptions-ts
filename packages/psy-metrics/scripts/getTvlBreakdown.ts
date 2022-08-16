import { AnchorProvider, web3 } from "@project-serum/anchor";
import { american, tokenizedEuros, getAllTvlTokenMap } from "../src";

(async () => {
  const connection = new web3.Connection("https://api.mainnet-beta.solana.com");
  const provider = new AnchorProvider(
    connection,
    // @ts-ignore
    {},
    AnchorProvider.defaultOptions()
  );

  const mintAmountMap = await getAllTvlTokenMap(provider);
  console.log(JSON.stringify(mintAmountMap));
})();
