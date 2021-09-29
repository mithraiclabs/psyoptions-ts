import * as anchor from "@project-serum/anchor";
import idl from "./idl.json";
import * as instructions from "./instructions";
/**
 * The instructions for interacting with the permissioned Serum market. The Serum
 * instructions are proxied through the PsyOptions program.
 */
import * as serumInstructions from "./serumInstructions";
export * as serumUtils from "./serumUtils";
export * from "./OptionMarket";

export { PSY_AMERICAN_PROGRAM_IDS } from "./programIds";

export * from "./fees";
export * from "./types";
export * from "./utils";

/**
 * The Anchor IDL for the Psy American program. Used when creating an Anchor Program.
 * 
 * ````typescript
 * const program = new Program(PsyAmericanIdl, psyAmericanProgramId, provider);
 * ````
 */
export const PsyAmericanIdl = idl as anchor.Idl;
export { instructions, serumInstructions };
