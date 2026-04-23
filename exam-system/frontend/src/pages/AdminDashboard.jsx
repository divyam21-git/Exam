import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Clock, FileText, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subAdmins, setSubAdmins] = useState([]);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const { data } = await axios.get('http://localhost:5000/api/exams', config);
      setExams(data);

      // Group exams by Sub-Admin
      const adminMap = {};
      data.forEach(exam => {
        const creator = exam.creator;
        if (creator && creator.role === 'Sub-Admin') {
          const key = creator._id;
          if (!adminMap[key]) {
            adminMap[key] = { ...creator, exams: [] };
          }
          adminMap[key].exams.push(exam);
        }
      });
      setSubAdmins(Object.values(adminMap));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteExam = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        };
        await axios.delete(`http://localhost:5000/api/exams/${id}`, config);
        fetchData();
      } catch (error) {
        console.error('Error deleting exam', error);
      }
    }
  };

  if (loading) return <div className="flex-center" style={{ height: '50vh' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <Link to="/create-exam" className="btn btn-primary">
          <Plus size={18} />
          Create Exam
        </Link>
      </div>

      {/* Sub-Admin Overview */}
      <div className="section-header" style={{ marginTop: '2rem' }}>
        <h2 className="section-title">
          <User size={20} /> Sub‑Admins & Their Exams
        </h2>
      </div>
      {subAdmins.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No Sub‑Admins have created exams yet.</p>
        </div>
      ) : (
        subAdmins.map(sa => (
          <div key={sa._id} className="card fade-in" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body">
              <h3 className="admin-subtitle" style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {sa.name} ({sa.email})
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Created {sa.exams.length} exam{sa.exams.length !== 1 && 's'}
              </p>
              <ul style={{ listStyle: 'disc', marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                {sa.exams.map(ex => (
                  <li key={ex._id} style={{ marginBottom: '0.5rem' }}>
                    <strong>{ex.title}</strong> – <span className={`badge ${ex.status === 'Published' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>{ex.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))
      )}

      {/* Existing Exams List */}
      <div className="section-header" style={{ marginTop: '2rem' }}>
        <h2 className="section-title">
          <FileText size={20} /> All Exams
        </h2>
      </div>
      <div className="list-card fade-in">
        {exams.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No exams found. Create one to get started.</p>
          </div>
        ) : (
          <ul style={{ margin: 0, padding: 0 }}>
            {exams.map((exam) => (
              <li key={exam._id} className="list-item">
                <div style={{ flex: 1 }}>
                  <p className="exam-title">{exam.title}</p>
                  <p className="exam-desc" style={{ marginBottom: '0.5rem' }}>{exam.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={14} />
                      {exam.duration} mins
                    </span>
                    <span className={`badge ${exam.status === 'Published' ? 'badge-success' : 'badge-warning'}`}>
                      {exam.status}
                    </span>
                    {exam.creator && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        <User size={14} />
                        {exam.creator.name}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Link to={`/edit-exam/${exam._id}`} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                    <Edit2 size={16} />
                  </Link>
                  <button onClick={() => deleteExam(exam._id)} className="btn btn-danger" style={{ padding: '0.5rem' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
