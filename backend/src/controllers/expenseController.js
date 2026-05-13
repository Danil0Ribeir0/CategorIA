import { processUserExpense } from '../services/aiService.js';
import { processExpenseFromImage } from '../services/imageService.js';
import { processExpenseFromAudio } from '../services/audioService.js';
import { convertToBrl } from '../services/currencyService.js';
import { Expense } from '../models/Expense.js';

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
            return res.status(500).json({ error: error.message });
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
            return res.status(500).json({ error: error.message });
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
            return res.status(500).json({ error: error.message });
        }
    },

    async createFromImage(req, res) {
        const filePath = req.file.path;
    
        try {
            const rawData = await processExpenseFromImage(filePath, req.file.mimetype);
            const amountInBrl = await convertToBrl(rawData.amount, rawData.currency);
            
            const expense = await Expense.create({ 
                ...rawData, 
                amountInBrl,
                user: req.userId 
            });

            fs.unlinkSync(filePath); 

            return res.status(201).json(expense);
        } catch (error) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(500).json({ error: error.message });
        }
    },

    async createFromAudio(req, res) {
        const filePath = req.file.path;
    
        try {
            const rawData = await processExpenseFromAudio(filePath, req.file.mimetype);
            const amountInBrl = await convertToBrl(rawData.amount, rawData.currency);
            
            const expense = await Expense.create({ 
                ...rawData, 
                amountInBrl,
                user: req.userId 
            });

            fs.unlinkSync(filePath); 

            return res.status(201).json(expense);
        } catch (error) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(500).json({ error: error.message });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const expense = await Expense.findOneAndUpdate(
                { _id: id, user: req.userId }, 
                updateData,
                { returnDocument: 'after', runValidators: true }
            );

            if (!expense) {
                return res.status(404).json({ error: 'Despesa não encontrada ou não tem permissão para a editar.' });
            }

            return res.status(200).json(expense);
        } catch (error) {
            return res.status(500).json({ error: error.message });
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
            return res.status(500).json({ error: error.message });
        }
    },

    async exportCsv(req, res) {
        try {
            const expenses = await Expense.find({ user: req.userId }).sort({ date: -1 });

            if (expenses.length === 0) {
                return res.status(404).json({ error: 'Nenhuma despesa encontrada para exportar.' });
            }

            let csv = 'Data,Descricao,Categoria,Valor Original,Moeda,Valor em BRL\n';

            expenses.forEach(exp => {
                const date = exp.date.toISOString().split('T')[0];
                csv += `${date},"${exp.description}",${exp.category},${exp.amount},${exp.currency},${exp.amountInBrl}\n`;
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=extrato_categoria.csv');

            return res.status(200).send(csv);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};