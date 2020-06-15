export enum meaning {
  stockQuote = 'STOCK_QUOTE',
}

export interface IInterpretMessageValue {
  understand: boolean;
  meaning?: meaning;
  value?: string;
}
