import fs from 'fs';

export class AIProcessor {
    constructor(model, validator) {
        this.model = model;
        this.validator = validator;
    }

    async processWithContent(prompt, contentPart = null, postProcessor = null) {
        try {
            const params = contentPart ? [prompt, contentPart] : prompt;
            
            const result = await this.model.generateContent(params);
            const jsonString = result.response.text();
            
            let rawData = JSON.parse(jsonString);

            if (postProcessor) {
                rawData = postProcessor(rawData);
            }

            return this._validate(rawData);
        } catch (error) {
            throw new Error(`Erro na IA ou no processamento dos dados: ${error.message}`);
        }
    }

    _validate(rawData) {
        const validation = this.validator.safeParse(rawData);
        if (!validation.success) {
            console.error("Falha na validação Zod:", validation.error.format());
            throw new Error("A IA processou o conteúdo, mas os dados extraídos são inválidos.");
        }
        return validation.data;
    }

    getFilePart(filePath, mimeType) {
        return {
            inlineData: {
                data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
                mimeType
            }
        };
    }
}