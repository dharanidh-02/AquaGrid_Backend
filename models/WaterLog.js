const mongoose = require('mongoose');

const waterLogSchema = mongoose.Schema({
    zone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Zone',
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    usage: {
        type: Number,
        required: true, // in Liters
    },
    supply: {
        type: Number,
        required: true, // in Liters
    },
    leakDetected: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const WaterLog = mongoose.model('WaterLog', waterLogSchema);

module.exports = WaterLog;
