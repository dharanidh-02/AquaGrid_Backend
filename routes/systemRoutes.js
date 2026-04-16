const express = require('express');
const router = express.Router();
const controller = require('../controllers/systemController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/settings', protect, authorizeRoles('Admin', 'System'), controller.getSystemSettings);
router.patch('/settings/:key', protect, authorizeRoles('Admin'), controller.updateSystemSetting);
router.get('/automation-status', protect, authorizeRoles('Admin', 'System'), controller.getAutomationStatus);

module.exports = router;
