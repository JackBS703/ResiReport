const express = require('express');
const {
  getActiveTypes, getTypes, createType, updateType, toggleTypeStatus, deleteType,
  getActiveStatuses, getStatuses, createStatus, updateStatus, toggleStatusActive, deleteStatus,
} = require('../controllers/catalogController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Todas las rutas requieren token válido
router.use(authMiddleware);

// Consultas de catálogos activos — cualquier rol autenticado (residente necesita esto al crear denuncia)
router.get('/types/active', getActiveTypes);
router.get('/statuses/active', getActiveStatuses);

// Gestión completa de tipos — solo admin y superadmin (HU-07, HU-08, RF-21)
router.get('/types', roleMiddleware('admin', 'superadmin'), getTypes);
router.post('/types', roleMiddleware('admin', 'superadmin'), createType);
router.put('/types/:id', roleMiddleware('admin', 'superadmin'), updateType);
router.patch('/types/:id/status', roleMiddleware('admin', 'superadmin'), toggleTypeStatus);
router.delete('/types/:id', roleMiddleware('admin', 'superadmin'), deleteType);

// Gestión completa de estados — solo admin y superadmin (HU-09, RF-19, RF-20)
router.get('/statuses', roleMiddleware('admin', 'superadmin'), getStatuses);
router.post('/statuses', roleMiddleware('admin', 'superadmin'), createStatus);
router.put('/statuses/:id', roleMiddleware('admin', 'superadmin'), updateStatus);
router.patch('/statuses/:id/status', roleMiddleware('admin', 'superadmin'), toggleStatusActive);
router.delete('/statuses/:id', roleMiddleware('admin', 'superadmin'), deleteStatus);

module.exports = router;