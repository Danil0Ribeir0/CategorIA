import express from 'express';
import { authController } from '../controllers/authController.js';
import { authLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);

export default router;