import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Select from 'react-select';
import { PiEye, PiEyeClosed } from 'react-icons/pi';
import api from '../api';
import { motion } from 'framer-motion';

const selectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: 'rgba(219, 203, 189, 0.2)',
    borderColor: '#87431D',
    borderRadius: '0.375rem',
    color: '#290001',
    boxShadow: 'none',
    fontSize: '1rem',
    height: '3rem',
    minHeight: '3rem',
    '&:hover': {
      borderColor: '#C87941',
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: '#290001',
    fontSize: '1rem sm:1rem',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#87431D',
    fontSize: '1rem sm:1rem',
  }),
  input: (base) => ({
    ...base,
    color: '#290001',
    fontSize: '1rem sm:1rem',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#DBCBBD',
    borderRadius: '0.375rem',
    marginTop: '0.25rem',
    maxHeight: '200px',
    overflowY: 'auto',
    position: 'absolute',
    width: '100%',
    zIndex: 1000,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: '200px',
    overflowY: 'auto',
    padding: '0.25rem',
    '::-webkit-scrollbar': {
      display: 'none',
    },
    '-ms-overflow-style': 'none',
    'scrollbar-width': 'none',
  }),
  option: (base, { isFocused }) => ({
    ...base,
    backgroundColor: isFocused ? '#C87941' : 'transparent',
    color: isFocused ? '#DBCBBD' : '#290001',
    padding: '0.5rem',
    cursor: 'pointer',
    fontSize: '1rem sm:1rem',
    '&:hover': {
      backgroundColor: '#C87941',
      color: '#DBCBBD',
    },
  }),
  dropdownIndicator: () => ({
    display: 'none',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
};

const salutationOptions = [
  { value: "Dr", label: "Dr" },
  { value: "Ms", label: "Ms" },
  { value: "Mr", label: "Mr" },
  { value: "Mrs", label: "Mrs" },
];

const designationOptions = [
  { value: "Professor", label: "Professor" },
  { value: "Associate Professor", label: "Associate Professor" },
  { value: "Assistant Professor", label: "Assistant Professor" },
  { value: "Others", label: "Others" },
];

const departmentOptions = [
  { value: "Apparel and Fashion Design", label: "Apparel and Fashion Design" },
  { value: "Applied Mathematics and Computational Sciences", label: "Applied Mathematics and Computational Sciences" },
  { value: "Applied Science", label: "Applied Science" },
  { value: "Automobile Engineering", label: "Automobile Engineering" },
  { value: "Biomedical Engineering", label: "Biomedical Engineering" },
  { value: "Biotechnology", label: "Biotechnology" },
  { value: "Chemistry", label: "Chemistry" },
  { value: "Civil Engineering", label: "Civil Engineering" },
  { value: "Computer Applications", label: "Computer Applications" },
  { value: "Computer Science and Engineering", label: "Computer Science and Engineering" },
  { value: "Electronics and Communication Engineering", label: "Electronics and Communication Engineering" },
  { value: "Electrical and Electronics Engineering", label: "Electrical and Electronics Engineering" },
  { value: "English", label: "English" },
  { value: "Fashion Technology", label: "Fashion Technology" },
  { value: "Humanities", label: "Humanities" },
  { value: "Information Technology", label: "Information Technology" },
  { value: "Instrumentation and Control Systems Engineering", label: "Instrumentation and Control Systems Engineering" },
  { value: "Library", label: "Library" },
  { value: "Management Sciences", label: "Management Sciences" },
  { value: "Mathematics", label: "Mathematics" },
  { value: "Mechanical Engineering", label: "Mechanical Engineering" },
  { value: "Metallurgical Engineering", label: "Metallurgical Engineering" },
  { value: "Physical Education", label: "Physical Education" },
  { value: "Physics", label: "Physics" },
  { value: "Production Engineering", label: "Production Engineering" },
  { value: "Robotics and Automation Engineering", label: "Robotics and Automation Engineering" },
  { value: "Textile Technology", label: "Textile Technology" },
  { value: "Training", label: "Training" },
];

const RegisterForm = () => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [salutation, setSalutation] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isProcessingDetails, setIsProcessingDetails] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setStep('email');
    setEmail('');
    setOtp('');
    setOtpSent(false);
    setSalutation('');
    setName('');
    setDesignation('');
    setDepartment('');
    setPhoneNumber('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError('');
  }, []);

  useEffect(() => {
    if (error) {
      window.alert(error);
    }
  }, [error]);

  const validateEmail = (email) => {
    // Check email ends with @psgtech.ac.in
    if (!email.endsWith('@psgtech.ac.in')) return false;

    // Split local part and domain
    const [localPart, domain] = email.split('@');

    // Ensure exactly one dot in local part
    if ((localPart.match(/\./g) || []).length !== 1) return false;

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const validatePhoneNumber = (phone_number) => {
    return /^\d{10}$/.test(phone_number);
  };

  const handleEmailAndOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!otpSent) {
      if (!validateEmail(email)) {
        setError('Please provide a valid official faculty email address.');
        return;
      }
      setIsSendingOtp(true); // Start loading for Send OTP
      try {
        await api.post('/auth/send-otp', { email, context: 'register' });
        setOtpSent(true);
        setError('OTP sent successfully. Please check your email.');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to send OTP');
      } finally {
        setIsSendingOtp(false); // Stop loading
      }
    } else {
      setIsVerifyingOtp(true); // Start loading for Verify OTP
      try {
        await api.post('/auth/verify-otp', { email, otp, context: 'register' });
        setStep('details');
      } catch (err) {
        setError(err.response?.data?.error || 'Invalid or expired OTP');
      } finally {
        setIsVerifyingOtp(false); // Stop loading
      }
    }
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!salutation) {
      setError('Please select a salutation');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!designation) {
      setError('Please select a designation');
      return;
    }
    if (!department) {
      setError('Please select a department');
      return;
    }
    if (!validatePhoneNumber(phone_number)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    setIsProcessingDetails(true); // Start loading for Next
    try {
      setStep('password');
    } catch (err) {
      setError('Failed to proceed to password step');
    } finally {
      setIsProcessingDetails(false); // Stop loading
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsRegistering(true); // Start loading for Register
    try {
      const fullName = `${salutation} ${name}`.trim();
      const response = await api.post('/auth/register', { name: fullName, email, dept: department, designation, phone_number, password });
      const { token, email: responseEmail, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('email', responseEmail);
      localStorage.setItem('role', role);
      navigate('/faculty-home');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsRegistering(false); // Stop loading
    }
  };

  return (
    <div className="max-w-md w-full bg-white bg-opacity-90 shadow-xl rounded-2xl p-8 border border-[#C87941]">
      <h2 className="text-3xl font-bold text-center text-[#87431D] mb-4">
        Start Here!
      </h2>
      <div className="flex justify-center mb-6">
        <div className="flex w-full max-w-[16rem] sm:max-w-[20rem] bg-white/30 rounded-full p-1">
          <motion.button
            className={`flex-1 py-1.5 sm:py-2 rounded-full transition-all duration-300 font-semibold text-xs sm:text-sm ${
              location.pathname === '/login' || location.pathname === '/' ? 'bg-[#87431D] text-white' : 'text-[#87431D] hover:text-[#C87941]'
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
              location.pathname === '/register' ? 'bg-[#87431D] text-white' : 'text-[#87431D] hover:text-[#C87941]'
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

      {step === 'email' && (
        <form onSubmit={handleEmailAndOtpSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 rounded-lg border border-[#C87941] focus:outline-none focus:ring-2 focus:ring-[#87431D]"
            required
            disabled={otpSent}
          />
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="OTP"
            className="w-full p-3 rounded-lg border border-[#C87941] focus:outline-none focus:ring-2 focus:ring-[#87431D]"
            required
            disabled={!otpSent}
          />
          <button
            type="submit"
            className={`uppercase w-full bg-[#87431D] text-white py-3 rounded-lg font-semibold hover:bg-[#C87941] transition-colors ${
              (isSendingOtp || isVerifyingOtp) ? 'cursor-not-allowed opacity-50 hover:bg-[#87431D]' : ''
            }`}
            disabled={isSendingOtp || isVerifyingOtp}
          >
            {isSendingOtp ? 'Sending OTP' : isVerifyingOtp ? 'Verifying OTP' : otpSent ? 'Verify OTP' : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 'details' && (
        <form onSubmit={handleDetailsSubmit} className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            <Select
              value={salutationOptions.find((option) => option.value === salutation)}
              onChange={(selected) => setSalutation(selected ? selected.value : '')}
              options={salutationOptions}
              placeholder="Sal."
              styles={selectStyles}
              isClearable={false}
              className="col-span-2"
              required
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="col-span-10 p-3 rounded-lg border border-[#C87941] focus:outline-none focus:ring-2 focus:ring-[#87431D]"
              required
            />
          </div>
          <Select
            value={designationOptions.find((option) => option.value === designation)}
            onChange={(selected) => setDesignation(selected ? selected.value : '')}
            options={designationOptions}
            placeholder="Designation"
            styles={selectStyles}
            isClearable={false}
            required
          />
          <Select
            value={departmentOptions.find((option) => option.value === department)}
            onChange={(selected) => setDepartment(selected ? selected.value : '')}
            options={departmentOptions}
            placeholder="Department"
            styles={selectStyles}
            isClearable={false}
            required
          />
          <input
            type="text"
            value={phone_number}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
            placeholder="Phone Number"
            className="w-full p-3 rounded-lg border border-[#C87941] focus:outline-none focus:ring-2 focus:ring-[#87431D]"
            required
            maxLength={10}
          />
          <button
            type="submit"
            className={`uppercase w-full bg-[#87431D] text-white py-3 rounded-lg font-semibold hover:bg-[#C87941] transition-colors ${
              isProcessingDetails ? 'cursor-not-allowed opacity-50 hover:bg-[#87431D]' : ''
            }`}
            disabled={isProcessingDetails}
          >
            {isProcessingDetails ? 'Processing' : 'Next'}
          </button>
        </form>
      )}


      {step === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 pr-10 rounded-lg border border-[#C87941] focus:outline-none focus:ring-2 focus:ring-[#87431D]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#87431D] hover:text-[#C87941]"
            >
              {showPassword ? <PiEyeClosed size={20} /> : <PiEye size={20} />}
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
              isRegistering ? 'cursor-not-allowed opacity-50 hover:bg-[#87431D]' : ''
            }`}
            disabled={isRegistering}
          >
            {isRegistering ? 'Registering' : 'Register'}
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

export default RegisterForm;