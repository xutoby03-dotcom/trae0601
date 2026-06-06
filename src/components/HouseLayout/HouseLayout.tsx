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
  'bedroom-light-1': { x: 15, y: 15 },
  'bedroom-ac-1': { x: 85, y: 15 },
  'bedroom-curtain-1': { x: 50, y: 80 },
  'bedroom-humidifier-1': { x: 15, y: 50 },
  'kitchen-light-1': { x: 15, y: 15 },
  'kitchen-speaker-1': { x: 85, y: 15 },
  'kitchen-camera-1': { x: 50, y: 75 },
  'bathroom-light-1': { x: 15, y: 15 },
  'bathroom-humidifier-1': { x: 75, y: 75 },
};

export const HouseLayout = () => {
  const { devices, selectDevice, toggleDevice } = useSmartHomeStore();

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl aspect-[850/620]">
        {roomInfo.map((room) => {
          const roomDevices = devices.filter((d) => d.room === room.id);
          const left = (room.x / 850) * 100;
          const top = (room.y / 620) * 100;
          const width = (room.width / 850) * 100;
          const height = (room.height / 620) * 100;

          return (
            <div
              key={room.id}
              className={`absolute rounded-xl border-2 bg-gradient-to-br ${roomColors[room.id]} backdrop-blur-sm transition-all duration-300`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
              }}
            >
              <div className="absolute top-2 left-0 right-0 text-center">
                <span className="text-gray-300 text-sm font-medium">{room.name}</span>
              </div>

              {roomDevices.map((device) => {
                const pos = devicePositions[device.id] || { x: 50, y: 50 };
                const isOn = device.isOn;
                const color = isOn ? '#00ff88' : '#6b7280';

                return (
                  <div
                    key={device.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
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
                      <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">
                        {device.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
