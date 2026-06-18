import { useEffect, useState } from 'react';
import {
  BarChart3, Package as PackageIcon, AlertTriangle, Clock, Grid3x3, Users,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/StatCard';
import {
  COMPANY_COLORS, formatDateTime, getTimeDiffHours,
} from '../lib/utils';
import type {
  Package, StatsSummary, CompanyStats, AbnormalRecord,
} from 'shared/types.js';

export default function Statistics() {
  const { showToast } = useToast();
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [companyStats, setCompanyStats] = useState<CompanyStats[]>([]);
  const [waitingPackages, setWaitingPackages] = useState<(Package & { isOverdue: boolean })[]>([]);
  const [abnormalRecords, setAbnormalRecords] = useState<AbnormalRecord[]>([]);
  const [tab, setTab] = useState<'waiting' | 'overdue' | 'abnormal'>('waiting');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [sum, comp, wait, abn] = await Promise.all([
        api.getStatsSummary(),
        api.getCompanyStats(),
        api.getPackages({ status: 'waiting' }),
        api.getAbnormalRecords(),
      ]);
      setSummary(sum);
      setCompanyStats(comp);
      setWaitingPackages(wait);
      setAbnormalRecords(abn);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const overdueSorted = [...waitingPackages]
    .filter(p => p.isOverdue)
    .sort((a, b) => getTimeDiffHours(b.createdAt) - getTimeDiffHours(a.createdAt));

  const companyData = companyStats.map(c => ({
    name: c.company,
    value: c.count,
    fill: COMPANY_COLORS[c.company] || '#64748b',
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary-500" />
          数据统计
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">全面了解快递暂存柜的使用情况</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="待取包裹" value={summary?.totalWaiting ?? 0} icon={PackageIcon} color="primary" />
        <StatCard title="超期包裹" value={summary?.totalOverdue ?? 0} icon={Clock} color="rose" />
        <StatCard
          title="柜格占用率"
          value={`${summary?.lockerOccupancy ?? 0}%`}
          icon={Grid3x3}
          color="amber"
        />
        <StatCard title="今日已取" value={summary?.pickedToday ?? 0} icon={Users} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">快递公司分布</h3>
          {loading || companyData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">暂无数据</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={companyData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {companyData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">快递公司包裹数量</h3>
          {loading || companyData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">暂无数据</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={companyData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" name="包裹数" radius={[6, 6, 0, 0]}>
                  {companyData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-3 flex gap-1">
          {[
            { key: 'waiting', label: '未取包裹', count: waitingPackages.length, icon: PackageIcon },
            { key: 'overdue', label: '超期排行', count: overdueSorted.length, icon: Clock },
            { key: 'abnormal', label: '异常记录', count: abnormalRecords.length, icon: AlertTriangle },
          ].map(t => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-card'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20' : 'bg-slate-200'
                }`}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left font-medium">收件人</th>
                <th className="px-6 py-3 text-left font-medium">快递公司</th>
                <th className="px-6 py-3 text-left font-medium">单号</th>
                <th className="px-6 py-3 text-left font-medium">柜格</th>
                <th className="px-6 py-3 text-left font-medium">存放时间</th>
                {tab !== 'abnormal' && <th className="px-6 py-3 text-left font-medium">状态</th>}
                {tab === 'abnormal' && <th className="px-6 py-3 text-left font-medium">异常原因</th>}
                {tab === 'overdue' && <th className="px-6 py-3 text-left font-medium">超期时长</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">加载中...</td></tr>
              ) : (
                (tab === 'waiting' ? waitingPackages :
                 tab === 'overdue' ? overdueSorted :
                 abnormalRecords).map((item: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-slate-800">{item.recipientName}</div>
                      {item.phoneLast4 && (
                        <div className="text-xs text-slate-400 font-mono">****{item.phoneLast4}</div>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className="tag text-white text-xs"
                        style={{ backgroundColor: COMPANY_COLORS[item.company] || '#64748b' }}
                      >
                        {item.company}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-600">
                      {item.trackingNumber}
                    </td>
                    <td className="px-6 py-3.5">
                      {item.lockerCode && (
                        <span className="font-semibold text-primary-500">{item.lockerCode}</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {formatDateTime(item.createdAt)}
                    </td>
                    {tab !== 'abnormal' && (
                      <td className="px-6 py-3.5">
                        {tab === 'overdue' ? (
                          <span className="tag bg-rose-100 text-rose-700">
                            已超期 {Math.floor(getTimeDiffHours(item.createdAt) - 48)} 小时
                          </span>
                        ) : (
                          item.isOverdue ? (
                            <span className="tag bg-rose-100 text-rose-700">已超期</span>
                          ) : (
                            <span className="tag bg-emerald-100 text-emerald-700">待取件</span>
                          )
                        )}
                      </td>
                    )}
                    {tab === 'abnormal' && (
                      <td className="px-6 py-3.5 text-slate-600 max-w-xs">
                        {item.abnormalReason}
                      </td>
                    )}
                    {tab === 'overdue' && (
                      <td className="px-6 py-3.5 text-accent-rose font-semibold">
                        {Math.floor(getTimeDiffHours(item.createdAt) - 48)} 小时
                      </td>
                    )}
                  </tr>
                ))
              )}
              {!loading && (
                (tab === 'waiting' && waitingPackages.length === 0) ||
                (tab === 'overdue' && overdueSorted.length === 0) ||
                (tab === 'abnormal' && abnormalRecords.length === 0)
              ) && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    暂无记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
