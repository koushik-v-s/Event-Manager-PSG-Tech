const otpStore = new Map();

const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

const storeOtp = (email, context, otp) => {
  const normalizedEmail = email.toLowerCase().trim();
  const key = `${normalizedEmail}:${context}`;
  const expiry = Date.now() + 10 * 60 * 1000; // 15 minutes
  otpStore.set(key, { otp, expiry });
};

const verifyOtp = (email, context, userOtp) => {
  const normalizedEmail = email.toLowerCase().trim();
  const key = `${normalizedEmail}:${context}`;
  const stored = otpStore.get(key);
  if (!stored) {
    return { valid: false, error: 'OTP not found or expired' };
  }
  if (stored.otp !== userOtp || Date.now() > stored.expiry) {
    otpStore.delete(key);
    return { valid: false, error: 'Invalid or expired OTP' };
  }
  otpStore.delete(key); // Delete OTP after successful verification
  return { valid: true };
};

module.exports = { generateOtp, storeOtp, verifyOtp };