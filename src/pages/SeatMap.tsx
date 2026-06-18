import { BookOpen, VolumeX, AlertTriangle } from 'lucide-react';
import { FloorTabs } from '@/components/FloorTabs';
import { ZoneFilter } from '@/components/ZoneFilter';
import { SeatGrid } from '@/components/SeatGrid';
import { useFeedbackStore } from '@/store/useFeedbackStore';

export default function SeatMap() {
  const { feedbacks } = useFeedbackStore();
  const pendingCount = feedbacks.filter((f) => f.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-teal-800 to-teal-700 text-white py-6 px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">图书馆自习区噪音反馈系统</h1>
                <p className="text-teal-100 text-sm mt-0.5">共同维护安静的学习环境</p>
              </div>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-full animate-pulse">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">{pendingCount} 条待处理</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <FloorTabs />
          <ZoneFilter />
        </div>

        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-slate-100">
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500" />
              <span>安静</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500" />
              <span>有反馈 (1-2次/24h)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span>需关注 (≥3次/24h)</span>
            </div>
            <div className="flex items-center gap-2">
              <VolumeX className="w-4 h-4 text-slate-400" />
              <span>点击座位可提交噪音反馈</span>
            </div>
          </div>
        </div>

        <div className="animate-fadeIn">
          <SeatGrid />
        </div>
      </main>
    </div>
  );
}
