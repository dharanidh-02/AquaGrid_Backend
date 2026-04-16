const asyncHandler = require('express-async-handler');
const DailyLog = require('../models/DailyLog');

const getDailyReport = asyncHandler(async (req, res) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    const report = await DailyLog.aggregate([
        { $match: { date: { $gte: startDate } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                totalUsage: { $sum: '$usage' },
                readingsCount: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);
    return res.json(report);
});

const getMonthlyReport = asyncHandler(async (req, res) => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    const report = await DailyLog.aggregate([
        { $match: { date: { $gte: startDate } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
                totalUsage: { $sum: '$usage' },
                readingsCount: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);
    return res.json(report);
});

const getHistoricalConsumption = asyncHandler(async (req, res) => {
    const logs = await DailyLog.find().sort({ date: -1 }).limit(300).populate({
        path: 'meterId',
        populate: { path: 'apartmentId', select: 'apartmentNumber residentName' },
    });
    return res.json(logs);
});

module.exports = {
    getDailyReport,
    getMonthlyReport,
    getHistoricalConsumption,
};
