import React from 'react';
import { useHoldStore, useRouteStore } from '@/store';
import type { Hold } from '@/types';
import { cn } from '@/utils/helpers';

interface HoldMarkerProps {
  hold: Hold;
  onClick?: (hold: Hold) => void;
  isSelected?: boolean;
  isSelectable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  small: 14,
  medium: 20,
  large: 28,
};

export const HoldMarker: React.FC<HoldMarkerProps> = ({
  hold,
  onClick,
  isSelected = false,
  isSelectable = true,
  size = 'md',
}) => {
  const { getRouteById } = useRouteStore();
  const { hasUnresolvedIssue, getIssuesByHold } = useHoldStore();

  const route = hold.routeId ? getRouteById(hold.routeId) : null;
  const hasIssue = hasUnresolvedIssue(hold.id);
  const issues = getIssuesByHold(hold.id);
  const highSeverity = issues.some((i) => i.severity === 'high');

  const holdSize = sizeMap[hold.size];
  const displaySize = size === 'sm' ? holdSize * 0.7 : size === 'lg' ? holdSize * 1.3 : holdSize;

  const fillColor = route ? route.color : '#64748b';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick && isSelectable) {
      onClick(hold);
    }
  };

  return (
    <g
      transform={`translate(${hold.x}, ${hold.y})`}
      onClick={handleClick}
      className={cn(
        'transition-all duration-200',
        isSelectable && 'cursor-pointer',
        isSelected && 'z-10'
      )}
    >
      {hasIssue && (
        <circle
          r={displaySize / 2 + 6}
          fill="none"
          stroke={highSeverity ? '#ef4444' : '#f59e0b'}
          strokeWidth={2}
          className={cn(
            'animate-pulse',
            highSeverity ? 'stroke-red-500' : 'stroke-amber-500'
          )}
        />
      )}

      {isSelected && (
        <circle
          r={displaySize / 2 + 4}
          fill="none"
          stroke="#f97316"
          strokeWidth={3}
          className="drop-shadow-lg"
        />
      )}

      <circle
        r={displaySize / 2}
        fill={fillColor}
        stroke="rgba(0,0,0,0.2)"
        strokeWidth={1}
        className={cn(
          'transition-all duration-200',
          isSelectable && 'hover:scale-110 hover:drop-shadow-lg',
          !route && 'opacity-50'
        )}
        style={{
          filter: route ? 'drop-shadow(1px 2px 2px rgba(0,0,0,0.3))' : 'none',
          transformOrigin: 'center',
        }}
      />

      <circle
        r={displaySize / 2 - displaySize / 6}
        fill="rgba(255,255,255,0.15)"
        cy={-displaySize / 8}
      />

      {hasIssue && (
        <text
          y={displaySize / 2 + 14}
          textAnchor="middle"
          fontSize="10"
          fill={highSeverity ? '#ef4444' : '#f59e0b'}
          fontWeight="bold"
        >
          !
        </text>
      )}
    </g>
  );
};
