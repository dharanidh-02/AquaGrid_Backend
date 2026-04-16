const express = require('express');
const Router = express.Router();
const billingController = require('../controllers/billingController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Route to calculate bill estimate
Router.post('/estimate', protect, authorizeRoles('Admin'), billingController.estimateBill);
Router.get('/generate-all', protect, authorizeRoles('Admin'), billingController.generateBillsForAllApartments);
Router.get('/my-summary', protect, authorizeRoles('User'), billingController.getMyBillingSummary);

module.exports = Router;
