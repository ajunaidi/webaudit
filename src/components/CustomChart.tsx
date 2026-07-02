/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuditScores } from '../types';

interface CustomChartProps {
  scores: AuditScores;
  height?: number;
}

export const CustomChart: React.FC<CustomChartProps> = ({ scores, height = 300 }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const categories: { key: keyof Omit<AuditScores, 'overall'>; label: string; color: string; description: string }[] = [
    { key: 'design', label: 'Design', color: '#4f46e5', description: 'Layout, Visual Hierarchy, Spacing & Typography' },
    { key: 'content', label: 'Content', color: '#db2777', description: 'Readability, Value Proposition & CTA Copy' },
    { key: 'seo', label: 'SEO', color: '#059669', description: 'Metadata, Alt Texts & Heading Structure' },
    { key: 'cro', label: 'CRO', color: '#d97706', description: 'Friction Points, Trust Signals & Funnel Optimization' },
    { key: 'ui', label: 'UI/UX', color: '#0891b2', description: 'Mobile Responsiveness & Interactive Accessibility' },
  ];

  const cx = 150;
  const cy = 150;
  const maxRadius = 90;

  // Calculate coordinates for the radar polygons
  const getCoordinates = (index: number, score: number) => {
    const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
    const radius = (score / 100) * maxRadius;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    return { x, y };
  };

  // Coordinates for grid background concentric pentagons
  const gridLevels = [25, 50, 75, 100];
  const gridPolygons = gridLevels.map((level) => {
    return categories.map((_, index) => {
      const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
      const x = cx + (level / 100) * maxRadius * Math.cos(angle);
      const y = cy + (level / 100) * maxRadius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  });

  // Coordinates for the actual scores polygon
  const scorePoints = categories.map((cat, index) => {
    const score = scores[cat.key] || 0;
    const { x, y } = getCoordinates(index, score);
    return `${x},${y}`;
  }).join(' ');

  // Outer labels and axes lines
  const axes = categories.map((cat, index) => {
    const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
    const outerX = cx + (maxRadius + 15) * Math.cos(angle);
    const outerY = cy + (maxRadius + 15) * Math.sin(angle);
    const labelX = cx + (maxRadius + 30) * Math.cos(angle);
    const labelY = cy + (maxRadius + 20) * Math.sin(angle);
    
    // Adjust label alignment based on position
    let textAnchor = 'middle';
    if (Math.cos(angle) > 0.1) textAnchor = 'start';
    if (Math.cos(angle) < -0.1) textAnchor = 'end';

    const score = scores[cat.key] || 0;
    const scoreCoords = getCoordinates(index, score);

    return {
      key: cat.key,
      label: cat.label,
      score,
      color: cat.color,
      linePath: `M ${cx} ${cy} L ${outerX} ${outerY}`,
      labelX,
      labelY,
      textAnchor,
      dotX: scoreCoords.x,
      dotY: scoreCoords.y,
      description: cat.description
    };
  });

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      {/* Radar Chart Visual */}
      <div className="relative w-[340px] h-[310px] flex items-center justify-center">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 300 300">
          <defs>
            {/* Smooth glowing gradient for overall scores */}
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(79, 70, 229, 0.25)" />
              <stop offset="70%" stopColor="rgba(79, 70, 229, 0.08)" />
              <stop offset="100%" stopColor="rgba(79, 70, 229, 0)" />
            </radialGradient>
            
            <linearGradient id="scoreBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#db2777" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>

          {/* Grid Level Background Labels */}
          {gridLevels.map((level) => (
            <text
              key={`level-${level}`}
              x={cx}
              y={cy - (level / 100) * maxRadius + 4}
              className="text-[9px] fill-slate-400 font-medium select-none"
              textAnchor="middle"
            >
              {level}
            </text>
          ))}

          {/* Concentric Pentagonal Grids */}
          {gridPolygons.map((points, idx) => (
            <polygon
              key={`grid-${idx}`}
              points={points}
              className="fill-none stroke-slate-200 stroke-1"
              strokeDasharray={idx === gridPolygons.length - 1 ? 'none' : '3 3'}
            />
          ))}

          {/* Axes Lines */}
          {axes.map((axis) => (
            <path
              key={`axis-${axis.key}`}
              d={axis.linePath}
              className="stroke-slate-200 stroke-1"
            />
          ))}

          {/* Filled Scores Area */}
          <polygon
            points={scorePoints}
            fill="url(#radarGlow)"
            stroke="url(#scoreBorderGrad)"
            strokeWidth="2.5"
            className="transition-all duration-500 ease-out filter drop-shadow-[0_2px_4px_rgba(79,70,229,0.15)]"
          />

          {/* Markers on each axis */}
          {axes.map((axis, idx) => (
            <g
              key={`marker-${axis.key}`}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              <circle
                cx={axis.dotX}
                cy={axis.dotY}
                r={hoveredIndex === idx ? "7" : "5"}
                fill={axis.color}
                className="stroke-white stroke-2 transition-all duration-200 shadow-sm"
              />
              <circle
                cx={axis.dotX}
                cy={axis.dotY}
                r="12"
                fill="transparent"
                className="hover:stroke-indigo-600/10 hover:stroke-[8px]"
              />
            </g>
          ))}

          {/* Axis Labels */}
          {axes.map((axis, idx) => (
            <g
              key={`label-${axis.key}`}
              className="cursor-pointer select-none"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <text
                x={axis.labelX}
                y={axis.labelY}
                textAnchor={axis.textAnchor}
                className={`text-xs font-bold transition-all duration-200 ${
                  hoveredIndex === idx ? 'fill-indigo-600 scale-105' : 'fill-slate-600'
                }`}
              >
                {axis.label} ({axis.score})
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Score Breakdown & Descriptions */}
      <div className="flex-1 flex flex-col justify-center gap-4 w-full">
        <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Score Analysis</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((cat, idx) => {
            const score = scores[cat.key] || 0;
            const isHovered = hoveredIndex === idx;
            
            // Score tier coloring
            let scoreColorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200/50';
            if (score < 50) scoreColorClass = 'text-rose-700 bg-rose-50 border-rose-200/50';
            else if (score < 80) scoreColorClass = 'text-amber-700 bg-amber-50 border-amber-200/50';

            return (
              <div
                key={cat.key}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                  isHovered 
                    ? 'bg-indigo-50/40 border-indigo-300 translate-x-1 shadow-sm' 
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.label}
                  </span>
                  <span className="text-xs text-slate-500 truncate mt-0.5">{cat.description}</span>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-sm font-bold border ${scoreColorClass}`}>
                  {score}
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall score banner */}
        <div className="mt-2 p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-indigo-650 font-semibold uppercase tracking-wider">Overall Health Index</span>
            <span className="text-xs text-slate-500 mt-1">Weighted performance across all tested domains.</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-600 to-cyan-600">
              {scores.overall}/100
            </div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase">
              {scores.overall >= 80 ? 'Excellent' : scores.overall >= 50 ? 'Needs Work' : 'Critical'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


interface HistoricalTrendChartProps {
  history: { date: string; score: number; url: string }[];
}

export const HistoricalTrendChart: React.FC<HistoricalTrendChartProps> = ({ history }) => {
  if (history.length < 2) {
    return (
      <div className="p-6 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-sm font-medium">Audits ke trends dekhne ke liye kam se kam 2 audits save karein.</p>
        <p className="text-xs text-slate-450 mt-1">Jab aap multiple tests save karenge, yahan continuous graph show hoga.</p>
      </div>
    );
  }

  const padding = 40;
  const chartHeight = 200;
  const chartWidth = 500;
  const plotWidth = chartWidth - padding * 2;
  const plotHeight = chartHeight - padding * 2;

  const minScore = 0;
  const maxScore = 100;

  // Render SVG path
  const points = history.map((item, index) => {
    const x = padding + (index / (history.length - 1)) * plotWidth;
    const y = chartHeight - padding - ((item.score - minScore) / (maxScore - minScore)) * plotHeight;
    return { x, y, ...item };
  });

  const linePath = points.reduce((path, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, '');

  // Fill path for background gradient below the line
  const fillPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold tracking-wider text-indigo-650 uppercase mb-1">Performance Trend over time</h4>
        <p className="text-xs text-slate-500">Aapki different website runs aur layout updates ki progressive evaluation.</p>
        
        <div className="mt-4 space-y-2 max-h-[140px] overflow-y-auto pr-1">
          {history.map((h, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
              <span className="text-slate-700 font-medium truncate max-w-[150px]">{h.url}</span>
              <span className="text-slate-450 text-[10px]">{h.date}</span>
              <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100/50">{h.score}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full md:w-[360px] lg:w-[480px] overflow-x-auto">
        <svg className="w-full h-auto overflow-visible min-w-[320px]" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <defs>
            <linearGradient id="trendFillGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(79, 70, 229, 0.15)" />
              <stop offset="100%" stopColor="rgba(79, 70, 229, 0)" />
            </linearGradient>
            
            <linearGradient id="lineStrokeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((level) => {
            const y = chartHeight - padding - (level / 100) * plotHeight;
            return (
              <g key={level}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  className="stroke-slate-100 stroke-1"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  className="text-[10px] fill-slate-400 text-right font-medium"
                  textAnchor="end"
                >
                  {level}%
                </text>
              </g>
            );
          })}

          {/* Shaded Area under the line */}
          <path d={fillPath} fill="url(#trendFillGlow)" />

          {/* Line Path */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineStrokeGlow)"
            strokeWidth="3"
            strokeLinecap="round"
            className="filter drop-shadow-[0_2px_3px_rgba(79,70,229,0.1)]"
          />

          {/* Dots on points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r="5"
                className="fill-white stroke-indigo-600 stroke-2 cursor-pointer hover:r-7 transition-all shadow-sm"
              />
              {/* Tooltip score text */}
              <text
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                className="text-[10px] fill-slate-700 font-bold bg-white stroke-slate-200 stroke-1 px-1 py-0.5 rounded shadow-sm"
              >
                {p.score}%
              </text>
              {/* X Axis labels */}
              <text
                x={p.x}
                y={chartHeight - padding + 15}
                textAnchor="middle"
                className="text-[9px] fill-slate-400 font-medium max-w-[50px] truncate"
              >
                {p.date.split(',')[0]}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
