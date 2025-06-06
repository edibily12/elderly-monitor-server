const Emergency = require('../models/Emergency');
const Device = require('../models/Device');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

// Handle emergency alert
exports.handleEmergency = async (req, res) => {
    try {
        const device = await Device.findById(req.device.deviceId);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        const { fallDirection, heartRate, spo2, battery, location } = req.body;

        // Create emergency record
        const emergency = new Emergency({
            device: device._id,
            fallDirection,
            heartRate,
            spo2,
            batteryLevel: battery,
            location: {
                type: 'Point',
                coordinates: [location.lng, location.lat]
            },
            timestamp: new Date()
        });

        await emergency.save();

        // Notify caregivers
        const owner = await User.findById(device.owner).populate('devices');
        await notificationService.sendEmergencyNotification(owner, emergency);

        res.status(201).json({ message: 'Emergency recorded', emergency });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get emergency details
exports.getEmergency = async (req, res) => {
    try {
        const emergency = await Emergency.findById(req.params.id).populate('device respondedBy');
        if (!emergency) {
            return res.status(404).json({ message: 'Emergency not found' });
        }

        // Check authorization
        const device = await Device.findById(emergency.device._id);
        if (device.owner.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(emergency);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update emergency status
exports.updateEmergencyStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;

        const update = {
            status,
            notes,
            responseTime: new Date(),
            respondedBy: req.user.userId
        };

        const emergency = await Emergency.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        ).populate('device respondedBy');

        if (!emergency) {
            return res.status(404).json({ message: 'Emergency not found' });
        }

        res.json(emergency);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get emergencies for device/user
exports.getEmergencies = async (req, res) => {
    try {
        let query = {};

        if (req.query.deviceId) {
            query.device = req.query.deviceId;
        } else if (req.user.role !== 'admin') {
            // For non-admins, only show their devices' emergencies
            const user = await User.findById(req.user.userId).populate('devices');
            query.device = { $in: user.devices.map(d => d._id) };
        }

        if (req.query.status) {
            query.status = req.query.status;
        }

        if (req.query.startDate && req.query.endDate) {
            query.timestamp = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
            };
        }

        const emergencies = await Emergency.find(query)
            .populate('device respondedBy')
            .sort({ timestamp: -1 });

        res.json(emergencies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};