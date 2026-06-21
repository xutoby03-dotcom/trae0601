import { useMemo } from 'react';
import { useTimeline } from '../../hooks/useTimeline';
import { useWindStore } from '../../store/useWindStore';
import { PlayControls } from './PlayControls';
import { Slider } from '../ui/Slider';
import { getTanglingLevel } from '../../utils/windCalculator';
import { Clock, Wind } from 'lucide-react';

export const TimelineControl = () => {
  const { currentHour, goToHour } = useTimeline();
  const { windData } = useWindStore();

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const timelineMarkers = useMemo(() => [0, 6, 12, 18, 24], []);

  const getHourColor = (hour: number) => {
    const data = windData.hours[hour];
    if (!data) return 'bg-slate-600';
    const tangling = getTanglingLevel(data.tanglingIndex);
    return tangling.color;
  };

  return (
    <div className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Clock size={16} />
            <span className="text-2xl font-bold font-mono">
              {formatHour(currentHour)}
            </span>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {windData.date}
          </div>
        </div>
        
        <PlayControls />

        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Wind size={14} className="text-cyan-400" />
          <span className="font-mono">
            {windData.hours[currentHour]?.windSpeed.toFixed(1)} m/s
          </span>
        </div>
      </div>

      <div className="relative mb-2">
        <div className="flex items-end gap-0.5 h-10 px-1 mb-1">
          {windData.hours.map((data, i) => (
            <div
              key={i}
              className="flex-1 rounded-t transition-all cursor-pointer hover:opacity-80"
              style={{
                height: `${Math.max(10, (data.tanglingIndex / 100) * 100)}%`,
                backgroundColor: i === currentHour 
                  ? '#06b6d4' 
                  : getHourColor(i),
                opacity: i === currentHour ? 1 : 0.5,
                boxShadow: i === currentHour ? '0 0 10px rgba(6, 182, 212, 0.5)' : 'none',
              }}
              onClick={() => goToHour(i)}
              title={`${formatHour(i)} - 缠绕指数: ${data.tanglingIndex.toFixed(0)}`}
            />
          ))}
        </div>
      </div>

      <div className="relative">
        <Slider
          min={0}
          max={23}
          step={1}
          value={currentHour}
          onValueChange={goToHour}
          className="z-10 relative"
        />
        
        <div className="flex justify-between mt-1.5 text-[10px] text-slate-500 font-mono px-1">
          {timelineMarkers.map((h) => (
            <span key={h}>{formatHour(h % 24)}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
