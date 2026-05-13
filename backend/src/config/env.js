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
    console.error("Erro de configuração de ambiente:", _env.error.format());
    process.exit(1);
}

export const env = _env.data;