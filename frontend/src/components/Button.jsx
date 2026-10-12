import React from 'react';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary, secondary, accent, danger, glass, outline, text
  size = 'md', // sm, md, lg
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left', // left, right
  fullWidth = false,
  className = '',
  style = {}
}) {
  
  const getStyles = () => {
    let background = 'var(--primary)';
    let color = '#FFFFFF';
    let border = 'none';
    let boxShadow = '0 4px 14px rgba(79, 70, 229, 0.25)';
    let hoverBg = 'var(--primary-hover)';
    
    if (variant === 'secondary') {
      background = 'var(--secondary)';
      boxShadow = '0 4px 14px rgba(124, 58, 237, 0.25)';
      hoverBg = 'var(--secondary-hover)';
    } else if (variant === 'accent') {
      background = 'var(--accent)';
      boxShadow = '0 4px 14px rgba(6, 182, 212, 0.25)';
      hoverBg = 'var(--accent-hover)';
    } else if (variant === 'danger') {
      background = 'var(--error)';
      boxShadow = '0 4px 14px rgba(239, 68, 68, 0.25)';
      hoverBg = '#DC2626';
    } else if (variant === 'glass') {
      background = 'var(--card-bg)';
      color = 'var(--text-main)';
      border = '1px solid var(--card-border)';
      boxShadow = 'var(--shadow)';
      hoverBg = 'rgba(255, 255, 255, 0.15)';
    } else if (variant === 'outline') {
      background = 'transparent';
      color = 'var(--primary)';
      border = '2px solid var(--primary)';
      boxShadow = 'none';
      hoverBg = 'rgba(79, 70, 229, 0.05)';
    } else if (variant === 'text') {
      background = 'transparent';
      color = 'var(--text-muted)';
      boxShadow = 'none';
      hoverBg = 'rgba(255, 255, 255, 0.05)';
    }

    let padding = '10px 20px';
    let fontSize = '14px';
    let borderRadius = '12px';
    
    if (size === 'sm') {
      padding = '6px 12px';
      fontSize = '12px';
      borderRadius = '8px';
    } else if (size === 'lg') {
      padding = '14px 28px';
      fontSize = '16px';
      borderRadius = '16px';
    }

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 600,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.6 : 1,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      width: fullWidth ? '100%' : 'auto',
      outline: 'none',
      background,
      color,
      border,
      boxShadow,
      padding,
      fontSize,
      borderRadius,
      ...style
    };
  };

  return (
    <button
      type={type}
      onClick={disabled || loading ? null : onClick}
      disabled={disabled || loading}
      className={`btn-ripple glow-effect ${className}`}
      style={getStyles()}
    >
      {loading && (
        <span className="spinner" style={{
          width: '18px',
          height: '18px',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          display: 'inline-block'
        }} />
      )}
      
      {!loading && Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      
      <span>{children}</span>
      
      {!loading && Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}
