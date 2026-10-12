import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  Sparkles, 
  Brain, 
  Zap, 
  Hourglass, 
  Percent, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Skeleton from '../components/Skeleton';

export default function Profile({ setToast }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data);
    } catch (e) {
      setToast({ message: 'Failed to load profile data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatTotalTime = (seconds) => {
    if (!seconds) return '0h 0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const getBadgeIcon = (iconName, unlocked) => {
    const size = 28;
    const color = unlocked ? '#FFFFFF' : 'var(--text-muted)';
    
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles size={size} color={color} />;
      case 'Brain':
        return <Brain size={size} color={color} />;
      case 'Zap':
        return <Zap size={size} color={color} />;
      case 'Trophy':
      default:
        return <Trophy size={size} color={color} />;
    }
  };

  const getBadgeBg = (iconName, unlocked) => {
    if (!unlocked) return 'rgba(255, 255, 255, 0.03)';
    
    switch (iconName) {
      case 'Sparkles':
        return 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'; // Purple/pink
      case 'Brain':
        return 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)'; // Cyan/blue
      case 'Zap':
        return 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)'; // Amber/red
      case 'Trophy':
      default:
        return 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)'; // Primary
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Skeleton variant="avatar" width="80px" height="80px" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Skeleton variant="title" width="200px" height="24px" />
            <Skeleton variant="text" width="150px" />
          </div>
        </div>
        <Skeleton variant="card" height="150px" />
        <Skeleton variant="card" height="200px" />
      </div>
    );
  }

  const { name, email, joined_date, is_admin, stats = {}, achievements = [] } = profile;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '24px max(24px, 4vw) 80px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      
      {/* Profile Identity Card */}
      <GlassCard 
        style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          flexWrap: 'wrap',
          padding: '32px'
        }}
        hoverEffect={false}
      >
        {/* Large Avatar */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)'
        }}>
          {name ? name[0].toUpperCase() : 'U'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '22px', color: 'var(--text-main)' }}>{name}</h2>
            {is_admin && (
              <span style={{
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
              }}>
                <ShieldCheck size={12} />
                <span>Admin</span>
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
              <Mail size={14} />
              <span>{email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
              <Calendar size={14} />
              <span>Joined: {new Date(joined_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Aggregate Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '20px' }}>
        <GlassCard style={profileStatCardStyle} hoverEffect={false}>
          <Trophy size={20} color="var(--primary)" />
          <div style={profileStatValStyle}>{stats.total_quizzes}</div>
          <div style={profileStatLabelStyle}>Attempts</div>
        </GlassCard>

        <GlassCard style={profileStatCardStyle} hoverEffect={false}>
          <Brain size={20} color="var(--secondary)" />
          <div style={profileStatValStyle}>{stats.highest_score} Qs</div>
          <div style={profileStatLabelStyle}>Highest Score</div>
        </GlassCard>

        <GlassCard style={profileStatCardStyle} hoverEffect={false}>
          <Percent size={20} color="var(--accent)" />
          <div style={profileStatValStyle}>{stats.accuracy}%</div>
          <div style={profileStatLabelStyle}>Average Accuracy</div>
        </GlassCard>

        <GlassCard style={profileStatCardStyle} hoverEffect={false}>
          <Hourglass size={20} color="var(--success)" />
          <div style={profileStatValStyle}>{formatTotalTime(stats.total_time_spent)}</div>
          <div style={profileStatLabelStyle}>Time Spent</div>
        </GlassCard>
      </div>

      {/* Achievements List */}
      <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} hoverEffect={false}>
        <h3 style={{ fontSize: '18px', color: 'var(--text-main)', fontFamily: 'Poppins' }}>Achievements & Badges</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {achievements.map((badge, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '14px 18px',
                borderRadius: '12px',
                backgroundColor: badge.unlocked ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255,255,255,0.01)',
                border: '1px solid var(--card-border)',
                opacity: badge.unlocked ? 1 : 0.5,
                transition: 'opacity 0.2s'
              }}
            >
              {/* Badge Icon */}
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                background: getBadgeBg(badge.icon, badge.unlocked),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: badge.unlocked ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
                flexShrink: 0
              }}>
                {getBadgeIcon(badge.icon, badge.unlocked)}
              </div>

              {/* Text */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
                <h4 style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 600 }}>{badge.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.4 }}>{badge.description}</p>
              </div>

              {/* Status Indicator */}
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '12px',
                backgroundColor: badge.unlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                color: badge.unlocked ? 'var(--success)' : 'var(--text-muted)'
              }}>
                {badge.unlocked ? 'UNLOCKED' : 'LOCKED'}
              </div>

            </div>
          ))}
        </div>
      </GlassCard>

    </div>
  );
}

// Styling components
const profileStatCardStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  padding: '20px 10px',
  textAlign: 'center'
};

const profileStatValStyle = {
  fontSize: '20px',
  fontWeight: 700,
  color: 'var(--text-main)',
  fontFamily: 'Poppins'
};

const profileStatLabelStyle = {
  fontSize: '12px',
  color: 'var(--text-muted)',
  fontWeight: 500
};
