import { useEffect, useState, useMemo } from 'react';
import {
  Package, AlertTriangle, Clock, CheckCircle2, ArrowRight,
  Grid3X3, Users, BarChart3, Snowflake, DollarSign, X,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAppStore } from '../store/appStore';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/StatCard';
import PackageCard from '../components/PackageCard';
import type { Package as PackageType, StatsSummary, Locker } from 'shared/types.js';

type PriorityFilter = 'all' | 'fragile' | 'cold' | 'cod' | 'overdue';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const { setPackages, setLockers, setSummary } = useAppStore();
  const [packages, setLocalPackages] = useState<(PackageType & { isOverdue: boolean })[]>([]);
  const [summary, setLocalSummary] = useState<StatsSummary | null>(null);
  const [lockers, setLocalLockers] = useState<Locker[]>([]);
  const [loading, setLoading] = useState(true);

  const filterRecipient = searchParams.get('recipient') || '';
  const filterCompany = searchParams.get('company') || '';
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

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

  const baseFiltered = useMemo(() => {
    let result = packages;
    if (filterRecipient) {
      result = result.filter(p => p.recipientName === filterRecipient);
    }
    if (filterCompany) {
      result = result.filter(p => p.company === filterCompany);
    }
    return result;
  }, [packages, filterRecipient, filterCompany]);

  const filteredPackages = useMemo(() => {
    let result = baseFiltered;
    if (priorityFilter === 'fragile') result = result.filter(p => p.isFragile);
    else if (priorityFilter === 'cold') result = result.filter(p => p.isColdChain);
    else if (priorityFilter === 'cod') result = result.filter(p => p.isCod);
    else if (priorityFilter === 'overdue') result = result.filter(p => p.isOverdue);
    return result;
  }, [baseFiltered, priorityFilter]);

  const priorityPackages = baseFiltered.filter(
    p => p.isFragile || p.isColdChain || p.isCod || p.isOverdue
  );
  const normalPackages = filteredPackages.filter(
    p => !p.isFragile && !p.isColdChain && !p.isCod && !p.isOverdue
  );
  const priorityFiltered = filteredPackages.filter(
    p => p.isFragile || p.isColdChain || p.isCod || p.isOverdue
  );
  const isFull = summary && summary.freeLockers === 0;

  const fragileCount = packages.filter(p => p.isFragile).length;
  const coldCount = packages.filter(p => p.isColdChain).length;
  const codCount = packages.filter(p => p.isCod).length;
  const overdueCount = packages.filter(p => p.isOverdue).length;

  function clearFilter(key: 'recipient' | 'company') {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    setSearchParams(next);
  }

  const hasActiveFilters = filterRecipient || filterCompany || priorityFilter !== 'all';

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
        <div className="flex flex-col gap-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-slate-800">全部待取</h2>
              <span className="tag bg-slate-100 text-slate-600">
                {hasActiveFilters ? `${filteredPackages.length} / ${packages.length}` : packages.length}
              </span>
            </div>
          </div>

          <div className="card !p-3 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-500 mr-1">快速筛选：</span>
            {[
              { key: 'all' as PriorityFilter, label: '全部', icon: Package, color: 'slate' },
              { key: 'fragile' as PriorityFilter, label: '易碎品', icon: AlertTriangle, color: 'amber', count: fragileCount },
              { key: 'cold' as PriorityFilter, label: '冷链/生鲜', icon: Snowflake, color: 'sky', count: coldCount },
              { key: 'cod' as PriorityFilter, label: '到付件', icon: DollarSign, color: 'rose', count: codCount },
              { key: 'overdue' as PriorityFilter, label: '超期未取', icon: Clock, color: 'rose', count: overdueCount },
            ].map(item => {
              const Icon = item.icon;
              const isActive = priorityFilter === item.key;
              const count = item.count;
              const disabled = item.key !== 'all' && (count ?? 0) === 0;
              const colorMap: Record<string, string> = {
                slate: isActive ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                amber: isActive ? 'bg-amber-500 text-white shadow-amber-200 shadow-md' : 'bg-amber-50 text-amber-700 hover:bg-amber-100',
                sky: isActive ? 'bg-sky-500 text-white shadow-sky-200 shadow-md' : 'bg-sky-50 text-sky-700 hover:bg-sky-100',
                rose: isActive ? 'bg-rose-500 text-white shadow-rose-200 shadow-md' : 'bg-rose-50 text-rose-700 hover:bg-rose-100',
              };
              return (
                <button
                  key={item.key}
                  onClick={() => setPriorityFilter(item.key)}
                  disabled={disabled}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${colorMap[item.color]}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                  {count !== undefined && (
                    <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20' : 'bg-white/60'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="ml-auto flex flex-wrap gap-2">
              {filterRecipient && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-600 text-xs font-medium">
                  收件人：{filterRecipient}
                  <button onClick={() => clearFilter('recipient')} className="hover:bg-primary-500/20 rounded p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterCompany && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-medium">
                  快递公司：{filterCompany}
                  <button onClick={() => clearFilter('company')} className="hover:bg-emerald-500/20 rounded p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setPriorityFilter('all');
                    setSearchParams({});
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1"
                >
                  清除全部
                </button>
              )}
            </div>
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
        ) : filteredPackages.length === 0 ? (
          <div className="card p-10 text-center">
            <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">没有符合筛选条件的包裹</p>
            <button
              onClick={() => { setPriorityFilter('all'); setSearchParams({}); }}
              className="btn-secondary mt-4"
            >
              清除筛选
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {priorityFiltered.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-accent-amber" />
                  <span className="text-sm font-medium text-slate-700">优先标记包裹</span>
                  <span className="tag bg-accent-amber/15 text-accent-amber text-xs">{priorityFiltered.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {priorityFiltered.map(p => (
                    <PackageCard
                      key={p.id}
                      pkg={p}
                      onAction={() => navigate('/pickup', { state: { preselectId: p.id } })}
                      actionLabel="立即处理"
                    />
                  ))}
                </div>
              </div>
            )}
            {normalPackages.length > 0 && (
              <div>
                {priorityFiltered.length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">普通包裹</span>
                    <span className="tag bg-slate-100 text-slate-600 text-xs">{normalPackages.length}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {normalPackages.map(p => (
                    <PackageCard
                      key={p.id}
                      pkg={p}
                      onAction={() => navigate('/pickup', { state: { preselectId: p.id } })}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
