const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const env = require('../config/env');

const login = async (req, res, next) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ ok: false, message: 'Correo y contraseña son obligatorios' });
    }

    // select('+password') porque el campo tiene select:false en el modelo
    const user = await User.findOne({ correo: correo.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });
    }

    if (!user.isActive) {
      return res.status(403).json({ ok: false, message: 'Cuenta inactiva. Contacta al administrador' });
    }

    const passwordValida = await bcrypt.compare(password, user.password);
    if (!passwordValida) {
      return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: user._id, rol: user.rol, nombre: user.nombre },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      ok: true,
      data: {
        token,
        user: { id: user._id, nombre: user.nombre, rol: user.rol },
      },
    });
  } catch (error) {
    next(error); // Pasa al errorHandler global
  }
};

module.exports = { login };