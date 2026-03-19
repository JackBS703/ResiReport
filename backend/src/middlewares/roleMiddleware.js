const roleMiddleware = (...rolesPermitidos) => {
  return (req, res, next) => {
    // authMiddleware debe correr antes, de lo contrario req.user no existe
    if (!req.user) {
      return res.status(401).json({ ok: false, message: 'No autenticado' });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        ok: false,
        message: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}`,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;