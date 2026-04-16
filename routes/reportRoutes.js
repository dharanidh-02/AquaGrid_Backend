const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/daily', protect, authorizeRoles('Admin', 'System'), controller.getDailyReport);
router.get('/monthly', protect, authorizeRoles('Admin', 'System'), controller.getMonthlyReport);
router.get('/history', protect, authorizeRoles('Admin', 'User', 'Maintenance Staff', 'System'), controller.getHistoricalConsumption);

module.exports = router;
