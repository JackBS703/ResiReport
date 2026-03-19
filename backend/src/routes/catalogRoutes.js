const express = require('express');
const { getActiveTypes, getActiveStatuses } = require('../controllers/catalogController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Requieren auth pero cualquier rol puede consultarlos
router.use(authMiddleware);

router.get('/types/active',    getActiveTypes);
router.get('/statuses/active', getActiveStatuses);

module.exports = router;