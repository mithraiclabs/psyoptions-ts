import { BN, Program } from "@project-serum/anchor";
import { Logger, MarketProxyBuilder, Middleware, OpenOrdersPda, ReferralFees } from "@project-serum/serum";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { PsyAmerican } from "../psyAmericanTypes";

/**
 * Create a MarketProxy for the Psy American V 1.1 program
 * 
 * @param program - Anchor Psy American program
 * @param optionMarketKey - The OptionMarket address
 * @param marketAuthorityBump - The marketAuthority bump seed
 * @param dexProgramId - The Serum DEX program id
 * @param marketKey - The Serum market address
 * @returns 
 */
export const marketLoader = async (
  program: Program<PsyAmerican>,
  optionMarketKey: PublicKey,
  marketAuthorityBump: number,
  dexProgramId: PublicKey,
  marketKey: PublicKey,
  opts: {
    enableLogger: boolean
  } = {
    enableLogger: false
  }
) => {
  let marketProxy = new MarketProxyBuilder()
    .middleware(
      new OpenOrdersPda({
        proxyProgramId: program.programId,
        dexProgramId: dexProgramId,
      })
    )
    .middleware(new ReferralFees())
    .middleware(new Validation(optionMarketKey, marketAuthorityBump));
  if (opts.enableLogger) {
    marketProxy = marketProxy.middleware(new Logger());
  }
  return marketProxy.load({
      connection: program.provider.connection,
      market: marketKey,
      dexProgramId: dexProgramId,
      proxyProgramId: program.programId,
      options: { commitment: "recent" },
    })
};

export class Validation implements Middleware {
  optionMarketKey: PublicKey;
  marketAuthorityBump: number;

  constructor(optionMarketKey: PublicKey, marketAuthorityBump: number) {
    this.optionMarketKey = optionMarketKey;
    this.marketAuthorityBump = marketAuthorityBump;
  }
  initOpenOrders(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([0]), ix.data]);
  }
  newOrderV3(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([1]), ix.data]);
  }
  cancelOrderV2(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([2]), ix.data]);
  }
  cancelOrderByClientIdV2(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([3]), ix.data]);
  }
  settleFunds(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([4]), ix.data]);
  }
  closeOpenOrders(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([5]), ix.data]);
  }
  prune(ix: TransactionInstruction) {
    // prepend a discriminator and the marketAuthorityBump
    const bumpBuffer = new BN(this.marketAuthorityBump).toBuffer(
      "le",
      1
    );
    ix.data = Buffer.concat([Buffer.from([6]), bumpBuffer, ix.data]);
    // prepend the optionMarket key
    ix.keys = [
      { pubkey: this.optionMarketKey, isWritable: false, isSigner: false },
      ...ix.keys,
    ];
  }
  consumeEvents(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([7]), ix.data]);
  }
  consumeEventsPermissioned(ix: TransactionInstruction) {
    ix.data = Buffer.concat([Buffer.from([8]), ix.data]);
  }
}