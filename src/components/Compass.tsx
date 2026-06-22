import React from 'react';
import { LightningRecord, CARDINAL_DIRECTIONS, CardinalDirection } from '../types';

interface CompassProps {
  records: LightningRecord[];
  viewDirection: CardinalDirection;
  onAzimuthSelect?: (azimuth: number) => void;
}

const Compass: React.FC<CompassProps> = ({ records, viewDirection, onAzimuthSelect }) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [hoveredAzimuth, setHoveredAzimuth] = React.useState<number | null>(null);

  const size = 320;
  const center = size / 2;
  const outerRadius = size / 2 - 20;
  const innerRadius = outerRadius * 0.6;
  const coreRadius = outerRadius * 0.2;

  const viewDeg = CARDINAL_DIRECTIONS.find(d => d.code === viewDirection)?.degrees ?? 0;

  const handleCompassClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onAzimuthSelect || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - center;
    const y = e.clientY - rect.top - center;
    let angle = Math.atan2(x, -y) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    onAzimuthSelect(Math.round(angle));
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - center;
    const y = e.clientY - rect.top - center;
    const dist = Math.sqrt(x * x + y * y);
    if (dist < coreRadius || dist > outerRadius) {
      setHoveredAzimuth(null);
      return;
    }
    let angle = Math.atan2(x, -y) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    setHoveredAzimuth(Math.round(angle));
  };

  const getPointOnCircle = (radius: number, deg: number) => {
    const rad = (deg - 90) * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };

  const getDistanceRadius = (distanceKm: number) => {
    const maxDist = 20;
    const normalized = Math.min(distanceKm / maxDist, 1);
    return innerRadius - normalized * (innerRadius - coreRadius - 10);
  };

  const getFlashColor = (record: LightningRecord) => {
    const colors: Record<number, string> = {
      1: '#94a3b8',
      2: '#a78bfa',
      3: '#818cf8',
      4: '#fde047',
      5: '#fb923c',
    };
    return colors[record.brightness] || '#818cf8';
  };

  const sortedRecords = [...records].sort((a, b) => a.timestamp - b.timestamp);
  const latestRecord = records.length > 0 ? records[records.length - 1] : null;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          ref={svgRef}
          width={size}
          height={size}
          className="cursor-crosshair"
          onClick={handleCompassClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredAzimuth(null)}
        >
          <defs>
            <radialGradient id="compassBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="70%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx={center} cy={center} r={outerRadius} fill="url(#compassBg)" stroke="#475569" strokeWidth="2" />
          <circle cx={center} cy={center} r={innerRadius} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx={center} cy={center} r={coreRadius} fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1" />

          {[5, 10, 15, 20].map((dist, i) => {
            const r = innerRadius - ((i + 1) / 4) * (innerRadius - coreRadius - 10);
            return (
              <g key={dist}>
                <circle cx={center} cy={center} r={r} fill="none" stroke="#1e3a5f" strokeWidth="0.5" opacity="0.6" />
                <text
                  x={center + 3}
                  y={center - r + 4}
                  fill="#64748b"
                  fontSize="9"
                  className="select-none"
                >
                  {dist}km
                </text>
              </g>
            );
          })}

          {CARDINAL_DIRECTIONS.map((dir, i) => {
            const p1 = getPointOnCircle(outerRadius - 8, dir.degrees);
            const p2 = getPointOnCircle(outerRadius, dir.degrees);
            const labelPos = getPointOnCircle(outerRadius - 24, dir.degrees);
            const isMajor = i % 4 === 0;
            const isViewDir = dir.code === viewDirection;
            return (
              <g key={dir.code}>
                <line
                  x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={isViewDir ? '#fde047' : isMajor ? '#94a3b8' : '#475569'}
                  strokeWidth={isMajor ? 2 : 1}
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  fill={isViewDir ? '#fde047' : isMajor ? '#e2e8f0' : '#94a3b8'}
                  fontSize={isMajor ? 12 : 9}
                  fontWeight={isViewDir ? 'bold' : isMajor ? 'semibold' : 'normal'}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="select-none"
                >
                  {isMajor ? dir.code : ''}
                </text>
              </g>
            );
          })}

          {sortedRecords.length > 1 && (
            <polyline
              points={sortedRecords.map(r => {
                const pos = getPointOnCircle(getDistanceRadius(r.estimatedDistanceKm), r.lightningAzimuth);
                return `${pos.x},${pos.y}`;
              }).join(' ')}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.5"
            />
          )}

          {sortedRecords.map((record, idx) => {
            const pos = getPointOnCircle(getDistanceRadius(record.estimatedDistanceKm), record.lightningAzimuth);
            const isLatest = record === latestRecord;
            const size = 5 + record.brightness * 1.2;
            return (
              <g key={record.id}>
                {isLatest && (
                  <circle
                    cx={pos.x} cy={pos.y} r={size + 8}
                    fill={getFlashColor(record)}
                    opacity="0.2"
                    className="animate-pulse-fast"
                  />
                )}
                <circle
                  cx={pos.x} cy={pos.y} r={size}
                  fill={getFlashColor(record)}
                  filter="url(#glow)"
                  opacity={0.6 + (idx / sortedRecords.length) * 0.4}
                />
                <text
                  x={pos.x}
                  y={pos.y - size - 4}
                  fill="#cbd5e1"
                  fontSize="8"
                  textAnchor="middle"
                  className="select-none"
                >
                  #{idx + 1}
                </text>
              </g>
            );
          })}

          {hoveredAzimuth !== null && (
            <line
              x1={center} y1={center}
              x2={getPointOnCircle(outerRadius, hoveredAzimuth).x}
              y2={getPointOnCircle(outerRadius, hoveredAzimuth).y}
              stroke="#fde047"
              strokeWidth="1"
              strokeDasharray="5 5"
              opacity="0.7"
            />
          )}

          {(() => {
            const viewStart = getPointOnCircle(coreRadius, (viewDeg + 90) % 360);
            const viewEnd = getPointOnCircle(coreRadius, (viewDeg + 270) % 360);
            const viewTip = getPointOnCircle(outerRadius * 0.92, viewDeg);
            return (
              <polygon
                points={`${viewStart.x},${viewStart.y} ${viewTip.x},${viewTip.y} ${viewEnd.x},${viewEnd.y}`}
                fill="rgba(253, 224, 71, 0.08)"
                stroke="rgba(253, 224, 71, 0.3)"
                strokeWidth="1"
              />
            );
          })()}

          <text x={center} y={center - 5} fill="#94a3b8" fontSize="8" textAnchor="middle" className="select-none">
            观测点
          </text>
          <text x={center} y={center + 8} fill="#fde047" fontSize="10" textAnchor="middle" fontWeight="bold" className="select-none">
            {viewDirection}
          </text>
        </svg>

        {hoveredAzimuth !== null && (
          <div className="absolute top-2 right-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-yellow-500/40">
            <span className="text-yellow-400 text-sm font-mono">{hoveredAzimuth}°</span>
            <span className="text-slate-400 text-xs ml-2">
              {CARDINAL_DIRECTIONS[Math.round(hoveredAzimuth / 22.5) % 16].label}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-400" />
          <span className="text-slate-400">1级暗</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-violet-400" />
          <span className="text-slate-400">2-3级</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="text-slate-400">4级亮</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-orange-400" />
          <span className="text-slate-400">5级极亮</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="3 3" /></svg>
          <span className="text-slate-400">移动轨迹</span>
        </div>
      </div>
    </div>
  );
};

export default Compass;
