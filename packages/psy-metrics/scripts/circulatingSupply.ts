import { web3 } from "@project-serum/anchor";
import { circulatingSupply } from "../src/circulatingSupply/index";

const connection = new web3.Connection("https://api.mainnet-beta.solana.com");

(async () => {

    await circulatingSupply(connection);
})();