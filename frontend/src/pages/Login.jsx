import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';

export default function Login({ onNavigate, setToast }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      setToast({ message: 'Welcome back!', type: 'success' });
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setToast({ message: err.message || 'Login failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '24px'
    }}>
      <GlassCard 
        style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '20px' }}
        glow
      >
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            color: 'var(--primary)',
            margin: '0 auto'
          }}>
            <Sparkles size={24} />
          </div>
          <h2 style={{ fontSize: '24px', color: 'var(--text-main)' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Sign in to continue to QuizGenius AI</p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--error)',
            fontSize: '13px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Email Address</label>
            <div style={inputContainerStyle}>
              <Mail size={18} color="var(--text-muted)" style={inputIconStyle} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div style={inputGroupStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>Password</label>
              <button 
                type="button" 
                onClick={() => setToast({ message: 'Reset link sent if email matches system records.', type: 'info' })}
                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
              >
                Forgot?
              </button>
            </div>
            <div style={inputContainerStyle}>
              <Lock size={18} color="var(--text-muted)" style={inputIconStyle} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--primary)' }}
              />
              Remember Me
            </label>
          </div>

          <Button
            type="submit"
            loading={loading}
            fullWidth
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            style={{ marginTop: '8px' }}
          >
            Sign In
          </Button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', borderTop: '1px solid var(--card-border)', paddingTop: '16px' }}>
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
          >
            Sign Up
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

// Styling helper variables
const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-main)',
  fontFamily: 'Poppins'
};

const inputContainerStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const inputIconStyle = {
  position: 'absolute',
  left: '12px',
  pointerEvents: 'none'
};

const inputStyle = {
  width: '100%',
  padding: '12px 12px 12px 40px',
  borderRadius: '10px',
  border: '1px solid var(--card-border)',
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  color: 'var(--text-main)',
  fontSize: '14px',
  outline: 'none',
  transition: 'all 0.2s',
  ':focus': {
    borderColor: 'var(--primary)',
    boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.2)'
  }
};
