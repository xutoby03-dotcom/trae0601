import React from 'react';
import { LightningRecord, MovementSummary, CARDINAL_DIRECTIONS, RISK_CONFIG, getDirectionFromDegrees, CardinalDirection } from '../types';

interface MovementSummaryProps {
  records: LightningRecord[];
}

const calculateMovementSummary = (records: LightningRecord[]): MovementSummary => {
  if (records.length === 0) {
    return {
      dominantDirection: null,
      directionTrend: 'unclear',
      averageDistanceKm: null,
      distanceTrend: null,
      totalFlashes: 0,
      lastActivityMinutesAgo: null,
      displacementDirection: null,
      displacementAzimuthDegrees: null,
      displacementKm: null,
      centroidStart: null,
      centroidEnd: null,
    };
  }

  const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp);
  const totalFlashes = sorted.length;

  const toXY = (r: LightningRecord) => {
    const rad = (r.lightningAzimuth * Math.PI) / 180;
    return {
      x: r.estimatedDistanceKm * Math.sin(rad),
      y: r.estimatedDistanceKm * Math.cos(rad),
    };
  };

  const points = sorted.map(toXY);
  const distances = sorted.map(r => r.estimatedDistanceKm);
  const averageDistanceKm = Math.round((distances.reduce((a, b) => a + b, 0) / distances.length) * 10) / 10;

  const avgX = points.reduce((s, p) => s + p.x, 0) / points.length;
  const avgY = points.reduce((s, p) => s + p.y, 0) / points.length;
  const avgRad = Math.atan2(avgX, avgY);
  let avgDeg = (avgRad * 180) / Math.PI;
  if (avgDeg < 0) avgDeg += 360;
  const dominantDirection = getDirectionFromDegrees(avgDeg);

  let distanceTrend: number | null = null;
  let directionTrend: MovementSummary['directionTrend'] = 'unclear';
  let displacementDirection: CardinalDirection | null = null;
  let displacementAzimuthDegrees: number | null = null;
  let displacementKm: number | null = null;
  let centroidStart: { x: number; y: number } | null = null;
  let centroidEnd: { x: number; y: number } | null = null;

  if (sorted.length >= 2) {
    const firstHalf = sorted.slice(0, Math.ceil(sorted.length / 2));
    const secondHalf = sorted.slice(Math.ceil(sorted.length / 2));
    const firstAvg = firstHalf.reduce((s, r) => s + r.estimatedDistanceKm, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((s, r) => s + r.estimatedDistanceKm, 0) / secondHalf.length;
    distanceTrend = Math.round((secondAvg - firstAvg) * 10) / 10;

    const half = Math.ceil(points.length / 2);
    const startPts = points.slice(0, half);
    const endPts = points.slice(half);
    centroidStart = {
      x: startPts.reduce((s, p) => s + p.x, 0) / startPts.length,
      y: startPts.reduce((s, p) => s + p.y, 0) / startPts.length,
    };
    centroidEnd = {
      x: endPts.reduce((s, p) => s + p.x, 0) / endPts.length,
      y: endPts.reduce((s, p) => s + p.y, 0) / endPts.length,
    };

    const dx = centroidEnd.x - centroidStart.x;
    const dy = centroidEnd.y - centroidStart.y;
    displacementKm = Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10;

    if (displacementKm >= 0.5) {
      let moveRad = Math.atan2(dx, dy);
      let moveDeg = (moveRad * 180) / Math.PI;
      if (moveDeg < 0) moveDeg += 360;
      displacementAzimuthDegrees = Math.round(moveDeg);
      displacementDirection = getDirectionFromDegrees(moveDeg);
    }

    if (distanceTrend <= -0.5) {
      directionTrend = 'approaching';
    } else if (distanceTrend >= 0.5) {
      directionTrend = 'receding';
    } else {
      directionTrend = 'stationary';
    }
  }

  const lastActivityMs = Date.now() - sorted[sorted.length - 1].timestamp;
  const lastActivityMinutesAgo = Math.round(lastActivityMs / 60000 * 10) / 10;

  return {
    dominantDirection,
    directionTrend,
    averageDistanceKm,
    distanceTrend,
    totalFlashes,
    lastActivityMinutesAgo,
    displacementDirection,
    displacementAzimuthDegrees,
    displacementKm,
    centroidStart,
    centroidEnd,
  };
};

const MovementPanel: React.FC<MovementSummaryProps> = ({ records }) => {
  const summary = React.useMemo(() => calculateMovementSummary(records), [records]);
  const latest = records.length > 0 ? [...records].sort((a, b) => b.timestamp - a.timestamp)[0] : null;

  const trendConfig = {
    approaching: { label: '正在逼近', icon: '📈', color: 'text-red-400', bgColor: 'bg-red-500/15', borderColor: 'border-red-500/30' },
    receding: { label: '正在远去', icon: '📉', color: 'text-emerald-400', bgColor: 'bg-emerald-500/15', borderColor: 'border-emerald-500/30' },
    stationary: { label: '基本稳定', icon: '➡️', color: 'text-blue-400', bgColor: 'bg-blue-500/15', borderColor: 'border-blue-500/30' },
    unclear: { label: '数据不足', icon: '❓', color: 'text-slate-400', bgColor: 'bg-slate-500/15', borderColor: 'border-slate-500/30' },
  };

  const domDir = CARDINAL_DIRECTIONS.find(d => d.code === summary.dominantDirection);
  const dispDir = CARDINAL_DIRECTIONS.find(d => d.code === summary.displacementDirection);

  const renderArrowSVG = () => {
    const arrowDeg = summary.displacementAzimuthDegrees ?? 0;
    const hasDisplacement = summary.displacementDirection !== null;
    return (
      <svg width="90" height="90" viewBox="0 0 90 90" className="flex-shrink-0">
        <circle cx="45" cy="45" r="40" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <circle cx="45" cy="45" r="25" fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />
        <text x="45" y="12" fill="#64748b" fontSize="10" textAnchor="middle">N</text>
        <text x="78" y="48" fill="#64748b" fontSize="10" textAnchor="middle">E</text>
        <text x="45" y="84" fill="#64748b" fontSize="10" textAnchor="middle">S</text>
        <text x="12" y="48" fill="#64748b" fontSize="10" textAnchor="middle">W</text>
        <circle cx="45" cy="45" r="2" fill="#3b82f6" />
        <text x="45" y="42" fill="#64748b" fontSize="7" textAnchor="middle">观测点</text>
        {summary.centroidStart && summary.centroidEnd && (
          (() => {
            const maxDim = 20;
            const allX = [summary.centroidStart.x, summary.centroidEnd.x, 0];
            const allY = [summary.centroidStart.y, summary.centroidEnd.y, 0];
            const maxAbs = Math.max(...allX.map(Math.abs), ...allY.map(Math.abs), 0.1);
            const scale = maxDim / maxAbs;
            const sx = 45 + summary.centroidStart.x * scale;
            const sy = 45 - summary.centroidStart.y * scale;
            const ex = 45 + summary.centroidEnd.x * scale;
            const ey = 45 - summary.centroidEnd.y * scale;
            return (
              <>
                <circle cx={sx} cy={sy} r="3" fill="#60a5fa" opacity="0.8" />
                <text x={sx} y={sy - 5} fill="#60a5fa" fontSize="7" textAnchor="middle">起点</text>
                <circle cx={ex} cy={ey} r="3" fill="#fde047" />
                <text x={ex} y={ey - 5} fill="#fde047" fontSize="7" textAnchor="middle">终点</text>
                <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="#fde047" strokeWidth="1.5" strokeDasharray="2 2" />
              </>
            );
          })()
        )}
        {hasDisplacement && (
          <g transform={`rotate(${arrowDeg} 45 45)`}>
            <line x1="45" y1="68" x2="45" y2="22" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="45,14 39,26 51,26" fill="#fde047" />
          </g>
        )}
      </svg>
    );
  };

  const renderMiniChart = () => {
    if (records.length < 2) return null;
    const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp);
    const maxDist = Math.max(...sorted.map(r => r.estimatedDistanceKm), 1);
    const width = 280;
    const height = 80;
    const padX = 20;
    const padY = 10;

    const points = sorted.map((r, i) => {
      const x = padX + (i / (sorted.length - 1)) * (width - padX * 2);
      const y = padY + (1 - r.estimatedDistanceKm / maxDist) * (height - padY * 2);
      return { x, y, dist: r.estimatedDistanceKm, time: r.timestamp };
    });

    const getColor = (dist: number) => {
      const lvl = dist <= 1 ? '#ef4444' : dist <= 3 ? '#fb923c' : dist <= 8 ? '#facc15' : '#4ade80';
      return lvl;
    };

    return (
      <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/40">
        <div className="text-xs text-slate-400 mb-2">📊 距离变化趋势</div>
        <svg width={width} height={height} className="w-full">
          <line x1={padX} y1={height / 2} x2={width - padX} y2={height / 2} stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />
          <polyline
            points={points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#60a5fa"
            strokeWidth="2"
          />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill={getColor(p.dist)} />
            </g>
          ))}
          <text x={padX} y={height - 1} fill="#64748b" fontSize="9">{maxDist.toFixed(0)}km</text>
          <text x={padX} y={padY + 6} fill="#64748b" fontSize="9">近</text>
          <text x={width - padX} y={padY + 6} fill="#64748b" fontSize="9" textAnchor="end">远</text>
        </svg>
      </div>
    );
  };

  return (
    <div className="card p-6 space-y-5">
      <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
        <span className="text-2xl">🧭</span>
        雷雨移动分析
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 flex items-center gap-3">
          {renderArrowSVG()}
          <div className="min-w-0">
            <div className="text-xs text-slate-500 mb-1">位移方向</div>
            {dispDir ? (
              <>
                <div className="text-2xl font-bold text-yellow-400">{dispDir.code}</div>
                <div className="text-sm text-slate-300">{dispDir.label}</div>
                <div className="text-xs text-slate-500">
                  {summary.displacementAzimuthDegrees}° · 移动 {summary.displacementKm}km
                </div>
              </>
            ) : domDir ? (
              <>
                <div className="text-xl font-bold text-slate-300">{domDir.code}</div>
                <div className="text-xs text-slate-400">集中在{domDir.label}</div>
                <div className="text-[10px] text-slate-500">数据不足以计算位移</div>
              </>
            ) : (
              <div className="text-slate-500 text-sm">--</div>
            )}
          </div>
        </div>

        <div className={`rounded-xl p-4 border-2 ${trendConfig[summary.directionTrend].bgColor} ${trendConfig[summary.directionTrend].borderColor}`}>
          <div className="text-xs text-slate-400 mb-1">移动趋势</div>
          <div className={`text-2xl font-bold ${trendConfig[summary.directionTrend].color}`}>
            {trendConfig[summary.directionTrend].icon} {trendConfig[summary.directionTrend].label}
          </div>
          {summary.distanceTrend !== null && (
            <div className="text-xs text-slate-400 mt-2">
              距离变化: {summary.distanceTrend > 0 ? '+' : ''}{summary.distanceTrend} km
            </div>
          )}
          {summary.averageDistanceKm !== null && (
            <div className="text-xs text-slate-400 mt-1">
              平均距离: {summary.averageDistanceKm} km
            </div>
          )}
        </div>
      </div>

      {renderMiniChart()}

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <div className="text-3xl font-extrabold text-storm-400">{summary.totalFlashes}</div>
          <div className="text-xs text-slate-400 mt-1">闪电总数</div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <div className="text-3xl font-extrabold text-purple-400">
            {records.length > 0 ? CARDINAL_DIRECTIONS[Math.round((latest?.lightningAzimuth ?? 0) / 22.5) % 16].code : '--'}
          </div>
          <div className="text-xs text-slate-400 mt-1">最新方位</div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <div className="text-3xl font-extrabold text-orange-400">
            {summary.lastActivityMinutesAgo !== null
              ? summary.lastActivityMinutesAgo < 1
                ? '<1'
                : summary.lastActivityMinutesAgo
              : '--'}
          </div>
          <div className="text-xs text-slate-400 mt-1">分钟前活跃</div>
        </div>
      </div>

      {records.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 rounded-xl p-4 border border-slate-700/50">
          <div className="text-sm font-semibold text-slate-200 mb-3">📋 分析总结</div>
          <div className="text-sm text-slate-300 space-y-2 leading-relaxed">
            {summary.directionTrend === 'approaching' && (
              <p className="text-red-300">
                ⚠️ <strong>雷雨正在逼近！</strong>
                {dispDir
                  ? `整体向${dispDir.label}方向移动（位移约 ${summary.displacementKm}km），`
                  : domDir ? `主要集中在${domDir.label}方向，` : ''}
                {summary.averageDistanceKm !== null && `当前平均距离${summary.averageDistanceKm}公里，`}
                距离观测点越来越近，请保持高度警惕！
              </p>
            )}
            {summary.directionTrend === 'receding' && (
              <p className="text-emerald-300">
                ✅ 雷雨正在远去。
                {dispDir
                  ? `整体向${dispDir.label}方向移动（位移约 ${summary.displacementKm}km），`
                  : domDir ? `主要集中在${domDir.label}方向，` : ''}
                距离正在增加，风险逐渐降低。
              </p>
            )}
            {summary.directionTrend === 'stationary' && (
              <p className="text-blue-300">
                🔄 雷雨位置基本稳定。
                {dispDir
                  ? `前段到后段整体仅向${dispDir.label}方向偏移约 ${summary.displacementKm}km，`
                  : ''}
                {domDir && summary.averageDistanceKm !== null
                  ? `主要活动于${domDir.label}方向约 ${summary.averageDistanceKm} 公里处，`
                  : ''}
                暂时没有明显移动迹象。
              </p>
            )}
            {summary.directionTrend === 'unclear' && (
              <p className="text-slate-400">
                📝 正在收集数据中。
                请继续记录更多闪电观测（至少 2 次）以生成位移和趋势分析。
              </p>
            )}
            {latest && (latest.riskLevel === 'extreme' || latest.riskLevel === 'danger') && (
              <p className={`${RISK_CONFIG[latest.riskLevel].color} font-semibold`}>
                🚨 最近一次闪电距离仅 {latest.estimatedDistanceKm} km，
                {RISK_CONFIG[latest.riskLevel].advice}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovementPanel;
