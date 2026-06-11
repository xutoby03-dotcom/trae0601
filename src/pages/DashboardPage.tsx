import { useMemo } from 'react';
import StatsCards, { StatsCardData } from '@/components/dashboard/StatsCards';
import { BarChartCard, PieChartCard, LineChartCard, BarChartData, PieChartData, LineChartData } from '@/components/dashboard/Charts';
import { useTodoStore } from '@/store/todoStore';
import { STATUS_LABELS, MEETING_TYPE_LABELS, DEPARTMENTS } from '@/types';
import { formatDate } from '@/utils/dateUtils';

export default function DashboardPage() {
  const { todos, meetings } = useTodoStore();

  const stats = useMemo<StatsCardData[]>(() => {
    const totalMeetings = meetings.length;
    const completedTodos = todos.filter((t) => t.status === 'completed').length;
    const inProgressTodos = todos.filter((t) => t.status === 'in_progress').length;
    const overdueTodos = todos.filter((t) => t.status === 'overdue').length;

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
  }, [todos, meetings]);

  const meetingTypeData = useMemo<PieChartData[]>(() => {
    const counts: Record<string, number> = {};
    todos.forEach((t) => {
      const meeting = meetings.find((m) => m.id === t.meetingId);
      if (meeting) {
        counts[meeting.type] = (counts[meeting.type] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: MEETING_TYPE_LABELS[key as keyof typeof MEETING_TYPE_LABELS],
      value,
    }));
  }, [todos, meetings]);

  const statusData = useMemo<PieChartData[]>(() => {
    const counts: Record<string, number> = { pending: 0, in_progress: 0, completed: 0, overdue: 0 };
    todos.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: STATUS_LABELS[key as keyof typeof STATUS_LABELS],
      value,
    }));
  }, [todos]);

  const departmentData = useMemo<BarChartData[]>(() => {
    const counts: Record<string, number> = {};
    DEPARTMENTS.forEach((dept) => {
      counts[dept] = 0;
    });
    todos.forEach((t) => {
      if (t.status === 'overdue' && counts[t.department] !== undefined) {
        counts[t.department] += 1;
      }
    });
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [todos]);

  const weeklyTrendData = useMemo<LineChartData[]>(() => {
    const days: LineChartData[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = formatDate(date);
      const dayLabel = `${date.getMonth() + 1}/${date.getDate()}`;
      const created = todos.filter((t) => formatDate(t.createdAt) === dateStr).length;
      const completed = todos.filter((t) => t.completedAt && formatDate(t.completedAt) === dateStr).length;
      days.push({ name: dayLabel, 新增: created, 完成: completed });
    }
    return days;
  }, [todos]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">数据看板</h1>
        <p className="text-sm text-gray-500 mt-1">会议与待办数据统计概览</p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartCard
          title="会议类型待办分布"
          subtitle="按会议类型统计待办数量"
          data={meetingTypeData}
        />
        <PieChartCard
          title="待办状态分布"
          subtitle="按状态统计待办数量"
          data={statusData}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard
          title="各部门逾期待办数量"
          subtitle="按部门统计逾期待办分配情况"
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
