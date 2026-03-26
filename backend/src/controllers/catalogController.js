const ComplaintType = require('../models/ComplaintType');
const ComplaintStatus = require('../models/ComplaintStatus');

// GET /api/catalog/types/active — tipos activos para formularios
const getActiveTypes = async (req, res, next) => {
  try {
    const tipos = await ComplaintType.find({ isActive: true }).sort({ nombre: 1 });
    res.status(200).json({ ok: true, data: tipos });
  } catch (error) {
    next(error);
  }
};

// GET /api/catalog/statuses/active — estados activos para filtros
const getActiveStatuses = async (req, res, next) => {
  try {
    const estados = await ComplaintStatus.find({ isActive: true }).sort({ nombre: 1 });
    res.status(200).json({ ok: true, data: estados });
  } catch (error) {
    next(error);
  }
};

// GET /api/catalog/types — todos los tipos (para Admin)
const getTypes = async (req, res, next) => {
  try {
    const tipos = await ComplaintType.find().sort({ nombre: 1 });
    // El frontend espera {name, description, isActive} pero la BD tiene {nombre, descripcion, isActive} según seed.
    // Mapeo los datos al formato que espera el frontend
    const mappedTypes = tipos.map(t => ({
      _id: t._id,
      name: t.nombre,
      description: t.descripcion,
      isActive: t.isActive
    }));
    res.status(200).json({ ok: true, data: mappedTypes });
  } catch (error) {
    next(error);
  }
};

// POST /api/catalog/types
const createType = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;
    const existe = await ComplaintType.findOne({ nombre: new RegExp('^' + name + '$', 'i') });
    if (existe) {
      return res.status(409).json({ ok: false, message: 'El tipo ya existe' });
    }
    const nuevo = await ComplaintType.create({ nombre: name, descripcion: description, isActive });
    res.status(201).json({ ok: true, message: 'Tipo creado', data: nuevo });
  } catch (error) {
    next(error);
  }
};

// PUT /api/catalog/types/:id
const updateType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    const existe = await ComplaintType.findOne({ nombre: new RegExp('^' + name + '$', 'i'), _id: { $ne: id } });
    if (existe) {
      return res.status(409).json({ ok: false, message: 'El nombre ya está en uso' });
    }
    const tipo = await ComplaintType.findByIdAndUpdate(id, { nombre: name, descripcion: description, isActive }, { new: true });
    if (!tipo) return res.status(404).json({ ok: false, message: 'No encontrado' });
    res.status(200).json({ ok: true, message: 'Tipo actualizado', data: tipo });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/catalog/types/:id/status
const toggleTypeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const tipo = await ComplaintType.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!tipo) return res.status(404).json({ ok: false, message: 'No encontrado' });
    res.status(200).json({ ok: true, message: 'Estado actualizado', data: tipo });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/catalog/types/:id
const deleteType = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Falta validar si está en uso por alguna Complaint, pero por ahora lo borramos si es posible.
    const tipo = await ComplaintType.findByIdAndDelete(id);
    if (!tipo) return res.status(404).json({ ok: false, message: 'No encontrado' });
    res.status(200).json({ ok: true, message: 'Tipo eliminado' });
  } catch (error) {
    next(error);
  }
};

// ── ESTADOS DE DENUNCIA ──

// GET /api/catalog/statuses — todos los estados (para Admin)
const getStatuses = async (req, res, next) => {
  try {
    const estados = await ComplaintStatus.find().sort({ isDefault: -1, nombre: 1 });
    // Mapeo los datos al formato que espera el frontend (en caso que usen name en vez de nombre)
    const mappedStatuses = estados.map(e => ({
      _id: e._id,
      name: e.nombre,
      color: e.color,
      isDefault: e.isDefault,
      isActive: e.isActive
    }));
    res.status(200).json({ ok: true, data: mappedStatuses });
  } catch (error) {
    next(error);
  }
};

// POST /api/catalog/statuses
const createStatus = async (req, res, next) => {
  try {
    const { name, color, isActive } = req.body;
    const existe = await ComplaintStatus.findOne({ nombre: new RegExp('^' + name + '$', 'i') });
    if (existe) {
      return res.status(409).json({ ok: false, message: 'El estado ya existe' });
    }
    const nuevo = await ComplaintStatus.create({ nombre: name, color, isActive, isDefault: false });
    res.status(201).json({ ok: true, message: 'Estado creado', data: nuevo });
  } catch (error) {
    next(error);
  }
};

// PUT /api/catalog/statuses/:id
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, color, isActive } = req.body;
    
    // Si isDefault, talvez no queramos dejar cambiar el nombre libremente (o sí, según reglas). Lo permitiremos pero el isDefault no cambiará.
    const existe = await ComplaintStatus.findOne({ nombre: new RegExp('^' + name + '$', 'i'), _id: { $ne: id } });
    if (existe) {
      return res.status(409).json({ ok: false, message: 'El nombre ya está en uso' });
    }
    
    // No permitir cambiar isDefault, solo campos UI
    const estado = await ComplaintStatus.findById(id);
    if (!estado) return res.status(404).json({ ok: false, message: 'No encontrado' });

    estado.nombre = name;
    estado.color = color;
    estado.isActive = isActive;

    await estado.save();

    res.status(200).json({ ok: true, message: 'Estado actualizado', data: estado });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/catalog/statuses/:id/status
const toggleStatusActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const estado = await ComplaintStatus.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!estado) return res.status(404).json({ ok: false, message: 'No encontrado' });
    res.status(200).json({ ok: true, message: 'Estado activo actualizado', data: estado });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/catalog/statuses/:id
const deleteStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const estado = await ComplaintStatus.findById(id);
    if (!estado) return res.status(404).json({ ok: false, message: 'No encontrado' });

    if (estado.isDefault) {
      return res.status(403).json({ ok: false, message: 'Los estados por defecto no se pueden eliminar' });
    }

    await ComplaintStatus.findByIdAndDelete(id);
    res.status(200).json({ ok: true, message: 'Estado eliminado' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveTypes,
  getActiveStatuses,
  getTypes,
  createType,
  updateType,
  toggleTypeStatus,
  deleteType,
  getStatuses,
  createStatus,
  updateStatus,
  toggleStatusActive,
  deleteStatus
};
  try {
    const tipos = await ComplaintType.find().sort({ nombre: 1 });
    // El frontend espera {name, description, isActive} pero la BD tiene {nombre, descripcion, isActive} según seed.
    // Mapeo los datos al formato que espera el frontend
    const mappedTypes = tipos.map(t => ({
      _id: t._id,
      name: t.nombre,
      description: t.descripcion,
      isActive: t.isActive
    }));
    res.status(200).json({ ok: true, data: mappedTypes });
  } catch (error) {
    next(error);
  }
};

// POST /api/catalog/types
const createType = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;
    const existe = await ComplaintType.findOne({ nombre: new RegExp('^' + name + '$', 'i') });
    if (existe) {
      return res.status(409).json({ ok: false, message: 'El tipo ya existe' });
    }
    const nuevo = await ComplaintType.create({ nombre: name, descripcion: description, isActive });
    res.status(201).json({ ok: true, message: 'Tipo creado', data: nuevo });
  } catch (error) {
    next(error);
  }
};

// PUT /api/catalog/types/:id
const updateType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    const existe = await ComplaintType.findOne({ nombre: new RegExp('^' + name + '$', 'i'), _id: { $ne: id } });
    if (existe) {
      return res.status(409).json({ ok: false, message: 'El nombre ya está en uso' });
    }
    const tipo = await ComplaintType.findByIdAndUpdate(id, { nombre: name, descripcion: description, isActive }, { new: true });
    if (!tipo) return res.status(404).json({ ok: false, message: 'No encontrado' });
    res.status(200).json({ ok: true, message: 'Tipo actualizado', data: tipo });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/catalog/types/:id/status
const toggleTypeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const tipo = await ComplaintType.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!tipo) return res.status(404).json({ ok: false, message: 'No encontrado' });
    res.status(200).json({ ok: true, message: 'Estado actualizado', data: tipo });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/catalog/types/:id
const deleteType = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Falta validar si está en uso por alguna Complaint, pero por ahora lo borramos si es posible.
    const tipo = await ComplaintType.findByIdAndDelete(id);
    if (!tipo) return res.status(404).json({ ok: false, message: 'No encontrado' });
    res.status(200).json({ ok: true, message: 'Tipo eliminado' });
  } catch (error) {
    next(error);
  }
};

// ── ESTADOS DE DENUNCIA ──

// GET /api/catalog/statuses — todos los estados (para Admin)
const getStatuses = async (req, res, next) => {
  try {
    const estados = await ComplaintStatus.find().sort({ isDefault: -1, nombre: 1 });
    // Mapeo los datos al formato que espera el frontend (en caso que usen name en vez de nombre)
    const mappedStatuses = estados.map(e => ({
      _id: e._id,
      name: e.nombre,
      color: e.color,
      isDefault: e.isDefault,
      isActive: e.isActive
    }));
    res.status(200).json({ ok: true, data: mappedStatuses });
  } catch (error) {
    next(error);
  }
};

// POST /api/catalog/statuses
const createStatus = async (req, res, next) => {
  try {
    const { name, color, isActive } = req.body;
    const existe = await ComplaintStatus.findOne({ nombre: new RegExp('^' + name + '$', 'i') });
    if (existe) {
      return res.status(409).json({ ok: false, message: 'El estado ya existe' });
    }
    const nuevo = await ComplaintStatus.create({ nombre: name, color, isActive, isDefault: false });
    res.status(201).json({ ok: true, message: 'Estado creado', data: nuevo });
  } catch (error) {
    next(error);
  }
};

// PUT /api/catalog/statuses/:id
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, color, isActive } = req.body;
    
    // Si isDefault, talvez no queramos dejar cambiar el nombre libremente (o sí, según reglas). Lo permitiremos pero el isDefault no cambiará.
    const existe = await ComplaintStatus.findOne({ nombre: new RegExp('^' + name + '$', 'i'), _id: { $ne: id } });
    if (existe) {
      return res.status(409).json({ ok: false, message: 'El nombre ya está en uso' });
    }
    
    // No permitir cambiar isDefault, solo campos UI
    const estado = await ComplaintStatus.findById(id);
    if (!estado) return res.status(404).json({ ok: false, message: 'No encontrado' });

    estado.nombre = name;
    estado.color = color;
    estado.isActive = isActive;

    await estado.save();

    res.status(200).json({ ok: true, message: 'Estado actualizado', data: estado });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/catalog/statuses/:id/status
const toggleStatusActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const estado = await ComplaintStatus.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!estado) return res.status(404).json({ ok: false, message: 'No encontrado' });
    res.status(200).json({ ok: true, message: 'Estado activo actualizado', data: estado });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/catalog/statuses/:id
const deleteStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const estado = await ComplaintStatus.findById(id);
    if (!estado) return res.status(404).json({ ok: false, message: 'No encontrado' });

    if (estado.isDefault) {
      return res.status(403).json({ ok: false, message: 'Los estados por defecto no se pueden eliminar' });
    }

    await ComplaintStatus.findByIdAndDelete(id);
    res.status(200).json({ ok: true, message: 'Estado eliminado' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveTypes,
  getActiveStatuses,
  getTypes,
  createType,
  updateType,
  toggleTypeStatus,
  deleteType,
  getStatuses,
  createStatus,
  updateStatus,
  toggleStatusActive,
  deleteStatus
};
>>>>>>> main
