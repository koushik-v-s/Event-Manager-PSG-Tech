import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import api from '../api';
import backgroundImage from '../assets/background-image.jpg';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { FiDownload, FiHash, FiFileText, FiUsers, FiUser, FiTag, FiInfo, FiCalendar, FiBriefcase, FiMapPin, FiImage, FiShoppingBag, FiMail, FiPhone, FiUpload, FiEye } from 'react-icons/fi';
import Calendar from 'react-calendar';

const ViewEventDetails = () => {
  const { event_id } = useParams();
  const navigate = useNavigate();
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');
  const [event, setEvent] = useState(null);
  const [facultyIncharge, setFacultyIncharge] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [newStartDate, setNewStartDate] = useState(null);
  const [newEndDate, setNewEndDate] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const startCalendarRef = useRef(null);
  const endCalendarRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const res = await api.get(`/events/details/${event_id}`);
        setEvent(res.data);
        setFacultyIncharge(res.data.faculty_incharge);
        setNewStartDate(res.data.start_date ? new Date(res.data.start_date) : null);
        setNewEndDate(res.data.end_date ? new Date(res.data.end_date) : null);
      } catch (err) {
        setError('Failed to fetch event details');
        console.error('Fetch error:', err);
      }
    };
    const fetchBookedDates = async () => {
      try {
        const res = await api.get('/events/booked-dates');
        setBookedDates(Array.isArray(res.data.bookedDates) ? res.data.bookedDates : []);
      } catch (err) {
        console.error('Failed to fetch booked dates:', err);
        setBookedDates([]);
      }
    };
    fetchEventDetails();
    fetchBookedDates();
  }, [event_id]);

  useEffect(() => {
    if (error) {
      window.alert(error);
    }
    if (success) {
      window.alert(success);
    }
  }, [error, success]);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const handleBack = () => {
    const role = localStorage.getItem('role');
    if (role === 'faculty') {
      navigate('/faculty-manage');
    } else if (role === 'admin') {
      navigate('/admin-manage');
    } else {
      navigate('/');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      setSuccess('');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/events/upload-approval/${event_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(res.data.message);
      setError('');
      const updatedRes = await api.get(`/events/details/${event_id}`);
      setEvent(updatedRes.data);
      setFacultyIncharge(updatedRes.data.faculty_incharge);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload approval document');
      setSuccess('');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
    fileInputRef.current.value = '';
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return '-';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '-';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForSubmission = (dateInput) => {
    if (!dateInput) return '';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
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

  const handleDownloadForm = async () => {
    setIsDownloading(true);
    try {
      const response = await api.get(`/events/generate-pdf/${event_id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Event-Approval-Form-${event_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccess('Form downloaded successfully');
      setError('');
    } catch (err) {
      setError('Failed to download approval form');
      setSuccess('');
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCancelEvent = async () => {
    if (window.confirm('Are you sure you want to cancel this event?')) {
      setIsCancelling(true);
      try {
        const res = await api.post(`/events/cancel/${event_id}`);
        setSuccess(res.data.message);
        setError('');
        const updatedRes = await api.get(`/events/details/${event_id}`);
        setEvent(updatedRes.data);
        setFacultyIncharge(updatedRes.data.faculty_incharge);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to cancel event');
        setSuccess('');
        console.error('Cancel error:', err);
      } finally {
        setIsCancelling(false);
      }
    }
  };

  const isStartDateFuture = () => {
    if (!event?.start_date) return false;
    const startDate = new Date(event.start_date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return startDate > currentDate;
  };

  const tileDisabled = ({ date }) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const formattedDate = formatDateForSubmission(date);
    return date < now || bookedDates.includes(formattedDate);
  };

  const endTileDisabled = ({ date }) => {
    if (!newStartDate) return true;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const formattedDate = formatDateForSubmission(date);
    return date < newStartDate || bookedDates.includes(formattedDate);
  };

  const handleStartDateChange = (date) => {
    if (newEndDate && date > newEndDate) {
      setError('Start date cannot be after end date');
      setSuccess('');
      return;
    }
    setNewStartDate(date);
    setShowStartCalendar(false);
  };

  const handleEndDateChange = (date) => {
    if (newStartDate && date < newStartDate) {
      setError('End date cannot be before start date');
      setSuccess('');
      return;
    }
    setNewEndDate(date);
    setShowEndCalendar(false);
  };

  const handleSaveStartDate = async () => {
    if (!newStartDate) {
      setError('Please select a start date');
      setSuccess('');
      return;
    }
    try {
      const res = await api.post(`/events/update-dates/${event_id}`, {
        start_date: formatDateForSubmission(newStartDate),
      });
      setSuccess(res.data.message);
      setError('');
      const updatedRes = await api.get(`/events/details/${event_id}`);
      setEvent(updatedRes.data);
      setFacultyIncharge(updatedRes.data.faculty_incharge);
      setNewStartDate(new Date(updatedRes.data.start_date));
      setNewEndDate(new Date(updatedRes.data.end_date));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update start date');
      setSuccess('');
      console.error('Update start date error:', err);
    }
  };

  const handleSaveEndDate = async () => {
    if (!newEndDate) {
      setError('Please select an end date');
      setSuccess('');
      return;
    }
    try {
      const res = await api.post(`/events/update-dates/${event_id}`, {
        end_date: formatDateForSubmission(newEndDate),
      });
      setSuccess(res.data.message);
      setError('');
      const updatedRes = await api.get(`/events/details/${event_id}`);
      setEvent(updatedRes.data);
      setFacultyIncharge(updatedRes.data.faculty_incharge);
      setNewStartDate(new Date(updatedRes.data.start_date));
      setNewEndDate(new Date(updatedRes.data.end_date));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update end date');
      setSuccess('');
      console.error('Update end date error:', err);
    }
  };

  const getDescriptionRows = (text) => {
    if (!text) return 3;
    const lines = text.split('\n').length;
    return Math.max(3, Math.min(lines + 1, 10));
  };

  const formatShortWeekday = (locale, date) => {
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
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
            width: 300px;
            font-size: 1rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          @media (min-width: 640px) {
            .react-calendar {
              width: 350px;
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
            font-size: 1rem;
          }
          @media (min-width: 640px) {
            .react-calendar__tile {
              padding: 0.5rem;
              font-size: 1rem;
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
            font-size: 1rem;
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
            font-size: 1rem;
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
          .event-description-textarea {
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-wrap: break-word;
            min-height: 0 !important;
            padding: 0.75rem;
          }
        `}
      </style>
      <Navbar handleLogout={handleLogout} email={email} role={role} className="h-16" />
      <div className="flex-grow flex items-center justify-center px-2 sm:px-3 md:px-4 py-4 sm:py-8">
        <div className="w-full max-w-3xl bg-[#DBCBBD]/30 backdrop-blur-lg rounded-xl p-6 sm:p-8 shadow-lg shadow-[#C87941]/30 mt-16 mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#290001] text-center uppercase flex-1"></h2>
            <div className="flex items-center space-x-2">
              {role === 'faculty' && email === facultyIncharge?.email && (
                <button
                  onClick={handleDownloadForm}
                  className={`bg-[#87431D] text-[#DBCBBD] p-2 rounded-lg hover:bg-[#C87941] transition-all duration-300 flex items-center space-x-1 ${
                    isDownloading ? 'cursor-not-allowed opacity-50 hover:bg-[#87431D]' : ''
                  }`}
                  disabled={isDownloading}
                >
                  <FiDownload className="w-5 h-5" />
                  <span className="text-sm sm:text-base">{isDownloading ? 'Downloading' : 'Download'}</span>
                </button>
              )}
              {role === 'admin' && event?.approval_status !== 'cancelled' && isStartDateFuture() && (
                <button
                  onClick={handleCancelEvent}
                  className={`bg-[#87431D] text-[#DBCBBD] p-2 rounded-lg hover:bg-[#C87941] transition-all duration-300 flex items-center space-x-1 ${
                    isCancelling ? 'cursor-not-allowed opacity-50 hover:bg-[#87431D]' : ''
                  }`}
                  disabled={isCancelling}
                >
                  <XCircle className="w-5 h-5" />
                  <span className="text-sm sm:text-base">{isCancelling ? 'Cancelling' : 'Cancel'}</span>
                </button>
              )}
              {event?.approval_document_url ? (
                <a
                  href={event.approval_document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#87431D] text-[#DBCBBD] p-2 rounded-lg hover:bg-[#C87941] transition-all duration-300 flex items-center space-x-1"
                >
                  <FiEye className="w-5 h-5" />
                  <span className="text-sm sm:text-base">View</span>
                </a>
              ) : (
                role === 'faculty' && email === facultyIncharge?.email && event?.approval_status === 'pending' && (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      onClick={handleUploadClick}
                      className={`bg-[#87431D] text-[#DBCBBD] p-2 rounded-lg hover:bg-[#C87941] transition-all duration-300 flex items-center space-x-1 ${
                        isUploading ? 'cursor-not-allowed opacity-50 hover:bg-[#87431D]' : ''
                      }`}
                      disabled={isUploading}
                    >
                      <FiUpload className="w-5 h-5" />
                      <span className="text-sm sm:text-base">{isUploading ? 'Uploading' : 'Upload'}</span>
                    </button>
                  </>
                )
              )}
              <button
                onClick={handleBack}
                className="bg-[#87431D] text-[#DBCBBD] p-2 rounded-lg hover:bg-[#C87941] transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
          {event ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="relative">
                <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Event ID</label>
                <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                  <FiHash className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                  <input
                    type="text"
                    value={event.event_id}
                    readOnly
                    className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Title</label>
                <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                  <FiFileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                  <input
                    type="text"
                    value={event.event_title || '-'}
                    readOnly
                    className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Nature of the Event</label>
                <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                  <FiTag className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                  <input
                    type="text"
                    value={toTitleCase(event.event_nature) || '-'}
                    readOnly
                    className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-4">
                <div className="flex-1 relative">
                  <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Organised by</label>
                  <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                    <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                    <input
                      type="text"
                      value={toTitleCase(event.organised_by) || '-'}
                      readOnly
                      className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div className="flex-1 relative mt-4 sm:mt-0">
                  <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Organiser</label>
                  <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                    <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                    <input
                      type="text"
                      value={event.organiser_name || '-'}
                      readOnly
                      className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
              <div className="relative">
                <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Expected Number of Participants</label>
                <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                  <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                  <input
                    type="text"
                    value={event.expected_participants || '-'}
                    readOnly
                    className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Category</label>
                <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                  <FiTag className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                  <input
                    type="text"
                    value={toTitleCase(event.category) || '-'}
                    readOnly
                    className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-4">
                <div className="flex-1 relative date-input-container">
                  <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Start Date</label>
                  <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                    {role === 'admin' && ['pending', 'approved'].includes(event.approval_status) && (
                      newStartDate && formatDateForSubmission(newStartDate) !== formatDateForSubmission(event.start_date) ? (
                        <CheckCircle
                          className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3 cursor-pointer"
                          onClick={handleSaveStartDate}
                        />
                      ) : (
                        <FiCalendar
                          className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3 cursor-pointer"
                          onClick={() => setShowStartCalendar(!showStartCalendar)}
                        />
                      )
                    )}
                    <input
                      type="text"
                      value={formatDate(newStartDate || event.start_date)}
                      readOnly
                      className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                    />
                  </div>
                  {showStartCalendar && (
                    <div ref={startCalendarRef} className="absolute z-10 mt-2 left-0 sm:left-auto">
                      <Calendar
                        onChange={handleStartDateChange}
                        value={newStartDate}
                        tileDisabled={tileDisabled}
                        formatShortWeekday={formatShortWeekday}
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 relative date-input-container mt-4 sm:mt-0">
                  <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">End Date</label>
                  <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                    {role === 'admin' && ['pending', 'approved'].includes(event.approval_status) && (
                      newEndDate && formatDateForSubmission(newEndDate) !== formatDateForSubmission(event.end_date) ? (
                        <CheckCircle
                          className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3 cursor-pointer"
                          onClick={handleSaveEndDate}
                        />
                      ) : (
                        <FiCalendar
                          className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3 cursor-pointer"
                          onClick={() => setShowEndCalendar(!showEndCalendar)}
                        />
                      )
                    )}
                    <input
                      type="text"
                      value={formatDate(newEndDate || event.end_date)}
                      readOnly
                      className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                    />
                  </div>
                  {showEndCalendar && (
                    <div ref={endCalendarRef} className="absolute z-10 mt-2 left-0 sm:left-auto">
                      <Calendar
                        onChange={handleEndDateChange}
                        value={newEndDate}
                        tileDisabled={endTileDisabled}
                        formatShortWeekday={formatShortWeekday}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Sponsors</label>
                {Array.isArray(event.sponsors) && event.sponsors.length > 0 ? (
                  event.sponsors.map((sponsor, index) => (
                    <div key={index} className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12 mb-2">
                      <FiBriefcase className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                      <input
                        type="text"
                        value={sponsor || '-'}
                        readOnly
                        className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-[#290001] text-sm sm:text-base"></div>
                )}
              </div>
              <div>
                <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Halls Required</label>
                {Array.isArray(event.halls_required) && event.halls_required.length > 0 ? (
                  event.halls_required.map((hall, index) => (
                    <div key={index} className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12 mb-2">
                      <FiMapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                      <input
                        type="text"
                        value={hall || '-'}
                        readOnly
                        className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-[#290001] text-sm sm:text-base"></div>
                )}
              </div>
              <div>
                <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Banners</label>
                {Array.isArray(event.banners) && event.banners.length > 0 ? (
                  event.banners.map((banner, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:space-x-2 mb-2">
                      <div className="flex-1 flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                        <FiImage className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                        <input
                          type="text"
                          value={banner.size || '-'}
                          readOnly
                          className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                        />
                      </div>
                      <div className="flex-1 flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12 mt-2 sm:mt-0">
                        <FiImage className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                        <input
                          type="text"
                          value={banner.location || '-'}
                          readOnly
                          className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[#290001] text-sm sm:text-base"></div>
                )}
              </div>
              <div>
                <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Stalls</label>
                <div className="flex flex-col sm:flex-row sm:space-x-4">
                  <div className="flex-1 mb-3 sm:mb-0">
                    <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-base">Food</label>
                    <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                      <FiShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                      <input
                        type="text"
                        value={event.stalls && event.stalls.food !== undefined ? event.stalls.food : 0}
                        readOnly
                        className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="flex-1 mb-3 sm:mb-0">
                    <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-base">Sales</label>
                    <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                      <FiTag className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                      <input
                        type="text"
                        value={event.stalls && event.stalls.sales !== undefined ? event.stalls.sales : 0}
                        readOnly
                        className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-base">Marketing</label>
                    <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                      <FiBriefcase className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                      <input
                        type="text"
                        value={event.stalls && event.stalls.marketing !== undefined ? event.stalls.marketing : 0}
                        readOnly
                        className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Status</label>
                <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                  {event.approval_status === 'pending' ? (
                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 ml-3 mr-3 text-[#87431D]" />
                  ) : (
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 ml-3 mr-3 text-[#87431D]" />
                  )}
                  <input
                    type="text"
                    value={toTitleCase(event.approval_status)}
                    readOnly
                    className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Date of Submission</label>
                <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                  <FiCalendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                  <input
                    type="text"
                    value={formatDate(event.created_at)}
                    readOnly
                    className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                  />
                </div>
              </div>
              {event.approval_status === 'pending' && (
                <div className="relative">
                  <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">Date of Expiry</label>
                  <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                    <FiCalendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                    <input
                      type="text"
                      value={formatDate(event.expires_at)}
                      readOnly
                      className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                    />
                  </div>
                </div>
              )}
              <div className="relative">
                <label className="block text-[#290001] font-bold mb-2 text-sm sm:text-lg">About the Event</label>
                <div className="flex items-start border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300">
                  <FiInfo className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mt-3 mr-3 flex-shrink-0" />
                  <textarea
                    value={event.event_description || ''}
                    readOnly
                    rows={getDescriptionRows(event.event_description)}
                    className="event-description-textarea bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base focus:outline-none resize-none min-h-0"
                  />
                </div>
              </div>
              {facultyIncharge && (
                <div>
                  <h3 className="text-sm sm:text-lg font-bold text-[#290001] mb-2">Faculty Incharge</h3>
                  <div className="space-y-2">
                    <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                      <FiMail className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                      <input
                        type="text"
                        value={facultyIncharge.email || '-'}
                        readOnly
                        className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                      />
                    </div>
                    <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                      <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                      <input
                        type="text"
                        value={facultyIncharge.name || '-'}
                        readOnly
                        className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                      />
                    </div>
                    <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                      <FiBriefcase className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                      <input
                        type="text"
                        value={facultyIncharge.designation || '-'}
                        readOnly
                        className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                      />
                    </div>
                    <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                      <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                      <input
                        type="text"
                        value={facultyIncharge.department || '-'}
                        readOnly
                        className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                      />
                    </div>
                    <div className="flex items-center border border-[#87431D] bg-[#DBCBBD]/10 rounded-lg shadow-sm shadow-[#C87941]/30 transition-all duration-300 h-12">
                      <FiPhone className="w-5 h-5 sm:w-6 sm:h-6 text-[#87431D] ml-3 mr-3" />
                      <input
                        type="text"
                        value={facultyIncharge.phone_number || '-'}
                        readOnly
                        className="bg-transparent p-3 w-full text-[#290001] rounded-lg text-sm sm:text-base"
                      />
                    </div>
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

export default ViewEventDetails;