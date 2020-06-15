import axios from 'axios';
import { IInterpretMessageValue, meaning } from '../interfaces/IInterpretMessageValue';
import QuoteService from '../services/quote';
import { SLACK_URL, SLACK_ACCESS_TOKEN } from '../config';

interface IMessageService {
  read(event: any): Promise<boolean>;
}

const quoteService = new QuoteService();

export default class MessageService implements IMessageService {

  async read(event: any): Promise<boolean> {
    const text: string = event.text;
    const interpret: IInterpretMessageValue = this.interpretMessage(text.toLowerCase());

    if (!interpret.understand) {
      return;
    }

    switch (interpret.meaning) {
      case meaning.stockQuote: {
        console.log('value', interpret.value);
        const quote = await quoteService.fetchStockQuote(interpret.value.toLowerCase())
        console.log('quote', quote);
        await this.sendMessage(`The price of ${interpret.value} is ${quote}`, event.channel);
        break;
      }
      default: {
        return;
      }
    }
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

  private async sendMessage(message: string, channel: string): Promise<boolean> {
    const payload = {
      channel,
      response_type: 'in_channel',
      text: message,
    };

    const resp = await axios.post(`${SLACK_URL}/chat.postMessage`, payload, {
      headers: {
        'Authorization': `Bearer ${SLACK_ACCESS_TOKEN}`,
        'Content-type': 'application/json', 
      },
    });
    return resp.data?.ok;
  }
}
