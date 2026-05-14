import fs from 'fs';
import { model } from './aiService.js';
import { expenseZodSchema } from '../schemas/expenseSchema.js';
import { anonymizeText } from '../utils/anonymizer.js';
import { AIProcessor } from './aiProcessor.js';

const processor = new AIProcessor(model, expenseZodSchema);

export async function processExpenseFromImage(imagePath, mimeType = "image/jpeg") {
    const imagePart = processor.getFilePart(imagePath, mimeType);
    const dataAtualISO = new Date().toISOString();

    const promptRico = `
      CONTEXTO DO SISTEMA:
      - A data e hora atual do sistema é: ${dataAtualISO}
      - Analise a imagem deste cupom fiscal/nota.
      - Extraia o nome do estabelecimento (para a description), o valor TOTAL pago (amount), e a moeda (currency).
      - PRESTE ATENÇÃO NA DATA: Se houver uma data impressa no cupom, use-a e converta para ISO 8601. Se não houver, use a data atual do sistema.
      
      REGRA DE PRIVACIDADE ESTRITA (LGPD):
      - Ignore COMPLETAMENTE dados sensíveis como NIF, CPF, CNPJ, nomes completos, e-mails ou números de cartão de crédito presentes na imagem.
      - NENHUM desses dados deve aparecer no campo "description" ou em qualquer outro lugar do JSON.
    `;

    const applyPrivacyFilter = (rawData) => {
        if (rawData.description) {
            const safeDescription = anonymizeText(rawData.description);
            if (safeDescription !== rawData.description) {
                console.warn(`[AUDITORIA DE PRIVACIDADE]: A IA tentou incluir dados sensíveis. O filtro interveio.`);
                rawData.description = safeDescription;
            }
        }
        return rawData;
    };

    return processor.processWithContent(promptRico, imagePart, applyPrivacyFilter);
}