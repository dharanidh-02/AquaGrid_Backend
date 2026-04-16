const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Route to fetch all alerts
router.get('/', protect, authorizeRoles('Admin', 'Maintenance Staff', 'System'), alertController.getAlerts);

// Route to resolve an alert
router.patch('/:id/resolve', protect, authorizeRoles('Admin', 'Maintenance Staff'), alertController.resolveAlert);

module.exports = router;
