import { useEffect } from 'react';
import { Boxes, CheckCircle2, AlertTriangle, ListTodo, CalendarDays, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store';
import StatCard from '@/components/Dashboard/StatCard';
import PendingList from '@/components/Dashboard/PendingList';
import AnomalyList from '@/components/Dashboard/AnomalyList';
import BatteryReminder from '@/components/Dashboard/BatteryReminder';
import RecentTimeline from '@/components/Dashboard/RecentTimeline';
import { formatDate } from '@/utils/dateUtils';

export default function DashboardPage() {
  const { initData, devices, tasks, isDeviceInspectedThisMonth } = useAppStore();

  useEffect(() => {
    initData();
  }, [initData]);

  const totalDevices = devices.length;

  const inspectedCount = devices.filter((d) => isDeviceInspectedThisMonth(d.id)).length;
  const completionRate = totalDevices > 0
    ? Math.round((inspectedCount / totalDevices) * 100)
    : 0;

  const anomalyDeviceIds = new Set(
    tasks.filter((t) => t.status !== 'done').map((t) => t.device_id),
  );
  const anomalyCount = anomalyDeviceIds.size;

  const pendingTaskCount = tasks.filter((t) => t.status !== 'done').length;

  const today = formatDate(new Date().toISOString());
  const weekdayLabels = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekday = weekdayLabels[new Date().getDay()];
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 6) return '凌晨好';
    if (hour < 12) return '早上好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  })();

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-brand-500" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {greeting}，欢迎回来
                </h1>
              </div>
              <p className="text-gray-500">
                今天是您的设备维护管家，让我们一起确保所有设备安全运行。
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur rounded-full shadow-sm border border-cream-200/60 w-fit">
              <CalendarDays className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-medium text-gray-700">
                {today} {weekday}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="设备总数"
            value={totalDevices}
            icon={Boxes}
            accent="brand"
            trend={{ value: 0, label: '本月' }}
          />
          <StatCard
            title="本月完成率"
            value={`${completionRate}%`}
            icon={CheckCircle2}
            accent="success"
            trend={{ value: completionRate >= 80 ? 5 : completionRate >= 50 ? 0 : -3, label: '较上周' }}
          />
          <StatCard
            title="异常设备数"
            value={anomalyCount}
            icon={AlertTriangle}
            accent="danger"
            trend={{ value: anomalyCount > 0 ? 2 : 0, label: '较上周' }}
          />
          <StatCard
            title="待处理任务"
            value={pendingTaskCount}
            icon={ListTodo}
            accent="warning"
            trend={{ value: pendingTaskCount > 5 ? 1 : 0, label: '较昨日' }}
          />
        </div>

        <div className="md:grid md:grid-cols-3 gap-6 space-y-6 md:space-y-0">
          <div className="md:col-span-2 space-y-6">
            <PendingList />
            <AnomalyList />
          </div>

          <div className="space-y-6">
            <BatteryReminder />
            <RecentTimeline />
          </div>
        </div>
      </div>
    </div>
  );
}
