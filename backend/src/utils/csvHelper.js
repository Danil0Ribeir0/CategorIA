export const sanitizeCSVValue = (value) => {
    if (typeof value !== 'string') return value;
    
    if (/^[=+@-]/.test(value)) {
        return "'" + value;
    }
    
    return value;
};