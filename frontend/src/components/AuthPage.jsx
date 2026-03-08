import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import { Link, useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background-image.jpg';
import image from '../assets/imagex.png';
import logo from '../assets/logo.png';

const AuthPage = ({ children }) => {
  const email = null;
  const role = null;
  const [isEntering, setIsEntering] = useState(true);
  const navigate = useNavigate();

  const getHomeRoute = () => {
    switch (role) {
      default:
        return '/';
    }
  };

  const handleLinkClick = (e) => {
    e.preventDefault();
    navigate(getHomeRoute(), { state: { email } });
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsEntering(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="h-screen w-screen flex flex-col bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#290001] text-[#DBCBBD] px-4 py-3 sm:px-6 sm:py-3 flex justify-between items-center shadow-lg shadow-[#C87941]/30">
        <Link
          to={getHomeRoute()}
          onClick={handleLinkClick}
          className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
        >
          <img src={logo} className="h-8 w-auto sm:h-10 md:h-12" />
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-lg md:text-xl font-bold tracking-tight leading-tight">
              PSG COLLEGE OF TECHNOLOGY
            </h1>
            <p className="text-xs sm:text-sm md:text-base font-bold tracking-wide">
              EVENT MANAGEMENT SYSTEM
            </p>
          </div>
        </Link>
      </nav>

      {/* Main Content */}
      <div className="relative flex-grow flex items-center justify-center px-4 sm:px-6 md:px-8 py-8 sm:py-10 overflow-hidden">
        <div className="flex flex-col md:flex-row w-full h-full items-center justify-center relative">
          {/* Left Semi-Pipe Section */}
          <div className="hidden md:flex flex-1 items-center justify-center relative h-full scale-95">
            <motion.div
              initial={{ x: '-100vw' }}
              animate={{ x: isEntering ? '-10%' : '-10%' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute left-0 w-[102vw] border-4 border-[#290001] 
                         rounded-r-full overflow-hidden flex items-center justify-center z-0"
              // Added spacing: leaves visual gap from navbar & footer
              style={{
                top: '1.4rem',       // space below navbar
                bottom: '0.4rem',    // space above footer
              }}
            >
              <img
                src={image}
                className="w-full h-full object-cover rounded-r-full 
                           shadow-[inset_10px_10px_20px_rgba(0,0,0,0.5)]"
              />
            </motion.div>
          </div>

          {/* Right Login/Register Section */}
          <div className="flex-1 flex items-center justify-center z-10 scale-100 sm:scale-75">
            {children}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer className="fixed bottom-0 left-0 w-full z-50 bg-[#290001] text-[#DBCBBD] px-4 py-2 sm:px-6 sm:py-3 shadow-lg shadow-[#C87941]/30 border-t border-[#DBCBBD]/20 text-center text-xs sm:text-sm font-medium" />
    </div>
  );
};

export default AuthPage;
