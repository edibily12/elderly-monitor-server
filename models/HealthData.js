const mongoose = require('mongoose');

const HealthDataSchema = new mongoose.Schema({
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    heartRate: {
        type: Number
    },
    spo2: {
        type: Number
    },
    activityLevel: {
        type: Number
    },
    batteryLevel: {
        type: Number
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number]
        }
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    }
});

HealthDataSchema.index({ device: 1, timestamp: -1 });
HealthDataSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('HealthData', HealthDataSchema);