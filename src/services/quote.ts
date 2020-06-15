import axios from 'axios';

import { FINNHUB_URL, FINNHUB_API_KEY } from '../config';
import IStockQuoteResponse from '../interfaces/IStockQuoteResponse';


interface IQuoteService {
  fetchStockQuote(ticker: string): Promise<number>;

}

export default class QuoteService implements IQuoteService {
  constructor() {
  }

  async fetchStockQuote(ticker: string): Promise<number> {
    const resp = await axios.get(`${FINNHUB_URL}/quote?token=${FINNHUB_API_KEY}&symbol=${ticker?.toUpperCase()}`);
    const data: IStockQuoteResponse = resp.data
    return data.c;
  }

}