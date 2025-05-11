import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardStats from '../../components/DashboardStats';
import { toast } from 'react-toastify';


const AdminDashboard = () => {
  const [vaccinationDrives, setVaccinationDrives] = useState([]);
  const [vaccinationRecords, setVaccinationRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [reportData, setReportData] = useState([]);
  const [reportType, setReportType] = useState('');
  const [reportParams, setReportParams] = useState({});
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const flatVaccinationRecords = vaccinationDrives.flatMap((drive) =>
    drive.records.map((record) => ({
      ...record,
      driveId: drive.id,
      driveDate: drive.driveDate,
    }))
  );

  const reportTypeLabels = {
    'drive-report': 'Drive-wise Vaccination Report',
    'class-report': 'Class-wise Vaccination Report',
    'drive-summary': 'Drive Summary Report',
    'missed-vaccinations': 'Missed Vaccinations Report',
  };

  const reportConfig = {
    'drive-report': { path: id => `/api/reports/drive/${id}`, needs: ['driveId'] },
    'class-report': { path: cls => `/api/reports/class/${cls}`, needs: ['className'] },
    'drive-summary': { path: () => `/api/reports/drive-summary`, needs: [] },
    'missed-vaccinations': { path: () => `/api/reports/missed-vaccinations`, needs: [] },
  };

  const reportColumns = {
    'drive-report': [
      { key: 'studentName', label: 'Student Name' },
      { key: 'className', label: 'Class' },
      { key: 'vaccineName', label: 'Vaccine' },
      { key: 'vaccinationDate', label: 'Date' },
      { key: 'vaccineStatus', label: 'Vaccination Status' },
      { key: 'driveStatus', label: 'Drive Status' },
    ],
    'class-report': [
      { key: 'studentName', label: 'Student Name' },
      { key: 'studentClass', label: 'Class' },
      {
        key: 'vaccinationStatuses',
        label: 'Vaccination Statuses',
        transform: statuses =>
          statuses.map((s, i) => (
            <div key={i} className="mb-1">
              <strong>{s.driveName}</strong>: {s.vaccinationStatus}
              {s.vaccinationDate && ` on ${s.vaccinationDate}`}
            </div>
          ))
      },
    ],

    'drive-summary': [
      { key: 'vaccineName', label: 'Drive' },
      { key: 'driveDate', label: 'Date' },
      { key: 'driveStatus', label: 'Drive Status' },
      { key: 'totalDoses', label: 'Total Doses' },
      { key: 'usedDoses', label: 'Used Doses' },
      { key: 'remainingDoses', label: 'Remaining Doses' },
    ],
    'missed-vaccinations': [
      { key: 'studentName', label: 'Student Name' },
      { key: 'studentClass', label: 'Class' },
      { key: 'vaccineName', label: 'Vaccine' },
    ],
  };

  const [exportFormat, setExportFormat] = useState('');

  const openReportModal = async () => {
    if (!reportType) {
      toast.error('Pick a report type first');
      return;
    }
    const cfg = reportConfig[reportType];
    for (let key of cfg.needs) {
      if (!reportParams[key]) {
        toast.error(`Missing parameter: ${key}`);
        return;
      }
    }

    let url = `http://localhost:8080${cfg.path(reportParams[cfg.needs[0]])}`;

    const qs = new URLSearchParams();
    if (qs.toString()) url += `?${qs}`;

    setIsReportModalOpen(true);
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setReportData(data.content ?? data);
    } catch {
      toast.error('Failed to load report');
    }
  };

  const handleExport = async () => {
    if (!reportType) {
      toast.error('Pick a report first');
      return;
    }

    const cfg = reportConfig[reportType];
    for (let key of cfg.needs) {
      if (!reportParams[key]) {
        toast.error(`Missing parameter: ${key}`);
        return;
      }
    }

    const params = new URLSearchParams();
    params.append('reportType', reportType);

    cfg.needs.forEach(key => {
      params.append(key, reportParams[key]);
    });

    params.append('format', exportFormat.toUpperCase());
    const url = `http://localhost:8080/api/reports/export?${params.toString()}`;

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        toast.error('Export failed');
        return;
      }

      const extensionMap = {
        CSV: 'csv',
        EXCEL: 'xlsx',
        PDF: 'pdf'
      };

      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${reportType}.${extensionMap[exportFormat.toUpperCase()] || 'dat'}`;

      document.body.appendChild(link);
      link.click();
      toast.success('Export successful');
      link.remove();

    } catch (err) {
      console.error(err);
      toast.error('Export failed');
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const fetchVaccinationDrives = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/vaccination/drives', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setVaccinationDrives(data);

      const allRecords = data.flatMap((drive) =>
        (drive.records || []).map((record) => ({
          ...record,
          vaccineName: drive.vaccineName,
        }))
      );
      setVaccinationRecords(allRecords);

    } catch (err) {
      setError('Failed to load vaccination drives');
    }
  };

  useEffect(() => {
    fetchVaccinationDrives();
  }, [token]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/students', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setStudents(data);
      } catch (err) {
        setError('Failed to load students');
      }
    };

    fetchStudents();
  }, [token]);

  const handleVaccinateStudent = async (studentId, driveId, vaccineName) => {
    try {
      const response = await fetch(`http://localhost:8080/api/vaccination/students/${studentId}/drives/${driveId}/vaccinate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vaccineName: vaccineName,
          vaccinationDate: new Date().toISOString(),
        }),
      });

      const message = await response.text();

      if (response.ok) {
        toast.success(message);
        await fetchVaccinationDrives();
      } else {
        toast.error(`Vaccination failed: ${message}`);
      }
    } catch (err) {
      console.error("Vaccination failed:", err);
      toast.error('Vaccination failed due to network or server error.');
    }
  };

  const handleCreateDrive = () => {
    navigate('/admin/create-drive');
  };

  const handleCreateStudent = () => {
    navigate('/admin/create-student', { state: { students: students } });
  };

  const handleUpdateStudent = (studentId) => {
    navigate(`/admin/update-student/${studentId}`);
  };

  const handleDeleteStudent = (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      fetch(`http://localhost:8080/api/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(() => {
          setStudents(students.filter(student => student.studentId !== studentId));
        })
        .catch(() => setError('Failed to delete student'));
    }
  };

  function renderCell(col, row) {
    if (col.transform) {
      return col.transform(row[col.key], row);
    }
    return row[col.key] ?? '';
  }

  const updateDriveStatus = async (driveId, status) => {
    if (!window.confirm(`${status === 'APPROVED' ? 'Approve' : 'Reject'} this vaccination drive?`)) return;

    try {
      const res = await fetch(`http://localhost:8080/api/vaccination/drive/${driveId}/status?status=${status}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success(`Drive ${status.toLowerCase()}`);
        await fetchVaccinationDrives();
      } else {
        toast.error(`${status} failed`);
      }
    } catch (err) {
      console.error(`${status} error`, err);
      toast.error(`Something went wrong while updating status to ${status}`);
    }
  };

  const [name, setName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [studentId, setStudentId] = useState("");
  const [vaccinated, setVaccinated] = useState("");


  const handleSearch = async () => {
    const params = new URLSearchParams();
    if (name) params.append("name", name);
    if (studentClass) params.append("studentClass", studentClass);
    if (studentId) params.append("studentId", studentId);
    if (vaccinated !== "") params.append("vaccinated", vaccinated);

    const response = await fetch(`http://localhost:8080/api/students/search?${params.toString()}`);
    const data = await response.json();
    setStudents(data);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="relative mb-6">
          <h2 className="text-3xl font-bold text-gray-700 text-center">Admin Dashboard</h2>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }}
            className="absolute top-0 right-0 bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
          >
            Logout
          </button>
        </div>

        <br />
        <DashboardStats />

        {/* Vaccination Drives Section */}
        <section className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Vaccination Drives</h3>
          <button
            onClick={handleCreateDrive}
            className="bg-green-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-green-600 transition"
          >
            Create New Drive
          </button>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <table className="min-w-full table-auto bg-white rounded-lg shadow-md">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Drive Name</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Available Doses</th>
                <th className="px-4 py-2 text-left">Applicable Classes</th>
                <th className="px-4 py-2 text-left">Drive Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vaccinationDrives.length > 0 ? (
                [...vaccinationDrives]
                  .sort((a, b) => {
                    if (a.status !== b.status) {
                      return a.status === 'PENDING' ? -1 : 1;
                    }
                  })



                  .map((drive) => (
                    <tr key={drive.id}>
                      <td className="px-4 py-2">{drive.vaccineName}</td>
                      <td className="px-4 py-2">{drive.driveDate}</td>
                      <td className="px-4 py-2">{drive.availableDoses}</td>
                      <td className="px-4 py-2">{(drive.applicableClasses || []).join(', ')}</td>
                      <td className="px-4 py-2">{drive.status}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button
                          onClick={() => navigate(`/admin/update-drive/${drive.id}`)}
                          disabled={drive.status === 'REJECTED' || !drive.editable}
                          className={`px-4 py-2 rounded text-white ${drive.status === 'REJECTED' || !drive.editable
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                          Edit
                        </button>

                        {drive.status === 'PENDING' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateDriveStatus(drive.id, 'APPROVED')}
                              className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateDriveStatus(drive.id, 'REJECTED')}
                              className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </div>
                        ) : drive.status === 'APPROVED' ? (
                          <span className="bg-green-200 text-green-800 px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-1">
                            ✅ Approved
                          </span>
                        ) : (
                          <span className="bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-1">
                            ❌ Rejected
                          </span>
                        )}

                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-2 text-center text-gray-500">
                    No upcoming drives.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Vaccination Records Section */}
        <section>
          <h3 className="text-2xl font-semibold mb-4">Vaccination Records</h3>
          <table className="min-w-full table-auto bg-white rounded-lg shadow-md">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Student Name</th>
                <th className="px-4 py-2 text-left">Student Class</th>
                <th className="px-4 py-2 text-left">Drive</th>
                <th className="px-4 py-2 text-left">Vaccination Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flatVaccinationRecords.length > 0 ? (
                [...flatVaccinationRecords]
                  .sort((a, b) => {
                    if (a.status !== b.status) {
                      return a.status === 'PENDING' ? -1 : 1;
                    }
                  })

                  .map((record) => (
                    <tr key={record.id}>
                      <td className="px-4 py-2">{record.student?.name || 'N/A'}</td>
                      <td className="px-4 py-2">{record.student?.studentClass || 'N/A'}</td>
                      <td className="px-4 py-2">{record.vaccineName}</td>
                      <td className="px-4 py-2">{record.vaccinationDate || 'N/A'}</td>
                      <td className="px-4 py-2">{record.status}</td>
                      <td className="px-4 py-2">
                        {record.status === 'VACCINATED' ? (
                          <span className="inline-block bg-green-100 text-green-800 font-semibold px-3 py-1 rounded">
                            ✓ Vaccinated
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              handleVaccinateStudent(
                                record.student.studentId,
                                record.driveId,
                                record.vaccineName
                              )
                            }
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md transition"
                          >
                            Vaccinate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-2 text-center text-gray-500">
                    No records available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Vaccination Drive Report Viewer */}
        {/* Reports Section */}
        <section className="mt-12">
          <h3 className="text-2xl font-semibold mb-4">Reports</h3>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Report Type */}
            <select
              value={reportType}
              onChange={e => {
                setReportType(e.target.value);
                setReportParams({});
                setReportData([]);
              }}
              className="border px-4 py-2 rounded-md"
            >
              <option value="">Select report</option>
              <option value="drive-report">Drive-wise Report</option>
              <option value="class-report">Class-wise Vaccination Report</option>
              <option value="drive-summary">Drive Summary Report</option>
              <option value="missed-vaccinations">Missed Vaccinations Report</option>
            </select>

            {/* Conditional Inputs */}
            {reportType === 'drive-report' && (
              <select
                value={reportParams.driveId || ''}
                onChange={e => setReportParams(p => ({ ...p, driveId: e.target.value }))}
                className="border px-4 py-2 rounded-md"
              >
                <option value="">Select drive</option>
                {vaccinationDrives.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.vaccineName} — {d.driveDate}
                  </option>
                ))}
              </select>
            )}

            {reportType === 'class-report' && (
              <input
                type="text"
                placeholder="Enter class (e.g. 5A)"
                value={reportParams.className || ''}
                onChange={e => setReportParams(p => ({ ...p, className: e.target.value }))}
                className="border px-4 py-2 rounded-md"
              />
            )}

            {/* Preview Button */}
            <button
              onClick={openReportModal}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              disabled={!reportType}
            >
              Preview
            </button>
          </div>
        </section>

        {/* Students Section */}
        <section className="mt-8">
          <h3 className="text-2xl font-semibold mb-4">Students</h3>
          <button
            onClick={handleCreateStudent}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-600 transition"
          >
            Add New Student
          </button>

          <button
            onClick={() => navigate('/admin/bulk-upload')}
            className="bg-indigo-500 text-white px-4 py-2 ml-3 rounded-md hover:bg-indigo-600 transition"
          >
            Bulk Upload CSV
          </button>

          <div className="mb-4 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search by Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border px-3 py-2 rounded-md"
            />
            <input
              type="text"
              placeholder="Search by Class"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="border px-3 py-2 rounded-md"
            />
            <input
              type="text"
              placeholder="Search by Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="border px-3 py-2 rounded-md"
            />
            <select
              value={vaccinated}
              onChange={(e) => setVaccinated(e.target.value)}
              className="border px-3 py-2 rounded-md"
            >
              <option value="">All</option>
              <option value="true">Vaccinated</option>
              <option value="false">Unvaccinated</option>
            </select>
            <button
              onClick={handleSearch}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
            >
              Search
            </button>
          </div>

          <table className="min-w-full table-auto bg-white rounded-lg shadow-md">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Student ID</th>
                <th className="px-4 py-2 text-left">Student Name</th>
                <th className="px-4 py-2 text-left">Student Class</th>
                <th className="px-4 py-2 text-left">Gender</th>
                <th className="px-4 py-2 text-left">Date of Birth</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.studentId}>
                    <td className="px-4 py-2">{student.studentId}</td>
                    <td className="px-4 py-2">{student.name}</td>
                    <td className="px-4 py-2">{student.studentClass}</td>
                    <td className="px-4 py-2">{student.gender}</td>
                    <td className="px-4 py-2">{student.dateOfBirth}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleUpdateStudent(student.studentId)}
                        className="bg-blue-500 text-white px-4 py-1 rounded-md mr-2 hover:bg-blue-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.studentId)}
                        className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-2 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {isReportModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="relative bg-white p-6 rounded-lg w-full max-w-2xl">

              {/* Fetch & show data when modal opens */}
              <button
                onClick={() => setIsReportModalOpen(false)}
                type="button"
                aria-label="Close"
                className="absolute top-3 right-5 z-10 text-4xl leading-none text-gray-500 hover:text-gray-800 p-1"
              >
                &times;
              </button>

              <h3 className="text-xl font-bold mb-4">
                Preview: {reportTypeLabels[reportType]}
              </h3>
              {reportData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <svg
                    className="w-12 h-12 text-gray-300 mb-2"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 13l3 3L22 4" />
                  </svg>
                  <p className="text-gray-400 italic">No data to display</p>
                </div>
              ) : (
                <>
                  <div className="overflow-auto max-h-64 mb-4">
                    <table className="w-full table-auto border">
                      <thead className="bg-gray-100">
                        <tr>
                          {/* adjust columns per reportType */}
                          {reportColumns[reportType].map(col => (
                            <th key={col.key} className="px-4 py-2 text-left">{col.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.map((row, rowIdx) => (
                          <tr key={row.id ?? rowIdx}>
                            {reportColumns[reportType].map(col => (
                              <td key={col.key} className="px-4 py-2">
                                {renderCell(col, row)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Export Dropdown */}
                  <div className="flex justify-end space-x-2">
                    <select
                      value={exportFormat}
                      onChange={e => setExportFormat(e.target.value)}
                      className="border px-3 py-1 rounded-md"
                    >
                      <option value="">Export as…</option>
                      <option value="CSV">CSV</option>
                      <option value="EXCEL">Excel</option>
                      <option value="PDF">PDF</option>
                    </select>
                    <button
                      onClick={handleExport}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      disabled={!exportFormat}
                    >
                      Download
                    </button>
                    <button
                      onClick={() => setIsReportModalOpen(false)}
                      className="ml-4 text-gray-600 hover:underline"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
