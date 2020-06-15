export default interface IStockQuoteResponse {
  c: number;   // current price
  h: number;   // high price of the day
  l: number;   // low price of the day
  o: number;   // open price of the day
  pc: number;  // previous close price
  t: number;   // time
}
