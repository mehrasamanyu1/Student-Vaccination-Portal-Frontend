import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { toast } from 'react-toastify';

const CreateDrive = () => {
  const [vaccineName, setVaccineName] = useState('');
  const [driveDate, setDriveDate] = useState('');
  const [availableDoses, setAvailableDoses] = useState('');
  const [applicableClasses, setApplicableClasses] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      vaccineName,
      driveDate,
      availableDoses: parseInt(availableDoses),
      applicableClasses: applicableClasses.split(',').map(cls => cls.trim().toUpperCase()),
    };

    try {
      const response = await fetch('http://localhost:8080/api/vaccination/drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const message = await response.text();

      if (!response.ok) {
        setError(`Creation failed: ${message}`);
        setSuccess('');
      }

      else{
        setSuccess('Vaccination drive created successfully!');
        setError('');

        setTimeout(() => {
          navigate('/admin/dashboard', { state: { message: 'Vaccination drive created successfully!' } });
        
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setSuccess('');
    }
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Create Vaccination Drive</h2>

        {success && <p className="text-green-600 text-center mb-4">{success}</p>}
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <label className="block mb-2 font-semibold">Vaccine Name</label>
        <input
          type="text"
          value={vaccineName}
          onChange={(e) => setVaccineName(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded mb-4"
        />

        <label className="block mb-2 font-semibold">Drive Date</label>
        <input
          type="date"
          value={driveDate}
          min ={getTodayDate()}
          onChange={(e) => setDriveDate(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded mb-4"
        />

        <label className="block mb-2 font-semibold">Available Doses</label>
        <input
          type="number"
          min={1}
          value={availableDoses}
          onChange={(e) => setAvailableDoses(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded mb-4"
        />

        <label className="block mb-2 font-semibold">Applicable Classes (comma-separated)</label>
        <input
          type="text"
          value={applicableClasses}
          onChange={(e) => setApplicableClasses(e.target.value)}
          placeholder="e.g., 5A, 5B"
          required
          className="w-full border px-3 py-2 rounded mb-6"
        />

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition"
        >
          Create Drive
        </button>
      </form>
    </div>

    </>
  );
};

export default CreateDrive;
