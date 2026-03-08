import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { PiEye, PiEyeClosed } from 'react-icons/pi';
import api from '../api';
import { motion } from 'framer-motion';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true); // Start loading
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('email', res.data.email);
      navigate(res.data.role === 'admin' ? '/admin-home' : '/faculty-home');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoggingIn(false); // Stop loading
    }
  };

  useEffect(() => {
    if (error) {
      window.alert(error);
    }
  }, [error]);

  return (
    <div className="max-w-md w-full bg-white bg-opacity-90 shadow-xl rounded-2xl p-8 border border-[#87431D]">
      <h2 className="text-3xl font-bold text-center text-[#87431D] mb-4">
        Step In!
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
              location.pathname === '/register' ? 'bg-[#87431D] text-white' : 'text-[#87431D] hover:text-[#87431D]'
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
      {error && <p className="text-red-500 text-center mb-4"></p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 rounded-lg border border-[#C87941] focus:outline-none focus:ring-2 focus:ring-[#87431D]"
          required
        />
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
        <button
        type="submit"
        className={`w-full bg-[#87431D] text-white py-3 rounded-lg font-semibold hover:bg-[#C87941] transition-colors ${
          isLoggingIn ? 'cursor-not-allowed opacity-50 hover:bg-[#87431D]' : ''
        }`}
        disabled={isLoggingIn}
      >
        {isLoggingIn ? 'LOGING IN' : 'LOGIN'}
      </button>
      </form>
      <p className="mt-4 text-right text-[#290001]">
        <Link to="/forgot-password" className="text-[#87431D] font-semibold hover:underline">
          Forgot Password?
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
