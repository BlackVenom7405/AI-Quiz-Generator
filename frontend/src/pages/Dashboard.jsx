import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { 
  Trophy, 
  Percent, 
  BookOpen, 
  TrendingUp, 
  ArrowRight, 
  Calendar, 
  HelpCircle,
  Eye,
  Trash2,
  Brain
} from 'lucide-react';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';
import Skeleton from '../components/Skeleton';
import { LineChart, BarChart } from '../components/SVGCharts';

export default function Dashboard({ onNavigate, onSelectQuiz, setToast }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quickTopic, setQuickTopic] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (e) {
      setToast({ message: 'Failed to fetch dashboard data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickGenerate = (e) => {
    e.preventDefault();
    if (!quickTopic.trim()) {
      setToast({ message: 'Please enter a topic first.', type: 'warning' });
      return;
    }
    // Navigate to generate page passing the topic in localStorage or via navigation callback
    localStorage.setItem('prefilled_topic', quickTopic);
    onNavigate('generate');
  };

  const handleDeleteQuiz = async (quizId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this quiz record?')) return;
    
    setDeletingId(quizId);
    try {
      await api.deleteQuiz(quizId);
      setToast({ message: 'Quiz deleted successfully.', type: 'success' });
      fetchDashboardData(); // Refresh
    } catch (err) {
      setToast({ message: 'Failed to delete quiz.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '24px' }}>
        <Skeleton variant="title" width="250px" height="32px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <Skeleton variant="card" height="120px" />
          <Skeleton variant="card" height="120px" />
          <Skeleton variant="card" height="120px" />
          <Skeleton variant="card" height="120px" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          <Skeleton variant="card" height="300px" />
          <Skeleton variant="card" height="300px" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || { total_quizzes: 0, highest_score: 0, avg_score: 0.0, accuracy: 0.0 };
  const recentQuizzes = data?.recent_quizzes || [];
  const weeklyPerformance = data?.weekly_performance || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '24px max(24px, 4vw) 80px' }}>
      
      {/* Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--text-main)' }}>
            {getGreeting()}, {data?.name || user?.name || 'User'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Here is your learning summary for today. Let's build some brain power!
          </p>
        </div>
        <Button onClick={() => onNavigate('generate')} icon={Brain}>
          Generate New Quiz
        </Button>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '20px' 
      }}>
        <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '16px' }} hoverEffect={false}>
          <div style={statIconBoxStyle('rgba(79, 70, 229, 0.1)', 'var(--primary)')}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Total Quizzes</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>{stats.total_quizzes}</div>
          </div>
        </GlassCard>

        <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '16px' }} hoverEffect={false}>
          <div style={statIconBoxStyle('rgba(124, 58, 237, 0.1)', 'var(--secondary)')}>
            <Trophy size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Highest Score</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>{stats.highest_score} Qs</div>
          </div>
        </GlassCard>

        <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '16px' }} hoverEffect={false}>
          <div style={statIconBoxStyle('rgba(6, 182, 212, 0.1)', 'var(--accent)')}>
            <Percent size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Average Accuracy</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>{stats.accuracy}%</div>
          </div>
        </GlassCard>

        <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '16px' }} hoverEffect={false}>
          <div style={statIconBoxStyle('rgba(16, 185, 129, 0.1)', 'var(--success)')}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Average Score</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>{stats.avg_score} Qs</div>
          </div>
        </GlassCard>
      </div>

      {/* Mid Section: Weekly performance graph + Quick Generate */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr', 
        gap: '24px',
        '@media (min-width: 1024px)': { gridTemplateColumns: '2fr 1fr' }
      }} className="mid-section-container">
        
        {/* Weekly Accuracy Graph */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} hoverEffect={false}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-main)' }}>Weekly Performance</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last 7 Days (Accuracy %)</span>
          </div>
          <div style={{ width: '100%', minHeight: '200px' }}>
            <LineChart data={weeklyPerformance} height={200} />
          </div>
        </GlassCard>

        {/* Quick Generate Input */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} glow>
          <h3 style={{ fontSize: '18px', color: 'var(--text-main)' }}>Quick Generate</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
            Have a topic in mind? Enter it below to start configuring your custom AI quiz instantly.
          </p>
          <form onSubmit={handleQuickGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '4px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="e.g. JavaScript Closures, WW2, Botany..."
                value={quickTopic}
                onChange={(e) => setQuickTopic(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--card-border)',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>
            <Button type="submit" fullWidth icon={ArrowRight} iconPosition="right">
              Continue
            </Button>
          </form>
        </GlassCard>
      </div>

      {/* Bottom Section: Recent Quizzes */}
      <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} hoverEffect={false}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--text-main)' }}>Recent Quizzes</h3>
          <button 
            onClick={() => onNavigate('history')}
            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
          >
            View All
          </button>
        </div>

        {recentQuizzes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <HelpCircle size={40} strokeWidth={1.5} style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '14px' }}>You haven't generated any quizzes yet.</p>
            <Button 
              onClick={() => onNavigate('generate')} 
              variant="text" 
              size="sm" 
              style={{ color: 'var(--primary)', marginTop: '8px' }}
            >
              Generate your first quiz now
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentQuizzes.map((quiz) => (
              <div 
                key={quiz.quiz_id}
                onClick={() => onSelectQuiz(quiz.quiz_id)}
                className="recent-quiz-row glow-effect"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--card-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                {/* Topic Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 200px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: getDifficultyColor(quiz.difficulty) + '15',
                    color: getDifficultyColor(quiz.difficulty),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12px',
                    flexShrink: 0
                  }}>
                    {quiz.difficulty[0]}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 600 }}>{quiz.topic}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <Calendar size={12} />
                      <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Score Summary */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {quiz.score} Questions
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Accuracy: {quiz.accuracy}%
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectQuiz(quiz.quiz_id)}
                      title="Review Details"
                      style={iconBtnStyle('rgba(79, 70, 229, 0.1)', 'var(--primary)')}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteQuiz(quiz.quiz_id, e)}
                      title="Delete Record"
                      disabled={deletingId === quiz.quiz_id}
                      style={iconBtnStyle('rgba(239, 68, 68, 0.1)', 'var(--error)')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <style>{`
        .recent-quiz-row:hover {
          background-color: rgba(255, 255, 255, 0.05) !important;
          border-color: var(--primary) !important;
          transform: translateX(4px);
        }
        .mid-section-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
        }
        @media (max-width: 1024px) {
          .mid-section-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// Helper colors
const getDifficultyColor = (diff) => {
  if (diff === 'Easy') return '#10B981'; // Green
  if (diff === 'Hard') return '#EF4444'; // Red
  return '#F59E0B'; // Amber for Medium
};

const statIconBoxStyle = (bgColor, iconColor) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  backgroundColor: bgColor,
  color: iconColor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const iconBtnStyle = (bgColor, color) => ({
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
  outline: 'none'
});
