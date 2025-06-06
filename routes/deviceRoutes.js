const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const auth = require('../middleware/auth');
const deviceAuth = require('../middleware/deviceAuth');

// @route   POST api/devices
// @desc    Register a new device
// @access  Private (User)
router.post('/', auth, deviceController.registerDevice);

// @route   GET api/devices/:id
// @desc    Get device by ID
// @access  Private (User/Admin)
router.get('/:id', auth, deviceController.getDevice);

// @route   PUT api/devices/:id/status
// @desc    Update device status
// @access  Private (Device)
router.put('/:id/status', deviceAuth, deviceController.updateDeviceStatus);

// @route   GET api/devices/:id/health
// @desc    Get device health data
// @access  Private (User/Admin)
router.get('/:id/health', auth, deviceController.getDeviceHealthData);

module.exports = router;