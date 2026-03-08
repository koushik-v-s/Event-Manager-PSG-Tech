import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import api from '../api';
import backgroundImage from '../assets/background-image.jpg';
import { ArrowLeft } from 'lucide-react';
import { FiMail, FiUser, FiBriefcase, FiUsers, FiPhone } from 'react-icons/fi';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem('email');
  const role = localStorage.getItem('role');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await api.get(`/users/profile/${email}`);
        setUser(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch user details');
        console.error('Fetch error:', err);
      }
    };
    if (email) {
      fetchUserDetails();
    } else {
      setError('No email provided');
    }
  }, [email]);

  useEffect(() => {
    if (error) {
      window.alert(error);
    }
  }, [error]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const handleBack = () => {
    navigate(role === 'admin' ? '/admin-home' : '/faculty-home');
  };

  const toTitleCase = (str) => {
    return str
      ? str
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      : '-';
  };

  return (
    <div className="min-h-screen flex flex-col bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <style>
        {`
          footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            z-index: 1000;
          }
        `}
      </style>
      <Navbar handleLogout={handleLogout} email={email} role={role} className="h-16" />
      <div className="flex-grow flex items-center justify-center px-2 sm:px-3 md:px-4 py-4 sm:py-8">
        <div className="w-full max-w-3xl bg-[#DBCBBD]/30 backdrop-blur-lg rounded-xl p-6 sm:p-8 shadow-lg shadow-[#C87941]/30 mt-16 mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#290001] text-center uppercase">Profile</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBack}
                className="bg-[#87431D] text-[#DBCBBD] p-2 rounded-lg hover:bg-[#C87941] transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
          {user ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="relative">
                <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Name</label>
                <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                  <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                  <input
                    type="text"
                    value={(user.name) || '-'}
                    readOnly
                    className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                  />
                </div>
              </div>
              {role === 'faculty' && (
                <>
                  <div className="relative">
                    <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Department</label>
                    <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                      <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                      <input
                        type="text"
                        value={toTitleCase(user.department) || '-'}
                        readOnly
                        className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Designation</label>
                    <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                      <FiBriefcase className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                      <input
                        type="text"
                        value={toTitleCase(user.designation) || '-'}
                        readOnly
                        className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="relative">
                <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Email</label>
                <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                  <FiMail className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                  <input
                    type="text"
                    value={user.email || '-'}
                    readOnly
                    className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                  />
                </div>
              </div>
              {role === 'faculty' && (
                <div className="relative">
                  <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Phone Number</label>
                  <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                    <FiPhone className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                    <input
                      type="text"
                      value={user.phone_number || '-'}
                      readOnly
                      className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-[#290001] text-sm sm:text-base">Loading...</div>
          )}
        </div>
      </div>
      <Footer className="h-16 bg-[#290001] text-[#DBCBBD] py-4" />
    </div>
  );
};

export default Profile;