import axios from 'axios';
import { IInterpretMessageValue, meaning } from '../interfaces/IInterpretMessageValue';
import QuoteService from '../services/quote';
import { SLACK_ACCESS_TOKEN } from '../config';

interface IStripeBody {
  text: string;
  response_url: string;
  user_id: string;
}

interface IMessageService {
  read(event: IStripeBody): Promise<boolean>;
}

const quoteService = new QuoteService();

export default class MessageService implements IMessageService {

  async read(event: IStripeBody): Promise<boolean> {
    const text: string = event.text;
    const interpret: IInterpretMessageValue = this.interpretMessage(text.toLowerCase());

    if (!interpret.understand) {
      return;
    }

    switch (interpret.meaning) {
      case meaning.stockQuote: {
        const quote = await quoteService.fetchStockQuote(interpret.value.toLowerCase());
        await this.sendMessage(`The price of ${interpret.value} is ${quote}`, 'good', event.response_url);
        break;
      }
      default: {
        return;
      }
    }
  }

  async sendBlockMessage(blocks: unknown[], responseUrl: string): Promise<void> {
    const resp = await axios.post(responseUrl, {
      response_type: 'in_channel',
      blocks,
    }, {
      headers: {
        'Authorization': `Bearer ${SLACK_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (resp.status !== 200) {
      throw new Error(resp.data);
    }

  }

  async sendMessage(message: string, color: string, responseUrl: string): Promise<boolean> {
    const payload = {
      response_type: 'in_channel',
      text: message,
      color,
    };

    const resp = await axios.post(responseUrl, payload, {
      headers: {
        'Authorization': `Bearer ${SLACK_ACCESS_TOKEN}`,
        'Content-type': 'application/json', 
      },
    });
    return resp.data?.ok;
  }

  private interpretMessage(message: string): IInterpretMessageValue {
    if (message.match(/\$/g) && (message.match(/price/g) || message.match(/quote/g))) {
      const match = message.match(/\$(\w+)$/);
      if (match && match.length > 0) {
        const ticker = match.pop().replace('$', '');
        return { understand: true, meaning: meaning.stockQuote, value: ticker };
      }
    } else {
      return { understand: false };
    }
    return { understand: false };
  }
}
