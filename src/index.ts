import axios from 'axios';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_URL = 'https://finnhub.io/api/v1';

interface IQuoteResponse {
  c: string;   // current price
  h: string;   // high price of the day
  l: string;   // low price of the day
  o: string;   // open price of the day
  pc: string;  // previous close price
  t: string;   // time
}

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  console.log(res);
  res.status(200);
  res.json({ message: 'Hello World'})
});

app.post('/', (req, res) => {
  console.log('req', req.body);
  const { challenge } = req.body;
  res.status(200).json({ challenge });
});

app.post('/test', (req, res) => {
  console.log('req.body', req.body);
  res.status(200);
  res.json({
    response_type: 'in_channel',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Here is first block*',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '**Here is second block**',
        },
      },
    ],
  });
});

app.post('/quote', async (req, res) => {
  res.status(200);
  const { text } = req.body;
  try {
    const stock: string = text.split(' ')[0];
    const resp = await axios.get(`${FINNHUB_URL}/quote?token=${FINNHUB_API_KEY}&symbol=${stock?.toUpperCase()}`);
    const data: IQuoteResponse = resp.data
    console.log('data', data);
    res.json({
      response_type: 'in_channel',
      text: `${data?.c}`,
    });
  } catch (e) {
    console.error(e);
    res.json({
      response_type: 'in_channel',
      text: 'Unable to stock retrieve price',
    });
  }
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`listening on port: ${port}`));
