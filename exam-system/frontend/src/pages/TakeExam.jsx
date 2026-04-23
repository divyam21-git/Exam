import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';

const TakeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        };
        const { data } = await axios.get(`http://localhost:5000/api/exams/${id}`, config);
        setExam(data);
        setTimeLeft(data.duration * 60); // Convert mins to seconds
        
        // Initialize answers array
        const initialAnswers = data.questions.map(q => ({
          questionId: q._id,
          selectedOption: -1
        }));
        setAnswers(initialAnswers);
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading exam');
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0 && !submitting && exam) {
        handleSubmit(); // Auto submit when time's up
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitting, exam]);

  const handleOptionSelect = (questionId, optionIndex) => {
    setAnswers(prev => 
      prev.map(ans => 
        ans.questionId === questionId ? { ...ans, selectedOption: optionIndex } : ans
      )
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      };
      const { data } = await axios.post(`http://localhost:5000/api/exams/${id}/submit`, { answers }, config);
      alert(`Exam submitted successfully! Your score: ${data.score} / ${data.totalPoints}`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting exam');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <div className="flex-center" style={{ height: '50vh' }}>Loading exam details...</div>;
  if (error) return <div className="auth-error" style={{ margin: '2rem' }}>{error}</div>;
  if (!exam) return <div className="flex-center">Exam not found.</div>;

  const isTimeRunningOut = timeLeft < 60;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div className="exam-header-sticky">
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>{exam.title}</h1>
          <p className="exam-desc" style={{ margin: 0 }}>{exam.description}</p>
        </div>
        <div className={`timer-box ${isTimeRunningOut ? 'danger' : ''}`}>
          <Clock size={24} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="questions-container">
        {exam.questions.map((q, index) => {
          const currentAnswer = answers.find(a => a.questionId === q._id)?.selectedOption;
          
          return (
            <div key={q._id} className="question-block fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <h3 className="question-text" style={{ margin: 0 }}>
                  <span className="question-num">{index + 1}.</span>
                  {q.text}
                </h3>
                <span className="badge badge-warning" style={{ background: 'var(--bg-color)', color: 'var(--text-muted)' }}>
                  {q.points} {q.points === 1 ? 'pt' : 'pts'}
                </span>
              </div>
              
              <div className="options-list">
                {q.options.map((opt, optIdx) => (
                  <label 
                    key={optIdx} 
                    className={`option-label ${currentAnswer === optIdx ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`question-${q._id}`}
                      value={optIdx}
                      checked={currentAnswer === optIdx}
                      onChange={() => handleOptionSelect(q._id, optIdx)}
                      className="option-radio"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn btn-primary"
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {submitting ? 'Submitting...' : 'Submit Exam'}
        </button>
      </div>
    </div>
  );
};

export default TakeExam;
