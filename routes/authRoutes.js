const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { check } = require('express-validator');
const auth = require('../middleware/auth');

// @route   POST api/auth/device
// @desc    Authenticate device
// @access  Public
router.post('/device', [
    check('deviceID', 'Device ID is required').not().isEmpty(),
    check('macAddress', 'MAC address is required').not().isEmpty()
], authController.authenticateDevice);

// @route POST api/auth/login
// @desc Authenticate user & get token
// @access Public
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], authController.loginUser);

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('phone', 'Phone number is required').not().isEmpty()
], authController.registerUser);

module.exports = router;