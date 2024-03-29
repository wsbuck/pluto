import { Router } from 'express';
import IPosition, { Sentiment } from '../../interfaces/IPosition';
import QuoteService from '../../services/quote';
import PositionService from '../../services/position';
import MessageService from '../../services/message';

const route = Router();
const quoteService = new QuoteService();
const positionService = new PositionService();
const messageService = new MessageService();

route.post('/bull', async (req, res) => {
  res.status(200).send('');
  const { user_id, text, response_url } = req.body;

  const ticker = text.split(' ').pop() as string;

  try {
    const quote = await quoteService.fetchStockQuote(ticker);
    if (quote === 0) {
      throw new Error('price equalled 0, probably incorrect ticker');
    }
    const position: IPosition = {
      dateCreated: Date.now(),
      user: user_id,
      price: quote,
      sentiment: Sentiment.bullish,
      ticker: ticker.toUpperCase(),
    };
    await positionService.createPosition(position);

    await messageService.sendMessage(
      `${ticker} added as 🐂 position for <@${position.user}>`,
      'good',
      response_url,
    );
  } catch (e) {
    console.error('error', e);
    messageService.sendMessage('Unable to create bullish position', 'danger', response_url);
  }

});

route.post('/bear', async (req, res) => {
  res.status(200).send('');
  const { user_id, text, response_url } = req.body;

  const ticker = text.split(' ').pop() as string;

  try {
    const quote = await quoteService.fetchStockQuote(ticker);
    if (quote === 0) {
      throw new Error('price equalled 0, probably incorrect ticker');
    }
    const position: IPosition = {
      dateCreated: Date.now(),
      user: user_id,
      price: quote,
      sentiment: Sentiment.bearish,
      ticker: ticker.toUpperCase(),
    };
    await positionService.createPosition(position);
    await messageService.sendMessage(
      `${ticker} added as 🐻 position for <@${position.user}>`,
      'good',
      response_url,
    );
  } catch (e) {
    console.error('error', e);
    messageService.sendMessage('Unable to create bearish position', 'danger', response_url);
  }

});

route.post('/get', async (req, res) => {
  res.status(200).send('');

  const { user_id, response_url: responseUrl, text } = req.body as {[field: string]: string};

  if (!user_id || !responseUrl) {
    return;
  }

  try {
    const userId = text?.match(/(?<=<@)\w+(?=|)/)?.pop() || user_id;
    const positions = await positionService.getPositions(userId);
    const bullishPositions = positions.filter(position => position.sentiment === Sentiment.bullish);
    const bearishPositions = positions.filter(position => position.sentiment === Sentiment.bearish);
    const blocks = [
      ...(bullishPositions.length > 0 ? [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Bullish Picks <@${userId}>*`,
        },
      }, { type: 'divider' }] : []),
      ...bullishPositions.map((position) => {
        const gainPercentage = (
          (position.currentPrice - position.price) / position.price * 100
        ).toFixed(2);
        return {
          type: 'section',
          text: {
            type: 'mrkdwn',
            // color: Number.parseFloat(gainPercentage) > 0 ? 'good' : 'danger',
            text: `*${position.ticker}*
                Date Recommended: <!date^${(position.dateCreated / 1000).toFixed(0)}^{date_short}|unknown>
                Initial Price: $${position.price}
                Current Price: $${position.currentPrice}
                Gain / Loss: ${gainPercentage}%
              `
          },
        };
      }),
      ...(bearishPositions.length > 0 ? [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Bearish Picks for <@${userId}>`,
        },
      }, { type: 'divider' }] : []),
      ...bearishPositions.map((position) => {
        const gainPercentage = (
          (position.currentPrice - position.price) / position.price * 100
        ).toFixed(2);
        return {
          type: 'section',
          // color: Number.parseFloat(gainPercentage) > 0 ? 'good' : 'danger',
          text: {
            type: 'mrkdwn',
            text: `*${position.ticker}*
                Date Recommended: <!date^${(position.dateCreated / 1000).toFixed(0)}^{date_short}|unknown>
                Initial Price: $${position.price}
                Current Price: $${position.currentPrice}
                Gain / Loss: ${gainPercentage}%
              `
          },
        };
      }),
    ];
    if (blocks.length === 0) {
      blocks.push({ type: 'section', text: { type: 'mrkdwn', text: 'No Positions'}});
    }
    messageService.sendBlockMessage(blocks, responseUrl);
  } catch (e) {
    console.error('error', e);
    messageService.sendMessage('Unable to get positions', 'danger', responseUrl);
  }

});

export default route;
