const Device = require('../models/Device');
const User = require('../models/User');
const HealthData = require('../models/HealthData');
const Emergency = require('../models/Emergency');

// Register new device
exports.registerDevice = async (req, res) => {
    try {
        const { deviceId, macAddress, name } = req.body;
        const owner = req.user.userId;

        // Check if a device already exists
        let device = await Device.findOne({ $or: [{ deviceId }, { macAddress }] });
        if (device) {
            return res.status(400).json({ message: 'Device already registered' });
        }

        // Create a device
        device = new Device({
            deviceId,
            macAddress,
            owner,
            name: name || 'Elderly Monitor'
        });

        await device.save();

        // Add device to user's devices
        await User.findByIdAndUpdate(owner, { $push: { devices: device._id } });

        res.status(201).json(device);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get device info
exports.getDevice = async (req, res) => {
    try {
        const device = await Device.findById(req.params.id).populate('owner');
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Check authorization
        if (device.owner._id.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(device);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update device status
exports.updateDeviceStatus = async (req, res) => {
    try {
        const { batteryLevel } = req.body;

        const device = await Device.findByIdAndUpdate(
            req.params.id,
            { batteryLevel, lastActive: Date.now() },
            { new: true }
        );

        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        res.json(device);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get device health data
exports.getDeviceHealthData = async (req, res) => {
    try {
        const { days = 7, limit = 100 } = req.query;
        const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const data = await HealthData.find({
            device: req.params.id,
            timestamp: { $gte: dateThreshold }
        })
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};