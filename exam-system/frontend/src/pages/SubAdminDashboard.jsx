import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FileText, Clock, User } from 'lucide-react';

const SubAdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const [resultsMap, setResultsMap] = useState({}); // examId -> results array
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      // Get exams created by this Sub-Admin (backend filters based on role)
      const { data: examsData } = await axios.get('http://localhost:5000/api/exams', config);
      setExams(examsData);

      // For each exam, fetch its results (admin/subadmin view)
      const resultsPromises = examsData.map((exam) =>
        axios.get(`http://localhost:5000/api/exams/${exam._id}/results`, config)
      );
      const resultsResponses = await Promise.all(resultsPromises);
      const map = {};
      resultsResponses.forEach((res, idx) => {
        map[examsData[idx]._id] = res.data; // array of Result docs
      });
      setResultsMap(map);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Sub-Admin data', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="flex-center" style={{ height: '50vh' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Sub‑Admin Dashboard</h1>
        <p>Exams you have created and student submissions.</p>
      </div>

      {exams.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No exams found. Create one first.</p>
        </div>
      ) : (
        exams.map((exam) => (
          <div key={exam._id} className="card fade-in" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body">
              <h3 className="exam-title">{exam.title}</h3>
              <p className="exam-desc">{exam.description}</p>
              <div className="exam-meta" style={{ marginBottom: '0.75rem' }}>
                <span>{exam.questions.length} Questions</span>
                <span>{exam.duration} mins</span>
                <span className={`badge ${exam.status === 'Published' ? 'badge-success' : 'badge-warning'}`}> {exam.status} </span>
              </div>

              {/* Submissions table */}
              <h4>Submissions</h4>
              {resultsMap[exam._id] && resultsMap[exam._id].length > 0 ? (
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Score</th>
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultsMap[exam._id].map((res) => (
                      <tr key={res._id} style={{ borderTop: '1px solid var(--border-color)' }}>
                        <td>{res.student?.name || 'Unknown'}</td>
                        <td>{res.score}/{res.totalPoints}</td>
                        <td>{new Date(res.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No submissions yet.</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SubAdminDashboard;
