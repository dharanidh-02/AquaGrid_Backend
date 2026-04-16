const mongoose = require('mongoose');

const zoneSchema = mongoose.Schema({
    zoneName: { type: String, required: true },
    zoneType: { type: String, required: true, enum: ['Residential', 'Industrial', 'Agricultural'] },
    tankCapacity: { type: Number, required: true },
    population: { type: Number, required: true },
    location: { type: String, required: true },
    currentLevel: { type: Number, default: 0 },
    stressScore: { type: Number, default: 0 },
    lastUpdate: { type: Date, default: Date.now },
}, {
    timestamps: true,
});

const Zone = mongoose.model('Zone', zoneSchema);

module.exports = Zone;
