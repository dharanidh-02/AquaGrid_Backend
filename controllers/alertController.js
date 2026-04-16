const asyncHandler = require('express-async-handler');
const Alert = require('../models/Alert');

// @desc    Get all alerts (latest first)
// @route   GET /api/alerts
// @access  Public
const getAlerts = asyncHandler(async (req, res) => {
    const query = {};
    if (req.query.status) {
        query.status = req.query.status;
    }
    const alerts = await Alert.find(query)
        .populate({
            path: 'meterId',
            populate: {
                path: 'apartmentId',
                select: 'apartmentNumber residentName block'
            }
        })
        .sort({ detectedAt: -1 });

    res.json(alerts);
});

// @desc    Mark an alert as resolved
// @route   PATCH /api/alerts/:id/resolve
// @access  Public
const resolveAlert = asyncHandler(async (req, res) => {
    const alert = await Alert.findById(req.params.id);

    if (alert) {
        alert.status = req.body.status || 'Resolved';
        const updatedAlert = await alert.save();
        res.json(updatedAlert);
    } else {
        return res.status(404).json({ message: 'Alert not found' });
    }
});

module.exports = {
    getAlerts,
    resolveAlert,
};
