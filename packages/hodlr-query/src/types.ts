export type SolscanTokenHolderRes = {
    data: SolscanTokenHolder[]
    total: number;
}

export type SolscanTokenHolder = {
    address: string;
    amount: number;
    decimals: number;
    owner: string;
    rank: number;
  }