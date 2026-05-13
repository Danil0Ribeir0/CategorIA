import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import mongoSanitize from 'express-mongo-sanitize';

import authRoutes from './src/routes/authRoutes.js';
import expenseRoutes from './src/routes/expenseRoutes.js';

import { apiLimiter } from './src/middlewares/rateLimitMiddleware.js';
import { errorHandler } from './src/middlewares/errorMiddleware.js';

dotenv.config({ path: path.join(process.cwd(), '..', '.env') });

const app = express();

app.use(express.json());

app.use(mongoSanitize());

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log("Conectado ao MongoDB via Mongoose com sucesso!"))
  .catch(err => console.error("Erro ao conectar ao MongoDB:", err));

app.use('/auth', authRoutes);
app.use('/expenses', apiLimiter, expenseRoutes);

app.use(errorHandler);

app.listen(3000, () => console.log("CategorIA Backend rodando na porta 3000"));