import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

import quoteRouter from './api/routes/quote';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  console.log(res);
  res.status(200);
  res.json({ message: 'Hello World'})
});

app.post('/', bodyParser.raw(), (req, res) => {

  res.status(200);
  const { challenge } = req.body?.event;
  res.json({ challenge });
  // try {
  //   if (text.match(/price/g) && text.match(/of (\w+)$/g)) {
  //     const match = text.match(/of (\w+)$/g);
  //     if (match.length > 0) {
  //       const ticker = match[0].split(' ')[1];
  //       res.json({
  //         response_type: 'in_channel',
  //         message: ticker
  //       });
  //     }
  //   }
  // } catch (e) {
  //   console.error(e);
  //   res.json({ message: 'There was an error '});
  // }
});

app.use('/quote', quoteRouter);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`listening on port: ${port}`));
