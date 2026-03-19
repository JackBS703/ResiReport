const express = require('express');
const {
  getComplaints,
  getComplaintById,
  cambiarEstado,
  cambiarPrioridad,
} = require('../controllers/complaintController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación + rol admin o superadmin
router.use(authMiddleware, roleMiddleware('admin', 'superadmin'));

// HU-14 — listar todas las denuncias con filtros
router.get('/', getComplaints);

// HU-15 — ver detalle de una denuncia
router.get('/:id', getComplaintById);

// HU-16 — cambiar estado
router.patch('/:id/status', cambiarEstado);

// HU-17 — cambiar prioridad
router.patch('/:id/priority', cambiarPrioridad);

module.exports = router;