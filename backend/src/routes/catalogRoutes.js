const express = require('express');
const {
  // Tipos
  getActiveTypes,
  getTypes,
  createType,
  updateType,
  toggleTypeStatus,
  deleteType,
  // Estados
  getActiveStatuses,
  getStatuses,
  createStatus,
  updateStatus,
  toggleStatusActive,
  deleteStatus
} = require('../controllers/catalogController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Requieren auth pero cualquier rol puede consultarlos
router.use(authMiddleware);

router.get('/types/active',    getActiveTypes);
router.get('/statuses/active', getActiveStatuses);

// CRUD de tipos de denuncia (Para Admin y Superadmin)
router.get('/types', getTypes);
router.post('/types', createType);
router.put('/types/:id', updateType);
router.patch('/types/:id/status', toggleTypeStatus);
router.delete('/types/:id', deleteType);

// CRUD de estados de denuncia
router.get('/statuses', getStatuses);
router.post('/statuses', createStatus);
router.put('/statuses/:id', updateStatus);
router.patch('/statuses/:id/status', toggleStatusActive);
router.delete('/statuses/:id', deleteStatus);

module.exports = router;