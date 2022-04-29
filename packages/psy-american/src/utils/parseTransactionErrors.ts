import { parseIdlErrors, ProgramError } from "@project-serum/anchor";
import { IDL } from "../psyAmericanTypes";

const idlErrors = parseIdlErrors(IDL);

export const parseTransactionError = (error: any) =>
  ProgramError.parse(error, idlErrors);
