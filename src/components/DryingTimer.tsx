import { useState } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Clock } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';
import { formatTimeRemaining } from '@/utils/time';
import { useModelStore } from '@/store/useModelStore';

interface DryingTimerProps {
  modelId: string;
  modelName: string;
}

export const DryingTimer = ({ modelId, modelName }: DryingTimerProps) => {
  const timer = useTimer(modelId);
  const { startTimer, pauseTimer, resetTimer, completeTimer, clearTimer } = useModelStore();
  const [showCustom, setShowCustom] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(30);

  const time = timer ? formatTimeRemaining(timer.remaining) : { hours: '00', minutes: '00', seconds: '00' };
  const progress = timer && timer.duration > 0 ? ((timer.duration - timer.remaining) / timer.duration) * 100 : 0;

  const quickPresets = [
    { label: '15分钟', minutes: 15 },
    { label: '30分钟', minutes: 30 },
    { label: '1小时', minutes: 60 },
    { label: '2小时', minutes: 120 },
    { label: '4小时', minutes: 240 },
    { label: '过夜', minutes: 480 },
  ];

  const handleStart = (minutes: number) => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    startTimer(modelId, minutes);
    setShowCustom(false);
  };

  if (!timer || timer.duration === 0) {
    return (
      <div className="bg-studio-card rounded-xl border border-studio-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-studio-text flex items-center gap-2">
            <Clock className="w-5 h-5 text-studio-copper" />
            干燥倒计时
          </h3>
        </div>

        {!showCustom ? (
          <div className="space-y-4">
            <p className="text-sm text-studio-muted mb-4">选择干燥等待时间，计时结束将收到通知</p>
            <div className="grid grid-cols-3 gap-2">
              {quickPresets.map((preset) => (
                <button
                  key={preset.minutes}
                  onClick={() => handleStart(preset.minutes)}
                  className="py-3 px-4 bg-studio-bg hover:bg-studio-copper/20 border border-studio-border hover:border-studio-copper/50 rounded-lg text-studio-text hover:text-studio-copper text-sm font-medium transition-all duration-200"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCustom(true)}
              className="w-full py-2.5 text-studio-muted hover:text-studio-copper text-sm transition-colors"
            >
              + 自定义时间
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-studio-text mb-2">自定义时间（分钟）</label>
              <input
                type="number"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-3 bg-studio-bg border border-studio-border rounded-lg text-studio-text text-center text-2xl font-mono focus:outline-none focus:border-studio-copper transition-colors"
                min="1"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCustom(false)}
                className="flex-1 py-2.5 bg-studio-border text-studio-text rounded-lg font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleStart(customMinutes)}
                className="flex-1 py-2.5 bg-studio-copper hover:bg-studio-copperDark text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                开始计时
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-studio-card rounded-xl border border-studio-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-semibold text-studio-text flex items-center gap-2">
          <Clock className="w-5 h-5 text-studio-copper" />
          干燥倒计时
        </h3>
        <span className="text-sm text-studio-muted">{modelName}</span>
      </div>

      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="#3A3A42"
            strokeWidth="8"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke={timer.remaining === 0 ? '#4D7C5E' : '#D97706'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={553}
            strokeDashoffset={553 - (553 * progress) / 100}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {timer.remaining === 0 ? (
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 text-studio-military mx-auto mb-2" />
              <span className="text-studio-military font-medium">干燥完成!</span>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-0.5 font-mono">
                <span className="text-4xl font-bold text-studio-text">{time.hours}</span>
                <span className="text-3xl text-studio-muted">:</span>
                <span className="text-4xl font-bold text-studio-text">{time.minutes}</span>
                <span className="text-3xl text-studio-muted">:</span>
                <span className="text-4xl font-bold text-studio-text">{time.seconds}</span>
              </div>
              <span className="text-xs text-studio-muted mt-1">
                剩余 {Math.ceil(timer.remaining / 60)} 分钟
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {timer.remaining === 0 ? (
          <button
            onClick={() => clearTimer(modelId)}
            className="flex-1 py-3 bg-studio-military hover:bg-studio-military/80 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            确认完成
          </button>
        ) : (
          <>
            {timer.isRunning ? (
              <button
                onClick={() => pauseTimer(modelId)}
                className="flex-1 py-3 bg-studio-border hover:bg-studio-border/80 text-studio-text rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Pause className="w-4 h-4" />
                暂停
              </button>
            ) : (
              <button
                onClick={() => startTimer(modelId, Math.ceil(timer.remaining / 60))}
                className="flex-1 py-3 bg-studio-copper hover:bg-studio-copperDark text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                继续
              </button>
            )}
            <button
              onClick={() => resetTimer(modelId)}
              className="py-3 px-4 bg-studio-border hover:bg-studio-border/80 text-studio-text rounded-lg font-medium transition-colors"
              title="重置计时器"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
