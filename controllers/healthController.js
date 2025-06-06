const HealthData = require('../models/HealthData');
const Device = require('../models/Device');

// Log health data
exports.logHealthData = async (req, res) => {
    try {
        const device = await Device.findById(req.device.deviceId);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        const { heartRate, spo2, activityLevel, battery, location } = req.body;

        const healthData = new HealthData({
            device: device._id,
            heartRate,
            spo2,
            activityLevel,
            batteryLevel: battery,
            location: location ? {
                type: 'Point',
                coordinates: [location.lng, location.lat]
            } : undefined,
            timestamp: new Date()
        });

        await healthData.save();

        // Update device last active and battery
        device.lastActive = new Date();
        device.batteryLevel = battery;
        await device.save();

        res.status(201).json({ message: 'Health data logged', healthData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get health data
exports.getHealthData = async (req, res) => {
    try {
        let query = { device: req.params.deviceId };

        if (req.query.startDate && req.query.endDate) {
            query.timestamp = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
            };
        }

        const data = await HealthData.find(query).sort({ timestamp: -1 });

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get health summary
exports.getHealthSummary = async (req, res) => {
    try {
        const device = await Device.findById(req.params.deviceId);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Get latest health data
        const latestData = await HealthData.findOne({ device: device._id })
            .sort({ timestamp: -1 });

        // Get averages for last 24 hours
        const dateThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const avgResults = await HealthData.aggregate([
            { $match: { device: device._id, timestamp: { $gte: dateThreshold } } },
            { $group: {
                    _id: null,
                    avgHeartRate: { $avg: "$heartRate" },
                    avgSpO2: { $avg: "$spo2" },
                    minHeartRate: { $min: "$heartRate" },
                    maxHeartRate: { $max: "$heartRate" },
                    minSpO2: { $min: "$spo2" },
                    count: { $sum: 1 }
                }}
        ]);

        const summary = {
            latest: latestData,
            averages: avgResults[0] || null,
            battery: device.batteryLevel
        };

        res.json(summary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};