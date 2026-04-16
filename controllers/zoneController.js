const Zone = require('../models/Zone');

// @desc    Get all zones
// @route   GET /api/zones
// @access  Private
const getZones = async (req, res) => {
    const zones = await Zone.find({});
    res.json(zones);
};

// @desc    Get zone by ID
// @route   GET /api/zones/:id
// @access  Private
const getZoneById = async (req, res) => {
    const zone = await Zone.findById(req.params.id);
    if (zone) {
        res.json(zone);
    } else {
        res.status(404).json({ message: 'Zone not found' });
    }
};

// @desc    Create a zone
// @route   POST /api/zones
// @access  Private/Admin
const createZone = async (req, res) => {
    const { zoneName, zoneType, tankCapacity, population, location } = req.body;

    const zone = new Zone({
        zoneName,
        zoneType,
        tankCapacity,
        population,
        location,
    });

    const createdZone = await zone.save();
    res.status(201).json(createdZone);
};

// @desc    Update zone
// @route   PUT /api/zones/:id
// @access  Private/Manager
const updateZone = async (req, res) => {
    const { zoneName, zoneType, tankCapacity, population, location, currentLevel } = req.body;

    const zone = await Zone.findById(req.params.id);

    if (zone) {
        zone.zoneName = zoneName || zone.zoneName;
        zone.zoneType = zoneType || zone.zoneType;
        zone.tankCapacity = tankCapacity || zone.tankCapacity;
        zone.population = population || zone.population;
        zone.location = location || zone.location;
        zone.currentLevel = currentLevel !== undefined ? currentLevel : zone.currentLevel;

        const updatedZone = await zone.save();
        res.json(updatedZone);
    } else {
        res.status(404).json({ message: 'Zone not found' });
    }
};

// @desc    Delete zone
// @route   DELETE /api/zones/:id
// @access  Private/Admin
const deleteZone = async (req, res) => {
    const zone = await Zone.findById(req.params.id);

    if (zone) {
        await zone.deleteOne();
        res.json({ message: 'Zone removed' });
    } else {
        res.status(404).json({ message: 'Zone not found' });
    }
};

module.exports = { getZones, getZoneById, createZone, updateZone, deleteZone };
