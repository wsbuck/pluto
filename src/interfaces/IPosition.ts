export enum Sentiment {
  bearish = 'BEARISH',
  bullish = 'BULLISH',
}

export default interface IPosition {
  currentPrice?: number;
  dateCreated: number;
  user: string;
  price: number;
  sentiment: Sentiment;
  ticker: string;
}
