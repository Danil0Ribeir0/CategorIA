import mongoose from 'mongoose';

export class ExpenseService {
    constructor(expenseRepository, currencyService, aiServices, exportFactory) {
        this.expenseRepository = expenseRepository;
        this.currencyService = currencyService;
        this.aiServices = aiServices;
        this.exportFactory = exportFactory;
    }

    async generateSummary(month, year, userId) {
        const matchStage = { user: new mongoose.Types.ObjectId(userId) };

        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            matchStage.date = { $gte: startDate, $lte: endDate };
        }

        const summary = await this.expenseRepository.aggregate([
            { $match: matchStage },
            { $group: { _id: "$category", totalAmount: { $sum: "$amountInBrl" } } },
            { $sort: { totalAmount: -1 } }
        ]);

        const totalExpenses = summary.reduce((acc, curr) => acc + curr.totalAmount, 0);

        return {
            total: totalExpenses,
            breakdown: summary.map(item => ({
                category: item._id,
                total: item.totalAmount,
                percentage: totalExpenses > 0 ? ((item.totalAmount / totalExpenses) * 100).toFixed(1) + '%' : '0%'
            }))
        };
    }

    async listWithFilters(filters, userId) {
        const { category, month, year, page, limit } = filters;
        const query = { user: userId };

        if (category) query.category = category;

        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            query.date = { $gte: startDate, $lte: endDate };
        }

        const skip = (page - 1) * limit;

        return this.expenseRepository.findWithPagination(query, skip, limit);
    }

    async _createExpenseCore(rawData, userId) {
        const amountInBrl = await this.currencyService.convertToBrl(rawData.amount, rawData.currency);
        return this.expenseRepository.create({ ...rawData, amountInBrl, user: userId });
    }

    async createFromText(text, userId) {
        const rawData = await this.aiServices.processUserExpense(text);
        return this._createExpenseCore(rawData, userId);
    }

    async createFromImage(filePath, mimeType, userId) {
        const rawData = await this.aiServices.processExpenseFromImage(filePath, mimeType);
        return this._createExpenseCore(rawData, userId);
    }

    async createFromAudio(filePath, mimeType, userId) {
        const rawData = await this.aiServices.processExpenseFromAudio(filePath, mimeType);
        return this._createExpenseCore(rawData, userId);
    }

    async updateExpense(id, updateData, userId) {
        const existingExpense = await this.expenseRepository.findByIdAndUser(id, userId);
        if (!existingExpense) throw new Error('NOT_FOUND');

        const needsRecalculation = updateData.amount !== undefined || updateData.currency !== undefined;
        const finalUpdateData = { ...updateData };

        if (needsRecalculation) {
            const amountToConvert = updateData.amount !== undefined ? updateData.amount : existingExpense.amount;
            const currencyToConvert = updateData.currency !== undefined ? updateData.currency : existingExpense.currency;
            finalUpdateData.amountInBrl = await this.currencyService.convertToBrl(amountToConvert, currencyToConvert);
        }

        return this.expenseRepository.update(id, userId, finalUpdateData);
    }

    async removeExpense(id, userId) {
        const expense = await this.expenseRepository.delete(id, userId);
        if (!expense) throw new Error('NOT_FOUND');
        return true;
    }

    async exportExpenses(userId, format = 'csv') {
        const expenses = await this.expenseRepository.findAll({ user: userId });
        if (expenses.length === 0) throw new Error('NOT_FOUND');

        const exporter = this.exportFactory.create(format);
        const data = exporter.export(expenses);

        return {
            data,
            contentType: exporter.getContentType(),
            extension: exporter.getFileExtension()
        };
    }
}