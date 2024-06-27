import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import config from './config';

const app: Application = express();

app.use(cors());
app.use(cookieParser());

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('working !');
});

app.listen(config.port, () => {
  console.log(`server is running on port ${config.port}`);
});
