const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtpHandler, register, login, forgotPassword, resetPassword } = require('../controllers/authController');
const { otpRateLimiter } = require('../middleware/rateLimiter');

router.post('/send-otp', otpRateLimiter, sendOtp);
router.post('/verify-otp', verifyOtpHandler);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', otpRateLimiter, forgotPassword);
router.post('/reset-password', otpRateLimiter, resetPassword);

module.exports = router;
