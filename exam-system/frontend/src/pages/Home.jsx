import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import SubAdminDashboard from './SubAdminDashboard';
import StudentDashboard from './StudentDashboard';

const Home = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="flex-center" style={{ minHeight: '80vh', flexDirection: 'column' }}>
        <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>
          Welcome to SmartExam System
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center', maxWidth: '600px' }}>
          A premium platform for creating, managing, and taking examinations online.
          Please login or register to continue.
        </p>
      </div>
    );
  }

  if (user.role === 'Admin') {
    return <AdminDashboard />;
  }
  
  if (user.role === 'Sub-Admin') {
    return <SubAdminDashboard />;
  }

  return <StudentDashboard />;
};

export default Home;
