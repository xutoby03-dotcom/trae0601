import { Flame } from 'lucide-react';
import WorkForm from '@/components/WorkForm';
import WorkList from '@/components/WorkList';
import FurnaceGrid from '@/components/FurnaceGrid';
import TemperatureCurve from '@/components/TemperatureCurve';
import SessionControls from '@/components/SessionControls';
import AddWorkModal from '@/components/AddWorkModal';

export default function Home() {
  return (
    <div className="min-h-screen bg-furnace-deeper">
      <header className="border-b border-furnace-ash/20 bg-furnace-dark/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Flame className="w-7 h-7 text-furnace-glow" />
              <div className="absolute inset-0 blur-md bg-furnace-glow/30 rounded-full" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-amber-50 tracking-wide">
                退火排程工具
              </h1>
              <p className="text-xs text-amber-300/40 -mt-0.5">玻璃工坊 · Annealing Scheduler</p>
            </div>
          </div>
          <div className="text-xs text-amber-300/30 hidden sm:block">
            按 Ctrl+D 收藏此页
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-furnace-dark/60 border border-furnace-ash/20 rounded-xl p-5 backdrop-blur-sm">
              <WorkForm />
            </div>

            <div className="bg-furnace-dark/60 border border-furnace-ash/20 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-amber-400" />
                <h2 className="font-display text-lg font-semibold text-amber-100">当前炉次</h2>
              </div>
              <WorkList />
            </div>

            <div className="bg-furnace-dark/60 border border-furnace-ash/20 rounded-xl p-5 backdrop-blur-sm">
              <SessionControls />
            </div>
          </div>

          <div className="lg:col-span-8 space-y-5">
            <div className="bg-furnace-dark/60 border border-furnace-ash/20 rounded-xl p-5 backdrop-blur-sm glow-pulse">
              <FurnaceGrid />
            </div>

            <div className="bg-furnace-dark/60 border border-furnace-ash/20 rounded-xl p-5 backdrop-blur-sm">
              <TemperatureCurve />
            </div>
          </div>
        </div>
      </main>

      <AddWorkModal />
    </div>
  );
}
