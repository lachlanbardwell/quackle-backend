import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import bodyParser, { json } from 'body-parser';
import { quackRouter } from './routes/quacks';
import { userRouter } from './routes/user';
import { createLog } from './middleware/log';
import { flockRouter } from './routes/flock';
import setEnv from './helpers/env-path';

setEnv();

const mongoCred = process.env.MONGO_URI;
export const jwtSecret = process.env.JWT_SECRET_KEY;

const port = 3001;
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

//MIDDLEWARE
app.use(bodyParser.json({ limit: '15mb' }));
app.use(bodyParser.urlencoded({ limit: '15mb', extended: true }));
app.use(json());
app.use(createLog);
//Adds security headers
app.use(helmet());

app.use(userRouter);
app.use(quackRouter);
app.use(flockRouter);

module.exports = app;

try {
  // mongoose.connect('mongodb://localhost:27017/quackle');
  mongoose.connect(mongoCred as string);
  console.log('Connected to mongoDB');
} catch (error) {
  console.error('Error connecting to mongoDB', error);
}

app.listen(port, () => {
  console.log(`Quackle running on port ${port}`);
});
