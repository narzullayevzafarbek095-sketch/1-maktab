function errorHandler(err, req, res, next) {
    console.error(`❌ [Error ${req.method} ${req.url}]:`, err.message || err);
    
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Serverda ichki xatolik yuz berdi.",
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
}

function notFoundHandler(req, res, next) {
    res.status(404).json({
        success: false,
        message: `Endpoint topilmadi: ${req.method} ${req.originalUrl}`
    });
}

module.exports = {
    errorHandler,
    notFoundHandler
};
