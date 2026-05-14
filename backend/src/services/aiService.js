import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { expenseZodSchema, ALLOWED_CATEGORIES } from '../schemas/expenseSchema.js';import 'dotenv/config';
import { anonymizeText } from '../utils/anonymizer.js';
import { AIProcessor } from './aiProcessor.js';
import { config } from '../config/env.js';

const genAI = new GoogleGenerativeAI(config.ai.geminiApiKey);

const SYSTEM_INSTRUCTION = `
Você é um assistente financeiro especialista em extração de dados.
Sua tarefa é analisar a frase do usuário e extrair os dados do gasto.
Você DEVE retornar os dados estritamente no formato solicitado.

REGRA DE CATEGORIZAÇÃO:
Você deve deduzir a categoria do gasto com base na descrição, mas DEVE OBRIGATORIAMENTE escolher UMA destas opções exatas:
[${ALLOWED_CATEGORIES.join(', ')}]

Não invente categorias novas sob nenhuma circunstância.
`;

const expenseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    description: {
      type: SchemaType.STRING,
      description: "A descrição do gasto de forma resumida (ex: Uber, Restaurante, Mercado)"
    },
    amount: {
      type: SchemaType.NUMBER,
      description: "O valor numérico do gasto"
    },
    currency: {
      type: SchemaType.STRING,
      description: "A moeda em formato ISO (ex: BRL, USD)"
    },
    category: {
      type: SchemaType.STRING,
      description: "A categoria da despesa (ex: Alimentação, Transporte, Saúde)"
    },
    date: { 
      type: SchemaType.STRING, 
      description: "A data inferida do gasto, estritamente no formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ). Calcule com base no contexto temporal fornecido." 
    }
  },
  required: ["description", "amount", "currency", "category", "date"]
};

export const model = genAI.getGenerativeModel({
  model: config.ai.model,
  systemInstruction: SYSTEM_INSTRUCTION, 
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: expenseSchema,      
    temperature: 0.1,
  }
});

const processor = new AIProcessor(model, expenseZodSchema);

export async function processUserExpense(text) {
    const safeText = anonymizeText(text);
    const dataAtualISO = new Date().toISOString();

    const promptRico = `
      CONTEXTO DO SISTEMA:
      - A data e hora atual do utilizador é exatamente: ${dataAtualISO}
      - Quando o utilizador mencionar dias da semana ou termos como "ontem", "hoje", "semana passada", use esta data atual como referência para calcular e retornar a data exata em que o gasto ocorreu.

      TEXTO DO UTILIZADOR A SER PROCESSADO:
      "${safeText}"
    `;

    return processor.processWithContent(promptRico);
}