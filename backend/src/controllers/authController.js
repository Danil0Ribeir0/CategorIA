import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const authController = {
    async register (req, res) {
        try {
            const { name, email, password } = req.body;

            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ error: 'Este email já está registado.' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = await User.create({
                name,
                email,
                password: hashedPassword
            });

            return res.status(201).json({
                message: 'Conta criada com sucesso!',
                userId: user._id
            })
        } catch (error) {
            next(error);
        }
    },

    async login (req, res) {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Credenciais inválidas.' })
            }

            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d'}
            );

            return res.json({
                message: 'Login efetuado com sucesso!',
                token,
                name: user.name
            });
        } catch (error) {
            next(error);
        }
    }
}