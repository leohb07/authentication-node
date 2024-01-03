import 'dotenv/config';
import express, { NextFunction, type Request, type Response } from 'express';
import config from 'config';
import connectDB from './utils/connectDB';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import userRouter from './routes/user.route';
import authRouter from './routes/auth.route';

const app = express();

app.use(express.json({ limit: '10kb' }));

app.use(cookieParser());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(
  cors({
    origin: config.get<string>('origin'),
    credentials: true,
  }),
);

app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);

app.get('/', (request: Request, response: Response) => {
  response.status(200).json({
    status: 'success',
    message: 'Welcome to API NodeJS',
  });
});

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

const port = config.get<number>('port');
app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
  connectDB();
});
