import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

import quoteRouter from './api/routes/quote';
import eventRouter from './api/routes/event';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', eventRouter);
app.use('/quote', quoteRouter);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`listening on port: ${port}`));
