const asyncHandler = require('express-async-handler');
const DailyLog = require('../models/DailyLog');
const Apartment = require('../models/Apartment');
const Meter = require('../models/Meter');

// @desc    Get usage trends (daily/weekly/monthly)
// @route   GET /api/dashboard/usage
// @access  Public (should be private in prod)
const getUsageTrends = asyncHandler(async (req, res) => {
    const { period } = req.query; // 'weekly', 'monthly', defaults to daily (last 7 days grouped by day)
    
    // Default: Last 7 days
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    if (period === 'monthly') {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    } // weekly can map to last 7 days as default

    // Aggregate daily logs by date
    const usageData = await DailyLog.aggregate([
        {
            $match: { date: { $gte: startDate } }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                totalUsage: { $sum: "$usage" }
            }
        },
        {
            $sort: { _id: 1 } // Sort chronologically
        }
    ]);

    res.json(usageData.map(data => ({
        date: data._id,
        totalUsage: data.totalUsage
    })));
});

// @desc    Get total consumption per apartment
// @route   GET /api/dashboard/apartments
// @access  Public
const getApartmentConsumption = asyncHandler(async (req, res) => {
    // We join Apartment -> Meter -> DailyLog
    // For simplicity, let's just aggregate Meter daily logs
    // and populate apartment details
    
    const consumption = await DailyLog.aggregate([
        {
            $group: {
                _id: "$meterId",
                totalUsage: { $sum: "$usage" }
            }
        },
        {
            $lookup: {
                from: "meters", // Name of the Meter collection in MongoDB
                localField: "_id",
                foreignField: "_id",
                as: "meterData"
            }
        },
        { $unwind: "$meterData" },
        {
            $lookup: {
                from: "apartments", // Name of Apartment collection
                localField: "meterData.apartmentId",
                foreignField: "_id",
                as: "apartmentData"
            }
        },
        { $unwind: "$apartmentData" },
        {
            $project: {
                _id: 0,
                apartmentNumber: "$apartmentData.apartmentNumber",
                residentName: "$apartmentData.residentName",
                totalUsage: 1,
                meterId: "$_id"
            }
        },
        { $sort: { totalUsage: -1 } }
    ]);

    res.json(consumption);
});

module.exports = {
    getUsageTrends,
    getApartmentConsumption,
};
