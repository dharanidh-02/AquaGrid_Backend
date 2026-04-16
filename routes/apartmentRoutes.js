const express = require('express');
const router = express.Router();
const controller = require('../controllers/apartmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', protect, authorizeRoles('Admin', 'Maintenance Staff'), controller.listApartments);
router.post('/', protect, authorizeRoles('Admin'), controller.createApartment);
router.put('/:id', protect, authorizeRoles('Admin'), controller.updateApartment);
router.delete('/:id', protect, authorizeRoles('Admin'), controller.deleteApartment);

module.exports = router;
