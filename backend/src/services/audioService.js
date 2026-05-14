import fs from 'fs';
import { model } from './aiService.js';
import { expenseZodSchema } from '../schemas/expenseSchema.js';
import { AIProcessor } from './aiProcessor.js';

const processor = new AIProcessor(model, expenseZodSchema);

export async function processExpenseFromAudio(audioPath, mimeType) {
    const audioPart = processor.getFilePart(audioPath, mimeType);
    const dataAtualISO = new Date().toISOString();

    const promptRico = `
        CONTEXTO DO SISTEMA:
        - A data e hora atual do sistema é: ${dataAtualISO}
        - OUÇA o áudio em anexo. O utilizador está a relatar verbalmente um gasto.
        - Extraia a descrição do gasto (description), o valor TOTAL pago (amount), e a moeda (currency).
        - PRESTE ATENÇÃO NA DATA: Se o utilizador mencionar "hoje", "ontem" ou dias da semana, calcule a data exata com base na data atual do sistema.
    `;

    return processor.processWithContent(promptRico, audioPart);
}