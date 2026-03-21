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
        .populate('estado',   'nombre')
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
      .populate('estado',  'nombre')
      .populate('residente', 'nombre correo torre apartamento')
      .populate('statusHistory.estadoNuevo',    'nombre')
      .populate('statusHistory.estadoAnterior', 'nombre')
      .populate('statusHistory.cambiadoPor',    'nombre rol');

    if (!complaint) {
      return res.status(404).json({ ok: false, message: 'Denuncia no encontrada' });
    }

    res.status(200).json({ ok: true, data: complaint });
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
      .populate('estado',  'nombre')
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
    const validas = ['sinasignar', 'baja', 'media', 'alta'];

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

module.exports = { getComplaints, getComplaintById, cambiarEstado, cambiarPrioridad };