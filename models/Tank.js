const mongoose = require('mongoose');

const tankSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: 'Main Reservoir'
    },
    height: {
        type: Number,
        required: true,
        default: 100 // cm
    },
    capacity: {
        type: Number, // optionally in Liters
        default: 10000 
    },
    currentLevel: {
        type: Number,
        required: true,
        default: 0 // percentage 0-100
    },
    status: {
        type: String,
        enum: ['Normal', 'Low', 'Critical', 'Overflow'],
        default: 'Normal'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Tank = mongoose.model('Tank', tankSchema);

module.exports = Tank;
