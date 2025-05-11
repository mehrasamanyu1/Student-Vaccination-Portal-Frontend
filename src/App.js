// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import CreateDrive from './pages/admin/CreateDrivePage';
import UpdateDrive from './pages/admin/UpdateDrivePage';
import AddStudent from './pages/admin/student/AddStudent';
import UpdateStudent from './pages/admin/student/UpdateStudent';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BulkUploadStudents from './pages/admin/student/BulkUploadStudents';

function App() {
  return (
    <>
    <ToastContainer />

    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create-drive"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <CreateDrive />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/update-drive/:id"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <UpdateDrive />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/create-student"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AddStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/update-student/:studentId"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <UpdateStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bulk-upload"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <BulkUploadStudents />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
    </>
  );
}

export default App;
