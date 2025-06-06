const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const auth = require('../middleware/auth');
const deviceAuth = require('../middleware/deviceAuth');

// @route POST api/health
// @desc Log health data
// @access Private (Device)
router.post('/', deviceAuth, healthController.logHealthData);

// @route   GET api/health/:deviceId
// @desc    Get health data for device
// @access  Private (User/Admin)
router.get('/:deviceId', auth, healthController.getHealthData);

// @route   GET api/health/:deviceId/summary
// @desc    Get health summary for device
// @access  Private (User/Admin)
router.get('/:deviceId/summary', auth, healthController.getHealthSummary);

module.exports = router;