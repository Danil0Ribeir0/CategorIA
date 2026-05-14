import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '..', '.env') });

const envSchema = z.object({
    DATABASE_URL: z.string().url("DATABASE_URL inválida"),
    JWT_SECRET: z.string().min(16, "JWT_SECRET muito curta (mínimo 16 caracteres)"),
    GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY obrigatória"),
    FRONTEND_URL: z.string().url().default('http://localhost:5173'),
    PORT: z.coerce.number().default(3000)
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('Erro fatal: Variáveis de ambiente inválidas ou em falta!');
    console.error(_env.error.format());
    process.exit(1);
}

export const config = {
    server: {
        port: parseInt(_env.data.PORT, 10),
    },
    database: {
        url: _env.data.DATABASE_URL,
    },
    frontend: {
        url: _env.data.FRONTEND_URL
    },
    jwt: {
        secret: _env.data.JWT_SECRET,
        expiresIn: '7d'
    },
    ai: {
        geminiApiKey: _env.data.GEMINI_API_KEY,
        model: 'gemini-2.5-flash'
    }
};