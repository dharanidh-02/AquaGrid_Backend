const asyncHandler = require('express-async-handler');
const WaterLog = require('../models/WaterLog');
const Zone = require('../models/Zone');

// @desc    Log daily water usage
// @route   POST /api/water
// @access  Private
const logUsage = asyncHandler(async (req, res) => {
    const { zoneId, date, usage, supply } = req.body;

    const zone = await Zone.findById(zoneId);

    if (!zone) {
        res.status(404);
        throw new Error('Zone not found');
    }

    // specific logic to update zone current level could go here
    // For now, just logging the history

    // Simple leak detection logic (mock)
    // If usage > supply by 10%, flag as leak
    const leakDetected = usage > (supply * 1.1);

    const log = await WaterLog.create({
        zone: zoneId,
        date: date || Date.now(),
        usage,
        supply,
        leakDetected
    });

    // Update zone's current water level roughly based on supply/usage balance
    // This is a simplification
    /* 
    zone.currentLevel = ... 
    await zone.save();
    */

    res.status(201).json(log);
});

// @desc    Get water usage history for a zone
// @route   GET /api/water/:zoneId
// @access  Private
const getZoneHistory = asyncHandler(async (req, res) => {
    const logs = await WaterLog.find({ zone: req.params.zoneId }).sort({ date: 1 });
    res.json(logs);
});

// @desc    Get all water logs (for analytics)
// @route   GET /api/water
// @access  Private/Admin
const getAllLogs = asyncHandler(async (req, res) => {
    const logs = await WaterLog.find({}).populate('zone', 'zoneName');
    res.json(logs);
});

module.exports = {
    logUsage,
    getZoneHistory,
    getAllLogs
};
