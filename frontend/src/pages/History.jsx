import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Search, 
  Trash2, 
  Eye, 
  RefreshCw, 
  Calendar, 
  Trophy, 
  Clock, 
  SlidersHorizontal,
  FolderOpen
} from 'lucide-react';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';
import Skeleton from '../components/Skeleton';

export default function History({ onSelectQuiz, onNavigate, setToast }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistory = async () => {
    try {
      const data = await api.getHistory(search, difficulty);
      setHistory(data);
    } catch (e) {
      setToast({ message: 'Failed to fetch quiz history.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Debounced search / filter trigger
  useEffect(() => {
    setLoading(true);
    const delay = setTimeout(() => {
      fetchHistory();
    }, 400);
    return () => clearTimeout(delay);
  }, [search, difficulty]);

  const handleDelete = async (quizId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this quiz record permanently?')) return;
    
    setDeletingId(quizId);
    try {
      await api.deleteQuiz(quizId);
      setToast({ message: 'Quiz deleted successfully.', type: 'success' });
      fetchHistory();
    } catch (err) {
      setToast({ message: 'Failed to delete record.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleRetake = (topic, e) => {
    e.stopPropagation();
    localStorage.setItem('prefilled_topic', topic);
    onNavigate('generate');
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return 'var(--success)';
    if (diff === 'Hard') return 'var(--error)';
    return 'var(--warning)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '24px max(24px, 4vw) 80px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--text-main)' }}>Quiz History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Review and manage your past attempts.</p>
        </div>
      </div>

      {/* Filter panel */}
      <GlassCard 
        style={{ 
          display: 'flex', 
          gap: '16px', 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          padding: '16px 20px'
        }}
        hoverEffect={false}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '2 1 280px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              borderRadius: '8px',
              border: '1px solid var(--card-border)',
              backgroundColor: 'rgba(255,255,255,0.02)',
              color: 'var(--text-main)',
              outline: 'none',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Difficulty filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 180px' }}>
          <SlidersHorizontal size={16} color="var(--text-muted)" />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={{
              flexGrow: 1,
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--card-border)',
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-main)',
              outline: 'none',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </GlassCard>

      {/* History content list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Skeleton variant="rect" height="70px" borderRadius="12px" />
          <Skeleton variant="rect" height="70px" borderRadius="12px" />
          <Skeleton variant="rect" height="70px" borderRadius="12px" />
        </div>
      ) : history.length === 0 ? (
        <GlassCard style={{ textAlign: 'center', padding: '60px 20px' }} hoverEffect={false}>
          <FolderOpen size={48} strokeWidth={1.5} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', color: 'var(--text-main)' }}>No Records Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px', maxWidth: '380px', margin: '6px auto 16px' }}>
            No quiz attempts match your current search queries or filters. Try adjusting them or generate a new quiz!
          </p>
          <Button onClick={() => onNavigate('generate')}>Create New Quiz</Button>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {history.map((quiz) => (
            <div
              key={quiz.quiz_id}
              onClick={() => onSelectQuiz(quiz.quiz_id)}
              className="history-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'var(--card-bg)',
                backdropFilter: 'blur(var(--glass-blur))',
                border: '1px solid var(--card-border)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: 'var(--shadow)'
              }}
            >
              {/* Left topic block */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 250px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '12px',
                    backgroundColor: getDifficultyColor(quiz.difficulty) + '15',
                    color: getDifficultyColor(quiz.difficulty)
                  }}>
                    {quiz.difficulty}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <Calendar size={12} />
                    <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <h3 style={{ fontSize: '16px', color: 'var(--text-main)', fontWeight: 600 }}>{quiz.topic}</h3>
              </div>

              {/* Mid metrics */}
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Trophy size={14} color="var(--secondary)" />
                  <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 600 }}>
                    Score: {quiz.score} Qs
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: quiz.accuracy >= 60 ? 'var(--success)' : 'var(--error)'
                  }}>
                    {quiz.accuracy}% Acc
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} color="var(--accent)" />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {Math.floor(quiz.time_taken / 60)}m {quiz.time_taken % 60}s
                  </span>
                </div>
              </div>

              {/* Right Action buttons */}
              <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onSelectQuiz(quiz.quiz_id)}
                  title="Review Details"
                  style={iconButtonStyle('rgba(79, 70, 229, 0.1)', 'var(--primary)')}
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={(e) => handleRetake(quiz.topic, e)}
                  title="Retake Quiz"
                  style={iconButtonStyle('rgba(124, 58, 237, 0.1)', 'var(--secondary)')}
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  onClick={(e) => handleDelete(quiz.quiz_id, e)}
                  title="Delete Record"
                  disabled={deletingId === quiz.quiz_id}
                  style={iconButtonStyle('rgba(239, 68, 68, 0.1)', 'var(--error)')}
                >
                  <Trash2 size={14} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      <style>{`
        .history-row:hover {
          background-color: rgba(255,255,255,0.06) !important;
          border-color: var(--primary) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}

const iconButtonStyle = (bgColor, color) => ({
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  backgroundColor: bgColor,
  color: color,
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'transform 0.15s ease',
  outline: 'none',
  ':hover': {
    transform: 'scale(1.05)'
  }
});
