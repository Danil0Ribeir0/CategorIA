import { processUserExpense } from '../services/aiService.js';
import { processExpenseFromImage } from '../services/imageService.js';
import { processExpenseFromAudio } from '../services/audioService.js';
import { convertToBrl } from '../services/currencyService.js';
import { Expense } from '../models/Expense.js';
import { sanitizeCSVValue } from '../utils/csvHelper.js';

import mongoose from 'mongoose';
import fs from 'fs';
import { z } from 'zod';

const listQuerySchema = z.object({
    category: z.string().optional(),
    month: z.coerce.number().min(1, "Mês deve ser de 1 a 12").max(12, "Mês deve ser de 1 a 12").optional(),
    year: z.coerce.number().min(2000, "Ano inválido").optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50, "Máximo de 50 itens por página").default(10)
});

const updateExpenseSchema = z.object({
    description: z.string().min(1, "A descrição não pode ser vazia").optional(),
    category: z.string().optional(),
    amount: z.number().positive("O valor deve ser positivo").optional(),
    currency: z.string().length(3, "A moeda deve ter 3 caracteres (ex: BRL, USD)").optional(),
    date: z.string().datetime().or(z.date()).optional()
}).strict();

export const expenseController = {
    async summary(req, res) {
        try {
            const { month, year } = req.query;

            const matchStage = {
                user: new mongoose.Types.ObjectId(req.userId)
            };

            if (month && year) {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0, 23, 59, 59);
                matchStage.date = { $gte: startDate, $lte: endDate };
            }

            const summary = await Expense.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: "category",
                        totalAmount: { $sum: "$amountInBrl" }
                    }
                },
                { $sort: { totalAmount: -1 } }
            ]);

            const totalExpenses = summary.reduce((acc, curr) => acc + curr.totalAmount, 0);

            const formattedSummary = summary.map(item => ({
                category: item._id,
                total: item.totalAmount,
                percentage: totalExpenses > 0 ? ((item.totalAmount / totalExpenses) * 100).toFixed(1) + '%' : '0%'
            }));

            return res.status(200).json({
                total: totalExpenses,
                breakdown: formattedSummary
            });
        } catch (error) {
            next(error);
        }
    },

    async list(req, res) {
        try {
            const validation = listQuerySchema.safeParse(req.query);

            if (!validation.success) {
                return res.status(400).json({ 
                    error: "Parâmetros inválidos", 
                    details: validation.error.flatten().fieldErrors 
                });
            }

            const { category, month, year, page, limit } = validation.data;

            const query = { user: req.userId };

            if (category) {
                query.category = category;
            }

            if (month && year) {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0, 23, 59, 59); 
                query.date = { $gte: startDate, $lte: endDate };
            }

            const skip = (page - 1) * limit;

            const expenses = await Expense.find(query)
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit);

            const totalItems = await Expense.countDocuments(query);

            return res.status(200).json({
                data: expenses,
                pagination: {
                    totalItems,
                    currentPage: page,
                    totalPages: Math.ceil(totalItems / limit),
                    itemsPerPage: limit
                }
            });
        } catch (error) {
            next(error);
        }
    },

    async createFromText(req, res) {
        try {
            const { text } = req.body;
            const rawData = await processUserExpense(text);      
            const amountInBrl = await convertToBrl(rawData.amount, rawData.currency);
            
            const expense = await Expense.create({ 
                ...rawData, 
                amountInBrl,
                user: req.userId 
            });

            return res.status(201).json(expense);
        } catch (error) {
            next(error);
        }
    },

    async createFromImage(req, res, next) {
        try {
            const rawData = await processExpenseFromImage(req.file.path, req.file.mimetype);
            const amountInBrl = await convertToBrl(rawData.amount, rawData.currency);
            
            const expense = await Expense.create({ 
                ...rawData, 
                amountInBrl,
                user: req.userId 
            });

            return res.status(201).json(expense);
        } catch (error) {
            next(error); 
        }
    },

    async createFromAudio(req, res, next) {
        try {
            const rawData = await processExpenseFromAudio(req.file.path, req.file.mimetype);
            const amountInBrl = await convertToBrl(rawData.amount, rawData.currency);
            
            const expense = await Expense.create({ 
                ...rawData, 
                amountInBrl,
                user: req.userId 
            });

            return res.status(201).json(expense);
        } catch (error) {
            next(error);
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const validation = updateExpenseSchema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({ 
                    error: "Dados de atualização inválidos", 
                    details: validation.error.flatten().fieldErrors 
                });
            }

            const updateData = validation.data;
            const expense = await Expense.findOne({ _id: id, user: req.userId });

            if (!expense) {
                return res.status(404).json({ error: 'Despesa não encontrada ou não tem permissão para a editar.' });
            }

            const needsRecalculation = updateData.amount !== undefined || updateData.currency !== undefined;

            Object.assign(expense, updateData);

            if (needsRecalculation) {
                expense.amountInBrl = await convertToBrl(expense.amount, expense.currency);
            }

            await expense.save();

            return res.status(200).json(expense);
        } catch (error) {
            next(error);
        }
    },

    async remove(req, res) {
        try {
            const { id } = req.params;

            const expense = await Expense.findOneAndDelete({ _id: id, user: req.userId });

            if (!expense) {
                return res.status(404).json({ error: 'Despesa não encontrada ou não tem permissão para a apagar.' });
            }

            return res.status(200).json({ message: 'Despesa apagada com sucesso!' });
        } catch (error) {
            next(error);
        }
    },

    async exportCsv(req, res, next) {
        try {
            const expenses = await Expense.find({ user: req.userId }).sort({ date: -1 });

            if (expenses.length === 0) {
                return res.status(404).json({ error: 'Nenhuma despesa encontrada para exportar.' });
            }

            let csv = 'Data,Descricao,Categoria,Valor Original,Moeda,Valor em BRL\n';

            expenses.forEach(exp => {
                const date = exp.date.toISOString().split('T')[0];
                const safeDescription = sanitizeCSVValue(exp.description);
                const safeCategory = sanitizeCSVValue(exp.category);

                csv += `${date},"${safeDescription}",${safeCategory},${exp.amount},${exp.currency},${exp.amountInBrl}\n`;
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=extrato_categoria.csv');

            return res.status(200).send(csv);
        } catch (error) {
            next(error);
        }
    }
};