const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Логируем ошибку в консоль

    const statusCode = err.status || 500; // Код статуса по умолчанию 500
    const message = err.message || 'Internal Server Error'; // Сообщение об ошибке

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
    });
};

module.exports = errorHandler;