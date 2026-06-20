import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Ban,
  Repeat,
  CalendarOff,
  Clock,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { useAppStore } from '@/store/useStore';
import StatsCard from '@/components/StatsCard';
import StatusBadge from '@/components/StatusBadge';
import Timeline from '@/components/Timeline';
import { formatDate, formatDateTime } from '@/utils/dateUtils';
import { INSPECTION_ITEM_LABELS } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { classrooms, inspections, repairs, getDashboardStats } = useAppStore();
  const stats = getDashboardStats();

  const inspectionActivities = inspections.slice(0, 3).map((i) => ({
    id: i.id,
    title: `${i.classroomName} - 巡检完成`,
    description: i.notes || `整体状态：${i.overallStatus === 'normal' ? '正常' : i.overallStatus === 'warning' ? '有预警' : '严重隐患'}`,
    time: formatDateTime(i.createdAt),
    status: 'completed' as const,
    type: 'inspection' as const,
  }));

  const repairActivities = repairs.slice(0, 2).map((r) => {
    const status: 'completed' | 'current' | 'pending' =
      r.status === 'completed' ? 'completed' : r.status === 'in_progress' ? 'current' : 'pending';
    return {
      id: r.id,
      title: `${r.classroomName} - ${r.status === 'completed' ? '维修完成' : r.status === 'in_progress' ? '维修进行中' : '待维修'}`,
      description: r.description,
      time: formatDateTime(r.updatedAt),
      status,
      type: 'repair' as const,
    };
  });

  const recentActivities = [...inspectionActivities, ...repairActivities]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5);

  const problemClassrooms = classrooms.filter(
    (c) => c.status !== 'normal'
  );

  const repeatedHazardList = [
    { classroom: '舞蹈教室 201', item: '翘边', count: 3, lastDate: '2026-06-19' },
    { classroom: '舞蹈教室 301', item: '空调温湿度', count: 2, lastDate: '2026-06-17' },
    { classroom: '舞蹈教室 401', item: '积水', count: 2, lastDate: '2026-06-16' },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">数据看板</h1>
          <p className="text-slate-500 text-sm mt-1">
            舞蹈教室地胶巡检概览，共 {classrooms.length} 间教室
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">最后更新</p>
          <p className="text-sm font-medium text-slate-600">{formatDate(new Date().toISOString())}</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatsCard
          title="待巡检"
          value={stats.pendingInspections}
          subtitle="超过3天未巡检"
          icon={ClipboardList}
          color="teal"
          onClick={() => navigate('/inspections')}
        />
        <StatsCard
          title="停用教室"
          value={stats.suspendedClassrooms}
          subtitle="暂停预约或维修中"
          icon={Ban}
          color="rose"
          onClick={() => navigate('/classrooms')}
        />
        <StatsCard
          title="重复隐患"
          value={stats.repeatedHazards}
          subtitle="连续3次出现"
          icon={Repeat}
          color="amber"
        />
        <StatsCard
          title="课程受影响"
          value={stats.affectedCourses}
          subtitle="预计影响节数"
          icon={CalendarOff}
          color="slate"
        />
        <StatsCard
          title="寿命提醒"
          value={stats.floorLifeWarnings}
          subtitle="6个月内到期"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Problem classrooms */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-800">停用 / 维修中教室</h2>
            </div>
            <button
              onClick={() => navigate('/classrooms')}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5">
            {problemClassrooms.length === 0 ? (
              <p className="text-center text-slate-400 py-8">所有教室正常运行</p>
            ) : (
              <div className="space-y-3">
                {problemClassrooms.map((classroom) => (
                  <div
                    key={classroom.id}
                    onClick={() => navigate(`/classrooms/${classroom.id}`)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <img
                      src={classroom.photos[0]}
                      alt={classroom.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-800 group-hover:text-teal-600 transition-colors">
                          {classroom.name}
                        </h3>
                        <StatusBadge status={classroom.status} type="classroom" size="sm" />
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {classroom.floor}楼 · {classroom.area}㎡ · {classroom.floorBrand.split(' ')[0]}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent activities */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">近期动态</h2>
          </div>
          <div className="p-5">
            <Timeline items={recentActivities} />
          </div>
        </div>
      </div>

      {/* Repeated hazards */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-slate-800">重复隐患TOP</h2>
          </div>
          <span className="text-xs text-slate-400">需重点关注</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  教室
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  隐患项
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  出现次数
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  最近出现
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  趋势
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {repeatedHazardList.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-medium text-slate-700">{item.classroom}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-slate-600">{item.item}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                      {item.count} 次
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-sm">
                    {item.lastDate}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-rose-500">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-medium">上升</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
