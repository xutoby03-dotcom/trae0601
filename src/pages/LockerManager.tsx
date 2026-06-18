import { useEffect, useState } from 'react';
import { Grid3x3, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import LockerGrid from '../components/LockerGrid';
import StatCard from '../components/StatCard';
import type { Locker, StatsSummary } from 'shared/types.js';

export default function LockerManager() {
  const { showToast } = useToast();
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [lks, sum] = await Promise.all([
        api.getLockers(),
        api.getStatsSummary(),
      ]);
      setLockers(lks);
      setSummary(sum);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function toggleLocker(l: Locker) {
    const newStatus = l.status === 'free' ? 'disabled' : l.status === 'disabled' ? 'free' : l.status;
    if (newStatus === l.status) return;
    if (l.status === 'occupied') {
      showToast('占用中的柜格无法修改状态', 'warning');
      return;
    }
    try {
      await api.updateLocker(l.id, newStatus);
      showToast(`柜格 ${l.code} 状态已更新`, 'success');
      loadData();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  }

  const occupancyRate = summary?.lockerOccupancy ?? 0;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Grid3x3 className="w-6 h-6 text-primary-500" />
          柜格管理
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">查看所有柜格状态，点击空闲柜格可启用/禁用</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="总柜格数"
          value={summary?.totalLockers ?? 0}
          icon={Grid3x3}
          color="primary"
        />
        <StatCard
          title="已占用"
          value={summary?.occupiedLockers ?? 0}
          icon={Grid3x3}
          color="rose"
        />
        <StatCard
          title="空闲可用"
          value={summary?.freeLockers ?? 0}
          icon={Grid3x3}
          color="emerald"
        />
        <StatCard
          title="占用率"
          value={`${occupancyRate}%`}
          icon={Grid3x3}
          color={occupancyRate >= 90 ? 'amber' : 'sky'}
        />
      </div>

      {occupancyRate >= 90 && (
        <div className="p-4 rounded-xl bg-accent-amber/10 border border-accent-amber/30 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-accent-amber shrink-0" />
          <div>
            <p className="font-semibold text-accent-amber">柜格即将占满</p>
            <p className="text-sm text-accent-amber/80">当前占用率 {occupancyRate}%，请提醒员工尽快取件以释放柜格</p>
          </div>
        </div>
      )}

      <div className="card p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4">柜格布局</h3>
        {loading ? (
          <div className="text-center py-10 text-slate-400">加载中...</div>
        ) : (
          <LockerGrid
            lockers={lockers}
            onSelect={toggleLocker}
          />
        )}
        <div className="mt-4 p-3 rounded-lg bg-slate-50 text-xs text-slate-500">
          💡 提示：点击空闲（绿色）或禁用（灰色）的柜格可切换其启用/禁用状态。占用（红色）的柜格不可操作。
        </div>
      </div>
    </div>
  );
}
