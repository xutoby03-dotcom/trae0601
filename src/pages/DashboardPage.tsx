import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  Ban,
  Repeat,
  TrendingUp,
  CloudRain,
  AlertTriangle,
  Droplets,
  ChevronRight,
  Building2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAppStore } from '@/store/appStore';
import { StatusBadge } from '@/components/Status/StatusBadge';
import { formatDate } from '@/utils';

export default function DashboardPage() {
  const { facilities, inspections, issues, repairs } = useAppStore();

  // Statistics
  const pendingInspections = inspections.filter((i) => i.status === 'pending').length;
  const outOfServiceFacilities = facilities.filter((f) => f.status === 'out_of_service').length;

  // Find repeated issues (same facility with multiple issues)
  const facilityIssueCounts = issues.reduce((acc, issue) => {
    acc[issue.facilityId] = (acc[issue.facilityId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const repeatedIssues = Object.values(facilityIssueCounts).filter((c) => c >= 2).length;

  // Overall integrity rate
  const normalFacilities = facilities.filter((f) => f.status === 'normal').length;
  const overallRate = facilities.length > 0 ? Math.round((normalFacilities / facilities.length) * 100) : 0;

  // Rain priority: facilities with water logging issues or slide type (outdoor) that haven't been inspected recently
  const rainPriorityFacilities = facilities
    .filter((f) => {
      const hasWaterIssue = issues.some(
        (i) => i.facilityId === f.id && (i.title.includes('雨') || i.title.includes('水') || i.title.includes('湿'))
      );
      const isOutdoor = f.type === 'slide' || f.type === 'swing' || f.type === 'seesaw';
      const lastInsp = f.lastInspectionDate ? new Date(f.lastInspectionDate) : new Date(0);
      const daysSince = Math.floor((Date.now() - lastInsp.getTime()) / (1000 * 60 * 60 * 24));
      return (hasWaterIssue || isOutdoor) && daysSince > 3;
    })
    .slice(0, 5);

  // Area integrity rate data for chart
  const areas = Array.from(new Set(facilities.map((f) => f.area)));
  const areaData = areas.map((area) => {
    const areaFacilities = facilities.filter((f) => f.area === area);
    const normalCount = areaFacilities.filter((f) => f.status === 'normal').length;
    return {
      name: area,
      rate: areaFacilities.length > 0 ? Math.round((normalCount / areaFacilities.length) * 100) : 0,
      count: areaFacilities.length,
    };
  });

  const chartColors = ['#FF8A3D', '#2EC4B6', '#2A9D8F', '#E63946', '#8B5CF6'];

  const statCards = [
    {
      title: '待巡检',
      value: pendingInspections,
      icon: ClipboardCheck,
      bg: 'from-orange-400 to-orange-500',
      link: '/inspections',
      sub: '项任务待执行',
      stagger: 'stagger-1',
    },
    {
      title: '停用设施',
      value: outOfServiceFacilities,
      icon: Ban,
      bg: 'from-red-400 to-red-500',
      link: '/facilities',
      sub: '个设施已停用',
      stagger: 'stagger-2',
    },
    {
      title: '重复问题',
      value: repeatedIssues,
      icon: Repeat,
      bg: 'from-purple-400 to-purple-500',
      link: '/issues',
      sub: '处设施反复出问题',
      stagger: 'stagger-3',
    },
    {
      title: '完好率',
      value: `${overallRate}%`,
      icon: TrendingUp,
      bg: 'from-teal-400 to-teal-500',
      link: '/facilities',
      sub: '设施整体完好率',
      stagger: 'stagger-4',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card p-6 bg-gradient-to-r from-primary-500 via-primary-400 to-secondary-500 text-white border-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <h1 className="font-display text-3xl mb-2">儿童设施安全巡检中心</h1>
          <p className="text-white/90">守护每一个孩子的安全笑脸，让游乐时光无忧无虑</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
            <span>共 {facilities.length} 台设施</span>
            <span>·</span>
            <span>累计巡检 {inspections.length} 次</span>
            <span>·</span>
            <span>处理问题 {issues.length} 个</span>
            <span>·</span>
            <span>完成维修 {repairs.filter((r) => r.status === 'reviewed').length} 次</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              className={`card p-5 block animate-fade-in-up opacity-0 ${card.stagger} relative overflow-hidden group`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.bg} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.bg} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="font-display text-3xl text-gray-800">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rain Priority */}
        <div className="card p-5 lg:col-span-1 animate-fade-in-up opacity-0 stagger-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title !mb-0 flex items-center gap-2 text-xl">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <CloudRain className="w-5 h-5 text-blue-600" />
              </div>
              雨后重点检查
            </h2>
            <span className="badge bg-blue-100 text-blue-700">
              <Droplets className="w-3 h-3 mr-1" />
              {rainPriorityFacilities.length} 项
            </span>
          </div>

          <div className="space-y-2">
            {rainPriorityFacilities.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CloudRain className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无雨后需重点检查的设施</p>
              </div>
            ) : (
              rainPriorityFacilities.map((f) => (
                <Link
                  key={f.id}
                  to={`/facilities/${f.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                >
                  <img src={f.photo} alt={f.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate group-hover:text-primary-600 transition-colors">{f.name}</p>
                    <p className="text-xs text-gray-500 truncate">{f.location}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge type="facility" value={f.status} />
                    <span className="text-xs text-gray-400">{formatDate(f.lastInspectionDate)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Area Chart */}
        <div className="card p-5 lg:col-span-2 animate-fade-in-up opacity-0 stagger-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title !mb-0 flex items-center gap-2 text-xl">
              <div className="w-9 h-9 rounded-xl bg-secondary-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-secondary-600" />
              </div>
              各区域完好率
            </h2>
            <Link to="/facilities" className="text-sm text-primary-600 hover:underline">
              查看全部 →
            </Link>
          </div>

          <div className="h-64">
            {areaData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                暂无数据
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={areaData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => [
                      `${value}%（${props.payload.count}台）`,
                      '完好率',
                    ]}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="rate" radius={[8, 8, 0, 0]} maxBarSize={60}>
                    {areaData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Issues */}
      <div className="card p-5 animate-fade-in-up opacity-0 stagger-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title !mb-0 flex items-center gap-2 text-xl">
            <div className="w-9 h-9 rounded-xl bg-danger-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-danger-600" />
            </div>
            最近问题
          </h2>
          <Link to="/issues" className="text-sm text-primary-600 hover:underline">
            查看全部 →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {issues.slice(-3).reverse().map((issue, idx) => {
            const facility = facilities.find((f) => f.id === issue.facilityId);
            return (
              <div
                key={issue.id}
                className={`p-4 rounded-xl bg-gradient-to-br ${
                  idx === 0
                    ? 'from-red-50 to-orange-50 border border-red-100'
                    : idx === 1
                    ? 'from-yellow-50 to-amber-50 border border-yellow-100'
                    : 'from-gray-50 to-white border border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-gray-800 line-clamp-1">{issue.title}</h3>
                  {issue.level && <StatusBadge type="issue-level" value={issue.level} />}
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {facility?.name || '未知设施'} · {formatDate(issue.reportDate)}
                </p>
                <p className="text-sm text-gray-600 line-clamp-2">{issue.description}</p>
              </div>
            );
          })}
        </div>

        {issues.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无问题记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
