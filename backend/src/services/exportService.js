class CSVExporter {
    constructor(csvHelper) {
        this.csvHelper = csvHelper;
    }

    export(expenses) {
        let csv = 'Data,Descricao,Categoria,Valor Original,Moeda,Valor em BRL\n';
        
        expenses.forEach(exp => {
            const date = exp.date.toISOString().split('T')[0];
            const safeDescription = this.csvHelper.sanitizeCSVValue(exp.description);
            const safeCategory = this.csvHelper.sanitizeCSVValue(exp.category);
            csv += `${date},"${safeDescription}",${safeCategory},${exp.amount},${exp.currency},${exp.amountInBrl}\n`;
        });
        
        return csv;
    }

    getContentType() {
        return 'text/csv';
    }

    getFileExtension() {
        return 'csv';
    }
}

export class ExportFactory {
    constructor(csvHelper) {
        this.exporters = {
            csv: new CSVExporter(csvHelper)
        };
    }

    create(format) {
        const exporter = this.exporters[format.toLowerCase()];
        if (!exporter) {
            throw new Error(`Formato de exportação '${format}' não suportado.`);
        }
        return exporter;
    }
}