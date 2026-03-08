import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { PiEye, PiEyeClosed } from 'react-icons/pi';
import api from '../api';
import { motion } from 'framer-motion';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState('request'); // 'request' for email/OTP, 'reset' for password
  const [isEmailLocked, setIsEmailLocked] = useState(false);
  const [isOtpEnabled, setIsOtpEnabled] = useState(false);
  const [error, setError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const validateEmail = (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    return normalizedEmail.endsWith('@psgtech.ac.in') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    const normalizedEmail = email.toLowerCase().trim();
    if (!validateEmail(normalizedEmail)) {
      setError('Email must end with @psgtech.ac.in');
      return;
    }
    setIsSendingOtp(true); // Start loading for Send OTP
    try {
      await api.post('/auth/forgot-password', { email: normalizedEmail });
      setEmail(normalizedEmail); // Preserve normalized email
      setIsEmailLocked(true); // Lock email field
      setIsOtpEnabled(true); // Enable OTP field
      setError('OTP sent successfully. Please check your email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
      console.error('Error in handleSendOtp:', err, JSON.stringify(err.response?.data));
    } finally {
      setIsSendingOtp(false); // Stop loading
    }
  };

  useEffect(() => {
    if (error) {
      window.alert(error);
    }
  }, [error]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }
    setIsVerifyingOtp(true); // Start loading for Verify OTP
    try {
      await api.post('/auth/verify-otp', { email, otp, context: 'password-reset' });
      setStep('reset'); // Move to password reset step
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP');
      console.error('Error in handleVerifyOtp:', err, JSON.stringify(err.response?.data));
    } finally {
      setIsVerifyingOtp(false); // Stop loading
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Please enter both passwords');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsResetting(true); // Start loading for Reset Password
    try {
      await api.post('/auth/reset-password', { email, newPassword });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
      console.error('Error in handleReset:', err, JSON.stringify(err.response?.data));
    } finally {
      setIsResetting(false); // Stop loading
    }
  };

  return (
    <div className="max-w-md w-full bg-white bg-opacity-90 shadow-xl rounded-2xl p-8 border border-[#C87941]">
      <h2 className="text-3xl font-bold text-center text-[#87431D] mb-4">
        Forgot Password?
      </h2>
      <div className="flex justify-center mb-6">
        <div className="flex w-full max-w-[16rem] sm:max-w-[20rem] bg-white/30 rounded-full p-1">
          <motion.button
            className={`flex-1 py-1.5 sm:py-2 rounded-full transition-all duration-300 font-semibold text-xs sm:text-sm ${
              location.pathname === '/login' || location.pathname === '/' ? 'bg-[#87431D] text-white opacity-50 cursor-not-allowed' : 'text-[#290001] hover:text-[#C87941]'
            }`}
            whileHover={location.pathname !== '/login' && location.pathname !== '/' ? { scale: 1.05 } : {}}
            whileTap={location.pathname !== '/login' && location.pathname !== '/' ? { scale: 0.95 } : {}}
            onClick={() => location.pathname !== '/login' && location.pathname !== '/' && navigate('/login')}
            disabled={location.pathname === '/login' || location.pathname === '/'}
          >
            LOGIN
          </motion.button>
          <motion.button
            className={`flex-1 py-1.5 sm:py-2 rounded-full transition-all duration-300 font-semibold text-xs sm:text-sm ${
              location.pathname === '/register' ? 'bg-[#87431D] text-white opacity-50 cursor-not-allowed' : 'text-[#290001] hover:text-[#C87941]'
            }`}
            whileHover={location.pathname !== '/register' ? { scale: 1.05 } : {}}
            whileTap={location.pathname !== '/register' ? { scale: 0.95 } : {}}
            onClick={() => location.pathname !== '/register' && navigate('/register')}
            disabled={location.pathname === '/register'}
          >
            REGISTER
          </motion.button>
        </div>
      </div>
      {error && (
        <p className={`text-center mb-4 ${error.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
        </p>
      )}
      {step === 'request' && (
        <form onSubmit={isOtpEnabled ? handleVerifyOtp : handleSendOtp} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 rounded-lg border border-[#C87941] focus:outline-none focus:ring-2 focus:ring-[#87431D]"
              required
              disabled={isEmailLocked}
            />
          </div>
          <div>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="OTP"
              className="w-full p-3 rounded-lg border border-[#C87941] focus:outline-none focus:ring-2 focus:ring-[#87431D]"
              required={isOtpEnabled}
              disabled={!isOtpEnabled}
            />
          </div>
          <button
            type="submit"
            className={`uppercase w-full bg-[#87431D] text-white py-3 rounded-lg font-semibold hover:bg-[#C87941] transition-colors ${
              (isSendingOtp || isVerifyingOtp) ? 'cursor-not-allowed opacity-50 hover:bg-[#87431D]' : ''
            }`}
            disabled={isSendingOtp || isVerifyingOtp}
          >
            {isSendingOtp ? 'Sending OTP' : isVerifyingOtp ? 'Verifying OTP' : isOtpEnabled ? 'VERIFY OTP' : 'SEND OTP'}
          </button>
        </form>
      )}
      {step === 'reset' && (
        <form onSubmit={handleReset} className="space-y-4">
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full p-3 pr-10 rounded-lg border border-[#C87941] focus:outline-none focus:ring-2 focus:ring-[#87431D]"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#87431D] hover:text-[#C87941]"
            >
              {showNewPassword ? <PiEyeClosed size={20} /> : <PiEye size={20} />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full p-3 pr-10 rounded-lg border border-[#C87941] focus:outline-none focus:ring-2 focus:ring-[#87431D]"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#87431D] hover:text-[#C87941]"
            >
              {showConfirmPassword ? <PiEyeClosed size={20} /> : <PiEye size={20} />}
            </button>
          </div>
          <button
            type="submit"
            className={`uppercase w-full bg-[#87431D] text-white py-3 rounded-lg font-semibold hover:bg-[#C87941] transition-colors ${
              isResetting ? 'cursor-not-allowed opacity-50 hover:bg-[#87431D]' : ''
            }`}
            disabled={isResetting}
          >
            {isResetting ? 'Resetting Password' : 'RESET PASSWORD'}
          </button>
        </form>
      )}
      <p className="mt-4 text-right text-[#290001]">
        <Link to="/register" className="uppercase text-whitefont-semibold hover:underline">
          .
        </Link>
      </p>
    </div>
  );
};

export default ForgotPasswordForm;