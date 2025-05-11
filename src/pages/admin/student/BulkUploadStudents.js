import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';

const BulkUploadStudents = () => {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleFileChange = e => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a CSV file first.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8080/api/students/bulk-upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Bulk upload failed');
      }

      toast.success('Students uploaded successfully!');
      setTimeout(() => navigate('/admin/dashboard'), 1200);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <Navbar />
      <br /><br />
      <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Bulk Upload Students</h2>

        <p className="text-gray-600 mb-4">
          Download a sample CSV, fill in rows, then upload here.
        </p>
        <a
          href="/bulk-upload.csv"
          download
          className="text-blue-500 hover:underline mb-6 inline-block"
        >
          Download sample CSV
        </a>

        <form onSubmit={handleSubmit}>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            required
            className="w-full border px-3 py-2 rounded mb-4"
          />

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition"
          >
            Upload
          </button>
        </form>
      </div>
    </>
  );
};

export default BulkUploadStudents;
