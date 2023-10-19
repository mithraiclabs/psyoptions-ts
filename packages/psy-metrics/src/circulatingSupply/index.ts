import { AnchorProvider, BN, Program, web3, Spl } from "@project-serum/anchor";
import { divideBnToNumber } from "../utils";
import { DepositWithWallet, Registrar, Voter } from "../types";
import { IDL, VoterStakeRegistry } from "./vsrIdl";

const PSY_MINT_ADDRESS = new web3.PublicKey(
  "PsyFiqqjiv41G7o5SMRzDJCu4psptThNR2GtfeGHfSq"
);
const FOUNDATION_ADDRESS = new web3.PublicKey(
  "6c33US7ErPmLXZog9SyChQUYUrrJY51k4GmzdhrbhNnD"
);
const VOTER_STAKE_REGISTRY_PROGRAM_ID = new web3.PublicKey(
  "VotEn9AWwTFtJPJSMV5F9jsMY6QwWM5qn3XP9PATGW7"
);
const SPL_GOVERNANCE_PROGRAM_ID = new web3.PublicKey(
  "GovHgfDPyQ1GwazJTDY2avSVY8GGcpmCapmmCsymRaGe"
);
const PSY_REALM_ID = new web3.PublicKey(
  "FiG6YoqWnVzUmxFNukcRVXZC51HvLr6mts8nxcm7ScR8"
);

const PSY_DAO_PSY_GRANT_ACCOUNT = new web3.PublicKey(
  "2v6gYajLxSd2xdfRMz8LCUJrc79Z26PTGmVzqLA5g6KW"
);

/**
 * Retrieves the circulating supply of PSY.
 *
 * 1. Gathers the total token supply
 * 2. Subtract tokens locked in PSY DAO Voter Stake Registry accounts
 *
 * @param connection
 */
export const circulatingSupply = async (provider: AnchorProvider) => {
  const splTokenProgram = Spl.token(provider);
  // 1. Gather the mint info for the PSY token
  const [mintInfo, psyGrantAccount] = await Promise.all([
    splTokenProgram.account.mint.fetch(PSY_MINT_ADDRESS),
    splTokenProgram.account.token.fetch(PSY_DAO_PSY_GRANT_ACCOUNT),
  ]);
  const totalSupply = mintInfo.supply;
  // 2. Pull the PSY from the Governance Grant treasury SPL Token account
  const grantSupply = psyGrantAccount.amount;

  const numerator = totalSupply.sub(grantSupply);
  const denominator = new BN(10).pow(new BN(mintInfo.decimals));
  return divideBnToNumber(numerator, denominator);
};

export const getVsrLockedDeposits = async (provider: AnchorProvider) => {
  // create VSR client
  const vsrProgram = new Program<VoterStakeRegistry>(
    IDL,
    VOTER_STAKE_REGISTRY_PROGRAM_ID,
    provider
  );

  const [registrarPk, registrarBump] = await web3.PublicKey.findProgramAddress(
    [
      PSY_REALM_ID.toBuffer(),
      Buffer.from("registrar"),
      PSY_MINT_ADDRESS.toBuffer(),
    ],
    VOTER_STAKE_REGISTRY_PROGRAM_ID
  );
  const voterStakeRegistrar = (await vsrProgram.account.registrar.fetch(
    registrarPk
  )) as Registrar;

  // Pull all voters
  const allVoters = await vsrProgram.account.voter.all([
    {
      memcmp: {
        offset: 40,
        bytes: registrarPk!.toBase58(),
      },
    },
  ]);
  const voters = (allVoters && allVoters.length
    ? allVoters
    : []) as unknown as { account: Voter; publicKey: web3.PublicKey }[];

  const depositsWithWalletsInner: DepositWithWallet[] = [];
  let depositSum = new BN(0);
  for (const voter of voters) {
    // Filter deposits that are for a different mint address
    const deposits = voter.account.deposits.filter(
      (x) =>
        x.isUsed &&
        typeof x.lockup?.kind.none === "undefined" &&
        x.votingMintConfigIdx ===
          voterStakeRegistrar?.votingMints.findIndex(
            (votingMint) =>
              votingMint.mint.toBase58() === PSY_MINT_ADDRESS.toBase58()
          )
    );
    for (const deposit of deposits) {
      const depositWithWallet = {
        voter: voter.publicKey,
        wallet: voter.account.voterAuthority,
        deposit: deposit,
      };
      depositSum = depositSum.add(deposit.amountDepositedNative);
      depositsWithWalletsInner.push(depositWithWallet);
    }
  }
  return depositSum;
};
