import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  BarChart3, PieChart as PieIcon, AlertTriangle, CalendarDays, Users, BedDouble,
} from 'lucide-react';
import { statisticsApi } from '@/api/client';
import type { ClassUsage, VacancyRate, Bed } from '#shared/types';

const COLORS = ['#0d9488', '#f97316', '#0ea5e9', '#8b5cf6', '#ef4444', '#84cc16', '#ec4899'];

function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function Statistics() {
  const [classUsage, setClassUsage] = useState<ClassUsage[]>([]);
  const [vacancy, setVacancy] = useState<VacancyRate>({ total: 0, occupied: 0, vacant: 0, rate: 0 });
  const [missed, setMissed] = useState<Bed[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const loadData = async () => {
    const [usage, vac, msd] = await Promise.all([
      statisticsApi.classUsage(dateRange.start || dateRange.end ? { startDate: dateRange.start, endDate: dateRange.end } : undefined),
      statisticsApi.vacancy(),
      statisticsApi.disinfectionMissed(),
    ]);
    setClassUsage(usage);
    setVacancy(vac);
    setMissed(msd);
  };

  useEffect(() => {
    loadData();
  }, []);

  const pieData = [
    { name: '已占用', value: vacancy.occupied, color: '#0d9488' },
    { name: '空床', value: vacancy.vacant, color: '#f97316' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-800 mb-1">统计分析</h1>
          <p className="text-gray-500">床位使用、班级预约、消毒情况一览</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-2xl p-5 animate-slide-up">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Users className="w-4 h-4" />班级预约总数
          </div>
          <p className="text-3xl font-bold font-display text-gray-800">{classUsage.reduce((s, c) => s + c.count, 0)}</p>
          <p className="text-xs text-gray-400 mt-1">{classUsage.length} 个班级</p>
        </div>
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <BedDouble className="w-4 h-4" />今日空床率
          </div>
          <p className="text-3xl font-bold font-display text-accent-600">{vacancy.rate}%</p>
          <p className="text-xs text-gray-400 mt-1">共 {vacancy.total} 张床位，{vacancy.occupied} 张已用</p>
        </div>
        <div className="glass-card rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '120ms' }}>
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <AlertTriangle className="w-4 h-4" />消毒漏检
          </div>
          <p className="text-3xl font-bold font-display text-red-500">{missed.length}</p>
          <p className="text-xs text-gray-400 mt-1">张床位未完成消毒</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SectionCard title="各班预约使用量" icon={BarChart3}>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <CalendarDays className="w-4 h-4" />
            </div>
            <input
              type="date"
              className="input-field !py-1.5 !text-xs w-36"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              placeholder="开始日期"
            />
            <span className="text-gray-400 text-sm">至</span>
            <input
              type="date"
              className="input-field !py-1.5 !text-xs w-36"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              placeholder="结束日期"
            />
            <button onClick={loadData} className="btn-secondary !py-1.5 !px-4 !text-xs">查询</button>
            <button
              onClick={() => { setDateRange({ start: '', end: '' }); setTimeout(loadData, 0); }}
              className="text-sm text-primary-600 hover:underline"
            >重置</button>
          </div>
          {classUsage.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">暂无数据</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classUsage} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="className" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                    formatter={(v: number) => [`${v} 人次`, '预约数']}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="url(#barGradient)">
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0d9488" />
                        <stop offset="100%" stopColor="#5eead4" />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard title="今日床位占用率" icon={PieIcon}>
          {vacancy.total === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">暂无床位数据</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`${v} 张`, '']}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 mt-2 pt-4 border-t border-gray-100">
            <div className="text-center p-3 rounded-2xl bg-primary-50">
              <p className="text-xs text-primary-600">已占用床位</p>
              <p className="text-2xl font-bold font-display text-primary-700">{vacancy.occupied}</p>
            </div>
            <div className="text-center p-3 rounded-2xl bg-accent-50">
              <p className="text-xs text-accent-600">空余床位</p>
              <p className="text-2xl font-bold font-display text-accent-700">{vacancy.vacant}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="消毒漏检床位" icon={AlertTriangle}>
        {missed.length === 0 ? (
          <div className="py-12 text-center text-emerald-600">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center">
              ✅
            </div>
            <p className="font-medium">所有床位均已完成消毒，状态良好！</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">房间/床号</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">铺位</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">当前状态</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">上次消毒</th>
                </tr>
              </thead>
              <tbody>
                {missed.map((bed) => (
                  <tr key={bed.id} className="border-b border-gray-50 hover:bg-red-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-800">{bed.room}室 #{bed.bedNumber}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {bed.bunkType === 'upper' ? '上铺' : '下铺'}
                      {bed.isWindowSide ? ' · 靠窗' : ''}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`tag ${bed.disinfectionStatus === 'expired' ? 'bg-red-100 text-red-700' : 'bg-accent-100 text-accent-700'}`}>
                        <AlertTriangle className="w-3 h-3" />
                        {bed.disinfectionStatus === 'expired' ? '消毒过期' : '待消毒'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {bed.disinfectionDate || '从未消毒'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
