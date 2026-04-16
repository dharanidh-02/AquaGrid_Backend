const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Route for overall usage trends (daily, weekly, monthly)
router.get('/usage', protect, authorizeRoles('Admin', 'System'), dashboardController.getUsageTrends);

// Route for apartment-specific total consumption
router.get('/apartments', protect, authorizeRoles('Admin', 'System'), dashboardController.getApartmentConsumption);

module.exports = router;
