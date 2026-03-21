const express = require('express');
const {
  listarAdmins,
  obtenerAdminPorId,
  crearAdmin,
  actualizarAdmin,
  toggleEstadoAdmin,
} = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Todas las rutas exigen token válido
router.use(authMiddleware);

// GET /api/admins
// Lista todos los admins — solo superadmin puede ver este panel (HU-05)
router.get(
  '/',
  roleMiddleware('superadmin'),
  listarAdmins
);

// GET /api/admins/:id
// Ver detalle de un admin específico — solo superadmin
router.get(
  '/:id',
  roleMiddleware('superadmin'),
  obtenerAdminPorId
);

// POST /api/admins
// Crear admin o superadmin — solo superadmin (HU-05, RF-09)
router.post(
  '/',
  roleMiddleware('superadmin'),
  crearAdmin
);

// PUT /api/admins/:id
// Editar datos de un admin, incluye contraseña opcional (HU-20, RF-38, RF-39)
router.put(
  '/:id',
  roleMiddleware('superadmin'),
  actualizarAdmin
);

// PATCH /api/admins/:id/status
// Activar o desactivar admin — superadmin no puede desactivarse a sí mismo (HU-06, RF-11)
router.patch(
  '/:id/status',
  roleMiddleware('superadmin'),
  toggleEstadoAdmin
);

module.exports = router;
