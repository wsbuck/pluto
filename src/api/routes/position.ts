import { Router } from 'express';
import IPosition, { Sentiment } from '../../interfaces/IPosition';
import QuoteService from '../../services/quote';
import PositionService from '../../services/position';

const route = Router();
const quoteService = new QuoteService();
const positionService = new PositionService();

route.post('/bull', async (req, res) => {
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
      sentiment: Sentiment.bullish,
      ticker: ticker.toUpperCase(),
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

route.post('/bear', async (req, res) => {
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
      sentiment: Sentiment.bearish,
      ticker: ticker.toUpperCase(),
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
    const positions = await positionService.getPositions(userId);
    res.json({
      response_type: 'in_channel',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Below are the current recommended *BULLISH* for user ${userId}`
          }
        },
        {
          type: 'divider',
        },
        ...positions.filter((position) => position.sentiment === Sentiment.bullish).map((position) => {
          return {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${position.ticker}*
                Date Recommended: ${position.dateCreated}
                Initial Price: ${position.price}
                Current Price: ${position.currentPrice}
              `
            },
          };
        }),
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Below are the current recommended *BEARISH* for user ${userId}`
          }
        },
        {
          type: 'divider',
        },
        ...positions.filter((position) => position.sentiment === Sentiment.bearish).map((position) => {
          return {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${position.ticker}*
                Date Recommended: ${position.dateCreated}
                Initial Price: ${position.price}
                Current Price: ${position.currentPrice}
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
