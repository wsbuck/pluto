import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  console.log('working');
  res.status(200);
  res.json({ message: 'Hello World'})
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`listening on port: ${port}`));
