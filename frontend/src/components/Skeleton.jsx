import React from 'react';

export default function Skeleton({
  variant = 'text', // text, title, avatar, rect, circular, card
  width = '100%',
  height,
  borderRadius = '8px',
  style = {},
  className = ''
}) {
  const getStyles = () => {
    let finalHeight = height;
    let finalBorderRadius = borderRadius;

    if (variant === 'text') {
      finalHeight = height || '14px';
      finalBorderRadius = '4px';
    } else if (variant === 'title') {
      finalHeight = height || '24px';
      finalBorderRadius = '6px';
    } else if (variant === 'avatar') {
      finalHeight = height || '40px';
      width = width === '100%' ? '40px' : width;
      finalBorderRadius = '50%';
    } else if (variant === 'circular') {
      finalHeight = height || width;
      finalBorderRadius = '50%';
    } else if (variant === 'rect') {
      finalHeight = height || '120px';
    } else if (variant === 'card') {
      finalHeight = height || '200px';
      finalBorderRadius = '16px';
    }

    return {
      width,
      height: finalHeight,
      borderRadius: finalBorderRadius,
      display: 'block',
      ...style
    };
  };

  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={getStyles()}
    />
  );
}
