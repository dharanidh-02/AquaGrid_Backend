const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    listUsers,
    updateUser,
    deleteUser,
} = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getMe);
router.get('/users', protect, authorizeRoles('Admin'), listUsers);
router.put('/users/:id', protect, authorizeRoles('Admin'), updateUser);
router.delete('/users/:id', protect, authorizeRoles('Admin'), deleteUser);

module.exports = router;
