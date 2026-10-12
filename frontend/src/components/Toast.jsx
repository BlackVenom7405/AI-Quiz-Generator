import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({
  message,
  type = 'success', // success, error, warning, info
  onClose,
  duration = 4000
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTheme = () => {
    switch (type) {
      case 'error':
        return {
          icon: <AlertCircle color="#EF4444" size={20} />,
          border: 'rgba(239, 68, 68, 0.4)',
          bg: 'rgba(239, 68, 68, 0.08)'
        };
      case 'warning':
        return {
          icon: <AlertTriangle color="#F59E0B" size={20} />,
          border: 'rgba(245, 158, 11, 0.4)',
          bg: 'rgba(245, 158, 11, 0.08)'
        };
      case 'info':
        return {
          icon: <Info color="#06B6D4" size={20} />,
          border: 'rgba(6, 182, 212, 0.4)',
          bg: 'rgba(6, 182, 212, 0.08)'
        };
      case 'success':
      default:
        return {
          icon: <CheckCircle2 color="#10B981" size={20} />,
          border: 'rgba(16, 185, 129, 0.4)',
          bg: 'rgba(16, 185, 129, 0.08)'
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      className="glass-panel"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        borderRadius: '14px',
        border: `1px solid ${theme.border}`,
        backgroundColor: theme.bg,
        boxShadow: 'var(--shadow)',
        zIndex: 1000,
        maxWidth: '380px',
        animation: 'slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {theme.icon}
      </div>
      
      <div style={{ 
        color: 'var(--text-main)', 
        fontSize: '14px', 
        fontWeight: 500,
        flexGrow: 1,
        lineHeight: 1.4
      }}>
        {message}
      </div>
      
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2px',
          borderRadius: '50%',
          transition: 'background-color 0.2s'
        }}
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateY(100px) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
