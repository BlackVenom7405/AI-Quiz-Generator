import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { 
  Users, 
  BookOpen, 
  Percent, 
  Cpu, 
  Trash2, 
  ShieldCheck, 
  Database,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';
import Skeleton from '../components/Skeleton';

export default function AdminPanel({ setToast }) {
  const { user: currentUser } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('users'); // users, quizzes, apilogs
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [quizzesList, setQuizzesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const analyticsRes = await api.getAdminAnalytics();
      setAnalytics(analyticsRes);
      
      if (activeSubTab === 'users') {
        const usersRes = await api.getAdminUsers();
        setUsersList(usersRes);
      } else if (activeSubTab === 'quizzes') {
        const quizzesRes = await api.getAdminQuizzes();
        setQuizzesList(quizzesRes);
      }
    } catch (e) {
      setToast({ message: e.message || 'Failed to fetch admin data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeSubTab]);

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      setToast({ message: 'You cannot delete your own admin account.', type: 'error' });
      return;
    }
    if (!window.confirm('WARNING: Deleting this user will permanently remove all their quiz history and logs. Proceed?')) return;
    
    setActionLoadingId(userId);
    try {
      await api.deleteAdminUser(userId);
      setToast({ message: 'User and all associated data deleted.', type: 'success' });
      fetchAdminData();
    } catch (err) {
      setToast({ message: 'Failed to delete user.', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Delete this quiz attempt record permanently?')) return;
    
    setActionLoadingId(quizId);
    try {
      await api.deleteAdminQuiz(quizId);
      setToast({ message: 'Quiz record deleted.', type: 'success' });
      fetchAdminData();
    } catch (err) {
      setToast({ message: 'Failed to delete quiz.', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading && !analytics) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '24px' }}>
        <Skeleton variant="title" width="200px" height="32px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <Skeleton variant="card" height="120px" />
          <Skeleton variant="card" height="120px" />
          <Skeleton variant="card" height="120px" />
        </div>
        <Skeleton variant="rect" height="300px" />
      </div>
    );
  }

  const stats = analytics?.stats || { total_users: 0, total_quizzes: 0, avg_accuracy: 0.0, api_calls: { total: 0, success: 0, error: 0 } };
  const apiLogs = analytics?.api_logs || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '24px max(24px, 4vw) 80px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: 'var(--text-main)' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage platform resources, view API traffic, and inspect metrics.</p>
      </div>

      {/* Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <GlassCard style={statStyle} hoverEffect={false}>
          <div style={iconBoxStyle('rgba(6, 182, 212, 0.1)', 'var(--accent)')}><Users size={20} /></div>
          <div>
            <div style={statLabelStyle}>Registered Users</div>
            <div style={statValStyle}>{stats.total_users}</div>
          </div>
        </GlassCard>

        <GlassCard style={statStyle} hoverEffect={false}>
          <div style={iconBoxStyle('rgba(79, 70, 229, 0.1)', 'var(--primary)')}><BookOpen size={20} /></div>
          <div>
            <div style={statLabelStyle}>Total Quizzes</div>
            <div style={statValStyle}>{stats.total_quizzes}</div>
          </div>
        </GlassCard>

        <GlassCard style={statStyle} hoverEffect={false}>
          <div style={iconBoxStyle('rgba(16, 185, 129, 0.1)', 'var(--success)')}><Percent size={20} /></div>
          <div>
            <div style={statLabelStyle}>Platform Avg Acc</div>
            <div style={statValStyle}>{stats.avg_accuracy}%</div>
          </div>
        </GlassCard>

        <GlassCard style={statStyle} hoverEffect={false}>
          <div style={iconBoxStyle('rgba(124, 58, 237, 0.1)', 'var(--secondary)')}><Cpu size={20} /></div>
          <div>
            <div style={statLabelStyle}>Gemini Requests</div>
            <div style={statValStyle}>{stats.api_calls.total} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({stats.api_calls.success} OK)</span></div>
          </div>
        </GlassCard>
      </div>

      {/* Main Tab Wrapper */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Navigation sub-tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)', gap: '16px' }}>
          <button 
            onClick={() => setActiveSubTab('users')} 
            style={subTabStyle(activeSubTab === 'users')}
          >
            Users List
          </button>
          <button 
            onClick={() => setActiveSubTab('quizzes')} 
            style={subTabStyle(activeSubTab === 'quizzes')}
          >
            Quizzes Generated
          </button>
          <button 
            onClick={() => setActiveSubTab('apilogs')} 
            style={subTabStyle(activeSubTab === 'apilogs')}
          >
            AI Gemini API Logs
          </button>
        </div>

        {/* Content tables */}
        <GlassCard style={{ overflowX: 'auto', padding: '0px' }} hoverEffect={false}>
          
          {loading ? (
            <div style={{ padding: '40px' }}><Skeleton variant="rect" height="150px" /></div>
          ) : (
            <>
              {activeSubTab === 'users' && (
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderStyle}>
                      <th style={tableCellStyle}>ID</th>
                      <th style={tableCellStyle}>Name</th>
                      <th style={tableCellStyle}>Email</th>
                      <th style={tableCellStyle}>Role</th>
                      <th style={tableCellStyle}>Joined Date</th>
                      <th style={tableCellStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((usr) => (
                      <tr key={usr.id} style={tableRowStyle}>
                        <td style={tableCellStyle}>{usr.id}</td>
                        <td style={{ ...tableCellStyle, fontWeight: 600 }}>{usr.name}</td>
                        <td style={tableCellStyle}>{usr.email}</td>
                        <td style={tableCellStyle}>
                          {usr.is_admin ? (
                            <span style={adminBadgeStyle}><ShieldCheck size={12} /> Admin</span>
                          ) : (
                            <span style={userBadgeStyle}>User</span>
                          )}
                        </td>
                        <td style={tableCellStyle}>{new Date(usr.created_at).toLocaleDateString()}</td>
                        <td style={tableCellStyle}>
                          <button
                            onClick={() => handleDeleteUser(usr.id)}
                            disabled={usr.id === currentUser.id || actionLoadingId === usr.id}
                            style={deleteButtonStyle(usr.id === currentUser.id)}
                            title="Delete User permanently"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeSubTab === 'quizzes' && (
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderStyle}>
                      <th style={tableCellStyle}>Quiz ID</th>
                      <th style={tableCellStyle}>User Name</th>
                      <th style={tableCellStyle}>Topic</th>
                      <th style={tableCellStyle}>Difficulty</th>
                      <th style={tableCellStyle}>Accuracy</th>
                      <th style={tableCellStyle}>Date</th>
                      <th style={tableCellStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzesList.map((qz) => (
                      <tr key={qz.quiz_id} style={tableRowStyle}>
                        <td style={tableCellStyle}>{qz.quiz_id}</td>
                        <td style={tableCellStyle}>
                          <div style={{ fontWeight: 600 }}>{qz.user_name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{qz.user_email}</div>
                        </td>
                        <td style={{ ...tableCellStyle, fontWeight: 500 }}>{qz.topic}</td>
                        <td style={tableCellStyle}>{qz.difficulty}</td>
                        <td style={{ ...tableCellStyle, fontWeight: 700, color: qz.accuracy >= 60 ? 'var(--success)' : 'var(--error)' }}>{qz.accuracy}%</td>
                        <td style={tableCellStyle}>{new Date(qz.created_at).toLocaleDateString()}</td>
                        <td style={tableCellStyle}>
                          <button
                            onClick={() => handleDeleteQuiz(qz.quiz_id)}
                            disabled={actionLoadingId === qz.quiz_id}
                            style={deleteButtonStyle()}
                            title="Delete Quiz record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeSubTab === 'apilogs' && (
                <table style={tableStyle}>
                  <thead>
                    <tr style={tableHeaderStyle}>
                      <th style={tableCellStyle}>Log ID</th>
                      <th style={tableCellStyle}>User ID</th>
                      <th style={tableCellStyle}>Type</th>
                      <th style={tableCellStyle}>Tokens</th>
                      <th style={tableCellStyle}>Status</th>
                      <th style={tableCellStyle}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiLogs.map((log) => {
                      const isSuccess = log.status === 'success';
                      return (
                        <tr key={log.log_id} style={tableRowStyle}>
                          <td style={tableCellStyle}>{log.log_id}</td>
                          <td style={tableCellStyle}>User #{log.user_id}</td>
                          <td style={{ ...tableCellStyle, textTransform: 'uppercase', fontWeight: 600 }}>{log.request_type}</td>
                          <td style={tableCellStyle}>
                            <div>In: {log.prompt_tokens}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Out: {log.completion_tokens}</div>
                          </td>
                          <td style={tableCellStyle}>
                            {isSuccess ? (
                              <span style={okStatusStyle}>Success</span>
                            ) : (
                              <span style={errStatusStyle} title={log.status}>
                                <AlertTriangle size={12} /> {log.status.substring(0, 15)}...
                              </span>
                            )}
                          </td>
                          <td style={tableCellStyle}>{new Date(log.created_at).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </>
          )}

        </GlassCard>
      </div>

    </div>
  );
}

// Styling subcomponents
const statStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
};

const iconBoxStyle = (bgColor, iconColor) => ({
  width: '44px',
  height: '44px',
  borderRadius: '10px',
  backgroundColor: bgColor,
  color: iconColor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const statLabelStyle = {
  fontSize: '12px',
  color: 'var(--text-muted)',
  fontWeight: 500
};

const statValStyle = {
  fontSize: '20px',
  fontWeight: 700,
  color: 'var(--text-main)',
  fontFamily: 'Poppins',
  display: 'flex',
  alignItems: 'baseline',
  gap: '4px'
};

const subTabStyle = (active) => ({
  background: 'transparent',
  border: 'none',
  borderBottom: active ? '3px solid var(--primary)' : '3px solid transparent',
  color: active ? 'var(--primary)' : 'var(--text-muted)',
  fontWeight: 600,
  fontSize: '14px',
  padding: '10px 16px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontFamily: 'Poppins'
});

// Table styling
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
  fontSize: '13px'
};

const tableHeaderStyle = {
  borderBottom: '2px solid var(--card-border)',
  backgroundColor: 'rgba(255,255,255,0.01)'
};

const tableRowStyle = {
  borderBottom: '1px solid var(--card-border)',
  backgroundColor: 'transparent',
  ':hover': {
    backgroundColor: 'rgba(255,255,255,0.02)'
  }
};

const tableCellStyle = {
  padding: '14px 20px',
  color: 'var(--text-main)'
};

// Badges
const adminBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '11px',
  fontWeight: 700,
  padding: '2px 8px',
  borderRadius: '12px',
  backgroundColor: 'rgba(236, 72, 153, 0.1)',
  color: '#EC4899',
  border: '1px solid rgba(236, 72, 153, 0.2)'
};

const userBadgeStyle = {
  fontSize: '11px',
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: '12px',
  backgroundColor: 'rgba(255,255,255,0.05)',
  color: 'var(--text-muted)',
  border: '1px solid var(--card-border)'
};

const okStatusStyle = {
  fontSize: '11px',
  fontWeight: 700,
  padding: '2px 8px',
  borderRadius: '12px',
  backgroundColor: 'rgba(16, 185, 129, 0.1)',
  color: 'var(--success)'
};

const errStatusStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '11px',
  fontWeight: 700,
  padding: '2px 8px',
  borderRadius: '12px',
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  color: 'var(--error)',
  cursor: 'help'
};

const deleteButtonStyle = (disabled = false) => ({
  width: '30px',
  height: '30px',
  borderRadius: '6px',
  backgroundColor: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(239, 68, 68, 0.1)',
  color: disabled ? 'var(--text-muted)' : 'var(--error)',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.3 : 1,
  transition: 'transform 0.15s ease',
  outline: 'none',
  ':hover': {
    transform: disabled ? 'none' : 'scale(1.05)'
  }
});
