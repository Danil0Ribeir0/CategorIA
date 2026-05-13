import fs from 'fs';
import { model } from './aiService.js';
import { expenseZodSchema } from '../schemas/expenseSchema.js';
import { anonymizeText } from '../utils/anonymizer.js';

function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

export async function processExpenseFromImage(imagePath, mimeType = "image/jpeg") {
  try {
    const imagePart = fileToGenerativePart(imagePath, mimeType);
    const dataAtualISO = new Date().toISOString();

    const promptRico = `
      CONTEXTO DO SISTEMA:
      - A data e hora atual do sistema é: ${dataAtualISO}
      - Analise a imagem deste cupom fiscal/nota.
      - Extraia o nome do estabelecimento (para a description), o valor TOTAL pago (amount), e a moeda (currency).
      - PRESTE ATENÇÃO NA DATA: Se houver uma data impressa no cupom, use-a e converta para ISO 8601. Se não houver, use a data atual do sistema.
      
      REGRA DE PRIVACIDADE ESTRITA (LGPD):
      - Ignore COMPLETAMENTE dados sensíveis como CPF, CNPJ, nomes completos, e-mails ou números de cartão de crédito presentes na imagem.
      - NENHUM desses dados deve aparecer no campo "description" ou em qualquer outro lugar do JSON.
    `;

    const result = await model.generateContent([promptRico, imagePart]);
    const jsonString = result.response.text();
    const rawData = JSON.parse(jsonString);

    if (rawData.description) {
        const safeDescription = anonymizeText(rawData.description);
        
        if (safeDescription !== rawData.description) {
            console.warn(`[AUDITORIA DE PRIVACIDADE]: A IA (Gemini) tentou incluir dados sensíveis na descrição da despesa. O filtro de anonimização interveio.`);
            rawData.description = safeDescription;
        }
    }

    const validation = expenseZodSchema.safeParse(rawData);

    if (!validation.success) {
      console.error("Zod barrou a entrada da imagem! Motivos:");
      console.error(validation.error.format());
      throw new Error("A IA leu a imagem, mas falhou no Zod.");
    }

    return validation.data;
  } catch (error) {
    console.error("Erro na Visão Computacional:", error.message);
    throw error;
  }
}