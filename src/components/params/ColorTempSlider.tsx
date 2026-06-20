import { useMemo } from 'react';

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

export default function ColorTempSlider({
  value,
  onChange,
  min = 2000,
  max = 10000,
}: Props) {
  const pct = useMemo(() => ((value - min) / (max - min)) * 100, [value, min, max]);

  const tempToRGB = (k: number): string => {
    const t = k / 100;
    let r = 255,
      g = 255,
      b = 255;
    if (t <= 66) {
      r = 255;
      g = Math.max(0, Math.min(255, 99.47 * Math.log(t) - 161.11));
      b = t <= 19 ? 0 : Math.max(0, Math.min(255, 138.5 * Math.log(t - 10) - 305.04));
    } else {
      r = Math.max(0, Math.min(255, 329.7 * Math.pow(t - 60, -0.133)));
      g = Math.max(0, Math.min(255, 288.1 * Math.pow(t - 60, -0.0755)));
      b = 255;
    }
    return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const v = Math.round(min + x * (max - min));
    onChange(Math.max(min, Math.min(max, v)));
  };

  const presets = [
    { label: '烛光', v: 2000 },
    { label: '钨丝', v: 3200 },
    { label: '暖白', v: 4500 },
    { label: '日光', v: 5500 },
    { label: '闪光灯', v: 6000 },
    { label: '阴天', v: 7500 },
    { label: '冷蓝', v: 9500 },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="section-label !mb-0">色温</span>
          <div
            className="w-4 h-4 rounded-full border border-studio-700"
            style={{ background: tempToRGB(value) }}
          />
        </div>
        <div className="font-mono text-sm text-amber-glow font-semibold">
          {value.toLocaleString()}K
        </div>
      </div>

      <div
        onClick={handleClick}
        className="relative h-7 rounded-md cursor-pointer color-temp-gradient border border-studio-700 overflow-hidden"
      >
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-studio-950 shadow-[0_0_6px_rgba(0,0,0,0.8)]"
          style={{ left: `${pct}%` }}
        >
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-3 h-3 -rotate-45 border-l border-t border-studio-950 bg-amber-glow" />
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-3 -rotate-45 border-r border-b border-studio-950 bg-amber-glow" />
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={50}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-transparent appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-glow
                   [&::-webkit-slider-thumb]:shadow-amber-glow-sm
                   [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-studio-950"
      />

      <div className="flex flex-wrap gap-1 pt-1">
        {presets.map((p) => (
          <button
            key={p.v}
            onClick={() => onChange(p.v)}
            className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors
                       ${
                         Math.abs(value - p.v) < 150
                           ? 'border-amber-glow/70 text-amber-glow bg-amber-glow/10'
                           : 'border-studio-700 text-studio-500 hover:border-studio-600 hover:text-studio-300'
                       }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
