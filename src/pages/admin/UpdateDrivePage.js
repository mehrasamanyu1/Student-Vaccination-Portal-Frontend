import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const UpdateDrive = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [driveData, setDriveData] = useState({
    vaccineName: '',
    driveDate: '',
    availableDoses: 0,
    applicableClasses: [],
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDrive = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/vaccination/drive/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDriveData({
          vaccineName: data.vaccineName,
          driveDate: data.driveDate,
          availableDoses: data.availableDoses,
          applicableClasses: data.applicableClasses || [],
        });
      } catch (err) {
        setError('Failed to load drive data');
      }
    };
    fetchDrive();
  }, [id, token]);

  const handleUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/vaccination/drive/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(driveData),
      });

      const message = await res.text();

      if (!res.ok)
        setError(`Update failed: ${message}`);
      else {
        setSuccess('Drive updated!');
        setTimeout(() => navigate('/admin/dashboard'), 1500);
      }
    } catch {
      setError(`Failed to update drive: ${message}`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Update Vaccination Drive</h2>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <div className="mb-4">
          <label className="block font-medium">Vaccine Name</label>
          <input
            type="text"
            value={driveData.vaccineName}
            onChange={(e) => setDriveData({ ...driveData, vaccineName: e.target.value })}
            className="border p-2 w-full rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Drive Date</label>
          <input
            type="date"
            value={driveData.driveDate}
            onChange={(e) => setDriveData({ ...driveData, driveDate: e.target.value })}
            className="border p-2 w-full rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Available Doses</label>
          <input
            type="number"
            value={driveData.availableDoses}
            onChange={(e) => setDriveData({ ...driveData, availableDoses: parseInt(e.target.value) })}
            className="border p-2 w-full rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Applicable Classes (comma-separated)</label>
          <input
            type="text"
            value={driveData.applicableClasses.join(', ')}
            onChange={(e) =>
              setDriveData({ ...driveData, applicableClasses: e.target.value.split(',').map(cls => cls.trim().toUpperCase()) })
            }

            className="border p-2 w-full rounded"
          />
        </div>

        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update Drive
        </button>
      </div>
    </>
  );
};

export default UpdateDrive;
