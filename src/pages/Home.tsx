import LocationSearch from '@/components/LocationSearch';
import AirspaceCard from '@/components/AirspaceCard';
import WeatherCard from '@/components/WeatherCard';
import RthCard from '@/components/RthCard';
import BatteryPanel from '@/components/BatteryPanel';
import ShotChecklist from '@/components/ShotChecklist';
import FlightStatus from '@/components/FlightStatus';
import { useFlightStore } from '@/store/useFlightStore';

export default function Home() {
  const { airspace, weather } = useFlightStore();
  const hasData = airspace && weather;

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      <header className="border-b border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00E5A0]/10">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#00E5A0]" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider text-white/90 font-mono">SKYCHECK</h1>
              <p className="text-[10px] text-white/30">无人机起飞前检查系统</p>
            </div>
          </div>
          <div className="w-1/3">
            <LocationSearch />
          </div>
        </div>
      </header>

      {!hasData ? (
        <div className="flex h-[calc(100vh-65px)] flex-col items-center justify-center gap-4 pb-16">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border border-white/5 bg-white/[0.02]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-10 w-10 text-white/10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="absolute -inset-4 animate-ping rounded-full border border-[#00E5A0]/10" style={{ animationDuration: '3s' }} />
          </div>
          <div className="text-center">
            <p className="text-sm text-white/30">输入拍摄地点开始检查</p>
            <p className="mt-1 text-xs text-white/15">支持：北京故宫、上海外滩、深圳湾、成都天府广场、杭州西湖</p>
          </div>
        </div>
      ) : (
        <main className="mx-auto max-w-7xl px-6 py-5 pb-20">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4">
              <AirspaceCard />
              <WeatherCard />
              <RthCard />
            </div>

            <div className="space-y-4">
              <BatteryPanel />
            </div>

            <div className="space-y-4">
              <ShotChecklist />
            </div>
          </div>
        </main>
      )}

      <FlightStatus />
    </div>
  );
}
