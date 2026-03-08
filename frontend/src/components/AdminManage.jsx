import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import api from '../api';
import backgroundImage from '../assets/background-image.jpg';
import { PiGridFour, PiPlayCircleBold, PiThumbsUpBold, PiXCircleBold, PiSlidersHorizontal, PiCalendar } from 'react-icons/pi';
import { ImSearch } from 'react-icons/im';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const statusOptions = [
  { label: 'All', value: 'All', icon: PiGridFour },
  { label: 'Pending', value: 'Pending', icon: PiPlayCircleBold },
  { label: 'Approved', value: 'Approved', icon: PiThumbsUpBold },
  { label: 'Rejected', value: 'Rejected', icon: PiXCircleBold },
  { label: 'Cancelled', value: 'Cancelled', icon: PiXCircleBold },
];

const organisedByOptions = [
  { value: 'Department', label: 'Department' },
  { value: 'Club', label: 'Club' },
  { value: 'Association', label: 'Association' },
  { value: 'Student Chapter', label: 'Student Chapter' },
  { value: 'PSG College of Technology', label: 'PSG College of Technology' },
  { value: 'Alumni Association', label: 'Alumni Association' },
  { value: 'PSG Polytechnic', label: 'PSG Polytechnic' },
  { value: 'Students Union', label: 'Students Union' },
];

const eventNatureOptions = [
  { value: 'All', label: 'All' },
  { value: 'International', label: 'International' },
  { value: 'National', label: 'National' },
  { value: 'Intercollegiate', label: 'Intercollegiate' },
  { value: 'Intracollegiate', label: 'Intracollegiate' },
];

const clubs = [
  "AeroModeling Club", "Animal Welfare Club", "Anti Drug Club", "Artificial Intelligence & Robotics",
  "Association of Serious Quizzers", "Astronomy Club", "Book Readers Club", "CAP Nature Club",
  "Cyber Security Club", "Dramatix Club", "English Literary Society", "Entrepreneurs Club",
  "Fine Arts Club", "Finverse Club", "Global Leaders Forum", "Higher Education Forum",
  "Industry Interaction Forum", "Martial Arts Club", "PSG Tech Chronicle Club", "Paathshala Club",
  "Radio Hub", "Rotaract Club", "SPIC-MACAY Heritage Club", "Student Research Council",
  "தமிழ் மன்றம்", "Tech Music", "Women Development Cell", "Youth Outreach Club",
  "Youth Red Cross Society", "Yuva Tourism Club"
].map(name => ({ value: name, label: name }));

const associations = [
  "Aeronautical Association", "American Society of Mechanical Engineers", "Apparel & Fashion Design Association",
  "Applied Science Association", "Automobile Engineering Association", "Biomedical Engineering Association",
  "Biotechnology Association", "Civil Engineering Association", "Computational Sciences Association",
  "Computer Applications Association", "Computer Science & Engineering Association",
  "Electrical & Electronics Engineering Association", "Electronics & Communication Engineering Association",
  "Fashion Technology Association", "Graduate Students Association", "Indian Green Building Council",
  "Indian Institute of Metals", "Indian Institution of Industrial Engineering", "Information Technology Association",
  "Institute of Electrical & Electronics Engineering", "Institution of Engineers",
  "Instrumentation & Control Systems Engineering Association", "International Society of Automation",
  "Management Association", "Mechanical Engineering Association", "Metallurgical Engineering Association",
  "Production Engineering Association", "Ramanujan Association of Mathematics",
  "Robotics & Automation Engineering Association", "Sir C.V. Raman Physics Association",
  "Society of Automotive Engineers", "Society of Manufacturing Engineers", "Solar Energy Society of India",
  "Textile Technology Engineering Association"
].map(name => ({ value: name, label: name }));

const studentChapters = [
  "IEEE EBMS Student Branch", "ISHRAE", "ISTE", "ICI", "The Institute of Electronics & Telecommunication Engineers"
].map(name => ({ value: name, label: name }));

const departments = [
  "Apparel and Fashion Design", "Applied Mathematics and Computational Sciences", "Applied Science",
  "Automobile Engineering", "Biomedical Engineering", "Biotechnology", "Chemistry", "Civil Engineering",
  "Computer Applications", "Computer Science and Engineering", "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering", "English", "Fashion Technology", "Humanities",
  "Information Technology", "Instrumentation and Control Systems Engineering", "Library",
  "Management Sciences", "Mathematics", "Mechanical Engineering", "Metallurgical Engineering",
  "Physical Education", "Physics", "Production Engineering", "Robotics and Automation Engineering",
  "Textile Technology", "Training"
].map(name => ({ value: name, label: name }));

const AdminManage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedOrganisedBy, setSelectedOrganisedBy] = useState('All');
  const [selectedOrganiserName, setSelectedOrganiserName] = useState('All');
  const [selectedEventNature, setSelectedEventNature] = useState('All');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [isSecondSliderOpen, setIsSecondSliderOpen] = useState(false);
  const [showFromDateCalendar, setShowFromDateCalendar] = useState(false);
  const [showToDateCalendar, setShowToDateCalendar] = useState(false);
  const fromCalendarRef = useRef(null);
  const toCalendarRef = useRef(null);
  const navigate = useNavigate();
  const email = localStorage.getItem('email');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events/all');
        setEvents(res.data);
        setFilteredEvents(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch events');
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = events;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        event => event.approval_status.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedOrganisedBy !== 'All') {
      filtered = filtered.filter(
        event => event.organised_by.toLowerCase() === selectedOrganisedBy.toLowerCase()
      );
    }

    if (selectedOrganiserName !== 'All') {
      filtered = filtered.filter(
        event => event.organiser_name.toLowerCase() === selectedOrganiserName.toLowerCase()
      );
    }

    if (selectedEventNature !== 'All') {
      filtered = filtered.filter(
        event => event.event_nature?.toLowerCase() === selectedEventNature.toLowerCase()
      );
    }

    if (fromDate || toDate) {
      filtered = filtered.filter(event => {
        if (!event.start_date) return false;
        const startDate = new Date(event.start_date);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;
        return (
          (!from || startDate >= from) &&
          (!to || startDate <= to)
        );
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(
        event =>
          event.event_id.toString().includes(searchQuery.toLowerCase()) ||
          event.event_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.organiser_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [searchQuery, selectedCategory, selectedOrganisedBy, selectedOrganiserName, selectedEventNature, fromDate, toDate, events]);

  useEffect(() => {
    if (error) {
      window.alert(error);
    }
  }, [error]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromCalendarRef.current && !fromCalendarRef.current.contains(event.target)) {
        setShowFromDateCalendar(false);
      }
      if (toCalendarRef.current && !toCalendarRef.current.contains(event.target)) {
        setShowToDateCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const handleViewDetails = (event_id) => {
    navigate(`/view-event-details/${event_id}`, { state: { email } });
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const toTitleCase = (str) =>
    str
      ? str
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      : '';

  const toggleFilterPanel = () => {
    setIsFilterOpen(!isFilterOpen);
    if (isFilterOpen) {
      setIsSecondSliderOpen(false);
      setSelectedFilter(null);
    }
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    setIsSecondSliderOpen(true);
  };

  const organiserNameOptions = [
    { value: 'All', label: 'All' },
    ...(selectedOrganisedBy === 'Club' ? clubs :
        selectedOrganisedBy === 'Association' ? associations :
        selectedOrganisedBy === 'Department' ? departments :
        selectedOrganisedBy === 'Student Chapter' ? studentChapters : [])
  ];

  const tileDisabled = ({ date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  return (
    <div className="h-screen w-screen flex flex-col font-montserrat bg-[#DBCBBD]/10">
      <style>
        {`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
            overflow-y: scroll;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .date-input-container {
            position: relative;
          }
          .date-input-container input {
            padding-right: 2.5rem;
          }
          .date-input-container input::-webkit-calendar-picker-indicator {
            display: none;
          }
          .react-calendar {
            background-color: #DBCBBD;
            border: 1px solid #290001;
            border-radius: 0.75rem;
            color: #290001;
            width: 240px;
            font-size: 0.8rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          @media (min-width: 640px) {
            .react-calendar {
              width: 280px;
              font-size: 0.9rem;
            }
          }
          .react-calendar__tile--active {
            background: #87431D !important;
            color: #DBCBBD !important;
          }
          .react-calendar__tile--active:enabled:hover,
          .react-calendar__tile--active:enabled:focus {
            background: #C87941 !important;
          }
          .react-calendar__tile {
            color: #290001;
            padding: 0.2rem;
            font-size: 0.8rem;
            height: 32px;
          }
          @media (min-width: 640px) {
            .react-calendar__tile {
              padding: 0.4rem;
              font-size: 0.9rem;
              height: 36px;
            }
          }
          .react-calendar__tile:disabled {
            background-color: #f0f0f0;
            color: #ccc;
          }
          .react-calendar__tile:enabled:hover,
          .react-calendar__tile:enabled:focus {
            background-color: #C87941;
            color: #DBCBBD;
          }
          .react-calendar__navigation button {
            color: #290001;
            font-size: 0.8rem;
            padding: 0.2rem;
          }
          @media (min-width: 640px) {
            .react-calendar__navigation button {
              font-size: 0.9rem;
              padding: 0.4rem;
            }
          }
          .react-calendar__navigation button:enabled:hover,
          .react-calendar__navigation button:enabled:focus {
            background-color: #C87941;
            color: #DBCBBD;
          }
          .react-calendar__month-view__weekdays__weekday {
            font-size: 0.8rem;
            text-transform: uppercase;
            text-align: center;
          }
          @media (min-width: 640px) {
            .react-calendar__month-view__weekdays__weekday {
              font-size: 0.9rem;
            }
          }
          .react-calendar__month-view__weekdays__weekday abbr {
            text-decoration: none;
          }
          .react-calendar__month-view__weekdays__weekday abbr[title] {
            display: none;
          }
        `}
      </style>
      <div style={{ backgroundImage: `url(${backgroundImage})` }} className="fixed inset-0 bg-cover bg-center z-[-1]"></div>
      <div className="fixed inset-0 bg-white/3 backdrop-blur-sm z-[-1]"></div>
      <Navbar handleLogout={handleLogout} email={email} className="h-16 z-50" />
      <div className="flex flex-col flex-grow overflow-hidden pt-20 relative">
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 left-0 h-full w-64 sm:w-80 bg-[#DBCBBD]/80 backdrop-blur-md border-r border-[#87431D]/20 z-50 overflow-y-auto p-4"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-[#290001] mb-4">Filters</h2>
              <div className="space-y-2">
                <button
                  onClick={() => handleFilterSelect('organisedBy')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 ${
                    selectedFilter === 'organisedBy'
                      ? 'bg-[#290001] text-[#DBCBBD]'
                      : 'bg-transparent text-[#290001] hover:bg-[#C87941] hover:text-[#DBCBBD]'
                  }`}
                >
                  Organised By
                </button>
                <button
                  onClick={() => handleFilterSelect('organiserName')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 ${
                    selectedFilter === 'organiserName'
                      ? 'bg-[#290001] text-[#DBCBBD]'
                      : 'bg-transparent text-[#290001] hover:bg-[#C87941] hover:text-[#DBCBBD]'
                  }`}
                >
                  Organiser Name
                </button>
                <button
                  onClick={() => handleFilterSelect('eventNature')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 ${
                    selectedFilter === 'eventNature'
                      ? 'bg-[#290001] text-[#DBCBBD]'
                      : 'bg-transparent text-[#290001] hover:bg-[#C87941] hover:text-[#DBCBBD]'
                  }`}
                >
                  Nature of Event
                </button>
                <button
                  onClick={() => handleFilterSelect('dateRange')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 ${
                    selectedFilter === 'dateRange'
                      ? 'bg-[#290001] text-[#DBCBBD]'
                      : 'bg-transparent text-[#290001] hover:bg-[#C87941] hover:text-[#DBCBBD]'
                  }`}
                >
                  Date Range
                </button>
              </div>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => {
                    setSelectedOrganisedBy('All');
                    setSelectedOrganiserName('All');
                    setSelectedEventNature('All');
                    setFromDate(null);
                    setToDate(null);
                    setSearchQuery('');
                  }}
                  className="w-full py-1.5 rounded-lg bg-[#C87941] text-[#DBCBBD] text-xs sm:text-sm font-medium hover:bg-[#87431D]"
                >
                  Reset Filters
                </button>
                <button
                  onClick={toggleFilterPanel}
                  className="w-full py-1.5 rounded-lg bg-[#C87941] text-[#DBCBBD] text-xs sm:text-sm font-medium hover:bg-[#87431D]"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
          {isSecondSliderOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-200%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 left-64 sm:left-80 h-full w-64 sm:w-80 bg-[#DBCBBD]/80 backdrop-blur-md border-r border-[#87431D]/20 z-50 overflow-y-auto p-4"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-[#290001] mb-4">
                {selectedFilter === 'organisedBy' ? 'Organised By' :
                 selectedFilter === 'organiserName' ? 'Organiser Name' :
                 selectedFilter === 'eventNature' ? 'Nature of Event' : 'Date Range'}
              </h2>
              <div className="space-y-2">
                {selectedFilter === 'organisedBy' && organisedByOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setSelectedOrganisedBy(value);
                      setSelectedOrganiserName('All');
                    }}
                    className={`w-full py-1.5 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 text-center ${
                      selectedOrganisedBy === value
                        ? 'bg-[#290001] text-[#DBCBBD]'
                        : 'bg-[#DBCBBD]/20 text-[#290001] hover:bg-[#C87941] hover:text-[#DBCBBD]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                {selectedFilter === 'organiserName' && organiserNameOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedOrganiserName(value)}
                    className={`w-full py-1.5 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 text-center ${
                      selectedOrganiserName === value
                        ? 'bg-[#290001] text-[#DBCBBD]'
                        : 'bg-[#DBCBBD]/20 text-[#290001] hover:bg-[#C87941] hover:text-[#DBCBBD]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                {selectedFilter === 'eventNature' && eventNatureOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedEventNature(value)}
                    className={`w-full py-1.5 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 text-center ${
                      selectedEventNature === value
                        ? 'bg-[#290001] text-[#DBCBBD]'
                        : 'bg-[#DBCBBD]/20 text-[#290001] hover:bg-[#C87941] hover:text-[#DBCBBD]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                {selectedFilter === 'dateRange' && (
                  <div className="space-y-2">
                    <div className="date-input-container">
                      <label className="block text-[#290001] font-bold mb-1 text-sm sm:text-base">From Date</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={fromDate ? formatDate(fromDate) : ''}
                          placeholder="From Date"
                          readOnly
                          onClick={() => setShowFromDateCalendar(!showFromDateCalendar)}
                          className="bg-[#DBCBBD]/20 p-2 w-full text-[#290001] rounded-lg border border-[#87431D]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C87941] h-8"
                        />
                        <PiCalendar
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#87431D] cursor-pointer"
                          size="1.2em"
                          onClick={() => setShowFromDateCalendar(!showFromDateCalendar)}
                        />
                        {showFromDateCalendar && (
                          <div ref={fromCalendarRef} className="absolute z-10 mt-2">
                            <Calendar
                              onChange={(date) => {
                                setFromDate(date);
                                setShowFromDateCalendar(false);
                              }}
                              value={fromDate}
                              tileDisabled={tileDisabled}
                              maxDate={toDate || new Date()}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="date-input-container">
                      <label className="block text-[#290001] font-bold mb-1 text-sm sm:text-base">To Date</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={toDate ? formatDate(toDate) : ''}
                          placeholder="To Date"
                          readOnly
                          onClick={() => setShowToDateCalendar(!showToDateCalendar)}
                          className="bg-[#DBCBBD]/20 p-2 w-full text-[#290001] rounded-lg border border-[#87431D]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C87941] h-8"
                        />
                        <PiCalendar
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#87431D] cursor-pointer"
                          size="1.2em"
                          onClick={() => setShowToDateCalendar(!showToDateCalendar)}
                        />
                        {showToDateCalendar && (
                          <div ref={toCalendarRef} className="absolute z-10 mt-2">
                            <Calendar
                              onChange={(date) => {
                                setToDate(date);
                                setShowToDateCalendar(false);
                              }}
                              value={toDate}
                              minDate={fromDate}
                              tileDisabled={tileDisabled}
                              maxDate={new Date()}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="bg-[#DBCBBD]/30 backdrop-blur-md border-b border-[#87431D]/20 py-2 px-2 sm:px-3 md:px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                <button
                  onClick={toggleFilterPanel}
                  className={`flex items-center justify-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                    isFilterOpen
                      ? 'bg-[#290001] text-[#DBCBBD]'
                      : 'bg-[#DBCBBD]/20 text-[#290001] hover:bg-[#C87941] hover:text-[#DBCBBD]'
                  }`}
                  style={{ minWidth: '90px' }}
                >
                  <PiSlidersHorizontal className="mr-1 text-sm sm:text-base" />
                  Filter
                </button>
                {statusOptions.map(({ label, value, icon: Icon }) => (
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
              <div className="text-center text-[#290001] bg-red-100/50 p-3 rounded-lg text-xs sm:text-sm"></div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center text-[#290001] bg-[#DBCBBD]/20 p-3 rounded-lg text-xs sm:text-sm"></div>
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
                        <span className="text-right capitalize">{toTitleCase(event.approval_status)}</span>
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
      <Footer className="fixed bottom-0 left-0 w-full bg-[#DBCBBD]/30 backdrop-blur-md py-2 border-t border-[#87431D]/20 text-center text-[#290001] text-xs font-medium" />
    </div>
  );
};

export default AdminManage;