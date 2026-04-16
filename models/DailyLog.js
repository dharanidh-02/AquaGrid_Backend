const mongoose = require('mongoose');

// Using MongoDB Time-Series collection option
const dailyLogSchema = mongoose.Schema({
    meterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meter',
        required: true, // This will act as the metaField for time-series grouping
    },
    date: {
        type: Date,
        required: true,
        default: Date.now, // timeField
    },
    usage: {
        type: Number,
        required: true, // e.g., in Gallons or Liters
    }
}, {
    // Enable Mongoose schema options for MongoDB 5.0+ time-series
    timeseries: {
        timeField: 'date',
        metaField: 'meterId',
        granularity: 'hours'
    }
});

const DailyLog = mongoose.model('DailyLog', dailyLogSchema);

module.exports = DailyLog;
