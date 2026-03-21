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
      filtro.$or = [{ nombre: regex }, { correo: regex }];
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

    return res.status(200).json({ ok: true, data: admin });
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
    const { nombre, correo, password, rol, telefono, isActive } = req.body;

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

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const nuevoAdmin = await User.create({
      nombre: nombre.trim(),
      correo: correoNormalizado,
      password: hashedPassword,
      rol,
      telefono: telefono?.trim() || null,
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    const { password: _pw, ...adminCreado } = nuevoAdmin.toObject();

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
    const { nombre, correo, password, rol, telefono, isActive } = req.body;

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

    // Superadmin no puede cambiar su propio rol
    if (rol && rol !== adminActual.rol && req.user.userId.toString() === id) {
      return res.status(403).json({
        ok: false,
        message: 'No puedes cambiar tu propio rol',
      });
    }

    // Si se degrada un superadmin, debe quedar al menos uno activo
    if (rol && rol !== 'superadmin' && adminActual.rol === 'superadmin') {
      const superadminsActivos = await User.countDocuments({
        rol: 'superadmin',
        isActive: true,
        _id: { $ne: id },
      });

      if (superadminsActivos === 0) {
        return res.status(403).json({
          ok: false,
          message: 'Debe haber al menos un superadmin activo en el sistema',
        });
      }
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
      ...(telefono !== undefined && { telefono: telefono?.trim() || null }),
      ...(typeof isActive === 'boolean' && { isActive }),
    };

    // RF-39: solo actualiza contraseña si se envía una nueva
    if (password && password.trim()) {
      actualizacion.password = await bcrypt.hash(password.trim(), BCRYPT_ROUNDS);
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

    // RF-11: superadmin no puede desactivar su propia cuenta
    if (req.user.userId.toString() === id && isActive === false) {
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

    // Debe quedar al menos un superadmin activo
    if (isActive === false && admin.rol === 'superadmin') {
      const superadminsActivos = await User.countDocuments({
        rol: 'superadmin',
        isActive: true,
        _id: { $ne: id },
      });

      if (superadminsActivos === 0) {
        return res.status(403).json({
          ok: false,
          message: 'Debe haber al menos un superadmin activo en el sistema',
        });
      }
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
