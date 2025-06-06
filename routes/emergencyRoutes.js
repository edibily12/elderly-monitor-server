const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const auth = require('../middleware/auth');
const deviceAuth = require('../middleware/deviceAuth');

// @route   POST api/emergencies
// @desc    Create new emergency alert
// @access  Private (Device)
router.post('/', deviceAuth, emergencyController.handleEmergency);

// @route   GET api/emergencies
// @desc    Get all emergencies
// @access  Private (User/Admin)
router.get('/', auth, emergencyController.getEmergencies);

// @route GET api/emergencies/:id
// @desc Get emergency by ID
// @access Private (User/Admin)
router.get('/:id', auth, emergencyController.getEmergency);

// @route   PUT api/emergencies/:id/status
// @desc    Update emergency status
// @access  Private (User/Admin)
router.put('/:id/status', auth, emergencyController.updateEmergencyStatus);

module.exports = router;