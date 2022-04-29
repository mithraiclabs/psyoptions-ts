import { Idl, parseIdlErrors, ProgramError } from "@project-serum/anchor";
import { IDL } from "../psyAmericanTypes";

const idlErrors = parseIdlErrors(IDL);

export const parseTransactionError = (error: any) => {
  console.log('**** in parseTransactionError', error, idlErrors);
  console.log('**** errorString', error.toString());
  return ProgramError.parse(error, idlErrors);
}