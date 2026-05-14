import { AuthService } from '../services/authService.js';
import { UserRepository } from '../repositories/userRepository.js';
import { User } from '../models/User.js';

const userRepository = new UserRepository(User);
const authService = new AuthService(userRepository);

export const authController = {
    async register(req, res, next) {
        try {
            const { name, email, password } = req.body;
            const result = await authService.register(name, email, password);
            
            return res.status(201).json(result);
        } catch (error) {
            if (error.statusCode) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            next(error);
        }
    },

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            
            return res.json(result);
        } catch (error) {
            if (error.statusCode) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            next(error);
        }
    }
};