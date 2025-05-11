import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ dashboardPath = '/admin/dashboard' }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center shadow-md">
      <button
        onClick={() => navigate(dashboardPath)}
        className="bg-white text-blue-600 font-semibold px-3 py-1 rounded hover:bg-gray-200"
      >
        Back to Dashboard
      </button>
      <h1 className="text-lg font-semibold">Admin Panel</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
