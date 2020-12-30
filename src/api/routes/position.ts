import { Router } from 'express';
import IPosition, { Sentiment } from '../../interfaces/IPosition';
import QuoteService from '../../services/quote';
import PositionService from '../../services/position';

const route = Router();
const quoteService = new QuoteService();
const positionService = new PositionService();

route.post('/buy', async (req, res) => {
  res.status(200);
  const { user_id, text } = req.body;

  if (!text) {
    res.json({
      response_type: 'in_response',
      text: 'Unable to add stock'
    });
  }

  const ticker = text.split(' ').pop() as string;

  try {
    const quote = await quoteService.fetchStockQuote(ticker);
    const position: IPosition = {
      dateCreated: Date.now(),
      user: user_id,
      price: quote,
      sentiment: Sentiment.buy,
      ticker,
    }
    await positionService.createPosition(position);
    res.json({
      response_type: 'in_channel',
      text: `${ticker} added as BUY position`,
    });
  } catch (e) {
    console.error('error', e);
    res.json({
      response_type: 'in_response',
      text: 'Unable to create buy position'
    });

  }

});

export default route;
