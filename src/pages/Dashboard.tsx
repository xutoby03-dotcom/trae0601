import { useEffect, useState } from 'react';
import {
  Package, AlertTriangle, Clock, CheckCircle2, ArrowRight,
  Grid3X3, Users, BarChart3,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAppStore } from '../store/appStore';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/StatCard';
import PackageCard from '../components/PackageCard';
import type { Package as PackageType, StatsSummary, Locker } from 'shared/types.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setPackages, setLockers, setSummary } = useAppStore();
  const [packages, setLocalPackages] = useState<(PackageType & { isOverdue: boolean })[]>([]);
  const [summary, setLocalSummary] = useState<StatsSummary | null>(null);
  const [lockers, setLocalLockers] = useState<Locker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [pkgs, sum, lks] = await Promise.all([
        api.getPackages({ status: 'waiting' }),
        api.getStatsSummary(),
        api.getLockers(),
      ]);
      setLocalPackages(pkgs);
      setLocalSummary(sum);
      setLocalLockers(lks);
      setPackages(pkgs);
      setSummary(sum);
      setLockers(lks);
    } catch (e: any) {
      showToast(e.message || '加载失败', 'error');
    } finally {
      setLoading(false);
    }
  }

  const priorityPackages = packages.filter(
    p => p.isFragile || p.isColdChain || p.isCod || p.isOverdue
  );
  const normalPackages = packages.filter(
    p => !p.isFragile && !p.isColdChain && !p.isCod && !p.isOverdue
  );
  const isFull = summary && summary.freeLockers === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">首页概览</h1>
          <p className="text-sm text-slate-500 mt-0.5">快递暂存柜实时状态与待取包裹</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/register')} className="btn-primary">
            <Package className="w-4 h-4 inline mr-1.5" /> 登记包裹
          </button>
          <button onClick={() => navigate('/pickup')} className="btn-secondary">
            <CheckCircle2 className="w-4 h-4 inline mr-1.5" /> 去取件
          </button>
        </div>
      </div>

      {isFull && (
        <div className="p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/30 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-accent-rose shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-accent-rose">柜格已满</p>
            <p className="text-sm text-accent-rose/80">所有柜格均已占用，请联系前台尽快腾挪</p>
          </div>
          <button onClick={() => navigate('/lockers')} className="btn-danger !py-2 text-sm">
            查看柜格 <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="待取包裹"
          value={summary?.totalWaiting ?? 0}
          icon={Package}
          color="primary"
          trend={`今日新增 ${summary?.totalToday ?? 0} 件`}
        />
        <StatCard
          title="超期包裹"
          value={summary?.totalOverdue ?? 0}
          icon={Clock}
          color="rose"
          trend="超过48小时未取"
        />
        <StatCard
          title="柜格占用率"
          value={`${summary?.lockerOccupancy ?? 0}%`}
          icon={Grid3X3}
          color={summary && summary.lockerOccupancy >= 90 ? 'amber' : 'emerald'}
          trend={`${summary?.occupiedLockers ?? 0} / ${summary?.totalLockers ?? 0} 已用`}
        />
        <StatCard
          title="今日已取"
          value={summary?.pickedToday ?? 0}
          icon={Users}
          color="sky"
          trend="已成功领取"
        />
      </div>

      {priorityPackages.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-accent-amber" />
            <h2 className="text-lg font-semibold text-slate-800">优先处理</h2>
            <span className="tag bg-accent-amber/15 text-accent-amber">{priorityPackages.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {priorityPackages.slice(0, 6).map(p => (
              <PackageCard
                key={p.id}
                pkg={p}
                onAction={() => navigate('/pickup', { state: { preselectId: p.id } })}
                actionLabel="立即处理"
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-slate-800">全部待取</h2>
            <span className="tag bg-slate-100 text-slate-600">{packages.length}</span>
          </div>
        </div>
        {loading ? (
          <div className="card p-10 text-center text-slate-400">加载中...</div>
        ) : packages.length === 0 ? (
          <div className="card p-10 text-center">
            <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">暂无待取包裹</p>
            <button onClick={() => navigate('/register')} className="btn-primary mt-4">
              登记第一个包裹
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {normalPackages.slice(0, 9).map(p => (
              <PackageCard
                key={p.id}
                pkg={p}
                onAction={() => navigate('/pickup', { state: { preselectId: p.id } })}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
