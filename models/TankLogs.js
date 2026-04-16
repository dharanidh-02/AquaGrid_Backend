const mongoose = require('mongoose');

const tankLogSchema = mongoose.Schema({
    tankId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tank',
        required: true
    },
    level: {
        type: Number, // percentage
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true // indexing for fast time-series queries
    }
}, {
    timestamps: true
});

const TankLogs = mongoose.model('TankLogs', tankLogSchema);

module.exports = TankLogs;
