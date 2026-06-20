import { useCallback, useRef, useEffect } from 'react';
import { useMaintenanceStore } from '../../stores/useMaintenanceStore';
import { useIssueStore } from '../../stores/useIssueStore';
import { iceRinkConfig } from '../../data/mockData';
import { TrackPath } from './TrackPath';
import { BladeHeatmap } from './BladeHeatmap';
import { IssueMarkerDot } from './IssueMarkerDot';
import type { IssueType } from '../../types';
import { generateTrackPath } from '../../utils/trackAlgorithm';

const SCALE = 12;

export function IceRinkView() {
  const { session, viewMode, activeTool, isSimulating, addTrackPoints } = useMaintenanceStore();
  const { issues, addIssue } = useIssueStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const fullTrackRef = useRef<ReturnType<typeof generateTrackPath>>([]);
  const lastWrittenIndexRef = useRef(0);

  useEffect(() => {
    const track = generateTrackPath(3, 3, 2);
    fullTrackRef.current = track;
  }, []);

  useEffect(() => {
    if (!isSimulating) {
      lastWrittenIndexRef.current = session.trackPoints.length;
      return;
    }

    const BATCH_SIZE = 4;
    const INTERVAL_MS = 80;

    const interval = setInterval(() => {
      const currentEnd = lastWrittenIndexRef.current;
      const nextEnd = Math.min(currentEnd + BATCH_SIZE, fullTrackRef.current.length);

      if (currentEnd >= fullTrackRef.current.length) {
        clearInterval(interval);
        return;
      }

      const batch = fullTrackRef.current.slice(currentEnd, nextEnd);
      if (batch.length > 0) {
        addTrackPoints(batch);
        lastWrittenIndexRef.current = nextEnd;
      }
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isSimulating, addTrackPoints]);

  useEffect(() => {
    if (session.status === 'idle' || session.status === 'completed') {
      lastWrittenIndexRef.current = 0;
    }
  }, [session.status]);

  const displayPoints = session.trackPoints.length > 0
    ? session.trackPoints
    : fullTrackRef.current;

  const handleSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (activeTool === 'none') return;

      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const scaleX = (iceRinkConfig.width * SCALE) / rect.width;
      const scaleY = (iceRinkConfig.height * SCALE) / rect.height;
      const x = ((e.clientX - rect.left) * scaleX) / SCALE;
      const y = ((e.clientY - rect.top) * scaleY) / SCALE;

      if (x < 0 || x > iceRinkConfig.width || y < 0 || y > iceRinkConfig.height) return;

      addIssue({
        type: activeTool as IssueType,
        x,
        y,
        severity: 'medium',
        description: '',
        radius: 2,
      });
    },
    [activeTool, addIssue]
  );

  const width = iceRinkConfig.width * SCALE;
  const height = iceRinkConfig.height * SCALE;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.3),transparent_60%)]" />
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        style={{ cursor: activeTool !== 'none' ? 'crosshair' : 'default' }}
        onClick={handleSvgClick}
      >
        <defs>
          <linearGradient id="iceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="50%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
          <pattern id="iceTexture" patternUnits="userSpaceOnUse" width="20" height="20">
            <rect width="20" height="20" fill="url(#iceGradient)" />
            <circle cx="5" cy="5" r="0.5" fill="rgba(255,255,255,0.3)" />
            <circle cx="15" cy="12" r="0.3" fill="rgba(255,255,255,0.2)" />
            <circle cx="10" cy="18" r="0.4" fill="rgba(255,255,255,0.25)" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          rx={SCALE * 2}
          ry={SCALE * 2}
          fill="url(#iceTexture)"
          stroke="#38bdf8"
          strokeWidth={2}
        />

        <g stroke="rgba(56, 189, 248, 0.3)" strokeWidth={1} fill="none">
          <circle
            cx={width / 2}
            cy={height / 2}
            r={SCALE * 4.5}
            strokeDasharray="5,5"
          />
          <line x1={width / 2} y1={0} x2={width / 2} y2={height} strokeDasharray="10,5" />
          <line x1={SCALE * 15} y1={0} x2={SCALE * 15} y2={height} />
          <line x1={width - SCALE * 15} y1={0} x2={width - SCALE * 15} y2={height} />
        </g>

        <g>
          {iceRinkConfig.doors.map((door) => (
            <g key={door.id}>
              <rect
                x={door.side === 'top' || door.side === 'bottom'
                    ? door.x * SCALE - (door.width * SCALE) / 2
                    : door.side === 'left'
                    ? 0
                    : width - SCALE * 0.5}
                y={door.side === 'left' || door.side === 'right'
                    ? door.y * SCALE - (door.width * SCALE) / 2
                    : door.side === 'top'
                    ? 0
                    : height - SCALE * 0.5}
                width={door.side === 'top' || door.side === 'bottom' ? door.width * SCALE : SCALE * 0.5}
                height={door.side === 'left' || door.side === 'right' ? door.width * SCALE : SCALE * 0.5}
                fill="#fbbf24"
                opacity={0.8}
                rx={2}
              />
              <text
                x={door.side === 'top' || door.side === 'bottom' ? door.x * SCALE : door.side === 'left' ? SCALE * 2 : width - SCALE * 2}
                y={door.side === 'left' || door.side === 'right' ? door.y * SCALE : door.side === 'top' ? SCALE * 1.5 : height - SCALE * 0.8}
                textAnchor="middle"
                fontSize="10"
                fill="#fbbf24"
                fontWeight="bold"
              >
                {door.name}
              </text>
            </g>
          ))}
        </g>

        {viewMode === 'blade' && <BladeHeatmap points={displayPoints} scale={SCALE} />}

        {viewMode !== 'blade' && (
          <TrackPath points={displayPoints} scale={SCALE} animated={isSimulating} />
        )}

        {viewMode === 'water' && displayPoints.some((p) => p.water) && (
          <g opacity={0.6}>
            {displayPoints
              .filter((p) => p.water)
              .map((p, i) => (
                <circle
                  key={i}
                  cx={p.x * SCALE}
                  cy={p.y * SCALE}
                  r={SCALE * 1.5}
                  fill="rgba(34, 211, 238, 0.4)"
                />
              ))}
          </g>
        )}

        {issues.map((issue) => (
          <IssueMarkerDot key={issue.id} issue={issue} scale={SCALE} pulse={!issue.resolved} />
        ))}

        {isSimulating && session.trackPoints.length > 0 && (
          <g filter="url(#glow)">
            <circle
              cx={session.trackPoints[session.trackPoints.length - 1].x * SCALE}
              cy={session.trackPoints[session.trackPoints.length - 1].y * SCALE}
              r={SCALE * 0.8}
              fill="#0ea5e9"
            />
            <circle
              cx={session.trackPoints[session.trackPoints.length - 1].x * SCALE}
              cy={session.trackPoints[session.trackPoints.length - 1].y * SCALE}
              r={SCALE * 0.4}
              fill="#fff"
            />
          </g>
        )}
      </svg>

      <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 text-xs space-y-2">
        <div className="text-slate-400 font-medium mb-2">图例</div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-sky-400 rounded-full" />
          <span className="text-slate-300">磨冰轨迹</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500/80" />
          <span className="text-slate-300">高优先级问题</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-500/80" />
          <span className="text-slate-300">中优先级问题</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-500/80" />
          <span className="text-slate-300">低优先级问题</span>
        </div>
      </div>
    </div>
  );
}
