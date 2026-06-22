import { useTacticsStore } from '@/store/useTacticsStore';
import type { Tool } from '@/types';
import {
  MousePointer2,
  Shield,
  Target,
  Disc3,
  Route,
  Zap,
} from 'lucide-react';

interface ToolButtonProps {
  tool: Tool;
  icon: React.ReactNode;
  label: string;
  color: string;
}

function ToolButton({ tool, icon, label, color }: ToolButtonProps) {
  const { currentTool, setTool } = useTacticsStore();
  const isActive = currentTool === tool;

  return (
    <button
      onClick={() => setTool(tool)}
      className="relative flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-all duration-200 group"
      style={{
        background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
        border: isActive ? `2px solid ${color}` : '2px solid transparent',
        boxShadow: isActive ? `0 0 15px ${color}40` : 'none',
      }}
    >
      <span
        className="mb-1 transition-transform duration-200 group-hover:scale-110"
        style={{ color: isActive ? color : 'rgba(255,255,255,0.7)' }}
      >
        {icon}
      </span>
      <span
        className="text-xs font-medium"
        style={{
          color: isActive ? color : 'rgba(255,255,255,0.6)',
          fontFamily: "'Rajdhani', sans-serif",
        }}
      >
        {label}
      </span>
      {isActive && (
        <span
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: color }}
        />
      )}
    </button>
  );
}

export default function Toolbar() {
  const { play, setRouteDrawingPlayer, routeDrawingPlayerId } = useTacticsStore();

  const selectedPlayer = play.players.find((p) => p.id === routeDrawingPlayerId);

  return (
    <div className="flex flex-col items-center py-4 px-2 bg-[#121a16] border-r border-[#1e2d24]">
      <div
        className="text-sm font-bold mb-4 tracking-wider"
        style={{
          color: 'rgba(255,255,255,0.5)',
          fontFamily: "'Rajdhani', sans-serif",
        }}
      >
        工具栏
      </div>

      <div className="flex flex-col gap-1">
        <ToolButton
          tool="select"
          icon={<MousePointer2 size={22} />}
          label="选择"
          color="#888"
        />
        <ToolButton
          tool="offense"
          icon={<Target size={22} />}
          label="进攻"
          color="#ff6b35"
        />
        <ToolButton
          tool="defense"
          icon={<Shield size={22} />}
          label="防守"
          color="#0077b6"
        />
        <ToolButton
          tool="disc"
          icon={<Disc3 size={22} />}
          label="飞盘"
          color="#ffd60a"
        />
      </div>

      <div className="w-full h-px bg-[#1e2d24] my-3" />

      <div className="flex flex-col gap-1">
        <ToolButton
          tool="route"
          icon={<Route size={22} />}
          label="路线"
          color="#38b000"
        />
        <ToolButton
          tool="fake"
          icon={<Zap size={22} />}
          label="假动作"
          color="#d00000"
        />
      </div>

      {selectedPlayer && (
        <div
          className="mt-4 px-2 py-2 rounded text-xs text-center"
          style={{
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.7)',
            fontFamily: "'Roboto Mono', monospace",
          }}
        >
          正在编辑:<br />
          <span style={{ color: selectedPlayer.type === 'offense' ? '#ff6b35' : '#0077b6' }}>
            {selectedPlayer.label}
          </span>
        </div>
      )}
    </div>
  );
}
