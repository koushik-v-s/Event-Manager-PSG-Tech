// frontend/src/components/DownloadForm.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const DownloadForm = () => {
  const { id } = useParams();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDownload = async () => {
    try {
      const res = await api.get(`/events/pdf/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      navigate('/faculty-manage');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to download PDF');
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Download Event Request Form</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={handleDownload}
        className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600"
      >
        Download PDF
      </button>
      <button
        onClick={() => navigate('/faculty-manage')}
        className="bg-gray-500 text-white p-2 mt-3 w-full rounded hover:bg-gray-600"
      >
        Back
      </button>
    </div>
  );
};

export default DownloadForm;