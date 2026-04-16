const express = require('express');
const router = express.Router();
const { updateTankLevel, getCurrentLevel, getTankHistory } = require('../controllers/tankController');
const { protect, admin } = require('../middleware/authMiddleware'); // if we need to restrict, but ESP32 usually does naive POST.

// Note: update endpoint might not be authenticated if coming from simple IoT ESP32 curl unless we use API keys. We'll leave it public for the IoT scope, or we could add a basic secret.
router.post('/update', updateTankLevel);
router.get('/current', getCurrentLevel);
router.get('/history', getTankHistory);

module.exports = router;
