const express = require('express');
const {
  getUsuarios,
  getUsuarioById,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Todas las rutas de usuarios requieren estar autenticado Y ser admin
router.use(authMiddleware, roleMiddleware('admin'));

router.get('/', getUsuarios);
router.get('/:id', getUsuarioById);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);

module.exports = router;