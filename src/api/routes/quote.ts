import { Router } from 'express';
import QuoteService from '../../services/quote';
import axios from 'axios';
import { FINNHUB_URL, FINNHUB_API_KEY } from '../../config';

const route = Router();
const quoteService = new QuoteService();

route.post('/stock', async (req, res) => {
  res.status(200);
  const { text } = req.body;
  try {
    const stock: string = text.split(' ')[0];
    const quote = await quoteService.fetchStockQuote(stock);
    res.json({
      response_type: 'in_channel',
      text: quote,
    });
  } catch (e) {
    console.error('error', e);
    res.json({
      response_type: 'in_response',
      text: 'Unable to retrieve stock price'
    });
  }
});

export default route;
