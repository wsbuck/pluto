export enum Sentiment {
  buy = 'BUY',
  sell = 'sell',
}

export default interface IPosition {
  dateCreated: number;
  user: string;
  price: number;
  sentiment: Sentiment;
  ticker: string;
}
