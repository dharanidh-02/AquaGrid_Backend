const express = require('express');
const router = express.Router();
const {
    logUsage,
    getZoneHistory,
    getAllLogs
} = require('../controllers/waterController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, logUsage)
    .get(protect, admin, getAllLogs);

router.route('/:zoneId')
    .get(protect, getZoneHistory);

module.exports = router;
