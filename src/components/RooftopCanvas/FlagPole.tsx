import { FlagPole as FlagPoleType, RiskMark, RISK_TYPE_LABELS } from '../../types';
import { getTanglingLevel, degToRad } from '../../utils/windCalculator';
import { getRiskLevel } from '../../utils/riskAssessment';
import { PoleStats } from '../../types';
import { AlertTriangle, ArrowDown, Palette, Move } from 'lucide-react';

interface FlagPoleProps {
  pole: FlagPoleType;
  stats: PoleStats | undefined;
  currentTangling: number;
  windDirection: number;
  isSelected: boolean;
  riskMark?: RiskMark;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export const FlagPole = ({
  pole,
  stats,
  currentTangling,
  windDirection,
  isSelected,
  riskMark,
  onClick,
  onContextMenu,
}: FlagPoleProps) => {
  const risk = stats ? getRiskLevel(stats.riskScore) : getRiskLevel(0);
  const tangling = getTanglingLevel(currentTangling);
  const flagAngle = windDirection;
  const flagSize = 12 + pole.height * 0.8;
  const poleRadius = 6 + pole.height * 0.3;

  const getRiskIcon = () => {
    if (!riskMark) return null;
    switch (riskMark.type) {
      case 'reduce_height':
        return <ArrowDown size={10} />;
      case 'change_material':
        return <Palette size={10} />;
      case 'relocate':
        return <Move size={10} />;
    }
  };

  return (
    <g
      transform={`translate(${pole.x}, ${pole.y})`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      style={{ cursor: 'pointer' }}
      className="transition-transform duration-200 hover:scale-110"
    >
      <defs>
        <radialGradient id={`pole-glow-${pole.id}`}>
          <stop offset="0%" stopColor={risk.color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={risk.color} stopOpacity="0" />
        </radialGradient>
      </defs>

      {isSelected && (
        <circle
          r={poleRadius + 15}
          fill={`url(#pole-glow-${pole.id})`}
          className="animate-pulse"
        />
      )}

      <circle
        r={poleRadius + 8}
        fill={risk.bgColor}
        stroke={risk.color}
        strokeWidth="1.5"
        strokeDasharray={riskMark ? '3 2' : 'none'}
      />

      <circle
        r={poleRadius}
        fill={risk.color}
        stroke="#0f172a"
        strokeWidth="2"
        style={{
          filter: `drop-shadow(0 0 6px ${risk.color})`,
        }}
      />

      <g transform={`rotate(${flagAngle})`}>
        <line
          x1="0"
          y1="0"
          x2={flagSize}
          y2="0"
          stroke={tangling.color}
          strokeWidth="2"
          opacity={1 - currentTangling / 200}
        />
        <path
          d={`M ${flagSize} 0 L ${flagSize + 8} -4 L ${flagSize + 8} 4 Z`}
          fill={tangling.color}
          opacity={1 - currentTangling / 150}
        />
      </g>

      {riskMark && (
        <g transform="translate(12, -12)">
          <circle
            r="8"
            fill="#f59e0b"
            stroke="#0f172a"
            strokeWidth="1.5"
          />
          <g transform="translate(-5, -5)" fill="#0f172a">
            {getRiskIcon()}
          </g>
        </g>
      )}

      <text
        y={poleRadius + 16}
        textAnchor="middle"
        className="text-[10px] font-mono fill-slate-400"
        style={{ pointerEvents: 'none' }}
      >
        {pole.id.replace('pole-', '#')}
      </text>

      {currentTangling > 60 && (
        <g transform="translate(-8, -20)">
          <AlertTriangle size={16} className="text-amber-500 animate-pulse" />
        </g>
      )}

      {isSelected && (
        <circle
          r={poleRadius + 4}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="4 2"
          className="animate-spin"
          style={{ animationDuration: '8s', transformOrigin: 'center' }}
        />
      )}
    </g>
  );
};
