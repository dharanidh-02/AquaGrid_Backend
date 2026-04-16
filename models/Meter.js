const mongoose = require('mongoose');

const meterSchema = mongoose.Schema({
    apartmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartment',
        required: true,
    },
    meterType: {
        type: String,
        enum: ['Water', 'Electricity'],
        default: 'Water',
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Maintenance'],
        default: 'Active',
    },
    installationDate: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
});

const Meter = mongoose.model('Meter', meterSchema);

module.exports = Meter;
