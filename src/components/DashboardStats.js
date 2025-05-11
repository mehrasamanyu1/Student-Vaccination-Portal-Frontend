import React, { useEffect, useState } from 'react';

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/reports/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, [token]);

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-100 p-4 rounded shadow">
        <h3 className="text-lg font-semibold">Total Students</h3>
        <p className="text-2xl">{stats.totalStudents}</p>
      </div>
  
      <div className="bg-green-100 p-4 rounded shadow">
        <h3 className="text-lg font-semibold">Vaccinated Students</h3>
        <p className="text-2xl mb-2">{stats.vaccinatedStudents}</p>
  
        {/* Vaccination Percentage Progress */}
        <div className="w-full bg-green-200 h-4 rounded">
          <div
            className="bg-green-500 h-4 rounded"
            style={{
              width: `${
                stats.totalStudents > 0
                  ? (stats.vaccinatedStudents / stats.totalStudents) * 100
                  : 0
              }%`,
            }}
          ></div>
        </div>
        <p className="text-sm mt-1 text-green-800">
          {stats.totalStudents > 0
            ? `${Math.round(
                (stats.vaccinatedStudents / stats.totalStudents) * 100
              )}% vaccinated (${stats.vaccinatedStudents} of ${stats.totalStudents})`
            : ''}
        </p>
      </div>
  
      <div className="bg-yellow-100 p-4 rounded shadow">
        <h3 className="text-lg font-semibold">Upcoming Drives</h3>
        <p className="text-2xl">{stats.upcomingDrives}</p>
      </div>
    </div>
  );
};

export default DashboardStats;