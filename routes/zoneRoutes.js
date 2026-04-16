const express = require('express');
const router = express.Router();
const {
    getZones,
    getZoneById,
    createZone,
    updateZone,
    deleteZone,
} = require('../controllers/zoneController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getZones).post(protect, admin, createZone);
router
    .route('/:id')
    .get(protect, getZoneById)
    .put(protect, admin, updateZone)
    .delete(protect, admin, deleteZone);

module.exports = router;
