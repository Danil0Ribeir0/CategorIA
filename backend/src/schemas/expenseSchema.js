import { z } from 'zod';

export const ALLOWED_CATEGORIES = [
  'Alimentação', 
  'Transporte', 
  'Moradia', 
  'Saúde', 
  'Educação', 
  'Lazer', 
  'Serviços', 
  'Outros'
];

export const expenseZodSchema = z.object({
  description: z.string().min(2, "A descrição deve ter pelo menos 2 caracteres."),
  amount: z.number().positive("O valor do gasto deve ser maior que zero."),
  currency: z.string().length(3, "A moeda deve estar no formato ISO de 3 letras (ex: BRL)."),
  category: z.enum(ALLOWED_CATEGORIES, {
    errorMap: () => ({ message: "Categoria inválida." })
  }),
  date: z.string().datetime("A data deve estar no formato ISO 8601 (ex: 2026-04-19T00:00:00Z).")
});