export enum Sentiment {
  buy = 'BUY',
  sell = 'sell',
}

export default interface IPosition {
  currentPrice?: number;
  dateCreated: number;
  user: string;
  price: number;
  sentiment: Sentiment;
  ticker: string;
}
