import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PlayCircle, FileText } from 'lucide-react';

const StudentDashboard = () => {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      };
      const [examsRes, resultsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/exams', config),
        axios.get('http://localhost:5000/api/exams/my-results', config)
      ]);
      setExams(examsRes.data);
      setResults(resultsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="flex-center" style={{ height: '50vh' }}>Loading exams...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Available Exams</h1>
      </div>
      
      <div className="exam-grid">
        {exams.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No exams available right now.</p>
          </div>
        ) : (
          exams.map((exam) => {
            const studentResult = results.find(r => r.exam._id === exam._id || r.exam === exam._id);
            const isCompleted = !!studentResult;

            return (
              <div key={exam._id} className="card fade-in">
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <h3 className="exam-title">{exam.title}</h3>
                  <p className="exam-desc">{exam.description}</p>
                  <div style={{ marginTop: 'auto' }}>
                    <div className="exam-meta">
                      <span>{exam.questions.length} Questions</span>
                      <span>{exam.duration} mins</span>
                    </div>
                    {isCompleted ? (
                      <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
                        Completed: Score {studentResult.score}/{studentResult.totalPoints}
                      </div>
                    ) : (
                      <Link
                        to={`/take-exam/${exam._id}`}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                      >
                        <PlayCircle size={18} />
                        Start Exam
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
