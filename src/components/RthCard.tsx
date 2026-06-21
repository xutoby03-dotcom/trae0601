import { Home, Navigation } from 'lucide-react';
import GlassCard from './GlassCard';
import { useFlightStore } from '@/store/useFlightStore';

export default function RthCard() {
  const { rth } = useFlightStore();
  if (!rth) return null;

  return (
    <GlassCard delay={300}>
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Home size={14} className="text-[#00E5A0]/70" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">返航与备降</h3>
        </div>

        <div className="mb-3 rounded-md border border-[#00E5A0]/10 bg-[#00E5A0]/[0.04] px-3 py-2">
          <div className="mb-1 text-[10px] text-[#00E5A0]/60">返航点</div>
          <div className="text-sm font-mono text-white/80">{rth.homePoint.name}</div>
          <div className="text-[10px] font-mono text-white/30">
            {rth.homePoint.lat.toFixed(4)}, {rth.homePoint.lng.toFixed(4)}
          </div>
        </div>

        <div className="space-y-2">
          {rth.alternatives.map((alt, i) => (
            <div key={i} className="flex items-center justify-between rounded-md bg-white/[0.03] px-3 py-2">
              <div>
                <div className="text-xs text-white/70">{alt.name}</div>
                <div className="text-[10px] font-mono text-white/25">{alt.location.lat.toFixed(4)}, {alt.location.lng.toFixed(4)}</div>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Navigation size={12} className="rotate-45 text-white/20" />
                <span className="font-mono">{alt.distance}m</span>
                <span className="text-white/20">{alt.direction}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
