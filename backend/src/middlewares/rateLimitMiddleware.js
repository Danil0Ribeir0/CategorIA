import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: "Muitas tentativas de autenticação. Por favor, tente novamente após 15 minutos." },
    standardHeaders: true,
    legacyHeaders: false,
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: "Muitas requisições efetuadas. Por favor, aguarde um momento antes de continuar." },
    standardHeaders: true,
    legacyHeaders: false,
});