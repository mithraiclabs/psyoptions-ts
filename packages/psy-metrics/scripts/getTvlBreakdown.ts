import { AnchorProvider, web3 } from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { getLockedTokensMap } from "../src";

(async () => {
  const connection = new web3.Connection("https://api.mainnet-beta.solana.com");
  const provider = new AnchorProvider(
    connection,
    // @ts-ignore
    {},
    AnchorProvider.defaultOptions()
  );

  await getLockedTokensMap(provider);
})();
