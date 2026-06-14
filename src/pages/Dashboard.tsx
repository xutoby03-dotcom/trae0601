import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Calculator,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  HandCoins,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import {
  formatCurrency,
  formatDateTime,
  getShiftLabel,
  getShiftColor,
  getStatusLabel,
  getStatusColor,
} from '@/utils/format';
import type { Handover, OverviewStats } from '../../shared/types';

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  gradient,
  delay,
}: {
  icon: typeof LayoutDashboard;
  label: string;
  value: number | string;
  suffix?: string;
  gradient: string;
  delay: number;
}) {
  const [display, setDisplay] = useState(0);
  const isNumber = typeof value === 'number';

  useEffect(() => {
    if (!isNumber) return;
    const duration = 800;
    const start = performance.now();
    const animate = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round((value as number) * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(animate);
    };
    const timer = setTimeout(() => requestAnimationFrame(animate), delay);
    return () => clearTimeout(timer);
  }, [value, isNumber, delay]);

  return (
    <div
      className="relative bg-white rounded-2xl p-5 border border-warm-200 overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 ${gradient} blur-2xl group-hover:opacity-30 transition-opacity`}
      />
      <div className="relative">
        <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center text-white mb-3`}>
          <Icon size={20} />
        </div>
        <div className="text-sm text-gray-500 mb-1">{label}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-serif font-bold text-gray-900">
            {isNumber ? display : value}
          </span>
          {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { overview, fetchOverview, fetchHandovers, handovers } = useAppStore();
  const [recent, setRecent] = useState<Handover[]>([]);

  useEffect(() => {
    fetchOverview();
    fetch('/api/handovers/recent')
      .then((r) => r.json())
      .then((d) => setRecent(d));
    fetchHandovers();
  }, [fetchOverview, fetchHandovers]);

  const stats: OverviewStats = overview || {
    todayHandovers: 0,
    pendingDifferences: 0,
    weeklyPunctuality: 100,
    totalRegisters: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">今日概览</h1>
          <p className="text-sm text-gray-500 mt-1">实时了解收银台交接情况</p>
        </div>
        <button
          onClick={() => navigate('/handovers/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow"
        >
          <Plus size={18} />
          <span className="font-medium">新建交接</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={HandCoins}
          label="今日交接次数"
          value={stats.todayHandovers}
          suffix="次"
          gradient="bg-gradient-to-br from-primary-400 to-primary-600"
          delay={0}
        />
        <StatCard
          icon={AlertTriangle}
          label="未处理差额"
          value={stats.pendingDifferences}
          suffix="笔"
          gradient="bg-gradient-to-br from-amber-400 to-amber-600"
          delay={100}
        />
        <StatCard
          icon={Clock}
          label="本周准时率"
          value={stats.weeklyPunctuality}
          suffix="%"
          gradient="bg-gradient-to-br from-emerald-400 to-emerald-600"
          delay={200}
        />
        <StatCard
          icon={Calculator}
          label="收银台总数"
          value={stats.totalRegisters}
          suffix="台"
          gradient="bg-gradient-to-br from-sky-400 to-sky-600"
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-warm-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-warm-200">
            <h2 className="font-serif font-semibold text-gray-900">最近交接</h2>
            <button
              onClick={() => navigate('/handovers')}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              查看全部
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-warm-100">
            {recent.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">暂无交接记录</div>
            )}
            {recent.map((h, idx) => {
              const isDanger = h.status === 'danger';
              return (
                <div
                  key={h.id}
                  onClick={() => navigate(`/handovers/${h.id}`)}
                  className={`px-5 py-4 flex items-center gap-4 cursor-pointer transition-colors ${
                    isDanger ? 'animate-pulse-danger hover:bg-red-50' : 'hover:bg-warm-50'
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${getShiftColor(
                      h.shift
                    )}`}
                  >
                    {getShiftLabel(h.shift).charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{h.registerCode}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getShiftColor(h.shift)}`}
                      >
                        {getShiftLabel(h.shift)}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(h.status)}`}
                      >
                        {getStatusLabel(h.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {h.handoverPerson} → {h.successorPerson}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-semibold ${
                        h.difference > 0
                          ? 'text-emerald-600'
                          : h.difference < 0
                          ? 'text-red-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {h.difference > 0 ? '+' : ''}
                      {formatCurrency(h.difference)}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      实点 {formatCurrency(h.actualAmount)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 hidden sm:block">
                    {formatDateTime(h.handoverTime)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-warm-200 p-5">
            <h2 className="font-serif font-semibold text-gray-900 mb-4">快捷操作</h2>
            <div className="space-y-2">
              {[
                { label: '新建收银台', path: '/registers/new', color: 'primary' },
                { label: '登记资金异动', path: '/transactions/new', color: 'amber' },
                { label: '查看统计报表', path: '/statistics', color: 'emerald' },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border border-warm-200 hover:border-${item.color}-300 hover:bg-${item.color}-50 transition-all group`}
                >
                  <span className="font-medium text-gray-700 group-hover:text-gray-900">
                    {item.label}
                  </span>
                  <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 text-white">
            <h3 className="font-serif font-semibold mb-2">使用小贴士</h3>
            <ul className="text-sm text-primary-50 space-y-1.5">
              <li className="flex gap-2">
                <span>✓</span>
                <span>交接前请逐张清点各面额现金</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>有差额时务必详细填写原因</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>交接班人都需要电子签名确认</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
