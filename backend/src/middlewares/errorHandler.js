const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  // En desarrollo mostramos el stack para debuggear más fácil
  const response = {
    ok: false,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;