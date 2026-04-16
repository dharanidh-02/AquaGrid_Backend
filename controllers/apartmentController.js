const asyncHandler = require('express-async-handler');
const Apartment = require('../models/Apartment');
const Meter = require('../models/Meter');

const listApartments = asyncHandler(async (req, res) => {
    const apartments = await Apartment.find().sort({ apartmentNumber: 1 });
    return res.json(apartments);
});

const createApartment = asyncHandler(async (req, res) => {
    const apartment = await Apartment.create(req.body);
    return res.status(201).json(apartment);
});

const updateApartment = asyncHandler(async (req, res) => {
    const apartment = await Apartment.findById(req.params.id);
    if (!apartment) {
        return res.status(404).json({ message: 'Apartment not found' });
    }
    Object.assign(apartment, req.body);
    const updated = await apartment.save();
    return res.json(updated);
});

const deleteApartment = asyncHandler(async (req, res) => {
    const apartment = await Apartment.findById(req.params.id);
    if (!apartment) {
        return res.status(404).json({ message: 'Apartment not found' });
    }
    await Meter.deleteMany({ apartmentId: apartment._id });
    await apartment.deleteOne();
    return res.json({ message: 'Apartment deleted' });
});

module.exports = {
    listApartments,
    createApartment,
    updateApartment,
    deleteApartment,
};
