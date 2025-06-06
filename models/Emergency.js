const mongoose = require('mongoose');

const EmergencySchema = new mongoose.Schema({
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    fallDirection: {
        type: String,
        enum: ['Rolled', 'Pitched', 'Unknown'],
        required: true
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    heartRate: {
        type: Number
    },
    spo2: {
        type: Number
    },
    batteryLevel: {
        type: Number
    },
    timestamp: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Responded', 'False Alarm'],
        default: 'Pending'
    },
    respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    responseTime: {
        type: Date
    },
    notes: {
        type: String
    }
});

EmergencySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Emergency', EmergencySchema);