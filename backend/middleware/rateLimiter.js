const rateLimit = require('express-rate-limit');

const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit to 5 requests per window
  message: { error: 'Too many OTP requests, please try again later.' },
});

module.exports = { otpRateLimiter };