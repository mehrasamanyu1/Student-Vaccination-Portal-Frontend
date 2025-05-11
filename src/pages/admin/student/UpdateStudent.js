import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';

const UpdateStudent = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch(`http://localhost:8080/api/students/${studentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch student');
        return res.json();
      })
      .then((data) => {
        setName(data.name);
        setStudentClass(data.studentClass);
        setGender(data.gender);
        setDateOfBirth(data.dateOfBirth);
      })
      .catch((err) => setError(err.message));
  }, [studentId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      studentId,
      name,
      studentClass,
      gender,
      dateOfBirth,
    };

    try {
      const response = await fetch(`http://localhost:8080/api/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 400) {
        const data = await response.json();
        throw new Error(data.message || 'Bad Request');
      }

      if (!response.ok) {
        throw new Error('Failed to update student');
      }

      setSuccess('Student updated successfully!');
      setError('');
      setTimeout(() => navigate('/admin/dashboard'), 1000);
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  return (
    <>
      <Navbar />
      <br />
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Update Student</h2>

        {success && <p className="text-green-600 text-center mb-4">{success}</p>}
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-semibold">Student ID</label>
          <input
            type="text"
            value={studentId}
            disabled
            className="w-full border px-3 py-2 rounded mb-4 bg-gray-100 cursor-not-allowed"
          />

          <label className="block mb-2 font-semibold">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded mb-4"
          />

          <label className="block mb-2 font-semibold">Class</label>
          <input
            type="text"
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded mb-4"
          />

          <label className="block mb-2 font-semibold">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded mb-4"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <label className="block mb-2 font-semibold">Date of Birth</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded mb-6"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
          >
            Update Student
          </button>
        </form>
      </div>
    </>
  );
};

export default UpdateStudent;
