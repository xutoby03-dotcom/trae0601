import type { MoonPhase } from '@/types';

interface Props {
  phase: MoonPhase;
  illumination: number;
  size?: number;
}

export default function MoonPhaseView({ phase, illumination, size = 140 }: Props) {
  const progress: Record<MoonPhase, number> = {
    new: 0,
    waxing_crescent: 0.125,
    first_quarter: 0.25,
    waxing_gibbous: 0.375,
    full: 0.5,
    waning_gibbous: 0.625,
    last_quarter: 0.75,
    waning_crescent: 0.875,
  };
  const p = progress[phase];
  const r = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #fffef5 0%, #fef3c7 40%, #f59e0b 85%, #92400e 100%)',
          boxShadow: `0 0 ${r * 0.4}px ${r * 0.15}px rgba(251, 191, 36, 0.25), inset -${r * 0.15}px -${r * 0.1}px ${r * 0.4}px rgba(0,0,0,0.2)`,
        }}
      />
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          clipPath: p < 0.5
            ? `inset(0 0 0 ${(0.5 - p) * 2 * 100}%)`
            : `inset(0 ${(p - 0.5) * 2 * 100}% 0 0)`,
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: p < 0.5
              ? `radial-gradient(circle at ${20 + p * 40}% 40%, #0a1628 0%, #050a14 100%)`
              : `radial-gradient(circle at ${80 - (p - 0.5) * 40}% 40%, #0a1628 0%, #050a14 100%)`,
            boxShadow: `inset 0 0 ${r * 0.6}px rgba(0,0,0,0.8)`,
          }}
        />
      </div>
      <div
        className="absolute inset-0 rounded-full pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 40%, rgba(120,80,40,0.3) 0%, transparent 8%),
            radial-gradient(circle at 65% 60%, rgba(120,80,40,0.25) 0%, transparent 5%),
            radial-gradient(circle at 45% 75%, rgba(120,80,40,0.2) 0%, transparent 4%),
            radial-gradient(circle at 70% 30%, rgba(120,80,40,0.22) 0%, transparent 3%)
          `,
        }}
      />
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/60 whitespace-nowrap">
        光照 {illumination}%
      </div>
    </div>
  );
}
