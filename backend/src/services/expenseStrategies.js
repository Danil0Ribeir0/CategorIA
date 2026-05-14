class TextExtractionStrategy {
    constructor(aiServices) {
        this.aiServices = aiServices;
    }
    
    async extract(input) {
        if (!input || typeof input !== 'string') throw new Error("Texto inválido para processamento.");
        return this.aiServices.processUserExpense(input);
    }
}

class ImageExtractionStrategy {
    constructor(aiServices) {
        this.aiServices = aiServices;
    }
    
    async extract(file) {
        if (!file || !file.path) throw new Error("Imagem não fornecida ou inválida.");
        return this.aiServices.processExpenseFromImage(file.path, file.mimetype);
    }
}

class AudioExtractionStrategy {
    constructor(aiServices) {
        this.aiServices = aiServices;
    }
    
    async extract(file) {
        if (!file || !file.path) throw new Error("Áudio não fornecido ou inválido.");
        return this.aiServices.processExpenseFromAudio(file.path, file.mimetype);
    }
}

export class ExpenseStrategyFactory {
    constructor(aiServices) {
        this.strategies = {
            text: new TextExtractionStrategy(aiServices),
            image: new ImageExtractionStrategy(aiServices),
            audio: new AudioExtractionStrategy(aiServices)
        };
    }

    getStrategy(type) {
        const strategy = this.strategies[type?.toLowerCase()];
        if (!strategy) {
            throw new Error(`Tipo de despesa '${type}' não é suportado.`);
        }
        return strategy;
    }
}