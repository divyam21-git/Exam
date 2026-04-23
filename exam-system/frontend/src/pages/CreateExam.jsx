import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, Save, ArrowLeft } from 'lucide-react';

const CreateExam = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [status, setStatus] = useState('Draft');
  const [questions, setQuestions] = useState([
    { text: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }
  ]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    }
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push('');
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options.length > 2) {
      newQuestions[qIndex].options.splice(oIndex, 1);
      if (newQuestions[qIndex].correctAnswer >= newQuestions[qIndex].options.length) {
        newQuestions[qIndex].correctAnswer = 0;
      }
      setQuestions(newQuestions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    for (let q of questions) {
      if (!q.text.trim()) {
        setError('All questions must have text');
        setSaving(false);
        return;
      }
      for (let o of q.options) {
        if (!o.trim()) {
          setError('All options must have text');
          setSaving(false);
          return;
        }
      }
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      };
      
      const payload = { title, description, duration, status, questions };
      await axios.post('http://localhost:5000/api/exams', payload, config);
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exam');
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Create New Exam</h1>
        <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <div className="card fade-in" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>General Settings</h2>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1', margin: 0 }}>
              <label className="form-label">Exam Title</label>
              <input
                type="text"
                required
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="form-group" style={{ gridColumn: '1 / -1', margin: 0 }}>
              <label className="form-label">Description</label>
              <textarea
                rows={3}
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Duration (Minutes)</label>
              <input
                type="number"
                min="1"
                required
                className="form-input"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
              />
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0 1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Questions Builder</h2>
        </div>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="card fade-in" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary-color)' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
              <h3 style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Question {qIndex + 1}</h3>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  style={{ color: 'var(--danger)' }}
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Question Text</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={q.text}
                  onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Options (Select radio button to mark correct answer)</label>
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctAnswer === oIndex}
                      onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                      className="option-radio"
                      style={{ margin: 0 }}
                      title="Mark as correct answer"
                    />
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder={`Option ${oIndex + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                    />
                    {q.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(qIndex, oIndex)}
                        style={{ color: 'var(--text-muted)', padding: '0.5rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => addOption(qIndex)}
                  style={{ color: 'var(--primary-color)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}
                >
                  <PlusCircle size={16} /> Add Option
                </button>
              </div>

              <div className="form-group" style={{ width: '150px', margin: 0 }}>
                <label className="form-label">Points</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="form-input"
                  value={q.points}
                  onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          style={{ width: '100%', padding: '1rem', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', background: 'transparent', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 600, transition: 'all 0.2s', marginBottom: '2rem' }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <PlusCircle size={20} />
          Add Another Question
        </button>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', position: 'sticky', bottom: '1rem', background: 'rgba(255,255,255,0.9)', padding: '1rem', borderRadius: 'var(--radius-lg)', backdropFilter: 'blur(10px)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Exam'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateExam;
