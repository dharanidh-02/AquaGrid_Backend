const mongoose = require('mongoose');

const alertSchema = mongoose.Schema({
    meterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meter',
        required: false, // Made optional for tank alerts
    },
    tankId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tank'
    },
    message: {
        type: String,
        required: true,
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium',
    },
    status: {
        type: String,
        enum: ['Unresolved', 'Acknowledged', 'Resolved'],
        default: 'Unresolved',
    },
    detectedAt: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
});

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
