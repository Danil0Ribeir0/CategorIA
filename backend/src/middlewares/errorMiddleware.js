export const errorHandler = (err, req, res, next) => {
    console.error(`[SERVER ERROR]: ${err.stack || err.message}`);

    const statusCode = err.statusCode || 500;

    const message = statusCode === 500 
        ? 'Ocorreu um erro interno no servidor. Por favor, tente mais tarde.' 
        : err.message;

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};