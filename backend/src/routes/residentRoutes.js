// Rutas para la gestión de residentes
// Este archivo define las rutas relacionadas con los residentes en el sistema de denuncias.
// Solo accesibles para usuarios con roles de admin o superadmin.

const express = require('express');
const {
  getResidents, getResidentById, createResident,
  updateResident, toggleResidentStatus,
} = require('../controllers/residentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Middleware de autenticación y verificación de roles
router.use(authMiddleware, roleMiddleware('admin', 'superadmin'));

// Obtener todos los residentes
router.get('/', getResidents);

// Obtener un residente por ID
router.get('/:id', getResidentById);

// Crear un nuevo residente
router.post('/', createResident);

// Actualizar un residente existente
router.put('/:id', updateResident);

// Cambiar el estado de un residente (activar/desactivar)
router.patch('/:id/status', toggleResidentStatus);

module.exports = router;