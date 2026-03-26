const express = require('express');
const {
  getComplaints,
  getComplaintById,
  createComplaint,
  getMyComplaints,
  updateComplaint,
  cambiarEstado,
  cambiarPrioridad,
} = require('../controllers/complaintController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación + rol resident, admin o superadmin
router.use(authMiddleware, roleMiddleware('resident', 'admin', 'superadmin'));

// HU-14 — listar todas las denuncias con filtros (solo admin)
router.get('/', roleMiddleware('admin', 'superadmin'), getComplaints);

// HU-11 — ver mis denuncias (residentes)
router.get('/mine', getMyComplaints);

// HU-15 — ver detalle de una denuncia
router.get('/:id', getComplaintById);

// HU-10 — crear denuncia
router.post('/', createComplaint);

// HU-13 — editar denuncia solo si estado = "Registrada"
router.put('/:id', updateComplaint);

// HU-16 — cambiar estado (solo admin)
router.patch('/:id/status', roleMiddleware('admin', 'superadmin'), cambiarEstado);

// HU-17 — cambiar prioridad (solo admin)
router.patch('/:id/priority', roleMiddleware('admin', 'superadmin'), cambiarPrioridad);
=======
// HU-16 — cambiar estado
router.patch('/:id/status', cambiarEstado);

// HU-17 — cambiar prioridad
router.patch('/:id/priority', cambiarPrioridad);
>>>>>>> main

module.exports = router;