const express = require('express');
const {
  getActiveTypes,
  getActiveStatuses,
  getTypes,
  createType,
  updateType,
  toggleTypeStatus,
  deleteType
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

module.exports = router;