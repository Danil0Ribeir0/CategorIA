import mongoose from 'mongoose';
import { config } from '../config/env.js';

export const connectDatabase = async () => {
    try {
        await mongoose.connect(config.database.url);
        console.log("✅ Conectado ao MongoDB com sucesso!");
    } catch (err) {
        console.error("Erro inicial de conexão ao MongoDB:", err);
        process.exit(1);
    }

    mongoose.connection.on('error', err => console.error('Erro na conexão MongoDB:', err));
    mongoose.connection.on('disconnected', () => console.warn('Conexão com MongoDB perdida. Tentando reconectar...'));
};