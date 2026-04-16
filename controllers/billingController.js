const asyncHandler = require('express-async-handler');
const DailyLog = require('../models/DailyLog');
const Meter = require('../models/Meter');
const Apartment = require('../models/Apartment');
const User = require('../models/User');

const DEFAULT_RATE = 0.05;

// @desc    Calculate bill estimate for a specific apartment
// @route   POST /api/billing/estimate
// @access  Public
const estimateBill = asyncHandler(async (req, res) => {
    // Expected body: { apartmentId: "mongoId", ratePerUnit: 0.05, startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD" }
    const { apartmentId, ratePerUnit, startDate, endDate } = req.body;

    if (!apartmentId || !ratePerUnit || !startDate || !endDate) {
        return res.status(400).json({ message: 'Please provide apartmentId, ratePerUnit, startDate, and endDate' });
    }

    // Find meters for this apartment
    const meters = await Meter.find({ apartmentId });
    const meterIds = meters.map(m => m._id);

    // Aggregate usage for these meters within the date range
    const usageData = await DailyLog.aggregate([
        {
            $match: {
                meterId: { $in: meterIds },
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }
        },
        {
            $group: {
                _id: null,
                totalUsage: { $sum: "$usage" }
            }
        }
    ]);

    const totalUsage = usageData.length > 0 ? usageData[0].totalUsage : 0;
    const estimatedCost = totalUsage * ratePerUnit;

    res.json({
        apartmentId,
        period: { startDate, endDate },
        totalUsage,
        ratePerUnit,
        estimatedCost
    });
});

// @desc    Generate bills for all apartments
// @route   GET /api/billing/generate-all
// @access  Private/Admin
const generateBillsForAllApartments = asyncHandler(async (req, res) => {
    const parsedRate = Number(req.query.ratePerUnit);
    const ratePerUnit = Number.isFinite(parsedRate) && parsedRate >= 0 ? parsedRate : DEFAULT_RATE;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const usageByApartment = await DailyLog.aggregate([
        {
            $match: {
                date: {
                    $gte: startDate,
                    $lte: endDate,
                },
            },
        },
        {
            $lookup: {
                from: 'meters',
                localField: 'meterId',
                foreignField: '_id',
                as: 'meterData',
            },
        },
        { $unwind: '$meterData' },
        {
            $group: {
                _id: '$meterData.apartmentId',
                totalUsage: { $sum: '$usage' },
            },
        },
        {
            $project: { _id: 1, totalUsage: 1 },
        }
    ]);

    const usageMap = new Map(usageByApartment.map((row) => [String(row._id), row.totalUsage]));
    const apartments = await Apartment.find().sort({ apartmentNumber: 1 }).select('apartmentNumber residentName');

    const billRows = apartments.map((apartment) => {
        const totalUsage = usageMap.get(String(apartment._id)) || 0;
        return {
            apartmentId: apartment._id,
            apartmentNumber: apartment.apartmentNumber,
            residentName: apartment.residentName,
            totalUsage,
            estimatedCost: totalUsage * ratePerUnit,
        };
    });

    return res.json({
        ratePerUnit,
        period: { startDate, endDate },
        bills: billRows,
    });
});

// @desc    Get billing info for logged-in resident
// @route   GET /api/billing/my-summary
// @access  Private/User
const getMyBillingSummary = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user || !user.apartmentId) {
        return res.status(404).json({ message: 'No apartment is mapped to this user account' });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const meters = await Meter.find({ apartmentId: user.apartmentId });
    const meterIds = meters.map((m) => m._id);

    const usage = await DailyLog.aggregate([
        {
            $match: {
                meterId: { $in: meterIds },
                date: { $gte: startDate, $lte: endDate },
            },
        },
        { $group: { _id: null, totalUsage: { $sum: '$usage' } } },
    ]);

    const totalUsage = usage.length ? usage[0].totalUsage : 0;
    const apartment = await Apartment.findById(user.apartmentId).select('apartmentNumber residentName');
    const estimatedCost = totalUsage * DEFAULT_RATE;

    return res.json({
        apartment,
        period: { startDate, endDate },
        totalUsage,
        ratePerUnit: DEFAULT_RATE,
        estimatedCost,
        paymentHistory: [
            { month: 'Previous Cycle', amount: Math.round(estimatedCost * 0.92), status: 'Paid' },
            { month: 'Current Cycle', amount: Math.round(estimatedCost), status: 'Pending' },
        ],
    });
});

module.exports = {
    estimateBill,
    generateBillsForAllApartments,
    getMyBillingSummary,
};
