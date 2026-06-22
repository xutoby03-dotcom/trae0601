import { useTacticsStore } from '@/store/useTacticsStore';
import type { Route, Player } from '@/types';
import { pathToSvgD } from '@/utils/pathCalculations';

interface RoutePathProps {
  route: Route;
  player: Player;
  scale: number;
  progress: number;
}

export default function RoutePath({ route, player, scale, progress }: RoutePathProps) {
  const { selectedId, setSelected } = useTacticsStore();
  const isSelected = selectedId === route.id;

  const d = pathToSvgD(player.startPosition, route.keyframes, scale);

  const totalLength = (() => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    try {
      return path.getTotalLength();
    } catch {
      return 1000;
    }
  })();

  const dashOffset = totalLength * (1 - Math.min(progress, 1));

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(route.id, 'route');
  };

  return (
    <g className="route-path" onClick={handleClick}>
      <path
        d={d}
        fill="none"
        stroke={route.color}
        strokeWidth={0.6 * scale}
        strokeOpacity="0.3"
        strokeDasharray="3,3"
      />

      <path
        d={d}
        fill="none"
        stroke={route.color}
        strokeWidth={1.2 * scale}
        strokeOpacity="0.9"
        strokeLinecap="round"
        strokeDasharray={totalLength}
        strokeDashoffset={dashOffset}
        style={{
          filter: `drop-shadow(0 0 ${2 * scale}px ${route.color}40)`,
        }}
      />

      {route.keyframes.map((kf, idx) => {
        const isPast = progress >= kf.time / (route.keyframes[route.keyframes.length - 1]?.time || 1);
        return (
          <circle
            key={kf.id}
            cx={kf.position.x * scale}
            cy={kf.position.y * scale}
            r={isSelected ? 0.8 * scale : 0.5 * scale}
            fill={isPast ? route.color : '#ffffff'}
            stroke={route.color}
            strokeWidth={1.5}
            style={{
              cursor: 'pointer',
              filter: isSelected ? `drop-shadow(0 0 ${3 * scale}px ${route.color})` : 'none',
            }}
          />
        );
      })}

      {route.keyframes.length > 0 && (
        <polygon
          points={(() => {
            const lastKf = route.keyframes[route.keyframes.length - 1];
            const prevKf = route.keyframes.length > 1
              ? route.keyframes[route.keyframes.length - 2]
              : { position: player.startPosition };
            const angle = Math.atan2(
              lastKf.position.y - prevKf.position.y,
              lastKf.position.x - prevKf.position.x,
            );
            const size = 1.5 * scale;
            const x = lastKf.position.x * scale;
            const y = lastKf.position.y * scale;
            const p1 = `${x + Math.cos(angle) * size},${y + Math.sin(angle) * size}`;
            const p2 = `${x + Math.cos(angle + 2.5) * size * 0.6},${y + Math.sin(angle + 2.5) * size * 0.6}`;
            const p3 = `${x + Math.cos(angle - 2.5) * size * 0.6},${y + Math.sin(angle - 2.5) * size * 0.6}`;
            return `${p1} ${p2} ${p3}`;
          })()}
          fill={route.color}
          opacity="0.9"
        />
      )}
    </g>
  );
}
