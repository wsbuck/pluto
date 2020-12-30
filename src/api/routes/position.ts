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

route.post('/sell', async (req, res) => {
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
      sentiment: Sentiment.sell,
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

route.post('/get', async (req, res) => {
  res.status(200);
  const { user_id: userId } = req.body;

  try {
    console.log('userId', userId);
    const positions = await positionService.getPositions(userId);
    console.log('positions', positions);
    res.json({
      response_type: 'in_channel',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Below are the current recommended *BUYS* for user ${userId}`
          }
        },
        {
          type: 'divider',
        },
        positions.map((position) => {
          return {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `
                *${position.ticker}*\n
                Date Recommended: ${position.dateCreated}\n
                Initial Price: ${position.price}\n
                Current Price: ${position.currentPrice}\n
              `
            },
          };
        }),
      ]
    });
  } catch (e) {
    console.error('error', e);
    res.json({
      response_type: 'in_response',
      text: 'Unable to get positions'
    });

  }

});

export default route;
