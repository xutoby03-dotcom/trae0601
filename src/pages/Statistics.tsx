import { useEffect, useMemo } from 'react';
import { useGearStore } from '../stores/useGearStore';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Wrench,
  AlertTriangle,
  Package,
  TrendingUp,
  MapPin,
  User,
  Zap,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { cn } from '../lib/utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function Statistics() {
  const navigate = useNavigate();
  const { fetchAll, summary, gears, records, loading } = useGearStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const damagedGears = useMemo(() => {
    return gears.filter((g) => g.isDamaged || g.status === 'damaged');
  }, [gears]);

  const dryingGears = useMemo(() => {
    return gears.filter((g) => g.status === 'drying');
  }, [gears]);

  const mostBorrowed = useMemo(() => {
    return [...gears].sort((a, b) => b.borrowCount - a.borrowCount).slice(0, 5);
  }, [gears]);

  const chartData = useMemo(() => {
    return {
      labels: mostBorrowed.map((g) => g.name),
      datasets: [
        {
          label: '借出次数',
          data: mostBorrowed.map((g) => g.borrowCount),
          backgroundColor: mostBorrowed.map((_, i) => {
            const colors = [
              'rgba(59, 130, 246, 0.8)',
              'rgba(147, 51, 234, 0.8)',
              'rgba(249, 115, 22, 0.8)',
              'rgba(22, 163, 74, 0.8)',
              'rgba(236, 72, 153, 0.8)',
            ];
            return colors[i % colors.length];
          }),
          borderColor: mostBorrowed.map((_, i) => {
            const colors = [
              'rgb(59, 130, 246)',
              'rgb(147, 51, 234)',
              'rgb(249, 115, 22)',
              'rgb(22, 163, 74)',
              'rgb(236, 72, 153)',
            ];
            return colors[i % colors.length];
          }),
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    };
  }, [mostBorrowed]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#64748b',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#64748b',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  const spareGap = summary?.spareGap || { needed: 2, available: 0 };
  const gap = Math.max(0, spareGap.needed - spareGap.available);
  const progressPercent = spareGap.needed > 0 ? Math.min(100, (spareGap.available / spareGap.needed) * 100) : 0;

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-bottom-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">统计分析</h1>
        <p className="text-slate-500">查看雨具使用数据和统计信息</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">借出频率排行</h2>
              <p className="text-sm text-slate-500">哪件雨具最常被使用</p>
            </div>
          </div>
          
          <div className="h-64">
            {mostBorrowed.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                暂无数据
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            {mostBorrowed.map((gear, index) => (
              <div
                key={gear.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors animate-in fade-in slide-in-from-left-4"
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm',
                  index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-orange-600' : 'bg-slate-300'
                )}>
                  {index + 1}
                </div>
                <img
                  src={gear.photoUrl}
                  alt={gear.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-900">{gear.name}</h3>
                    {gear.borrowCount >= 15 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        <Zap className="w-3 h-3" />
                        高频
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    <User className="w-3 h-3 inline mr-1" />
                    {gear.suitableFor}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{gear.borrowCount}</p>
                  <p className="text-xs text-slate-500">次</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">待维修雨具</h2>
                <p className="text-sm text-slate-500">{damagedGears.length} 件需要维修</p>
              </div>
            </div>

            {damagedGears.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-600">太棒了！所有雨具都完好无损</p>
              </div>
            ) : (
              <div className="space-y-3">
                {damagedGears.map((gear, index) => (
                  <div
                    key={gear.id}
                    className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100 animate-in fade-in slide-in-from-right-4"
                    style={{ animationDelay: `${300 + index * 100}ms` }}
                  >
                    <img
                      src={gear.photoUrl}
                      alt={gear.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-900">{gear.name}</h3>
                        <StatusBadge status={gear.status} />
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {gear.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-red-600">需要维修</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {dryingGears.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">待晾干</h2>
                  <p className="text-sm text-slate-500">{dryingGears.length} 件正在晾干</p>
                </div>
              </div>

              <div className="space-y-3">
                {dryingGears.map((gear, index) => (
                  <div
                    key={gear.id}
                    className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100 animate-in fade-in slide-in-from-right-4"
                    style={{ animationDelay: `${400 + index * 100}ms` }}
                  >
                    <img
                      src={gear.photoUrl}
                      alt={gear.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">{gear.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">晾干后请记得登记入柜</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/lend-return?mode=return&gearId=${gear.id}`)}
                    >
                      登记入柜
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">门口备用雨具缺口</h2>
            <p className="text-sm text-slate-500">根据历史使用情况分析需要的备用数量</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-slate-50 rounded-2xl">
            <p className="text-sm text-slate-500 mb-2">建议备用数量</p>
            <p className="text-4xl font-bold text-blue-600">{spareGap.needed}</p>
            <p className="text-xs text-slate-400 mt-1">基于历史峰值</p>
          </div>
          
          <div className="text-center p-6 bg-slate-50 rounded-2xl">
            <p className="text-sm text-slate-500 mb-2">当前在柜数量</p>
            <p className="text-4xl font-bold text-slate-900">{spareGap.available}</p>
            <p className="text-xs text-slate-400 mt-1">可随时取用</p>
          </div>
          
          <div className="text-center p-6 bg-slate-50 rounded-2xl">
            <p className="text-sm text-slate-500 mb-2">缺口数量</p>
            <p className={cn(
              'text-4xl font-bold',
              gap > 0 ? 'text-red-600' : 'text-green-600'
            )}>
              {gap > 0 ? gap : 0}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {gap > 0 ? '需要补充' : '储备充足'}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">备用储备进度</span>
            <span className="text-sm font-medium text-slate-900">
              {spareGap.available} / {spareGap.needed}
            </span>
          </div>
          <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000',
                gap > 0 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {gap > 0 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">备用雨具不足</p>
              <p className="text-sm text-red-600 mt-1">
                根据最近30天的使用情况，建议在门口备用 {spareGap.needed} 套雨具。
                目前还缺 {gap} 套，建议补充购买，以应对突发降雨天气。
              </p>
              <Button size="sm" className="mt-3" onClick={() => navigate('/archive?action=add')}>
                登记新雨具
              </Button>
            </div>
          </div>
        )}

        {gap === 0 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 font-medium">备用储备充足</p>
              <p className="text-sm text-green-600 mt-1">
                太棒了！门口的备用雨具数量充足，即使遇到突发降雨也能满足需求。
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">总体统计</h2>
            <p className="text-sm text-slate-500">所有雨具的使用情况</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-3xl font-bold text-blue-600">{summary?.totalCount || 0}</p>
            <p className="text-sm text-blue-700 mt-1">雨具总数</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-3xl font-bold text-green-600">{summary?.inCabinetCount || 0}</p>
            <p className="text-sm text-green-700 mt-1">在柜数量</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <p className="text-3xl font-bold text-purple-600">{summary?.lentCount || 0}</p>
            <p className="text-sm text-purple-700 mt-1">借出中</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <p className="text-3xl font-bold text-orange-600">{summary?.overdueCount || 0}</p>
            <p className="text-sm text-orange-700 mt-1">超时未归</p>
          </div>
        </div>

        {records.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-medium text-slate-700 mb-4">最近借出记录</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {[...records].sort((a, b) => new Date(b.lendTime).getTime() - new Date(a.lendTime).getTime()).slice(0, 5).map((record, index) => {
                const gear = gears.find((g) => g.id === record.gearId);
                return (
                  <div
                    key={record.id}
                    className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors animate-in fade-in slide-in-from-left-4"
                    style={{ animationDelay: `${600 + index * 100}ms` }}
                  >
                    {gear && (
                      <img
                        src={gear.photoUrl}
                        alt={gear.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {gear?.name || '未知雨具'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {record.borrower} → {record.destination}
                      </p>
                    </div>
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full',
                      record.status === 'active'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                    )}>
                      {record.status === 'active' ? '借出中' : '已归还'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
