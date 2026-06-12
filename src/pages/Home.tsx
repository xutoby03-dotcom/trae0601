import { useState } from 'react';
import TankProfile from '@/components/TankProfile';
import WaterChangeList from '@/components/WaterChangeList';
import ObservationList from '@/components/ObservationList';
import ReminderPanel from '@/components/ReminderPanel';
import StatsPanel from '@/components/StatsPanel';
import { useFishTankStore } from '@/store/useFishTankStore';

export default function Home() {
  const { tank } = useFishTankStore();
  const [selectedMonth, setSelectedMonth] = useState('all');
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-sky-900 mb-1 flex items-center gap-3">
                <span className="text-4xl">🐠</span>
                {tank.name} · 护理日志
              </h1>
              <p className="text-sky-600">
                {dateStr}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow-sm border border-sky-100">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">实时监控中</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div id="section-tank" className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <TankProfile />
            </div>

            <div id="section-water-change" className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <WaterChangeList
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
            </div>

            <div id="section-observation" className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <ObservationList />
            </div>
          </div>

          <div className="space-y-6">
            <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <ReminderPanel />
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
              <StatsPanel selectedMonth={selectedMonth} />
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-sm text-sky-600/60">
          <p>🫧 用心呵护每一条小鱼 · 数据持久化在本地浏览器</p>
        </footer>
      </div>
    </div>
  );
}
