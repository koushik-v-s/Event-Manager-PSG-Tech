import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import AdminHome from './components/AdminHome';
import FacultyHome from './components/FacultyHome';
import AdminManage from './components/AdminManage';
import FacultyManage from './components/FacultyManage';
import RequestEvent from './components/RequestEvent';
import ViewEventDetails from './components/ViewEventDetails';
import Profile from './components/Profile';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token) {
    return <Navigate to="/login" />;
  }
  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === 'admin' ? '/admin-home' : '/faculty-home'} />;
  }
  return children;
};

const App = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route
          path="/login"
          element={
            <AuthPage>
              <LoginForm key="login" />
            </AuthPage>
          }
        />
        <Route
          path="/register"
          element={
            <AuthPage>
              <RegisterForm key="register" />
            </AuthPage>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthPage>
              <ForgotPasswordForm key="forgot-password" />
            </AuthPage>
          }
        />
        <Route
          path="/"
          element={
            <AuthPage>
              <LoginForm key="login-home" />
            </AuthPage>
          }
        />
        <Route
          path="/admin-home"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty-home"
          element={
            <ProtectedRoute allowedRole="faculty">
              <FacultyHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-manage"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminManage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty-manage"
          element={
            <ProtectedRoute allowedRole="faculty">
              <FacultyManage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/request-event"
          element={
            <ProtectedRoute allowedRole="faculty">
              <RequestEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-event-details/:event_id"
          element={
            <ProtectedRoute>
              <ViewEventDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;