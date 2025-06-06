const admin = require('firebase-admin');
const User = require('../models/User');
const Emergency = require('../models/Emergency');
const twilio = require('twilio');

// Initialize Firebase Admin SDK
// TODO: Add proper Firebase service account key file
// const serviceAccount = require('../path/to/serviceAccountKey.json');
// 
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

// Initialize Twilio
let twilioClient;
if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN && 
    process.env.TWILIO_SID !== 'your_twilio_sid' && 
    process.env.TWILIO_AUTH_TOKEN !== 'your_twilio_auth_token') {
    twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('Twilio client initialized');
} else {
    console.warn('Twilio credentials not configured properly');
}

exports.sendEmergencyNotification = async (user, emergency) => {
    try {
        // Prepare notification payload
        const payload = {
            notification: {
                title: 'Emergency Alert!',
                body: `Fall detected: ${emergency.fallDirection}`,
                sound: 'default'
            },
            data: {
                emergencyId: emergency._id.toString(),
                deviceId: emergency.device._id.toString(),
                latitude: emergency.location.coordinates[1].toString(),
                longitude: emergency.location.coordinates[0].toString(),
                timestamp: emergency.timestamp.toISOString()
            }
        };

        // Send to user's FCM token
        // TODO: Uncomment when Firebase is properly configured
        // if (user.fcmToken) {
        //     await admin.messaging().sendToDevice(user.fcmToken, payload);
        // }

        // Send SMS to a user's phone
        if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
            await twilioClient.messages.create({
                body: `EMERGENCY: Fall detected (${emergency.fallDirection}). Location: https://maps.google.com/?q=${emergency.location.coordinates[1]},${emergency.location.coordinates[0]}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: user.phone
            });
        } else {
            console.warn('Twilio SMS not configured, emergency notification not sent');
        }

        // TODO: Add additional notification logic for other caregivers
    } catch (err) {
        console.error('Notification error:', err);
    }
};

exports.sendHealthAlert = async (user, message) => {
    try {
        // TODO: Uncomment when Firebase is properly configured
        // if (user.fcmToken) {
        //     await admin.messaging().sendToDevice(user.fcmToken, {
        //         notification: {
        //             title: 'Health Alert',
        //             body: message,
        //             sound: 'default'
        //         }
        //     });
        // }
    } catch (err) {
        console.error('Health alert notification error:', err);
    }
};