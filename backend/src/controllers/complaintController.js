const Complaint = require('../models/Complaint');
const ComplaintStatus = require('../models/ComplaintStatus');

// GET /api/complaints — HU-14: listar todas con filtros
const getComplaints = async (req, res, next) => {
  try {
    const { estado, tipo, prioridad, fechaDesde, fechaHasta, search, page = 1, limit = 10 } = req.query;

    const filtro = {};

    if (estado)    filtro.estado    = estado;
    if (tipo)      filtro.tipo      = tipo;
    if (prioridad) filtro.prioridad = prioridad;

    // Filtro por rango de fechas sobre createdAt
    if (fechaDesde || fechaHasta) {
      filtro.createdAt = {};
      if (fechaDesde) filtro.createdAt.$gte = new Date(fechaDesde);
      if (fechaHasta) filtro.createdAt.$lte = new Date(fechaHasta);
    }

    // Búsqueda por texto en título o descripción
    if (search) {
      filtro.$or = [
        { titulo:    { $regex: search, $options: 'i' } },
        { ubicacion: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // máx 50 por seguridad
    const skip     = (pageNum - 1) * limitNum;

    // Ejecuta ambas queries en paralelo para no hacer 2 viajes secuenciales
    const [complaints, total] = await Promise.all([
      Complaint.find(filtro)
        .populate('tipo',     'nombre')
        .populate('estado',   'nombre color')
        .populate('residente','nombre correo torre apartamento')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Complaint.countDocuments(filtro), // total real con filtros aplicados
    ]);

    res.status(200).json({
      ok:       true,
      data:     complaints,
      total,                     // total de registros que coinciden con el filtro
      page:     pageNum,
      limit:    limitNum,
      pages:    Math.ceil(total / limitNum), // total de páginas
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/complaints/:id — HU-15: ver detalle
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('tipo',    'nombre')
      .populate('estado',  'nombre color')
      .populate('residente', 'nombre correo torre apartamento')
      .populate('statusHistory.estadoNuevo',    'nombre')
      .populate('statusHistory.estadoAnterior', 'nombre')
      .populate('statusHistory.cambiadoPor',    'nombre rol');

    if (!complaint) {
      return res.status(404).json({ ok: false, message: 'Denuncia no encontrada' });
    }

    // HU-12: autorizar solo propietario o admin
    if (complaint.residente._id.toString() !== req.user.userId && !['admin', 'superadmin'].includes(req.user.rol)) {
      return res.status(403).json({ ok: false, message: 'No autorizado para ver esta denuncia' });
    }

    res.status(200).json({ ok: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

// POST /api/complaints — HU-10: crear denuncia
const createComplaint = async (req, res, next) => {
  try {
    const { titulo, descripcion, ubicacion, tipo } = req.body;

    // HU-22: validaciones específicas por campo
    const errors = {};
    if (!titulo || titulo.trim().length < 5) {
      errors.titulo = 'El título es obligatorio y debe tener al menos 5 caracteres';
    }
    if (!descripcion || descripcion.trim().length < 10) {
      errors.descripcion = 'La descripción es obligatoria y debe tener al menos 10 caracteres';
    }
    if (!ubicacion || ubicacion.trim().length < 5) {
      errors.ubicacion = 'La ubicación es obligatoria y debe tener al menos 5 caracteres';
    }
    if (!tipo) {
      errors.tipo = 'El tipo de denuncia es obligatorio';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ ok: false, message: 'Errores de validación', errors });
    }

    // Obtener estado "Registrada"
    const estadoRegistrada = await ComplaintStatus.findOne({ nombre: 'Registrada' });
    if (!estadoRegistrada) {
      return res.status(500).json({ ok: false, message: 'Estado por defecto no encontrado' });
    }

    const complaint = await Complaint.create({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      ubicacion: ubicacion.trim(),
      tipo,
      estado: estadoRegistrada._id,
      residente: req.user.userId,
      prioridad: 'sin_asignar',
      statusHistory: [{
        estadoAnterior: null,
        estadoNuevo: estadoRegistrada._id,
        cambiadoPor: req.user.userId,
      }]
    });

    // Retornar con populates
    const populated = await Complaint.findById(complaint._id)
      .populate('tipo', 'nombre')
      .populate('estado', 'nombre color')
      .populate('residente', 'nombre correo torre apartamento');

    res.status(201).json({ ok: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// GET /api/complaints/mine — HU-11: ver mis denuncias
const getMyComplaints = async (req, res, next) => {
  try {
    const { estado, tipo, prioridad, search, page = 1, limit = 10 } = req.query;

    const filtro = { residente: req.user.userId };

    if (estado)    filtro.estado    = estado;
    if (tipo)      filtro.tipo      = tipo;
    if (prioridad) filtro.prioridad = prioridad;

    // Búsqueda por texto en título o descripción
    if (search) {
      filtro.$or = [
        { titulo:    { $regex: search, $options: 'i' } },
        { ubicacion: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // máx 50 por seguridad
    const skip     = (pageNum - 1) * limitNum;

    const [complaints, total] = await Promise.all([
      Complaint.find(filtro)
        .populate('tipo',     'nombre')
        .populate('estado',   'nombre color')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Complaint.countDocuments(filtro),
    ]);

    res.status(200).json({
      ok:       true,
      data:     complaints,
      total,
      page:     pageNum,
      limit:    limitNum,
      pages:    Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/complaints/:id — HU-13: editar denuncia solo si estado = "Registrada"
const updateComplaint = async (req, res, next) => {
  try {
    const { titulo, descripcion, ubicacion, tipo } = req.body;

    const complaint = await Complaint.findById(req.params.id).populate('estado', 'nombre color');
    if (!complaint) {
      return res.status(404).json({ ok: false, message: 'Denuncia no encontrada' });
    }

    // Autorización: propietario o admin
    if (complaint.residente.toString() !== req.user.userId && !['admin', 'superadmin'].includes(req.user.rol)) {
      return res.status(403).json({ ok: false, message: 'No autorizado para editar esta denuncia' });
    }

    // HU-13: solo si estado = "Registrada"
    if (complaint.estado.nombre !== 'Registrada') {
      return res.status(403).json({ ok: false, message: 'Solo se pueden editar denuncias en estado Registrada' });
    }

    // HU-22: validaciones
    const errors = {};
    if (titulo && titulo.trim().length < 5) {
      errors.titulo = 'El título debe tener al menos 5 caracteres';
    }
    if (descripcion && descripcion.trim().length < 10) {
      errors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }
    if (ubicacion && ubicacion.trim().length < 5) {
      errors.ubicacion = 'La ubicación debe tener al menos 5 caracteres';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ ok: false, message: 'Errores de validación', errors });
    }

    // Actualizar solo campos permitidos
    if (titulo) complaint.titulo = titulo.trim();
    if (descripcion) complaint.descripcion = descripcion.trim();
    if (ubicacion) complaint.ubicacion = ubicacion.trim();
    if (tipo) complaint.tipo = tipo;

    await complaint.save();

    // Retornar actualizada
    const updated = await Complaint.findById(complaint._id)
      .populate('tipo', 'nombre')
      .populate('estado', 'nombre color')
      .populate('residente', 'nombre correo torre apartamento');

    res.status(200).json({ ok: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/complaints/:id/status — HU-16: cambiar estado + registrar historial
const cambiarEstado = async (req, res, next) => {
  try {
    const { estadoId } = req.body;

    if (!estadoId) {
      return res.status(400).json({ ok: false, message: 'El estadoId es obligatorio' });
    }

    // Verificar que el estado existe y está activo
    const estadoNuevo = await ComplaintStatus.findById(estadoId);
    if (!estadoNuevo || !estadoNuevo.isActive) {
      return res.status(400).json({ ok: false, message: 'Estado inválido o inactivo' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ ok: false, message: 'Denuncia no encontrada' });
    }

    // Registra el cambio en el historial — RF-31
    complaint.statusHistory.push({
      estadoAnterior: complaint.estado,
      estadoNuevo:    estadoId,
      cambiadoPor:    req.user.userId,
    });

    complaint.estado = estadoId;
    await complaint.save();

    // Retorna la complaint actualizada con todos los campos populados
    const actualizada = await Complaint.findById(complaint._id)
      .populate('tipo',    'nombre')
      .populate('estado',  'nombre color')
      .populate('residente', 'nombre correo')
      .populate('statusHistory.estadoNuevo',    'nombre')
      .populate('statusHistory.estadoAnterior', 'nombre')
      .populate('statusHistory.cambiadoPor',    'nombre rol');

    res.status(200).json({ ok: true, data: actualizada });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/complaints/:id/priority — HU-17: cambiar prioridad
const cambiarPrioridad = async (req, res, next) => {
  try {
    const { prioridad } = req.body;
    const validas = ['sin_asignar', 'baja', 'media', 'alta'];

    if (!validas.includes(prioridad)) {
      return res.status(400).json({ ok: false, message: 'Prioridad inválida' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { prioridad },
      { new: true, runValidators: true }
    )
      .populate('tipo',     'nombre')
      .populate('estado',   'nombre')
      .populate('residente','nombre correo');

    if (!complaint) {
      return res.status(404).json({ ok: false, message: 'Denuncia no encontrada' });
    }

    res.status(200).json({ ok: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

module.exports = { getComplaints, getComplaintById, createComplaint, getMyComplaints, updateComplaint, cambiarEstado, cambiarPrioridad };
