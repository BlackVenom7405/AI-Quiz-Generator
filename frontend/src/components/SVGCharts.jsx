import React, { useState } from 'react';

export function LineChart({ data = [], height = 200, strokeWidth = 3 }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', height, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No performance data available
      </div>
    );
  }

  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  const chartHeight = height - margin.top - margin.bottom;
  const chartWidth = 500; // Fixed inner coordinate space, responsive outer container handles scaling

  // Find max accuracy or default to 100
  const maxVal = 100;
  
  // Calculate points
  const points = data.map((d, index) => {
    const x = margin.left + (index * (chartWidth / (data.length - 1 || 1)));
    const y = margin.top + chartHeight - ((d.accuracy / maxVal) * chartHeight);
    return { x, y, value: d.accuracy, label: d.date };
  });

  // Generate SVG path for the line
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  }

  // Generate SVG area path for the gradient fill below the line
  let areaD = '';
  if (points.length > 0) {
    areaD = `${pathD} L ${points[points.length - 1].x} ${margin.top + chartHeight} L ${points[0].x} ${margin.top + chartHeight} Z`;
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg 
        viewBox={`0 0 ${chartWidth + margin.left + margin.right} ${height}`} 
        width="100%" 
        height={height}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Gradient for fill under the line */}
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
          </linearGradient>
          {/* Gradient for the line stroke */}
          <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--secondary)" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(val => {
          const y = margin.top + chartHeight - ((val / maxVal) * chartHeight);
          return (
            <g key={val}>
              <line 
                x1={margin.left} 
                y1={y} 
                x2={margin.left + chartWidth} 
                y2={y} 
                stroke="var(--card-border)" 
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text 
                x={margin.left - 10} 
                y={y + 4} 
                fill="var(--text-muted)" 
                fontSize="10" 
                textAnchor="end"
                fontFamily="Inter"
              >
                {val}%
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={margin.top + chartHeight + 20}
            fill="var(--text-muted)"
            fontSize="11"
            textAnchor="middle"
            fontFamily="Poppins"
            fontWeight="500"
          >
            {p.label}
          </text>
        ))}

        {/* Gradient fill area */}
        {areaD && <path d={areaD} fill="url(#lineGrad)" />}

        {/* Sparkline path */}
        {pathD && (
          <path 
            d={pathD} 
            fill="none" 
            stroke="url(#strokeGrad)" 
            strokeWidth={strokeWidth} 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        )}

        {/* Interaction dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hoveredPoint === i ? 6 : 4}
            fill={hoveredPoint === i ? 'var(--secondary)' : 'var(--primary)'}
            stroke="#FFFFFF"
            strokeWidth="2"
            style={{ 
              cursor: 'pointer',
              transition: 'r 0.15s ease, fill 0.15s ease',
              filter: hoveredPoint === i ? 'drop-shadow(0 0 4px var(--secondary))' : 'none'
            }}
            onMouseEnter={() => setHoveredPoint(i)}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        ))}
      </svg>

      {/* Tooltip Overlay */}
      {hoveredPoint !== null && (
        <div className="glass-panel" style={{
          position: 'absolute',
          left: `${(points[hoveredPoint].x / (chartWidth + margin.left + margin.right)) * 95}%`,
          top: `${points[hoveredPoint].y - 50}px`,
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-main)',
          pointerEvents: 'none',
          boxShadow: 'var(--shadow)',
          transform: 'translateX(-50%)',
          zIndex: 10,
          border: '1px solid rgba(124, 58, 237, 0.2)'
        }}>
          <div>{data[hoveredPoint].date}</div>
          <div style={{ color: 'var(--primary)' }}>Accuracy: {points[hoveredPoint].value}%</div>
        </div>
      )}
    </div>
  );
}

export function BarChart({ data = [], height = 200 }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', height, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No attempt statistics available
      </div>
    );
  }

  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  const chartHeight = height - margin.top - margin.bottom;
  const chartWidth = 500;

  // Find max count to scale
  const counts = data.map(d => d.count);
  const maxCount = Math.max(...counts, 4); // default minimum scale is 4

  const barWidth = (chartWidth / data.length) * 0.6;
  const barGap = (chartWidth / data.length) * 0.4;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg 
        viewBox={`0 0 ${chartWidth + margin.left + margin.right} ${height}`} 
        width="100%" 
        height={height}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {Array.from({ length: 5 }).map((_, idx) => {
          const val = Math.round((maxCount / 4) * idx);
          const y = margin.top + chartHeight - ((val / maxCount) * chartHeight);
          return (
            <g key={idx}>
              <line 
                x1={margin.left} 
                y1={y} 
                x2={margin.left + chartWidth} 
                y2={y} 
                stroke="var(--card-border)" 
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text 
                x={margin.left - 10} 
                y={y + 4} 
                fill="var(--text-muted)" 
                fontSize="10" 
                textAnchor="end"
                fontFamily="Inter"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Render Bars */}
        {data.map((d, index) => {
          const x = margin.left + (index * (chartWidth / data.length)) + (barGap / 2);
          const barHeight = (d.count / maxCount) * chartHeight;
          const y = margin.top + chartHeight - barHeight;

          return (
            <g key={index}>
              {/* Actual bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2) /* min height 2px */}
                rx="6"
                ry="6"
                fill={hoveredBar === index ? 'url(#barGrad)' : 'var(--primary)'}
                opacity={hoveredBar === index ? 1 : 0.8}
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              />
              {/* X label */}
              <text
                x={x + (barWidth / 2)}
                y={margin.top + chartHeight + 20}
                fill="var(--text-muted)"
                fontSize="11"
                textAnchor="middle"
                fontFamily="Poppins"
                fontWeight="500"
              >
                {d.date}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip Overlay */}
      {hoveredBar !== null && (
        <div className="glass-panel" style={{
          position: 'absolute',
          left: `${((margin.left + (hoveredBar * (chartWidth / data.length)) + (barGap / 2) + (barWidth / 2)) / (chartWidth + margin.left + margin.right)) * 95}%`,
          top: `${margin.top + chartHeight - ((data[hoveredBar].count / maxCount) * chartHeight) - 40}px`,
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-main)',
          pointerEvents: 'none',
          boxShadow: 'var(--shadow)',
          transform: 'translateX(-50%)',
          zIndex: 10,
          border: '1px solid rgba(6, 182, 212, 0.2)'
        }}>
          <div>{data[hoveredBar].date}</div>
          <div style={{ color: 'var(--accent)' }}>Quizzes: {data[hoveredBar].count}</div>
        </div>
      )}
    </div>
  );
}
