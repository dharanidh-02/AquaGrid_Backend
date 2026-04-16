const asyncHandler = require('express-async-handler');
const Tank = require('../models/Tank');
const TankLogs = require('../models/TankLogs');
const Alert = require('../models/Alert');

const calculateStatus = (level) => {
    if (level < 10) return 'Critical';
    if (level < 20) return 'Low';
    if (level > 95) return 'Overflow';
    return 'Normal';
};

// @desc    Update tank level from IoT device
// @route   POST /api/tank/update
// @access  Public (from ESP32)
const updateTankLevel = asyncHandler(async (req, res) => {
    const { level, tankId: providedTankId } = req.body;

    if (level === undefined || level === null) {
        return res.status(400).json({ message: 'Level is required' });
    }

    // Default to the first tank if no ID provided
    let tank;
    if (providedTankId) {
        tank = await Tank.findById(providedTankId);
    } else {
        tank = await Tank.findOne();
    }

    // Initialize tank if it doesn't exist
    if (!tank) {
        tank = await Tank.create({
            name: 'Primary Facility Tank',
            height: 100,
            currentLevel: level,
            status: calculateStatus(level)
        });
    }

    const previousLevel = tank.currentLevel;
    const previousStatus = tank.status;

    const newStatus = calculateStatus(level);
    
    // Check for sudden drop explicitly (>30% in one go is sketchy)
    const isSuddenDrop = (previousLevel - level) > 30;

    // Update Tank
    tank.currentLevel = level;
    tank.status = newStatus;
    tank.lastUpdated = Date.now();
    await tank.save();

    // Log it
    await TankLogs.create({
        tankId: tank._id,
        level: level,
        timestamp: Date.now()
    });

    // Alert Handling (could be refactored to an event system, but keeping here for simplicity)
    const reqIo = req.app.get('io');
    
    if (reqIo) {
        reqIo.emit('tank:update', {
            tankId: tank._id,
            level: tank.currentLevel,
            status: tank.status,
            lastUpdated: tank.lastUpdated
        });
    }

    if (isSuddenDrop || (newStatus !== 'Normal' && newStatus !== previousStatus)) {
        // find a system/admin identifier or bind alert to tank. For now, since Alert expects meterId, we might need a workaround for "system" alerts.
        // Wait, Alert.js requires meterId. 
        // Let's create an unlinked or dummy alert mechanism, or temporarily adjust Alert schema.
    }

    res.json({ message: 'Tank level updated', currentLevel: level, status: newStatus });
});

// @desc    Get current tank details
// @route   GET /api/tank/current
// @access  Public
const getCurrentLevel = asyncHandler(async (req, res) => {
    let tank = await Tank.findOne();
    if (!tank) {
        tank = await Tank.create({ name: 'Primary Facility Tank', height: 100, currentLevel: 0 });
    }
    res.json(tank);
});

// @desc    Get historical tank logs
// @route   GET /api/tank/history
// @access  Public
const getTankHistory = asyncHandler(async (req, res) => {
    // default to last 24 hours
    const since = req.query.since || new Date(Date.now() - 24 * 60 * 60 * 1000);
    const limit = parseInt(req.query.limit) || 1000;

    const tank = await Tank.findOne();
    if (!tank) {
        return res.json([]);
    }

    const logs = await TankLogs.find({
        tankId: tank._id,
        timestamp: { $gte: new Date(since) }
    })
    .sort({ timestamp: 1 })
    .limit(limit);

    res.json(logs);
});

module.exports = {
    updateTankLevel,
    getCurrentLevel,
    getTankHistory
};
