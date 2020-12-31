import { Router } from 'express';
import IPosition, { Sentiment } from '../../interfaces/IPosition';
import QuoteService from '../../services/quote';
import PositionService from '../../services/position';

const route = Router();
const quoteService = new QuoteService();
const positionService = new PositionService();

route.post('/bull', async (req, res) => {
  res.statusCode = 200;
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
      text: `${ticker} added as 🐂 position for <@${position.user}>`,
    });
  } catch (e) {
    console.error('error', e);
    res.json({
      response_type: 'in_response',
      text: 'Unable to create bullish position'
    });

  }

});

route.post('/bear', async (req, res) => {
  res.statusCode = 200;
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
      text: `${ticker} added as 🐻 position for <@${position.user}>`,
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
  res.statusCode = 200;
  const { user_id: userId } = req.body;

  try {
    const positions = await positionService.getPositions(userId);
    const bullishPositions = positions.filter(position => position.sentiment === Sentiment.bullish);
    const bearishPositions = positions.filter(position => position.sentiment === Sentiment.bearish);
    res.json({
      response_type: 'in_channel',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Below are the current recommended *BULLISh* for user <@${userId}>`
          }
        },
        {
          type: 'divider',
        },
        ...bullishPositions.map((position) => {
          return {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${position.ticker}*
                Date Recommended: ${new Date(position.dateCreated).toLocaleString()}
                Initial Price: $${position.price}
                Current Price: $${position.currentPrice}
                Gain / Loss: ${(position.currentPrice - position.price) / position.price}
              `
            },
          };
        }),
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Below are the current recommended *BEARISH* for user <@${userId}>`
          }
        },
        {
          type: 'divider',
        },
        ...bearishPositions.map((position) => {
          return {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${position.ticker}*
                Date Recommended: ${new Date(position.dateCreated).toLocaleString()}
                Initial Price: $${position.price}
                Current Price: $${position.currentPrice}
                Gain / Loss: ${(position.currentPrice - position.price) / position.price}
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
