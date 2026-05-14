import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async register(name, email, password) {
        const userExists = await this.userRepository.findByEmail(email);
        if (userExists) {
            const error = new Error('Este email já está registado.');
            error.statusCode = 400;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await this.userRepository.create({
            name,
            email,
            password: hashedPassword
        });

        return { message: 'Conta criada com sucesso!', userId: user._id };
    }

    async login(email, password) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            const error = new Error('Credenciais inválidas.');
            error.statusCode = 401;
            throw error;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error('Credenciais inválidas.');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign(
            { userId: user._id }, 
            config.jwt.secret, 
            { expiresIn: config.jwt.expiresIn }
        );

        return { message: 'Login efetuado com sucesso!', token, name: user.name };
    }
}