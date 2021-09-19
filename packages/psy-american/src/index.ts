import * as anchor from "@project-serum/anchor";
import idl from "./idl.json";
import * as instructions from "./instructions";

export * from "./fees";

export const PsyAmericanIdl = idl as anchor.Idl;
export { instructions };
