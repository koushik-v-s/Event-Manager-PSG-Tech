import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import api from '../api';
import Calendar from 'react-calendar';
import backgroundImage from '../assets/background-image.jpg';
import Select from 'react-select';
import { PlusCircle, MinusCircle, Send } from 'lucide-react';
import { FiFileText, FiUsers, FiUser, FiTag, FiInfo, FiCalendar, FiBriefcase, FiMapPin, FiImage, FiShoppingBag, FiEye } from 'react-icons/fi';

const RequestEvent = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');
  const [eventTitle, setEventTitle] = useState('');
  const [eventNature, setEventNature] = useState('');
  const [organisedBy, setOrganisedBy] = useState('');
  const [organiserName, setOrganiserName] = useState('');
  const [expectedParticipants, setExpectedParticipants] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sponsors, setSponsors] = useState([]);
  const [halls, setHalls] = useState([]);
  const [banners, setBanners] = useState([]);
  const [foodStalls, setFoodStalls] = useState(0);
  const [salesStalls, setSalesStalls] = useState(0);
  const [marketingStalls, setMarketingStalls] = useState(0);
  const [eventDescription, setEventDescription] = useState('');
  const [error, setError] = useState('');
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [bookedDatesWithEvents, setBookedDatesWithEvents] = useState({});
  const startCalendarRef = useRef(null);
  const endCalendarRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format date for display as DD/MM/YYYY
  const formatDate = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format date for submission as YYYY-MM-DD
  const formatDateForSubmission = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // Convert DD/MM/YYYY to YYYY-MM-DD
  const convertToStandardFormat = (dateStr) => {
    if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  };

  // Validate event description word count
  const validateDescription = (text) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length >= 20 && words.length <= 50;
  };

  // Fetch booked dates with event IDs
  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const res = await api.get('/events/booked-dates');
        if (Array.isArray(res.data.bookedDates)) {
          const formattedBookedDates = {};
          res.data.bookedDates.forEach((dateStr) => {
            const standardDate = convertToStandardFormat(dateStr);
            if (standardDate) {
              formattedBookedDates[standardDate] = 'unknown';
            }
          });
          setBookedDatesWithEvents(formattedBookedDates);
        } else {
          setBookedDatesWithEvents(res.data.bookedDates || {});
        }
      } catch (err) {
        console.error('Failed to fetch booked dates:', err);
      }
    };
    fetchBookedDates();
  }, []);

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

  // Close calendars when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startCalendarRef.current && !startCalendarRef.current.contains(event.target)) {
        setShowStartCalendar(false);
      }
      if (endCalendarRef.current && !endCalendarRef.current.contains(event.target)) {
        setShowEndCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSponsor = () => setSponsors([...sponsors, '']);
  const removeSponsor = (index) => setSponsors(sponsors.filter((_, i) => i !== index));
  const updateSponsor = (index, value) => {
    const newSponsors = [...sponsors];
    newSponsors[index] = value;
    setSponsors(newSponsors);
  };

  const addHall = () => setHalls([...halls, '']);
  const removeHall = (index) => setHalls(halls.filter((_, i) => i !== index));
  const updateHall = (index, value) => {
    const newHalls = [...halls];
    newHalls[index] = value;
    setHalls(newHalls);
  };

  const addBanner = () => setBanners([...banners, { size: '', location: '' }]);
  const removeBanner = (index) => setBanners(banners.filter((_, i) => i !== index));
  const updateBannerSize = (index, value) => {
    const newBanners = [...banners];
    newBanners[index].size = value;
    setBanners(newBanners);
  };
  const updateBannerLocation = (index, value) => {
    const newBanners = [...banners];
    newBanners[index].location = value;
    setBanners(newBanners);
  };

  // Convert bookedDatesWithEvents to Date ranges
  const bookedDateRanges = Object.keys(bookedDatesWithEvents).map(dateStr => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  // Disable function for start date calendar
  const tileDisabled = ({ date }) => {
    const day = date.getDay();
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (date < now || (day !== 5 && day !== 6 && day !== 0)) return true;
    return false;
  };

  // Disable function for end date calendar
  const endTileDisabled = ({ date }) => {
    if (!startDate) return true;
    const day = date.getDay();
    const startDay = startDate.getDay();
    const startWeekFriday = new Date(startDate);
    if (startDay !== 5) {
      startWeekFriday.setDate(startDate.getDate() - (startDay - 5));
    }
    const sunday = new Date(startWeekFriday);
    sunday.setDate(startWeekFriday.getDate() + 2);
    if (date < startDate || date > sunday || (day !== 5 && day !== 6 && day !== 0)) return true;
    return bookedDateRanges.some(booked => {
      const nextDay = new Date(booked);
      nextDay.setDate(booked.getDate());
      return date >= booked && date <= nextDay;
    });
  };

  // Add class for booked dates
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    const formattedDate = formatDateForSubmission(date);
    if (bookedDatesWithEvents[formattedDate]) {
      return 'booked-date';
    }
    return '';
  };

  // Render eye icon over booked dates
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const formattedDate = formatDateForSubmission(date);
    const eventId = bookedDatesWithEvents[formattedDate];
    if (!eventId) return null;
    return (
      <div
        className="w-full h-full flex items-center justify-center cursor-pointer booked-date-overlay"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/view-event-details/${eventId}`);
        }}
      >
        <FiEye className="eye-icon w-5 h-5 text-[#290001]" />
      </div>
    );
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    setEndDate(date);
    setShowStartCalendar(false);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    setShowEndCalendar(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!eventTitle || !eventNature || !organisedBy || !category || !startDate || !endDate || !eventDescription || !organiserName || !expectedParticipants) {
      setError('All fields are required');
      return;
    }
    if (parseInt(expectedParticipants) <= 0) {
      setError('Expected number of participants must be a positive number');
      return;
    }
    if (!validateDescription(eventDescription)) {
      setError('Event description must be between 20 and 50 words');
      return;
    }
    if (sponsors.some((s) => !s) || halls.some((h) => !h) || banners.some((b) => !b.size || !b.location)) {
      setError('All added fields must be filled');
      return;
    }
    setIsSubmitting(true);
    const data = {
      event_title: eventTitle,
      event_nature: eventNature,
      organised_by: organisedBy,
      organiser_name: ['Club', 'Association', 'Department', 'Student Chapter'].includes(organisedBy)
        ? organiserName
        : organisedBy,
      expected_participants: parseInt(expectedParticipants),
      category,
      start_date: formatDateForSubmission(startDate),
      end_date: formatDateForSubmission(endDate),
      sponsors: JSON.stringify(sponsors),
      halls_required: JSON.stringify(halls),
      banners: JSON.stringify(banners),
      stalls: JSON.stringify({ food: foodStalls, sales: salesStalls, marketing: marketingStalls }),
      event_description: eventDescription,
    };
    try {
      const res = await api.post('/events/request', data);
      const eventId = res.data.event_id;
      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + 7);
      const dd = String(dueDate.getDate()).padStart(2, '0');
      const mm = String(dueDate.getMonth() + 1).padStart(2, '0');
      const yyyy = dueDate.getFullYear();
      const formattedDueDate = `${dd}/${mm}/${yyyy}`;
      window.alert(`This form must be downloaded and duly got signed and uploaded to the portal within one week of application. (Due Date: ${formattedDueDate})`);
      navigate(`/view-event-details/${eventId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit event');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      fontSize: '1rem',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#87431D',
      fontSize: '1rem',
    }),
    input: (base) => ({
      ...base,
      color: '#290001',
      fontSize: '1rem',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'rgba(219, 203, 189, 0.9)',
      borderRadius: '0.375rem',
      marginTop: '0.25rem',
      maxHeight: '150px',
      position: 'absolute',
      width: '100%',
      zIndex: 1000,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: '150px',
      padding: '0.25rem',
    }),
    option: (base, { isFocused }) => ({
      ...base,
      backgroundColor: isFocused ? '#C87941' : 'transparent',
      color: isFocused ? '#DBCBBD' : '#290001',
      padding: '0.5rem',
      cursor: 'pointer',
      fontSize: '1rem',
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
    { value: 'International', label: 'International' },
    { value: 'National', label: 'National' },
    { value: 'Intercollegiate', label: 'Intercollegiate' },
    { value: 'Intracollegiate', label: 'Intracollegiate' },
  ];

  const categoryOptions = [
    { value: 'Conference', label: 'Conference' },
    { value: 'Symposium', label: 'Symposium' },
    { value: 'Graduation Day', label: 'Graduation Day' },
    { value: 'Alumni Meet', label: 'Alumni Meet' },
  ];

  const clubs = [
    "AeroModeling Club",
    "Animal Welfare Club",
    "Anti Drug Club",
    "Artificial Intelligence & Robotics",
    "Association of Serious Quizzers",
    "Astronomy Club",
    "Book Readers Club",
    "CAP Nature Club",
    "Cyber Security Club",
    "Dramatix Club",
    "English Literary Society",
    "Entrepreneurs Club",
    "Fine Arts Club",
    "Finverse Club",
    "Global Leaders Forum",
    "Higher Education Forum",
    "Industry Interaction Forum",
    "Martial Arts Club",
    "PSG Tech Chronicle Club",
    "Paathshala Club",
    "Radio Hub",
    "Rotaract Club",
    "SPIC-MACAY Heritage Club",
    "Student Research Council",
    "தமிழ் மன்றம்",
    "Tech Music",
    "Women Development Cell",
    "Youth Outreach Club",
    "Youth Red Cross Society",
    "Yuva Tourism Club"
  ].map(name => ({ value: name, label: name }));

  const associations = [
    "Aeronautical Association",
    "American Society of Mechanical Engineers",
    "Apparel & Fashion Design Association",
    "Applied Science Association",
    "Automobile Engineering Association",
    "Biomedical Engineering Association",
    "Biotechnology Association",
    "Civil Engineering Association",
    "Computational Sciences Association",
    "Computer Applications Association",
    "Computer Science & Engineering Association",
    "Electrical & Electronics Engineering Association",
    "Electronics & Communication Engineering Association",
    "Fashion Technology Association",
    "Graduate Students Association",
    "Indian Green Building Council",
    "Indian Institute of Metals",
    "Indian Institution of Industrial Engineering",
    "Information Technology Association",
    "Institute of Electrical & Electronics Engineering",
    "Institution of Engineers",
    "Instrumentation & Control Systems Engineering Association",
    "International Society of Automation",
    "Management Association",
    "Mechanical Engineering Association",
    "Metallurgical Engineering Association",
    "Production Engineering Association",
    "Ramanujan Association of Mathematics",
    "Robotics & Automation Engineering Association",
    "Sir C.V. Raman Physics Association",
    "Society of Automotive Engineers",
    "Society of Manufacturing Engineers",
    "Solar Energy Society of India",
    "Textile Technology Engineering Association"
  ].map(name => ({ value: name, label: name }));

  const studentChapters = [
    "IEEE EBMS Student Branch",
    "ISHRAE",
    "ISTE",
    "ICI",
    "The Institute of Electronics & Telecommunication Engineers"
  ].map(name => ({ value: name, label: name }));

  const departments = [
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

  const organiserNameOptions = organisedBy === 'Club' ? clubs :
                              organisedBy === 'Association' ? associations :
                              organisedBy === 'Department' ? departments :
                              organisedBy === 'Student Chapter' ? studentChapters : [];

  const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  const sponsorRows = chunkArray(sponsors, 2);
  const hallRows = chunkArray(halls, 4);

  const formatShortWeekday = (locale, date) => {
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
  };

  return (
    <div className="min-h-screen flex flex-col bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <style>
        {`
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
            width: 280px;
            font-size: 0.9rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          @media (min-width: 640px) {
            .react-calendar {
              width: 320px;
              font-size: 1rem;
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
            padding: 0.25rem;
            font-size: 0.9rem;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 36px;
          }
          @media (min-width: 640px) {
            .react-calendar__tile {
              padding: 0.5rem;
              font-size: 1rem;
              height: 40px;
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
          .booked-date {
            background-color: #ffffff !important;
            color: #666 !important;
            position: relative;
            cursor: pointer;
          }
          .booked-date-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: transparent;
            z-index: 10;
          }
          .booked-date-overlay:hover {
            background-color: #ffffff;
          }
          .booked-date-overlay:hover .eye-icon {
            display: flex;
          }
          .eye-icon {
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 20;
            align-items: center;
            justify-content: center;
          }
          .booked-date .react-calendar__tile--active,
          .booked-date .react-calendar__tile {
            z-index: 1;
          }
          .booked-date:hover .react-calendar__tile--active,
          .booked-date:hover .react-calendar__tile {
            visibility: hidden;
          }
          .react-calendar__navigation button {
            color: #290001;
            font-size: 0.9rem;
            padding: 0.25rem;
          }
          @media (min-width: 640px) {
            .react-calendar__navigation button {
              font-size: 1rem;
              padding: 0.5rem;
            }
          }
          .react-calendar__navigation button:enabled:hover,
          .react-calendar__navigation button:enabled:focus {
            background-color: #C87941;
            color: #DBCBBD;
          }
          .react-calendar__month-view__weekdays__weekday {
            font-size: 0.9rem;
            text-transform: uppercase;
            text-align: center;
          }
          @media (min-width: 640px) {
            .react-calendar__month-view__weekdays__weekday {
              font-size: 1rem;
            }
          }
          .react-calendar__month-view__weekdays__weekday abbr {
            text-decoration: none;
          }
          .react-calendar__month-view__weekdays__weekday abbr[title] {
            display: none;
          }
          footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            z-index: 1000;
          }
        `}
      </style>
      <Navbar handleLogout={handleLogout} email={email} role={role} className="h-16" />
      <div className="flex-grow flex items-center justify-center px-2 sm:px-4 py-4 sm:py-6">
        <div className="w-full max-w-3xl bg-[#DBCBBD]/30 backdrop-blur-lg rounded-xl p-4 sm:p-6 shadow-lg shadow-[#C87941]/30 mt-12 mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-[#290001] mb-4 text-center uppercase">
            Submit Proposal
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="relative">
              <label className="block text-[#290001] font-bold mb-1 text-sm sm:text-base">Event Title</label>
              <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 hover:border-[#C87941] transition-all duration-300 h-12">
                <FiFileText className="w-5 h-5 text-[#87431D] ml-3 mr-3" />
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Event Title"
                  className="bg-transparent p-3 w-full text-[#290001] focus:outline-none focus:ring-2 focus:ring-[#C87941] focus:ring-offset-2 rounded-lg placeholder-[#87431D] h-12"
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-[#290001] font-bold mb-1 text-sm sm:text-base">Nature of the Event</label>
              <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 hover:border-[#C87941] transition-all duration-300 h-12">
                <FiTag className="w-5 h-5 text-[#87431D] ml-3 mr-3" />
                <Select
                  options={eventNatureOptions}
                  value={eventNature ? eventNatureOptions.find(opt => opt.value === eventNature) : null}
                  onChange={(selected) => setEventNature(selected ? selected.value : '')}
                  placeholder="Nature of Event"
                  styles={selectStyles}
                  className="w-full"
                  isClearable
                  required
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-[#290001] font-bold mb-1 text-sm sm:text-base">About the Event</label>
              <div className="flex items-start border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 hover:border-[#C87941] transition-all duration-300">
                <FiInfo className="w-5 h-5 text-[#87431D] ml-3 mt-3 mr-3" />
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Describe the Event"
                  className="bg-transparent p-3 w-full text-[#290001] focus:outline-none focus:ring-2 focus:ring-[#C87941] focus:ring-offset-2 rounded-lg placeholder-[#87431D] min-h-[40px]"
                  rows="2"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-4">
              <div className="flex-1 relative">
                <label className="block text-[#290001] font-bold mb-1 text-sm sm:text-base">Organised By</label>
                <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 hover:border-[#C87941] transition-all duration-300 h-12">
                  <FiUsers className="w-5 h-5 text-[#87431D] ml-3 mr-3" />
                  <Select
                    options={organisedByOptions}
                    value={organisedBy ? organisedByOptions.find(opt => opt.value === organisedBy) : null}
                    onChange={(selected) => {
                      setOrganisedBy(selected ? selected.value : '');
                      setOrganiserName('');
                    }}
                    placeholder="Organiser"
                    styles={selectStyles}
                    className="w-full"
                    isClearable
                  />
                </div>
              </div>
              <div className="flex-1 relative mt-3 sm:mt-0">
                <label className="block text-[#290001] font-bold mb-1 text-sm sm:text-base">Category</label>
                <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 hover:border-[#C87941] transition-all duration-300 h-12">
                  <FiTag className="w-5 h-5 text-[#87431D] ml-3 mr-3" />
                  <Select
                    options={categoryOptions}
                    value={category ? categoryOptions.find(opt => opt.value === category) : null}
                    onChange={(selected) => setCategory(selected ? selected.value : '')}
                    placeholder="Category"
                    styles={selectStyles}
                    className="w-full"
                    isClearable
                  />
                </div>
              </div>
            </div>
            {['Club', 'Association', 'Department', 'Student Chapter'].includes(organisedBy) && (
              <div className="relative">
                <label className="block text-[#290001] font-bold mb-1 text-sm sm:text-base">Organiser Name</label>
                <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 hover:border-[#C87941] transition-all duration-300 h-12">
                  <FiUser className="w-5 h-5 text-[#87431D] ml-3 mr-3" />
                  <Select
                    options={organiserNameOptions}
                    value={organiserName ? organiserNameOptions.find(opt => opt.value === organiserName) : null}
                    onChange={(selected) => setOrganiserName(selected ? selected.value : '')}
                    placeholder="Organiser Name"
                    styles={selectStyles}
                    className="w-full"
                    isClearable
                    required
                  />
                </div>
              </div>
            )}
            <div className="relative">
              <label className="block text-[#290001] font-bold mb-1 text-sm sm:text-base">Expected Number of Participants</label>
              <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 hover:border-[#C87941] transition-all duration-300 h-12">
                <FiUsers className="w-5 h-5 text-[#87431D] ml-3 mr-3" />
                <input
                  type="number"
                  value={expectedParticipants}
                  onChange={(e) => setExpectedParticipants(e.target.value)}
                  placeholder="Expected Number of Participants"
                  className="bg-transparent p-3 w-full text-[#290001] focus:outline-none focus:ring-2 focus:ring-[#C87941] focus:ring-offset-2 rounded-lg placeholder-[#87431D] h-12 text-sm sm:text-base"
                  min="1"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-4">
              <div className="flex-1 relative date-input-container">
                <label className="block text-[#290001] font-bold mb-1 text-sm sm:text-base">Start Date</label>
                <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 hover:border-[#C87941] transition-all duration-300 h-12">
                  <FiCalendar className="w-5 h-5 text-[#87431D] ml-3 mr-3 cursor-pointer" onClick={() => setShowStartCalendar(!showStartCalendar)} />
                  <input
                    type="text"
                    value={startDate ? formatDate(startDate) : ''}
                    placeholder="Start Date"
                    className="bg-transparent p-3 w-full text-[#290001] focus:outline-none focus:ring-2 focus:ring-[#C87941] focus:ring-offset-2 rounded-lg placeholder-[#87431D] h-12"
                    readOnly
                    onClick={() => setShowStartCalendar(!showStartCalendar)}
                  />
                </div>
                {showStartCalendar && (
                  <div ref={startCalendarRef} className="absolute z-10 mt-2 left-0 sm:left-auto">
                    <Calendar
                      onChange={handleStartDateChange}
                      value={startDate}
                      tileDisabled={tileDisabled}
                      tileContent={tileContent}
                      tileClassName={tileClassName}
                      formatShortWeekday={formatShortWeekday}
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 relative date-input-container mt-3 sm:mt-0">
                <label className="block text-[#290001] font-bold mb-1 text-sm sm:text-base">End Date</label>
                <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 hover:border-[#C87941] transition-all duration-300 h-12">
                  <FiCalendar className="w-5 h-5 text-[#87431D] ml-3 mr-3 cursor-pointer" onClick={() => setShowEndCalendar(!showEndCalendar)} />
                  <input
                    type="text"
                    value={endDate ? formatDate(endDate) : ''}
                    placeholder="End Date"
                    className="bg-transparent p-3 w-full text-[#290001] focus:outline-none focus:ring-2 focus:ring-[#C87941] focus:ring-offset-2 rounded-lg placeholder-[#87431D] h-12"
                    readOnly
                    onClick={() => setShowEndCalendar(!showEndCalendar)}
                  />
                </div>
                {showEndCalendar && (
                  <div ref={endCalendarRef} className="absolute z-10 mt-2 left-0 sm:left-auto">
                    <Calendar
                      onChange={handleEndDateChange}
                      value={endDate}
                      tileDisabled={endTileDisabled}
                      tileContent={tileContent}
                      tileClassName={tileClassName}
                      formatShortWeekday={formatShortWeekday}
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm sm:text-base font-bold text-[#290001]">Sponsors</h3>
                <button
                  type="button"
                  onClick={addSponsor}
                  className="bg-[#87431D] text-[#DBCBBD] p-1.5 rounded-lg hover:bg-[#C87941] hover:scale-110 transition-all duration-300"
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
              </div>
              {sponsorRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex w-full space-x-2 mb-2">
                  {row.map((sponsor, index) => {
                    const globalIndex = rowIndex * 2 + index;
                    return (
                      <div key={globalIndex} className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <div className="flex-1 flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 hover:border-[#C87941] transition-all duration-300 h-12">
                            <FiBriefcase className="w-5 h-5 text-[#87431D] ml-3 mr-3" />
                            <input
                              type="text"
                              value={sponsor}
                              onChange={(e) => updateSponsor(globalIndex, e.target.value)}
                              placeholder="Name"
                              className="bg-transparent p-3 w-full text-[#290001] focus:outline-none focus:ring-2 focus:ring-[#C87941] focus:ring-offset-2 rounded-lg placeholder-[#87431D] h-12"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSponsor(globalIndex)}
                            className="bg-[#C87941] text-[#DBCBBD] p-1.5 ml-2 rounded-lg hover:bg-[#87431D] hover:scale-110 transition-all duration-300"
                          >
                            <MinusCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {row.length < 2 && (
                    <div className="flex-1 min-w-0"></div>
                  )}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm sm:text-base font-bold text-[#290001]">Halls Required (Tentative)</h3>
                <button
                  type="button"
                  onClick={addHall}
                  className="bg-[#87431D] text-[#DBCBBD] p-1.5 rounded-lg hover:bg-[#C87941] hover:scale-110 transition-all duration-300"
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
              </div>
              {hallRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex w-full space-x-2 mb-2">
                  {row.map((hall, index) => {
                    const globalIndex = rowIndex * 4 + index;
                    return (
                      <div key={globalIndex} className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <div className="flex-1 flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 hover:border-[#C87941] transition-all duration-300 h-12">
                            <FiMapPin className="w-5 h-5 text-[#87431D] ml-3 mr-3" />
                            <input
                              type="text"
                              value={hall}
                              onChange={(e) => updateHall(globalIndex, e.target.value)}
                              placeholder="Hall No."
                              className="bg-transparent p-3 w-full text-[#290001] focus:outline-none focus:ring-2 focus:ring-[#C87941] focus:ring-offset-2 rounded-lg placeholder-[#87431D] h-12"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeHall(globalIndex)}
                            className="bg-[#C87941] text-[#DBCBBD] p-1.5 ml-2 rounded-lg hover:bg-[#87431D] hover:scale-110 transition-all duration-300"
                          >
                            <MinusCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {row.length < 4 && Array(4 - row.length).fill().map((_, index) => (
                    <div key={`filler-${index}`} className="flex-1 min-w-0"></div>
                  ))}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm sm:text-base font-bold text-[#290001]">Banners (Tentative)</h3>
                <button
                  type="button"
                  onClick={addBanner}
                  className="bg-[#87431D] text-[#DBCBBD] p-1.5 rounded-lg hover:bg-[#C87941] hover:scale-110 transition-all duration-300"
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
              </div>
              {banners.map((banner, index) => (
                <div key={index} className="flex items-center mb-2 space-x-2">
                  <div className="flex-1 flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 hover:border-[#C87941] transition-all duration-300 h-12">
                    <FiImage className="w-5 h-5 text-[#87431D] ml-3 mr-3" />
                    <input
                      type="text"
                      value={banner.size}
                      onChange={(e) => updateBannerSize(index, e.target.value)}
                      placeholder="Size"
                      className="bg-transparent p-3 w-full text-[#290001] focus:outline-none focus:ring-2 focus:ring-[#C87941] focus:ring-offset-2 rounded-lg placeholder-[#87431D] h-12"
                    />
                  </div>
                  <div className="flex-1 flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 hover:border-[#C87941] transition-all duration-300 h-12">
                    <FiImage className="w-5 h-5 text-[#87431D] ml-3 mr-3" />
                    <input
                      type="text"
                      value={banner.location}
                      onChange={(e) => updateBannerLocation(index, e.target.value)}
                      placeholder="Location"
                      className="bg-transparent p-3 w-full text-[#290001] focus:outline-none focus:ring-2 focus:ring-[#C87941] focus:ring-offset-2 rounded-lg placeholder-[#87431D] h-12"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBanner(index)}
                    className="bg-[#C87941] text-[#DBCBBD] p-1.5 rounded-lg hover:bg-[#87431D] hover:scale-110 transition-all duration-300"
                  >
                    <MinusCircle className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#290001] mb-2">Number of Stalls (Tentative)</h3>
              <div className="flex flex-col sm:flex-row sm:space-x-4">
                <div className="flex-1 mb-3 sm:mb-0">
                  <label className="block text-[#290001] font-bold mb-1 text-sm sm:text-base">Food</label>
                  <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 hover:border-[#C87941] transition-all duration-300 h-12">
                    <FiShoppingBag className="w-5 h-5 text-[#87431D] ml-3 mr-3" />
                    <input
                      type="number"
                      value={foodStalls}
                      onChange={(e) => setFoodStalls(parseInt(e.target.value) || 0)}
                      className="bg-transparent p-3 w-full text-[#290001] focus:outline-none focus:ring-2 focus:ring-[#C87941] focus:ring-offset-2 rounded-lg placeholder:text-sm placeholder-[#87431D] h-12 text-sm sm:text-base"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex-1 mb-3 sm:mb-0">
                  <label className="block text-[#290001] font-bold mb-1 text-sm sm:text-base">Sales</label>
                  <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 hover:border-[#C87941] transition-all duration-300 h-12">
                    <FiTag className="w-5 h-5 text-[#87431D] ml-3 mr-3" />
                    <input
                      type="number"
                      value={salesStalls}
                      onChange={(e) => setSalesStalls(parseInt(e.target.value) || 0)}
                      className="bg-transparent p-3 w-full text-[#290001] focus:outline-none focus:ring-2 focus:ring-[#C87941] focus:ring-offset-2 rounded-lg placeholder:text-sm placeholder-[#87431D] h-12 text-sm sm:text-base"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-[#290001] font-bold mb-1 text-sm sm:text-base">Marketing</label>
                  <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 hover:border-[#C87941] transition-all duration-300 h-12">
                    <FiBriefcase className="w-5 h-5 text-[#87431D] ml-3 mr-3" />
                    <input
                      type="number"
                      value={marketingStalls}
                      onChange={(e) => setMarketingStalls(parseInt(e.target.value) || 0)}
                      className="bg-transparent p-3 w-full text-[#290001] focus:outline-none focus:ring-2 focus:ring-[#C87941] focus:ring-offset-2 rounded-lg placeholder:text-sm placeholder-[#87431D] h-12 text-sm sm:text-base"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="text-[#290001] font-bold mb-4">
              Due Date for Approval Submission: {(() => {
                const today = new Date();
                const dueDate = new Date(today);
                dueDate.setDate(today.getDate() + 7);
                const dd = String(dueDate.getDate()).padStart(2, '0');
                const mm = String(dueDate.getMonth() + 1).padStart(2, '0');
                const yyyy = dueDate.getFullYear();
                return `${dd}/${mm}/${yyyy}`;
              })()}
            </div>
            <button
              type="submit"
              className={`uppercase relative bg-gradient-to-r from-[#290001] to-[#87431D] text-[#DBCBBD] py-3 px-8 rounded-xl shadow-lg shadow-[#C87941]/50 hover:shadow-[#C87941]/70 hover:scale-105 transition-all duration-300 ease-in-out text-base font-bold flex items-center justify-center w-full h-12 ${
                isSubmitting ? 'cursor-not-allowed opacity-50 hover:scale-100' : ''
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting' : 'Submit Proposal'}
              <Send className="w-5 h-5 ml-2" />
            </button>
          </form>
        </div>
      </div>
      <Footer className="h-16 bg-[#290001] text-[#DBCBBD] py-4" />
    </div>
  );
};

export default RequestEvent;