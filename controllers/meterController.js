const asyncHandler = require('express-async-handler');
const Meter = require('../models/Meter');

const listMeters = asyncHandler(async (req, res) => {
    const meters = await Meter.find().populate('apartmentId', 'apartmentNumber residentName block');
    return res.json(meters);
});

const createMeter = asyncHandler(async (req, res) => {
    const meter = await Meter.create(req.body);
    return res.status(201).json(meter);
});

const updateMeter = asyncHandler(async (req, res) => {
    const meter = await Meter.findById(req.params.id);
    if (!meter) {
        return res.status(404).json({ message: 'Meter not found' });
    }
    Object.assign(meter, req.body);
    const updated = await meter.save();
    return res.json(updated);
});

const listFaultyMeters = asyncHandler(async (req, res) => {
    const meters = await Meter.find({ status: 'Maintenance' }).populate('apartmentId', 'apartmentNumber residentName block');
    return res.json(meters);
});

const deleteMeter = asyncHandler(async (req, res) => {
    const meter = await Meter.findById(req.params.id);
    if (!meter) {
        return res.status(404).json({ message: 'Meter not found' });
    }
    await meter.deleteOne();
    return res.json({ message: 'Meter deleted' });
});

module.exports = {
    listMeters,
    createMeter,
    updateMeter,
    listFaultyMeters,
    deleteMeter,
};
