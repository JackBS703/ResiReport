const jwt = require('jsonwebtoken');
const env = require('../config/env');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // El header debe venir como "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded; // { userId, rol, nombre } disponible en todos los controladores
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, message: 'Token inválido o expirado' });
  }
};

module.exports = verifyToken;
