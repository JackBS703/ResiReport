const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { BCRYPT_ROUNDS } = require('../config/env');

// GET /api/admins
const listarAdmins = async (req, res) => {
  try {
    const { search = '' } = req.query;

    const filtro = {
      rol: { $in: ['admin', 'superadmin'] },
    };

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filtro.$or = [
        { nombre: regex },
        { correo: regex },
      ];
    }

    const admins = await User.find(filtro)
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      data: admins,
      total: admins.length,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error al listar administradores',
      error: error.message,
    });
  }
};

// GET /api/admins/:id
const obtenerAdminPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findOne({
      _id: id,
      rol: { $in: ['admin', 'superadmin'] },
    }).select('-password');

    if (!admin) {
      return res.status(404).json({
        ok: false,
        message: 'Administrador no encontrado',
      });
    }

    return res.status(200).json({
      ok: true,
      data: admin,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener administrador',
      error: error.message,
    });
  }
};

// POST /api/admins
const crearAdmin = async (req, res) => {
  try {
    const {
      nombre,
      correo,
      password,
      rol,
      telefono,
      isActive,
    } = req.body;

    if (!nombre || !correo || !password || !rol) {
      return res.status(400).json({
        ok: false,
        message: 'Nombre, correo, contraseña y rol son obligatorios',
      });
    }

    if (!['admin', 'superadmin'].includes(rol)) {
      return res.status(400).json({
        ok: false,
        message: 'El rol debe ser admin o superadmin',
      });
    }

    const correoNormalizado = correo.trim().toLowerCase();

    const existeCorreo = await User.findOne({ correo: correoNormalizado });
    if (existeCorreo) {
      return res.status(409).json({
        ok: false,
        message: 'El correo ya está registrado en el sistema',
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(BCRYPT_ROUNDS) || 10
    );

    const nuevoAdmin = await User.create({
      nombre: nombre.trim(),
      correo: correoNormalizado,
      password: hashedPassword,
      rol,
      telefono: telefono?.trim() || '',
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    const adminCreado = nuevoAdmin.toObject();
    delete adminCreado.password;

    return res.status(201).json({
      ok: true,
      message: 'Administrador creado correctamente',
      data: adminCreado,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error al crear administrador',
      error: error.message,
    });
  }
};

// PUT /api/admins/:id
const actualizarAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      correo,
      password,
      rol,
      telefono,
      isActive,
    } = req.body;

    const adminActual = await User.findOne({
      _id: id,
      rol: { $in: ['admin', 'superadmin'] },
    });

    if (!adminActual) {
      return res.status(404).json({
        ok: false,
        message: 'Administrador no encontrado',
      });
    }

    const correoNormalizado = correo?.trim().toLowerCase();

    if (correoNormalizado && correoNormalizado !== adminActual.correo) {
      const correoExiste = await User.findOne({
        correo: correoNormalizado,
        _id: { $ne: id },
      });

      if (correoExiste) {
        return res.status(409).json({
          ok: false,
          message: 'El correo ya está registrado en otro usuario',
        });
      }
    }

    if (rol && !['admin', 'superadmin'].includes(rol)) {
      return res.status(400).json({
        ok: false,
        message: 'El rol debe ser admin o superadmin',
      });
    }

    const actualizacion = {
      ...(nombre !== undefined && { nombre: nombre.trim() }),
      ...(correoNormalizado && { correo: correoNormalizado }),
      ...(rol && { rol }),
      ...(telefono !== undefined && { telefono: telefono.trim() }),
      ...(typeof isActive === 'boolean' && { isActive }),
    };

    // HU-20 / RF-39: contraseña opcional
    if (password && password.trim()) {
      actualizacion.password = await bcrypt.hash(
        password.trim(),
        Number(BCRYPT_ROUNDS) || 10
      );
    }

    const adminActualizado = await User.findByIdAndUpdate(
      id,
      actualizacion,
      { new: true, runValidators: true }
    ).select('-password');

    return res.status(200).json({
      ok: true,
      message: 'Administrador actualizado correctamente',
      data: adminActualizado,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error al actualizar administrador',
      error: error.message,
    });
  }
};

// PATCH /api/admins/:id/status
const toggleEstadoAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        ok: false,
        message: 'El campo isActive debe ser booleano',
      });
    }

    // HU-06 / RF-11: impedir auto-desactivación
    if (req.user && req.user.id === id && isActive === false) {
      return res.status(403).json({
        ok: false,
        message: 'No puedes desactivar tu propia cuenta',
      });
    }

    const admin = await User.findOne({
      _id: id,
      rol: { $in: ['admin', 'superadmin'] },
    });

    if (!admin) {
      return res.status(404).json({
        ok: false,
        message: 'Administrador no encontrado',
      });
    }

    const adminActualizado = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');

    return res.status(200).json({
      ok: true,
      message: `Administrador ${isActive ? 'activado' : 'desactivado'} correctamente`,
      data: adminActualizado,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error al cambiar el estado del administrador',
      error: error.message,
    });
  }
};

module.exports = {
  listarAdmins,
  obtenerAdminPorId,
  crearAdmin,
  actualizarAdmin,
  toggleEstadoAdmin,
};
