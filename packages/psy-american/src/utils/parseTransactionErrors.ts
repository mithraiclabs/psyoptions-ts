import { Idl, parseIdlErrors, ProgramError } from "@project-serum/anchor";
import IDL from "../idl.json";

const idlErrors = parseIdlErrors(IDL as Idl);

export const parseTranactionError = (error: any) => ProgramError.parse(error, idlErrors);