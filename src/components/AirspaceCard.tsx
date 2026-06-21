import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';
import GlassCard from './GlassCard';
import { useFlightStore } from '@/store/useFlightStore';

const zoneTypeLabels: Record<string, string> = {
  airport: '机场',
  military: '军事',
  government: '政府',
  population: '人口密集',
};

const statusLabel: Record<string, { text: string; color: string; Icon: typeof ShieldCheck }> = {
  safe: { text: '空域安全', color: 'text-[#00E5A0]', Icon: ShieldCheck },
  caution: { text: '空域受限', color: 'text-[#FFB800]', Icon: ShieldQuestion },
  danger: { text: '禁飞区域', color: 'text-[#FF4757]', Icon: ShieldAlert },
};

export default function AirspaceCard() {
  const { airspace } = useFlightStore();
  if (!airspace) return null;

  const { text, color, Icon } = statusLabel[airspace.status];

  return (
    <GlassCard status={airspace.status} delay={100}>
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">空域信息</h3>
          <div className="flex items-center gap-1.5">
            <Icon size={14} className={color} />
            <span className={`text-xs font-mono font-bold ${color}`}>{text}</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs text-white/40">
            <span>限高</span>
            <span className="font-mono text-white/80">
              {airspace.altitudeLimit > 0 ? `${airspace.altitudeLimit}m` : '完全禁飞'}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                airspace.altitudeLimit === 0
                  ? 'w-0 bg-[#FF4757]'
                  : airspace.altitudeLimit < 100
                    ? 'bg-[#FFB800]'
                    : 'bg-[#00E5A0]'
              }`}
              style={{ width: `${Math.min(100, (airspace.altitudeLimit / 300) * 100)}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {airspace.noFlyZones.map((zone, i) => (
            <div key={i} className="flex items-center justify-between rounded-md bg-white/[0.03] px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#FF4757] animate-pulse" />
                <span className="text-xs text-white/70">{zone.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-white/40">
                  {zoneTypeLabels[zone.type]}
                </span>
                <span className="text-xs font-mono text-white/50">{zone.radius / 1000}km</span>
              </div>
            </div>
          ))}
        </div>

        {airspace.distanceToNearestZone > 0 && (
          <div className="mt-3 text-xs text-white/30">
            距最近禁飞区 <span className="font-mono text-white/50">{(airspace.distanceToNearestZone / 1000).toFixed(1)}km</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
