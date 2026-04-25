import fs from 'fs';
import { model } from './aiService.js';
import { expenseZodSchema } from '../schemas/expenseSchema.js';

function fileToGenerativePart(filePath, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            mimeType
        },
    };
}

export async function processExpenseFromAudio(audioPath, mimeType) {
    try {
        const audioPart = fileToGenerativePart(audioPath, mimeType);
        const dataAtualISO = new Date().toISOString();

        const promptRico = `
            CONTEXTO DO SISTEMA:
            - A data e hora atual do sistema é: ${dataAtualISO}
            - OUÇA o áudio em anexo. O usuário está a relatar verbalmente um gasto.
            - Extraia a descrição do gasto (description), o valor TOTAL pago (amount), e a moeda (currency).
            - PRESTE ATENÇÃO NA DATA: Se o usuário mencionar "hoje", "ontem" ou dias da semana, calcule a data exata com base na data atual do sistema.
        `;

        const result = await model.generateContent([promptRico, audioPart]);
        const jsonString = result.response.text();
        const rawData = JSON.parse(jsonString);

        const validation = expenseZodSchema.safeParse(rawData);

        if (!validation.success) {
            console.error("Zod barrou a entrada do áudio! Motivos:", validation.error.format());
            throw new Error("A IA ouviu o áudio, mas os dados extraídos são inválidos.");
        }

        return validation.data;
    } catch (error) {
        console.error("Erro no processamento de Áudio:", error.message);
        throw error;
    }
}