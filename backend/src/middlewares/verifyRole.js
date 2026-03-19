const verifyRole = (...rolesPermitidos) => {
  // Retorna una función middleware — el "..." permite pasar múltiples roles
  // Ejemplo de uso en una ruta: verifyRole('admin', 'superadmin')
  return (req, res, next) => {
    
    // req.user lo puso verifyToken en el paso anterior
    // Si verifyRole se usa sin verifyToken antes, esto explotará — es intencional
    if (!req.user) {
      return res.status(401).json({ ok: false, message: 'No autenticado' });
    }

    // Verifica si el rol del usuario está dentro de los roles permitidos
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permisos para realizar esta acción',
      });
    }

    next(); // Rol válido — pasa al controlador
  };
};

module.exports = verifyRole;
