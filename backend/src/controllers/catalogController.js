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

module.exports = { getActiveTypes, getActiveStatuses };