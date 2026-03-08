import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import api from '../api';
import backgroundImage from '../assets/background-image.jpg';
import { PiGridFour, PiPlayCircleBold, PiThumbsUpBold, PiXCircleBold } from 'react-icons/pi';
import { ImSearch } from 'react-icons/im';

const FacultyManage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events/my-events');
        setEvents(res.data);
        setFilteredEvents(res.data);
      } catch (err) {
        setError('Failed to fetch events');
        console.error('Fetch error:', err);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (error) {
      window.alert(error);
    }
  }, [error]);

  useEffect(() => {
    let filtered = events;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(event => event.approval_status === selectedCategory.toLowerCase());
    }
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.event_id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.event_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organiser_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredEvents(filtered);
  }, [searchQuery, selectedCategory, events]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const handleViewDetails = (event_id) => {
    navigate(`/view-event-details/${event_id}`, { state: { email } });
  };

  // Format date from yyyy-mm-dd to dd/mm/yyyy using Date object
  const formatDate = (isoDate) => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const toTitleCase = (str) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="h-screen w-screen flex flex-col font-montserrat bg-[#DBCBBD]/10">
      <div style={{ backgroundImage: `url(${backgroundImage})` }} className="fixed inset-0 bg-cover bg-center z-[-1]"></div>
      <div className="fixed inset-0 bg-white/3 backdrop-blur-sm z-[-1]"></div>
      <Navbar handleLogout={handleLogout} email={email} role={role} className="h-16 z-50" />
      <div className="flex flex-col flex-grow overflow-hidden pt-20">
        <div className="bg-[#DBCBBD]/30 backdrop-blur-md border-b border-[#87431D]/20 py-2 px-2 sm:px-3 md:px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                {[
                  { label: 'All', value: 'All', icon: PiGridFour },
                  { label: 'Pending', value: 'Pending', icon: PiPlayCircleBold },
                  { label: 'Approved', value: 'Approved', icon: PiThumbsUpBold },
                  { label: 'Cancelled', value: 'Cancelled', icon: PiXCircleBold },
                ].map(({ label, value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedCategory(value)}
                    className={`flex items-center justify-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                      selectedCategory === value
                        ? 'bg-gradient-to-r from-[#290001] to-[#87431D] text-[#DBCBBD]'
                        : 'bg-[#DBCBBD]/20 text-[#290001] hover:bg-[#C87941] hover:text-[#DBCBBD]'
                    }`}
                    style={{ minWidth: '90px' }}
                  >
                    {Icon && <Icon className="mr-1 text-sm sm:text-base" />}
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-center md:justify-end gap-1 sm:gap-2 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-2 py-1 sm:px-3 sm:py-1.5 h-7 sm:h-8 w-full md:w-64 rounded-lg bg-[#DBCBBD]/20 placeholder-[#290001] text-[#290001] border border-[#87431D]/50 text-xs focus:outline-none focus:ring-2 focus:ring-[#C87941] z-10"
                />
                <ImSearch className="text-[#87431D] h-5 sm:h-6 w-5 sm:w-6" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto px-2 sm:px-3 md:px-4 py-4 sm:py-6 hide-scrollbar" style={{ maxHeight: 'calc(100vh - 120px - 60px - 64px)' }}>
          <div className="max-w-7xl mx-auto">
            {error ? (
              <div className="text-center text-[#290001] bg-red-100/50 p-3 rounded-lg text-xs sm:text-sm">
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center text-[#290001] bg-[#DBCBBD]/20 p-3 rounded-lg text-xs sm:text-sm">
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredEvents.map((event) => (
                  <div
                    key={event.event_id}
                    className="bg-[#DBCBBD]/20 rounded-lg shadow-md shadow-[#C87941]/50 p-2 sm:p-3 flex flex-col justify-between transition-all duration-300 hover:bg-[#C87941] hover:border-[#DBCBBD] hover:scale-100 border border-[#87431D] max-w-full group"
                  >
                    <div className="text-[#290001] group-hover:text-[#DBCBBD] text-xs sm:text-sm transition-colors duration-300">
                      <div className="grid grid-cols-2 gap-x-2 mb-1">
                        <span className="font-semibold truncate">Event ID:</span>
                        <span className="text-right truncate">{event.event_id}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 mb-1">
                        <span className="font-semibold truncate">Title:</span>
                        <span className="text-right truncate">{event.event_title || '-'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 mb-1">
                        <span className="font-semibold truncate">Organiser:</span>
                        <span className="text-right truncate">{event.organiser_name || '-'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 mb-1">
                        <span className="font-semibold">Start Date:</span>
                        <span className="text-right">{formatDate(event.start_date)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 mb-1">
                        <span className="font-semibold">End Date:</span>
                        <span className="text-right">{formatDate(event.end_date)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2">
                        <span className="font-semibold truncate">Status:</span>
                        <span
                          className={`text-right capitalize ${
                            event.approval_status === 'pending' ? 'font-bold' : ''
                          }`}
                        >
                          {toTitleCase(event.approval_status)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(event.event_id)}
                      className="mt-2 px-2 sm:px-3 py-1 bg-[#DBCBBD]/20 text-[#290001] rounded-lg text-xs sm:text-sm font-medium hover:bg-[#87431D] hover:text-[#DBCBBD] group-hover:text-[#DBCBBD] transition-all duration-300"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer className="fixed bottom-0 left-0 w-full bg-[#DBCBBD]/30 backdrop-blur-md py-2 border-t border-[#87431D]/20 text-center text-[#290001] text-xs font-medium z-50" />
    </div>
  );
};

export default FacultyManage;