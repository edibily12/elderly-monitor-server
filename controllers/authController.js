const jwt = require('jsonwebtoken');
const Device = require('../models/Device');
const User = require('../models/User');
const { generateToken, verifyToken, hashPassword, comparePassword } = require('../config/auth');

// Device authentication
exports.authenticateDevice = async (req, res) => {
    try {
        const { deviceID, macAddress } = req.body;

        // Check if a device exists
        const device = await Device.findOne({ deviceId: deviceID, macAddress });
        if (!device) {
            return res.status(404).json({ message: 'Device not registered' });
        }

        // Generate token
        const token = generateToken({ deviceId: device._id, role: 'device' });

        // Update last active
        device.lastActive = Date.now();
        await device.save();

        res.json({ token, deviceId: device._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// User login
exports.loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        // Check if user exists
        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).json({message: 'Invalid credentials'});
        }

        // Check password
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({message: 'Invalid credentials'});
        }

        // Generate token
        const token = generateToken({userId: user._id, role: user.role});

        res.json({token, user: {id: user._id, name: user.name, email: user.email, role: user.role}});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
};

// User registration
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // Check if a user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        user = new User({
            name,
            email,
            password: await hashPassword(password),
            phone,
            role: role || 'family'
        });

        await user.save();

        // Generate token
        const token = generateToken({ userId: user._id, role: user.role });

        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};