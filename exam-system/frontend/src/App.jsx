import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateExam from './pages/CreateExam';
import TakeExam from './pages/TakeExam';
import SubAdminDashboard from './pages/SubAdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/create-exam" element={<ProtectedRoute allowedRoles={['Admin', 'Sub-Admin']}><CreateExam /></ProtectedRoute>} />
              <Route path="/take-exam/:id" element={<ProtectedRoute allowedRoles={['Student']}><TakeExam /></ProtectedRoute>} />
              <Route path="/subadmin" element={<ProtectedRoute allowedRoles={['Sub-Admin']}><SubAdminDashboard /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;


