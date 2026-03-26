const bcrypt = require('bcryptjs');
const User = require('../models/User');

// GET /api/users — Solo admin
const getUsuarios = async (req, res, next) => {
  try {
    const usuarios = await User.find().select('-password');
    res.status(200).json({ ok: true, data: usuarios });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id — Solo admin
const getUsuarioById = async (req, res, next) => {
  try {
    const usuario = await User.findById(req.params.id).select('-password');
    if (!usuario) {
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    }
    res.status(200).json({ ok: true, data: usuario });
  } catch (error) {
    next(error);
  }
};

// POST /api/users — Solo admin
const crearUsuario = async (req, res, next) => {
  try {
    const { nombre, correo, password, rol } = req.body;

    if (!nombre || !correo || !password || !rol) {
      return res.status(400).json({ ok: false, message: 'Todos los campos son obligatorios' });
    }

    const existe = await User.findOne({ correo: correo.toLowerCase() });
    if (existe) {
      return res.status(409).json({ ok: false, message: 'El correo ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevoUsuario = await User.create({
      nombre,
      correo: correo.toLowerCase(),
      password: passwordHash,
      rol,
    });

    res.status(201).json({
      ok: true,
      data: { id: nuevoUsuario._id, nombre: nuevoUsuario.nombre, rol: nuevoUsuario.rol },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id — Solo admin
const actualizarUsuario = async (req, res, next) => {
  try {
    const { password, ...resto } = req.body;

    // Si mandan nueva contraseña, la hasheamos antes de guardar
    if (password) {
      const salt = await bcrypt.genSalt(10);
      resto.password = await bcrypt.hash(password, salt);
    }

    const actualizado = await User.findByIdAndUpdate(
      req.params.id,
      resto,
      { new: true, runValidators: true }
    ).select('-password');

    if (!actualizado) {
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    }

    res.status(200).json({ ok: true, data: actualizado });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id — Solo admin
const eliminarUsuario = async (req, res, next) => {
  try {
    const eliminado = await User.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    }
    res.status(200).json({ ok: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsuarios, getUsuarioById, crearUsuario, actualizarUsuario, eliminarUsuario };