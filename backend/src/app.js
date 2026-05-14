import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from './config/env.js';
import authRoutes from './src/routes/authRoutes.js';
import expenseRoutes from './src/routes/expenseRoutes.js';
import { apiLimiter } from './src/middlewares/rateLimitMiddleware.js';
import { errorHandler } from './src/middlewares/errorMiddleware.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(mongoSanitize());

app.use('/auth', authRoutes);
app.use('/expenses', apiLimiter, expenseRoutes);

app.use(errorHandler);

export default app;