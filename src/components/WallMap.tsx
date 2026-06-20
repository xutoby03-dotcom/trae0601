import React, { useState, useMemo } from 'react';
import { HoldMarker } from './HoldMarker';
import { useHoldStore, useRouteStore } from '@/store';
import type { Hold } from '@/types';
import { Info, AlertTriangle, MapPin } from 'lucide-react';

interface WallMapProps {
  mode?: 'view' | 'patrol' | 'select';
  onHoldClick?: (hold: Hold) => void;
  selectedHoldIds?: string[];
  highlightRouteId?: string | null;
  highlightHoldId?: string | null;
  showGrid?: boolean;
}

export const WallMap: React.FC<WallMapProps> = ({
  mode = 'view',
  onHoldClick,
  selectedHoldIds = [],
  highlightRouteId = null,
  highlightHoldId = null,
  showGrid = true,
}) => {
  const { holds } = useHoldStore();
  const { routes } = useRouteStore();
  const [hoveredHold, setHoveredHold] = useState<Hold | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i <= 10; i++) {
      lines.push(
        <line
          key={`v-${i}`}
          x1={i * 10}
          y1={0}
          x2={i * 10}
          y2={100}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.3"
        />
      );
      lines.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={i * 10}
          x2={100}
          y2={i * 10}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.3"
        />
      );
    }
    return lines;
  }, []);

  const handleHoldClick = (hold: Hold) => {
    if (onHoldClick) {
      onHoldClick(hold);
    }
  };

  const handleHoldHover = (hold: Hold, e: React.MouseEvent) => {
    setHoveredHold(hold);
    const rect = (e.target as SVGElement).getBoundingClientRect();
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
  };

  const getRouteByHold = (hold: Hold) => {
    if (!hold.routeId) return null;
    return routes.find((r) => r.id === hold.routeId);
  };

  const isHighlighted = (hold: Hold) => {
    if (highlightHoldId && hold.id === highlightHoldId) return true;
    if (!highlightHoldId && highlightRouteId && hold.routeId === highlightRouteId) return true;
    if (selectedHoldIds.includes(hold.id)) return true;
    return false;
  };

  const isDimmed = (hold: Hold) => {
    if (highlightHoldId) {
      return hold.id !== highlightHoldId;
    }
    if (highlightRouteId && hold.routeId !== highlightRouteId) return true;
    return false;
  };

  const sortedHolds = useMemo(() => {
    return [...holds].sort((a, b) => {
      if (isHighlighted(a) && !isHighlighted(b)) return 1;
      if (!isHighlighted(a) && isHighlighted(b)) return -1;
      return 0;
    });
  }, [holds, highlightRouteId, highlightHoldId, selectedHoldIds]);

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-white/60 text-sm">
        <MapPin size={16} />
        <span>抱石墙 A 区</span>
      </div>

      {mode === 'patrol' && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full text-sm border border-red-500/30">
          <AlertTriangle size={16} />
          <span>巡场模式</span>
        </div>
      )}

      {mode === 'select' && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-orange-500/20 text-orange-400 px-3 py-1.5 rounded-full text-sm border border-orange-500/30">
          <Info size={16} />
          <span>点击选择岩点</span>
        </div>
      )}

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      >
        <defs>
          <linearGradient id="wallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <pattern id="wallTexture" patternUnits="userSpaceOnUse" width="2" height="2">
            <rect width="2" height="2" fill="url(#wallGradient)" />
            <circle cx="1" cy="1" r="0.3" fill="rgba(255,255,255,0.02)" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width="100" height="100" fill="url(#wallGradient)" />

        {showGrid && gridLines}

        <g className="holds-layer">
          {sortedHolds.map((hold) => (
            <g
              key={hold.id}
              style={{
                opacity: isDimmed(hold) ? 0.3 : 1,
                transition: 'opacity 0.3s ease',
              }}
              onMouseEnter={(e) => handleHoldHover(hold, e)}
              onMouseLeave={() => setHoveredHold(null)}
            >
              <HoldMarker
                hold={hold}
                onClick={handleHoldClick}
                isSelected={isHighlighted(hold)}
                isSelectable={mode !== 'view' || true}
              />
            </g>
          ))}
        </g>
      </svg>

      {hoveredHold && (
        <div
          className="absolute pointer-events-none z-20 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white shadow-xl transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(tooltipPos.x / (typeof window !== 'undefined' ? window.innerWidth : 1000)) * 100}%`,
            top: `${(tooltipPos.y / (typeof window !== 'undefined' ? window.innerHeight : 800)) * 100}%`,
          }}
        >
          <div className="font-medium text-white">
            {getRouteByHold(hoveredHold)?.name || '未分配岩点'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            类型: {hoveredHold.type} | 大小: {hoveredHold.size}
          </div>
          {getRouteByHold(hoveredHold) && (
            <div className="text-xs text-slate-400">
              难度: {getRouteByHold(hoveredHold)?.grade}
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-xs text-white/40">
        <span>共 {holds.length} 个岩点</span>
        <span>{routes.filter((r) => r.status === 'active').length} 条线路开放中</span>
      </div>
    </div>
  );
};
