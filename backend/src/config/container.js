import { User } from '../models/User.js';
import { Expense } from '../models/Expense.js';

import { UserRepository } from '../repositories/userRepository.js';
import { ExpenseRepository } from '../repositories/expenseRepository.js';

import { convertToBrl } from '../services/currencyService.js';
import { processUserExpense } from '../services/aiService.js';
import { processExpenseFromImage } from '../services/imageService.js';
import { processExpenseFromAudio } from '../services/audioService.js';
import { sanitizeCSVValue } from '../utils/csvHelper.js';

import { AuthService } from '../services/authService.js';
import { ExpenseService } from '../services/expenseService.js';
import { ExportFactory } from '../services/exportService.js';

class DIContainer {
    constructor() {
        this.services = {};
    }

    register(name, instance) {
        this.services[name] = instance;
    }

    get(name) {
        if (!this.services[name]) {
            throw new Error(`O serviço '${name}' não foi registado no container.`);
        }
        return this.services[name];
    }
}

export const container = new DIContainer();

container.register('userRepository', new UserRepository(User));
container.register('expenseRepository', new ExpenseRepository(Expense));

const currencyService = { convertToBrl };
const aiServices = { processUserExpense, processExpenseFromImage, processExpenseFromAudio };
const csvHelper = { sanitizeCSVValue };

container.register('currencyService', currencyService);
container.register('aiServices', aiServices);
container.register('csvHelper', csvHelper);
container.register('exportFactory', new ExportFactory(container.get('csvHelper')));

container.register('authService', new AuthService(
    container.get('userRepository')
));

container.register('expenseService', new ExpenseService(
    container.get('expenseRepository'),
    container.get('currencyService'),
    container.get('aiServices'),
    container.get('exportFactory')
));