const express = require('express');
const {
  getResidents,
  getResidentById,
  createResident,
  updateResident,
  toggleResidentStatus,
} = require('../controllers/residentController');
const verifyToken = require('../middlewares/verifyToken');
const verifyRole = require('../middlewares/verifyRole');

const router = express.Router();

// Todas las rutas de residentes requieren token válido + rol admin o superadmin
router.use(verifyToken, verifyRole('admin', 'superadmin'));

router.get('/', getResidents);
router.get('/:id', getResidentById);
router.post('/', createResident);
router.put('/:id', updateResident);
router.patch('/:id/status', toggleResidentStatus);

module.exports = router;
