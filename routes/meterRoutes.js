const express = require('express');
const router = express.Router();
const controller = require('../controllers/meterController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', protect, authorizeRoles('Admin', 'Maintenance Staff'), controller.listMeters);
router.post('/', protect, authorizeRoles('Admin'), controller.createMeter);
router.put('/:id', protect, authorizeRoles('Admin', 'Maintenance Staff'), controller.updateMeter);
router.delete('/:id', protect, authorizeRoles('Admin'), controller.deleteMeter);
router.get('/faulty/list', protect, authorizeRoles('Admin', 'Maintenance Staff'), controller.listFaultyMeters);

module.exports = router;
