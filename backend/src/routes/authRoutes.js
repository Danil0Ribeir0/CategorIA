import express from 'express';
import { authController } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);

export default router;