import { useMemo } from 'react';
import StatsCards, { StatsCardData } from '@/components/dashboard/StatsCards';
import { BarChartCard, PieChartCard, LineChartCard, BarChartData, PieChartData, LineChartData } from '@/components/dashboard/Charts';
import { mockTodos, mockMeetings } from '@/data/mockData';
import { PRIORITY_LABELS, STATUS_LABELS, DEPARTMENTS } from '@/types';
import { formatDate } from '@/utils/dateUtils';

export default function DashboardPage() {
  const stats = useMemo<StatsCardData[]>(() => {
    const totalMeetings = mockMeetings.length;
    const totalTodos = mockTodos.length;
    const completedTodos = mockTodos.filter((t) => t.status === 'completed').length;
    const inProgressTodos = mockTodos.filter((t) => t.status === 'in_progress').length;
    const overdueTodos = mockTodos.filter((t) => t.status === 'overdue').length;

    return [
      {
        label: '会议总数',
        value: totalMeetings,
        icon: 'meetings',
        trend: 12,
        trendLabel: '较上月',
        color: 'primary',
      },
      {
        label: '已完成待办',
        value: completedTodos,
        icon: 'completed',
        trend: 8,
        trendLabel: '较上周',
        color: 'success',
      },
      {
        label: '进行中待办',
        value: inProgressTodos,
        icon: 'inProgress',
        trend: -3,
        trendLabel: '较上周',
        color: 'info',
      },
      {
        label: '已逾期待办',
        value: overdueTodos,
        icon: 'overdue',
        trend: -5,
        trendLabel: '较上周',
        color: 'danger',
      },
    ];
  }, []);

  const priorityData = useMemo<PieChartData[]>(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    mockTodos.forEach((t) => {
      counts[t.priority] = (counts[t.priority] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: PRIORITY_LABELS[key as keyof typeof PRIORITY_LABELS],
      value,
    }));
  }, []);

  const statusData = useMemo<PieChartData[]>(() => {
    const counts: Record<string, number> = { pending: 0, in_progress: 0, completed: 0, overdue: 0 };
    mockTodos.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: STATUS_LABELS[key as keyof typeof STATUS_LABELS],
      value,
    }));
  }, []);

  const departmentData = useMemo<BarChartData[]>(() => {
    const counts: Record<string, number> = {};
    DEPARTMENTS.forEach((dept) => {
      counts[dept] = 0;
    });
    mockTodos.forEach((t) => {
      if (counts[t.department] !== undefined) {
        counts[t.department] += 1;
      }
    });
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, []);

  const weeklyTrendData = useMemo<LineChartData[]>(() => {
    const days: LineChartData[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = formatDate(date);
      const dayLabel = `${date.getMonth() + 1}/${date.getDate()}`;
      const created = mockTodos.filter((t) => formatDate(t.createdAt) === dateStr).length;
      const completed = mockTodos.filter((t) => t.completedAt && formatDate(t.completedAt) === dateStr).length;
      days.push({ name: dayLabel, 新增: created, 完成: completed });
    }
    return days;
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">数据看板</h1>
        <p className="text-sm text-gray-500 mt-1">会议与待办数据统计概览</p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartCard
          title="待办优先级分布"
          subtitle="按优先级统计待办数量"
          data={priorityData}
        />
        <PieChartCard
          title="待办状态分布"
          subtitle="按状态统计待办数量"
          data={statusData}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard
          title="各部门待办数量"
          subtitle="按部门统计待办分配情况"
          data={departmentData}
        />
        <LineChartCard
          title="近7日待办趋势"
          subtitle="新增与完成待办数量趋势"
          data={weeklyTrendData}
          lines={[
            { key: '新增', color: '#1e3a5f' },
            { key: '完成', color: '#10b981' },
          ]}
        />
      </div>
    </div>
  );
}
