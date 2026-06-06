import { useSmartHomeStore } from '@/store/useSmartHomeStore';
import { roomInfo } from '@/data/initialData';
import type { RoomType } from '@/types';
import {
  Lightbulb,
  Thermometer,
  Blinds,
  Speaker,
  Droplets,
  Camera,
} from 'lucide-react';

const deviceIcons: Record<string, React.ReactNode> = {
  light: <Lightbulb className="w-5 h-5" />,
  ac: <Thermometer className="w-5 h-5" />,
  curtain: <Blinds className="w-5 h-5" />,
  speaker: <Speaker className="w-5 h-5" />,
  humidifier: <Droplets className="w-5 h-5" />,
  camera: <Camera className="w-5 h-5" />,
};

const roomColors: Record<RoomType, string> = {
  living: 'from-cyan-900/40 to-cyan-800/20 border-cyan-500/30',
  bedroom: 'from-purple-900/40 to-purple-800/20 border-purple-500/30',
  kitchen: 'from-amber-900/40 to-amber-800/20 border-amber-500/30',
  bathroom: 'from-teal-900/40 to-teal-800/20 border-teal-500/30',
};

const devicePositions: Record<string, { x: number; y: number }> = {
  'living-light-1': { x: 15, y: 15 },
  'living-ac-1': { x: 85, y: 15 },
  'living-curtain-1': { x: 50, y: 80 },
  'living-speaker-1': { x: 15, y: 50 },
  'living-camera-1': { x: 85, y: 50 },
  'living-humidifier-1': { x: 50, y: 50 },
  'bedroom-light-1': { x: 15, y: 15 },
  'bedroom-ac-1': { x: 85, y: 15 },
  'bedroom-curtain-1': { x: 50, y: 80 },
  'bedroom-humidifier-1': { x: 15, y: 50 },
  'bedroom-speaker-1': { x: 85, y: 50 },
  'bedroom-camera-1': { x: 50, y: 50 },
  'kitchen-light-1': { x: 15, y: 15 },
  'kitchen-ac-1': { x: 85, y: 15 },
  'kitchen-speaker-1': { x: 15, y: 50 },
  'kitchen-camera-1': { x: 85, y: 50 },
  'kitchen-humidifier-1': { x: 50, y: 80 },
  'kitchen-curtain-1': { x: 50, y: 50 },
  'bathroom-light-1': { x: 15, y: 15 },
  'bathroom-ac-1': { x: 85, y: 15 },
  'bathroom-humidifier-1': { x: 15, y: 50 },
  'bathroom-camera-1': { x: 85, y: 50 },
  'bathroom-speaker-1': { x: 50, y: 50 },
  'bathroom-curtain-1': { x: 50, y: 80 },
};

export const HouseLayout = () => {
  const { devices, selectDevice, toggleDevice } = useSmartHomeStore();

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl aspect-[850/620]">
        <div className="absolute inset-0 -m-6 border-4 border-gray-600/80 rounded-[30px] bg-gray-800/20 shadow-2xl" />
        
        <div className="absolute inset-0 -m-3 border-2 border-gray-700/60 rounded-[22px]" />

        <div className="absolute left-[52%] top-[48%] w-[120px] h-[80px] bg-gray-800/40 rounded-lg border border-gray-600/40 flex items-center justify-center">
          <span className="text-gray-500 text-xs font-medium">走廊</span>
        </div>

        <div className="absolute left-[47%] top-[48%] w-[5%] h-[80px] bg-gray-900/80" />
        <div className="absolute left-[60%] top-[48%] w-[5%] h-[80px] bg-gray-900/80" />
        <div className="absolute left-[52%] top-[40%] w-[120px] h-[8%] bg-gray-900/80" />
        <div className="absolute left-[52%] top-[56%] w-[120px] h-[8%] bg-gray-900/80" />

        {roomInfo.map((room) => {
          const roomDevices = devices.filter((d) => d.room === room.id);
          const left = (room.x / 850) * 100;
          const top = (room.y / 620) * 100;
          const width = (room.width / 850) * 100;
          const height = (room.height / 620) * 100;

          return (
            <div
              key={room.id}
              className={`absolute rounded-xl border-2 bg-gradient-to-br ${roomColors[room.id]} backdrop-blur-sm transition-all duration-300 overflow-hidden`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
              }}
            >
              <div className="absolute top-2 left-0 right-0 text-center z-10">
                <span className="text-gray-300 text-sm font-medium bg-gray-900/60 px-3 py-1 rounded-full">
                  {room.name}
                </span>
              </div>

              {room.id === 'living' && (
                <div className="absolute bottom-0 left-[20%] right-[20%] h-3 bg-gray-900/80 rounded-t-lg" />
              )}
              {room.id === 'bedroom' && (
                <div className="absolute bottom-0 left-[40%] right-[40%] h-3 bg-gray-900/80 rounded-t-lg" />
              )}
              {room.id === 'kitchen' && (
                <div className="absolute top-0 left-[30%] right-[30%] h-3 bg-gray-900/80 rounded-b-lg" />
              )}
              {room.id === 'bathroom' && (
                <div className="absolute top-0 left-[50%] right-[20%] h-3 bg-gray-900/80 rounded-b-lg" />
              )}

              {roomDevices.map((device) => {
                const pos = devicePositions[device.id] || { x: 50, y: 50 };
                const isOn = device.isOn;
                const color = isOn ? '#00ff88' : '#6b7280';

                return (
                  <div
                    key={device.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    onClick={() => selectDevice(device)}
                    onDoubleClick={() => toggleDevice(device.id)}
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isOn ? 'shadow-lg shadow-emerald-500/30' : ''
                      }`}
                      style={{
                        backgroundColor: isOn ? 'rgba(0, 255, 136, 0.15)' : 'rgba(107, 114, 128, 0.1)',
                        border: `2px solid ${color}`,
                      }}
                    >
                      <div style={{ color }}>{deviceIcons[device.type]}</div>
                    </div>
                    <div className="text-center mt-1">
                      <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors bg-gray-900/80 px-1.5 py-0.5 rounded">
                        {device.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-gray-500">设备在线</span>
        </div>

        <div className="absolute right-4 bottom-4 text-xs text-gray-600">
          平面图 · 1:100
        </div>
      </div>
    </div>
  );
};
