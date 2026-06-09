import { useState, useCallback, useRef, useEffect } from 'react';
import { useStore } from '@/store';
import { DeviceIcon, portColor, deviceTypeLabels } from '@/utils/icons';
import type { Device } from '@/types';
import { Play, X, Film, Gamepad2, Music, Tv, Headphones, Radio, BookOpen, Coffee } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Film, Gamepad2, Music, Tv, Headphones, Radio, BookOpen, Coffee,
};

const statusColor: Record<string, string> = {
  online: '#22c55e',
  offline: '#6b7280',
  fault: '#ef4444',
};

const statusLabel: Record<string, string> = {
  online: '在线',
  offline: '离线',
  fault: '故障',
};

const NODE_W = 180;
const NODE_H = 64;

export default function Home() {
  const devices = useStore((s) => s.devices);
  const positions = useStore((s) => s.positions);
  const scenes = useStore((s) => s.scenes);
  const sceneDevices = useStore((s) => s.sceneDevices);
  const activeSceneId = useStore((s) => s.activeSceneId);
  const activateScene = useStore((s) => s.activateScene);
  const updatePosition = useStore((s) => s.updatePosition);
  const getConnections = useStore((s) => s.getConnections);

  const [drag, setDrag] = useState<{ deviceId: string; offsetX: number; offsetY: number } | null>(null);
  const [hovered, setHovered] = useState<{ device: Device; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const connections = getConnections();
  const activeDeviceIds = activeSceneId
    ? sceneDevices.filter((sd) => sd.sceneId === activeSceneId).map((sd) => sd.deviceId)
    : [];

  const getPos = (deviceId: string) => positions.find((p) => p.deviceId === deviceId);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, deviceId: string) => {
      e.preventDefault();
      const pos = getPos(deviceId);
      if (!pos || !svgRef.current) return;
      const pt = svgRef.current.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svgRef.current.getScreenCTM();
      if (!ctm) return;
      const svgPt = pt.matrixTransform(ctm.inverse());
      setDrag({ deviceId, offsetX: svgPt.x - pos.x, offsetY: svgPt.y - pos.y });
    },
    [positions],
  );

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const pt = svgRef.current.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svgRef.current.getScreenCTM();
      if (!ctm) return;
      const svgPt = pt.matrixTransform(ctm.inverse());
      updatePosition(drag.deviceId, svgPt.x - drag.offsetX, svgPt.y - drag.offsetY);
    };
    const onUp = () => setDrag(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [drag, updatePosition]);

  const handleSceneClick = (sceneId: string) => {
    if (activeSceneId === sceneId) {
      useStore.setState({ activeSceneId: null });
    } else {
      activateScene(sceneId);
    }
  };

  return (
    <div className="h-full w-full flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <header
        className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          客厅拓扑图
        </h1>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {devices.length} 台设备
        </span>
      </header>

      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox="0 0 1000 500"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff08" strokeWidth="0.5" />
            </pattern>
            <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
            </filter>
          </defs>
          <rect width="1000" height="500" fill="url(#grid)" />

          {connections.map((conn) => {
            const sp = getPos(conn.sourceDeviceId);
            const tp = getPos(conn.targetDeviceId);
            if (!sp || !tp) return null;
            return (
              <line
                key={conn.id}
                x1={sp.x + NODE_W / 2}
                y1={sp.y + NODE_H / 2}
                x2={tp.x + NODE_W / 2}
                y2={tp.y + NODE_H / 2}
                stroke={portColor(conn.portType)}
                strokeWidth={2}
                strokeDasharray="8 4"
                className="glow-line"
                style={{ animation: 'flow-dash 1s linear infinite' }}
              />
            );
          })}

          {devices.map((device) => {
            const pos = getPos(device.id);
            if (!pos) return null;
            const isActive = activeDeviceIds.includes(device.id);
            return (
              <g
                key={device.id}
                onMouseDown={(e) => handleMouseDown(e, device.id)}
                onMouseEnter={(e) => setHovered({ device, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: drag?.deviceId === device.id ? 'grabbing' : 'grab' }}
              >
                {isActive && (
                  <rect
                    x={pos.x - 4}
                    y={pos.y - 4}
                    width={NODE_W + 8}
                    height={NODE_H + 8}
                    rx={16}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    filter="url(#node-glow)"
                  >
                    <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
                  </rect>
                )}
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={12}
                  fill="#18182299"
                  stroke={isActive ? '#f59e0b' : '#ffffff15'}
                  strokeWidth={isActive ? 2 : 1}
                />
                <foreignObject x={pos.x + 10} y={pos.y + 10} width={36} height={44}>
                  <div
                    className="flex items-center justify-center h-full"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <DeviceIcon type={device.type} size={24} />
                  </div>
                </foreignObject>
                <text x={pos.x + 54} y={pos.y + 28} fill="white" fontSize="13" fontWeight="bold">
                  {device.name}
                </text>
                <text x={pos.x + 54} y={pos.y + 46} fill="#8888a0" fontSize="11">
                  {device.brand}
                </text>
                <circle
                  cx={pos.x + NODE_W - 16}
                  cy={pos.y + 16}
                  r={5}
                  fill={statusColor[device.status]}
                />
              </g>
            );
          })}
        </svg>

        {hovered && (
          <div
            className="card-glass px-3 py-2 text-xs fixed pointer-events-none z-50"
            style={{ left: hovered.x + 12, top: hovered.y + 12, minWidth: 140 }}
          >
            <div className="flex items-center gap-2 mb-1">
              {hovered.device.photoUrl ? (
                <img src={hovered.device.photoUrl} alt={hovered.device.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <DeviceIcon type={hovered.device.type} size={16} />
                </div>
              )}
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {hovered.device.name}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              类型：{deviceTypeLabels[hovered.device.type]}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              状态：{statusLabel[hovered.device.status]}
            </div>
            {hovered.device.remoteLocation && (
              <div style={{ color: 'var(--text-muted)' }}>
                遥控器位置：{hovered.device.remoteLocation}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className="shrink-0 flex gap-3 px-6 py-4 overflow-x-auto"
        style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
      >
        {scenes.map((scene) => {
          const Icon = iconMap[scene.icon] || Play;
          const isActive = activeSceneId === scene.id;
          return (
            <button
              key={scene.id}
              onClick={() => handleSceneClick(scene.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl shrink-0 transition-all"
              style={{
                background: isActive ? 'var(--accent)' : 'var(--bg-card)',
                color: isActive ? '#000' : 'var(--text-primary)',
                border: isActive ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                boxShadow: isActive ? '0 0 20px var(--accent-glow)' : 'none',
              }}
            >
              <Icon size={18} />
              <span className="text-sm font-medium whitespace-nowrap">{scene.name}</span>
              {isActive ? <X size={14} /> : <Play size={14} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
