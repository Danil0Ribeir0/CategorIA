import mongoose from 'mongoose';

export class ExpenseService {
    constructor(ExpenseModel, currencyService, aiServices, csvHelper) {
        this.Expense = ExpenseModel;
        this.currencyService = currencyService;
        this.aiServices = aiServices;
        this.csvHelper = csvHelper;
    }

    async generateSummary(month, year, userId) {
        const matchStage = { user: new mongoose.Types.ObjectId(userId) };

        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            matchStage.date = { $gte: startDate, $lte: endDate };
        }

        const summary = await this.Expense.aggregate([
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

        const expenses = await this.Expense.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        const totalItems = await this.Expense.countDocuments(query);

        return {
            data: expenses,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                itemsPerPage: limit
            }
        };
    }

    async _createExpenseCore(rawData, userId) {
        const amountInBrl = await this.currencyService.convertToBrl(rawData.amount, rawData.currency);
        return this.Expense.create({ ...rawData, amountInBrl, user: userId });
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
        const expense = await this.Expense.findOne({ _id: id, user: userId });
        if (!expense) throw new Error('NOT_FOUND');

        const needsRecalculation = updateData.amount !== undefined || updateData.currency !== undefined;
        Object.assign(expense, updateData);

        if (needsRecalculation) {
            expense.amountInBrl = await this.currencyService.convertToBrl(expense.amount, expense.currency);
        }

        await expense.save();
        return expense;
    }

    async removeExpense(id, userId) {
        const expense = await this.Expense.findOneAndDelete({ _id: id, user: userId });
        if (!expense) throw new Error('NOT_FOUND');
        return true;
    }

    async exportCsv(userId) {
        const expenses = await this.Expense.find({ user: userId }).sort({ date: -1 });
        if (expenses.length === 0) throw new Error('NOT_FOUND');

        let csv = 'Data,Descricao,Categoria,Valor Original,Moeda,Valor em BRL\n';
        expenses.forEach(exp => {
            const date = exp.date.toISOString().split('T')[0];
            const safeDescription = this.csvHelper.sanitizeCSVValue(exp.description);
            const safeCategory = this.csvHelper.sanitizeCSVValue(exp.category);
            csv += `${date},"${safeDescription}",${safeCategory},${exp.amount},${exp.currency},${exp.amountInBrl}\n`;
        });
        return csv;
    }
}