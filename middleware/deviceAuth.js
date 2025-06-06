const jwt = require('jsonwebtoken');
const { verifyToken } = require('../config/auth');
const Device = require('../models/Device');

module.exports = async (req, res, next) => {
    // Get token from the header
    const token = req.header('x-device-token');

    // Check if not token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = verifyToken(token);

        // Check if device still exists
        const device = await Device.findById(decoded.deviceId);
        if (!device) {
            return res.status(401).json({ message: 'Device no longer registered' });
        }

        req.device = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};