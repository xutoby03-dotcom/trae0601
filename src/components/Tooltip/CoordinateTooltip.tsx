
import { HitPoint, ScreenPoint } from '../../types';

interface CoordinateTooltipProps {
  hitPoint: HitPoint | null;
  screenPoint: ScreenPoint | null;
}

export function CoordinateTooltip({ hitPoint, screenPoint }: CoordinateTooltipProps) {
  if (!hitPoint || !screenPoint) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none tooltip-bubble"
      style={{
        left: screenPoint.x,
        top: screenPoint.y - 10,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="bg-panel glass-panel rounded-lg px-3 py-2 shadow-xl border border-white/10">
        <div className="text-cyan-400 text-xs font-semibold mb-1">三维坐标</div>
        <div className="font-mono text-xs text-white space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-red-400">X:</span>
            <span>{hitPoint.point.x.toFixed(4)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">Y:</span>
            <span>{hitPoint.point.y.toFixed(4)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400">Z:</span>
            <span>{hitPoint.point.z.toFixed(4)}</span>
          </div>
        </div>
      </div>
      <div 
        className="absolute left-1/2 w-0 h-0"
        style={{
          bottom: '-6px',
          transform: 'translateX(-50%)',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid rgba(255, 255, 255, 0.1)'
        }}
      />
    </div>
  );
}
