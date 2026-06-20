import {
  Flashlight,
  Lamp,
  Sun,
  CircleDot,
  RectangleHorizontal,
  Trash2,
  RotateCw,
  type LucideIcon,
} from 'lucide-react';
import type { CanvasDevice, DeviceType } from '@/types';
import { DEVICE_TYPE_COLORS, DEVICE_TYPE_LABELS } from '@/types';

const ICONS: Record<DeviceType, LucideIcon> = {
  main_light: Flashlight,
  fill_light: Lamp,
  rim_light: Sun,
  reflector: CircleDot,
  background: RectangleHorizontal,
};

const SHADOW: Record<DeviceType, string> = {
  main_light: 'shadow-device-main',
  fill_light: 'shadow-device-fill',
  rim_light: 'shadow-device-rim',
  reflector: '',
  background: '',
};

interface Props {
  device: CanvasDevice;
  selected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onRotate: (delta: number) => void;
  onRemove: () => void;
}

export default function CanvasDeviceIcon({
  device,
  selected,
  onSelect,
  onDragStart,
  onRotate,
  onRemove,
}: Props) {
  const color = DEVICE_TYPE_COLORS[device.type];
  const Icon = ICONS[device.type];
  const isBg = device.type === 'background';
  const isRef = device.type === 'reflector';

  const stopRotate = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    onRotate(delta);
  };

  return (
    <div
      className={`absolute group ${isBg ? 'pointer-events-none' : ''}`}
      style={{
        left: `${device.x}%`,
        top: `${device.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: selected ? 30 : isBg ? 1 : 10,
      }}
    >
      {!isBg && (
        <svg
          className="absolute pointer-events-none"
          style={{
            width: '120px',
            height: '120px',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) rotate(${device.rotation}deg)`,
          }}
          viewBox="0 0 120 120"
        >
          <line
            x1="60"
            y1="60"
            x2="60"
            y2="4"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray="3 4"
            opacity={selected ? 0.8 : 0.35}
          />
          <polygon
            points="60,4 54,16 66,16"
            fill={color}
            opacity={selected ? 0.9 : 0.5}
          />
        </svg>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onMouseDown={(e) => !isBg && onDragStart(e)}
        className={`relative flex flex-col items-center transition-all duration-200
                   ${isBg ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
                   ${selected ? 'scale-110' : 'hover:scale-105'}`}
      >
        {isBg ? (
          <div
            className="w-64 h-8 rounded-md border-2"
            style={{
              borderColor: color,
              background: `linear-gradient(90deg, ${color}10, ${color}30, ${color}10)`,
              boxShadow: `0 0 30px ${color}20`,
            }}
          >
            <div className="h-full flex items-center justify-center gap-2 px-3">
              <Icon className="w-4 h-4" style={{ color }} />
              <span
                className="text-[11px] font-mono font-medium"
                style={{ color }}
              >
                {device.model.slice(0, 22)}
              </span>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center relative
                         border-2 transition-all
                         ${selected ? 'border-amber-glow ring-2 ring-amber-glow/30' : 'border-studio-700'}
                         ${SHADOW[device.type]}`}
              style={{
                background: `radial-gradient(circle at 35% 35%, ${color}35, ${color}08 70%), #0F172A`,
              }}
            >
              <Icon
                className="w-5 h-5"
                style={{
                  color,
                  filter: selected ? `drop-shadow(0 0 4px ${color})` : 'none',
                }}
              />
              {selected && (
                <span className="absolute inset-0 rounded-full border border-amber-glow animate-pulse-ring" />
              )}
            </div>

            <div
              className={`mt-1.5 text-[10px] px-2 py-0.5 rounded font-medium whitespace-nowrap
                         ${selected ? 'bg-amber-glow text-studio-950' : 'bg-studio-800/90 text-studio-300 border border-studio-700'}`}
            >
              {DEVICE_TYPE_LABELS[device.type]}
              {device.distance ? ` · ${device.distance}m` : ''}
            </div>
          </>
        )}
      </button>

      {selected && !isBg && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-studio-800 border border-studio-700 rounded-lg px-1.5 py-1 opacity-100 transition-opacity z-40">
          <button
            onMouseDown={(e) => stopRotate(e, -15)}
            className="p-1.5 rounded hover:bg-studio-700 text-studio-300 hover:text-amber-glow transition-colors"
            title="逆时针旋转15°"
          >
            <RotateCw className="w-3.5 h-3.5 scale-x-[-1]" />
          </button>
          <div className="text-[10px] font-mono text-studio-400 px-1 min-w-[34px] text-center">
            {device.rotation}°
          </div>
          <button
            onMouseDown={(e) => stopRotate(e, 15)}
            className="p-1.5 rounded hover:bg-studio-700 text-studio-300 hover:text-amber-glow transition-colors"
            title="顺时针旋转15°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-studio-700 mx-0.5" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1.5 rounded hover:bg-alert-dangerBg text-studio-400 hover:text-alert-danger transition-colors"
            title="删除设备"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
