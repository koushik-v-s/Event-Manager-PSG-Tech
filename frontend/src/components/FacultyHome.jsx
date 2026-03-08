import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import api from '../api';
import backgroundImage from '../assets/background-image.jpg';
import { PlusCircle, List } from 'lucide-react';

const FacultyHome = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');
  const [userName, setUserName] = useState('User');
  const [error, setError] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    navigate('/login');
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const res = await api.get('/users/username');
        setUserName(res.data.name || 'User');
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      }
    };
    fetchUserName();
  }, []);

  useEffect(() => {
    if (error) {
      window.alert(error);
    }
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <Navbar handleLogout={handleLogout} email={email} role={role} />
      <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-4xl bg-[#DBCBBD]/20 backdrop-blur-md rounded-xl p-8 shadow-lg shadow-[#C87941]/80">
          <h2 className="text-xl sm:text-4xl font-bold text-[#290001] mb-8 text-center">
            Welcome, {userName}!
          </h2>
          {error && <p className="text-red-500 mb-4 text-center"></p>}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              onClick={() => navigate('/request-event')}
              className="relative bg-gradient-to-r from-[#290001] to-[#87431D] text-[#DBCBBD] py-12 px-16 rounded-xl shadow-lg shadow-[#C87941]/50 hover:shadow-[#C87941]/70 hover:scale-105 transition-all duration-300 ease-in-out text-lg font-semibold flex flex-col items-center justify-center"
            >
              <span className="text-2xl sm:text-3xl mb-2">Request Event</span>
              <span className="text-sm sm:text-base opacity-80">Propose New Event</span>
              <PlusCircle className="absolute top-2 right-2 w-8 h-8 text-[#DBCBBD]/80" />
            </button>
            <button
              onClick={() => navigate('/faculty-manage')}
              className="relative bg-gradient-to-r from-[#290001] to-[#87431D] text-[#DBCBBD] py-12 px-16 rounded-xl shadow-lg shadow-[#C87941]/50 hover:shadow-[#C87941]/70 hover:scale-105 transition-all duration-300 ease-in-out text-lg font-semibold flex flex-col items-center justify-center"
            >
              <span className="text-2xl sm:text-3xl mb-2">View Events</span>
              <span className="text-sm sm:text-base opacity-80">Manage Your Events</span>
              <List className="absolute top-2 right-2 w-8 h-8 text-[#DBCBBD]/80" />
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FacultyHome;