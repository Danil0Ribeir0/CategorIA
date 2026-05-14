import { z } from 'zod';
import { container } from '../config/container.js';

const expenseService = container.get('expenseService');

const listQuerySchema = z.object({
    category: z.string().optional(),
    month: z.coerce.number().min(1, "Mês deve ser de 1 a 12").max(12).optional(),
    year: z.coerce.number().min(2000, "Ano inválido").optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10)
});

const updateExpenseSchema = z.object({
    description: z.string().min(1).optional(),
    category: z.string().optional(),
    amount: z.number().positive().optional(),
    currency: z.string().length(3).optional(),
    date: z.string().datetime().or(z.date()).optional()
}).strict();

const expenseRepository = new ExpenseRepository(Expense);

const expenseService = new ExpenseService(
    Expense,
    { convertToBrl },
    { processUserExpense, processExpenseFromImage, processExpenseFromAudio },
    { sanitizeCSVValue }
);

export const expenseController = {
    async summary(req, res, next) {
        try {
            const result = await expenseService.generateSummary(req.query.month, req.query.year, req.userId);
            return res.status(200).json(result);
        } catch (error) { next(error); }
    },

    async list(req, res, next) {
        try {
            const validation = listQuerySchema.safeParse(req.query);
            if (!validation.success) {
                return res.status(400).json({ error: "Parâmetros inválidos", details: validation.error.flatten().fieldErrors });
            }
            const result = await expenseService.listWithFilters(validation.data, req.userId);
            return res.status(200).json(result);
        } catch (error) { next(error); }
    },

    async createFromText(req, res, next) {
        try {
            const result = await expenseService.createFromText(req.body.text, req.userId);
            return res.status(201).json(result);
        } catch (error) { next(error); }
    },

    async createFromImage(req, res, next) {
        try {
            const result = await expenseService.createFromImage(req.file.path, req.file.mimetype, req.userId);
            return res.status(201).json(result);
        } catch (error) { next(error); }
    },

    async createFromAudio(req, res, next) {
        try {
            const result = await expenseService.createFromAudio(req.file.path, req.file.mimetype, req.userId);
            return res.status(201).json(result);
        } catch (error) { next(error); }
    },

    async update(req, res, next) {
        try {
            const validation = updateExpenseSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ error: "Dados inválidos", details: validation.error.flatten().fieldErrors });
            }
            const result = await expenseService.updateExpense(req.params.id, validation.data, req.userId);
            return res.status(200).json(result);
        } catch (error) {
            if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Despesa não encontrada.' });
            next(error);
        }
    },

    async remove(req, res, next) {
        try {
            await expenseService.removeExpense(req.params.id, req.userId);
            return res.status(200).json({ message: 'Despesa apagada com sucesso!' });
        } catch (error) {
            if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Despesa não encontrada.' });
            next(error);
        }
    },

    async export(req, res, next) {
        try {
            const format = req.query.format || 'csv';
            const result = await expenseService.exportExpenses(req.userId, format);

            res.setHeader('Content-Type', result.contentType);
            res.setHeader('Content-Disposition', `attachment; filename=extrato_categoria.${result.extension}`);

            return res.status(200).send(result.data);
        } catch (error) {
            if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Nenhuma despesa encontrada para exportar.' });
            if (error.message.includes('não suportado')) return res.status(400).json({ error: error.message });
            
            next(error);
        }
    }
};