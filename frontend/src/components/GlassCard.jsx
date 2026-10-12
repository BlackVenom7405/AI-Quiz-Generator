import React from 'react';

export default function GlassCard({
  children,
  onClick,
  hoverEffect = true,
  glow = false,
  className = '',
  style = {},
  padding = '24px',
  borderRadius = '20px'
}) {
  const cardStyle = {
    padding,
    borderRadius,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease',
    ...style
  };

  return (
    <div
      onClick={onClick}
      className={`glass-panel ${hoverEffect ? 'glow-effect' : ''} ${className}`}
      style={cardStyle}
    >
      {children}
      
      {/* CSS style extension for card scaling and glowing animations */}
      <style>{`
        .glass-panel.glow-effect:hover {
          transform: ${hoverEffect ? 'translateY(-4px)' : 'none'};
          box-shadow: ${glow ? '0 12px 40px var(--shadow), 0 0 24px var(--glow-color)' : '0 12px 40px var(--shadow)'};
          border-color: rgba(124, 58, 237, 0.3);
        }
      `}</style>
    </div>
  );
}
