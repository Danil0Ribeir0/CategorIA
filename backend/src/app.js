import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import { config } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import { apiLimiter } from './middlewares/rateLimitMiddleware.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.frontend?.url || 'http://localhost:5173', credentials: true }));

app.use(compression());

app.use(express.json());
app.use(mongoSanitize());

app.use('/auth', authRoutes);
app.use('/expenses', apiLimiter, expenseRoutes);

app.use(errorHandler);

export default app;