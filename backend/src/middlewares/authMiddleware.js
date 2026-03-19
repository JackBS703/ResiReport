const jwt = require('jsonwebtoken');
const env = require('../config/env');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    // El header debe venir como: "Bearer eyJhbGci..."
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ ok: false, message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Adjuntamos el payload del token al request para uso posterior
    req.user = decoded; // { userId, rol, nombre, iat, exp }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ ok: false, message: 'Token expirado' });
    }
    return res.status(401).json({ ok: false, message: 'Token inválido' });
  }
};

module.exports = authMiddleware;