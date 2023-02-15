import { AnchorProvider, web3 } from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { circulatingSupply } from "../src/circulatingSupply/index";

const connection = new web3.Connection("https://api.mainnet-beta.solana.com");

(async () => {
    const provider = new AnchorProvider(
        connection,
        new NodeWallet(new web3.Keypair()),
        {}
      );
    const supply = await circulatingSupply(provider);
    console.log(`circulating PSY: ${supply}`)
})();