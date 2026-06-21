import { Sensor as SensorType } from '../../types';
import { Wind, Compass, Volume2 } from 'lucide-react';

interface SensorProps {
  sensor: SensorType;
}

export const Sensor = ({ sensor }: SensorProps) => {
  const getIcon = () => {
    switch (sensor.type) {
      case 'anemometer':
        return <Wind size={14} className="text-cyan-400" />;
      case 'wind_vane':
        return <Compass size={14} className="text-emerald-400" />;
      case 'noise':
        return <Volume2 size={14} className="text-amber-400" />;
    }
  };

  const getColor = () => {
    switch (sensor.type) {
      case 'anemometer':
        return '#06b6d4';
      case 'wind_vane':
        return '#10b981';
      case 'noise':
        return '#f59e0b';
    }
  };

  const color = getColor();

  return (
    <g transform={`translate(${sensor.x}, ${sensor.y})`}>
      <defs>
        <radialGradient id={`sensor-pulse-${sensor.id}`}>
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle
        r="20"
        fill={`url(#sensor-pulse-${sensor.id})`}
        className="animate-ping"
        style={{ animationDuration: '2s' }}
      />

      <circle
        r="12"
        fill="rgba(15, 23, 42, 0.8)"
        stroke={color}
        strokeWidth="1.5"
      />

      <g transform="translate(-7, -7)">
        {getIcon()}
      </g>

      <text
        y="24"
        textAnchor="middle"
        className="text-[9px] font-mono fill-slate-500"
        style={{ pointerEvents: 'none' }}
      >
        {sensor.id.replace('sensor-', 'S')}
      </text>
    </g>
  );
};
