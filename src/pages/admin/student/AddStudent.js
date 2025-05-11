import React, { useState , useEffect} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';

const AddStudent = () => {
  const location = useLocation();
  const students = location.state?.students || [];

  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (students.length === 0) {
      setStudentId('S001');
    } else {
      const lastStudent = students[students.length - 1];
      const lastIdNum = parseInt(lastStudent.studentId.slice(1));
      const nextIdNum = lastIdNum + 1;
      const newId = `S${nextIdNum.toString().padStart(Math.max(3, nextIdNum.toString().length), '0')}`;
      setStudentId(newId);
    }
  }, [students]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (studentClass.includes(',') || studentClass.trim().split(/\s+/).length > 1) {
      setError('Please enter only a single class (e.g., 5A)');
      setSuccess('');
      return;
    }

    // Enforce valid class format
    const classFormatRegex = /^\d+[a-zA-Z]$/;
    if (!classFormatRegex.test(studentClass.trim())) {
      setError('Class must be in format like 5A or 8B (no special characters or spaces)');
      setSuccess('');
      return;
    }

    const payload = {
      studentId,
      name,
      studentClass: studentClass.trim().toUpperCase(),
      gender,
      dateOfBirth,
    };

    try {
      const response = await fetch('http://localhost:8080/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Student Id already exists.');
        }
        throw new Error('Failed to add student');
      }

      setSuccess('Student added successfully!');
      setError('');
      setStudentId('');
      setName('');
      setStudentClass('');
      setGender('');
      setDateOfBirth('');

      setTimeout(() => {
        navigate('/admin/dashboard', { state: { message: 'Student added successfully!' } });
      }, 1500);

    } catch (err) {
      setError(err.message || 'Something went wrong');
      setSuccess('');
    }
  };

  return (
    <>
      <Navbar />
      <br />
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Add Student</h2>

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
            pattern="^[1-9][0-9]*[A-Z]$"
            title="Class must be like '5A' or '2B', etc."
            placeholder="e.g., 5A"
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
            <option value="Other">Other</option>
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
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition"
          >
            Add Student
          </button>
        </form>
      </div>
    </>
  );
};

export default AddStudent;
