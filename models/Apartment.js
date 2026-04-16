const mongoose = require('mongoose');

const apartmentSchema = mongoose.Schema({
    apartmentNumber: {
        type: String,
        required: true,
        unique: true,
    },
    residentName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
    },
    block: {
        type: String,
        default: 'A',
    }
}, {
    timestamps: true,
});

const Apartment = mongoose.model('Apartment', apartmentSchema);

module.exports = Apartment;
