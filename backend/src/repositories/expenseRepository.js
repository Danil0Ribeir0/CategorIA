// backend/src/repositories/expenseRepository.js
export class ExpenseRepository {
    constructor(ExpenseModel) {
        this.model = ExpenseModel;
    }

    async aggregate(pipeline) {
        return this.model.aggregate(pipeline);
    }

    async findWithPagination(query, skip, limit) {
        const data = await this.model.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);
        
        const totalItems = await this.model.countDocuments(query);
        
        return { data, totalItems };
    }

    async findAll(query) {
        return this.model.find(query).sort({ date: -1 });
    }

    async findByIdAndUser(id, userId) {
        return this.model.findOne({ _id: id, user: userId });
    }

    async create(expenseData) {
        return this.model.create(expenseData);
    }

    async update(id, userId, updateData) {
        // Usamos findOneAndUpdate para que o Service não precise chamar o .save() do Mongoose
        return this.model.findOneAndUpdate(
            { _id: id, user: userId }, 
            updateData, 
            { new: true } // Retorna o documento já atualizado
        );
    }

    async delete(id, userId) {
        return this.model.findOneAndDelete({ _id: id, user: userId });
    }
}