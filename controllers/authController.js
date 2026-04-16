const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, password, role, apartmentId, email, dateOfBirth } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ username });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
        username,
        password,
        email: email || '',
        dateOfBirth: dateOfBirth || null,
        role,
        apartmentId: apartmentId || null,
    });

    if (user) {
        return res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            dateOfBirth: user.dateOfBirth,
            role: user.role,
            token: generateToken(user._id),
        });
    }

    return res.status(400).json({ message: 'Invalid user data' });
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Check for user email
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
        return res.json({
            _id: user.id,
            username: user.username,
            role: user.role,
            token: generateToken(user._id),
        });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
});

// @desc    Get user data
// @route   GET /api/auth/profile
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

// @desc    Admin list users
// @route   GET /api/auth/users
// @access  Private/Admin
const listUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json(users);
});

// @desc    Admin update user
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.username !== undefined) user.username = req.body.username;
    if (req.body.role !== undefined) user.role = req.body.role;
    if (req.body.email !== undefined) user.email = req.body.email;
    if (req.body.dateOfBirth !== undefined) user.dateOfBirth = req.body.dateOfBirth || null;
    if (req.body.apartmentId !== undefined) user.apartmentId = req.body.apartmentId || null;
    if (req.body.password) user.password = req.body.password;

    const updated = await user.save();
    return res.json({
        _id: updated.id,
        username: updated.username,
        role: updated.role,
        apartmentId: updated.apartmentId || null,
    });
});

// @desc    Admin delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    if (user.username === 'admin') {
        return res.status(400).json({ message: 'Default admin cannot be deleted' });
    }
    await user.deleteOne();
    return res.json({ message: 'User deleted' });
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    listUsers,
    updateUser,
    deleteUser,
};
