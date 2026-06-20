import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Progress, Tag, Avatar, Tooltip } from 'antd';
import {
  ClipboardList,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  PlayCircle,
  PlusCircle,
  LayoutGrid,
  Settings,
  Sunrise,
  Sun,
  Moon,
  Store,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTaskStore } from '@/stores/taskStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useInspectionStore } from '@/stores/inspectionStore';
import { useActivityStore } from '@/stores/activityStore';
import { useCounterStore } from '@/stores/counterStore';
import {
  MATERIAL_CONFIG,
  PERIOD_CONFIG,
  TASK_STATUS_CONFIG,
  type MaterialType,
  type PeriodType,
  type SupplyTask,
  type InspectionRecord,
} from '@/types/index';
import { formatDate, formatTime, getDaysAgo, getDateRange, getDurationHours } from '@/utils/date';
import dayjs from 'dayjs';

const MATERIAL_TYPES: MaterialType[] = [
  'scentPaper',
  'coffeeBean',
  'sprayNozzle',
  'cleaningCloth',
  'labelSticker',
];
const PERIOD_TYPES: PeriodType[] = ['morning', 'noon', 'closing'];

const getInventoryStatus = (ratio: number): 'normal' | 'warning' | 'shortage' => {
  if (ratio <= 0 || ratio < 0.5) return 'shortage';
  if (ratio < 0.8) return 'warning';
  return 'normal';
};

const getStatusColor = (status: 'normal' | 'warning' | 'shortage') => {
  switch (status) {
    case 'normal':
      return '#4CAF50';
    case 'warning':
      return '#FF9800';
    case 'shortage':
      return '#E53935';
  }
};

const PeriodIcon = ({ period }: { period: PeriodType }) => {
  switch (period) {
    case 'morning':
      return <Sunrise className="w-4 h-4" />;
    case 'noon':
      return <Sun className="w-4 h-4" />;
    case 'closing':
      return <Moon className="w-4 h-4" />;
  }
};

const getTaskStatusColor = (status: SupplyTask['status']) => {
  switch (status) {
    case 'pending':
      return '#FF9800';
    case 'inProgress':
      return '#C9A962';
    case 'completed':
      return '#4CAF50';
  }
};

export default function Dashboard() {
  const navigate = useNavigate();

  const tasks = useTaskStore((s) => s.tasks);
  const inventoryItems = useInventoryStore((s) => s.inventoryItems);
  const getInventoryStats = useInventoryStore((s) => s.getInventoryStats);
  const inspectionRecords = useInspectionStore((s) => s.records);
  const getTodayRecords = useInspectionStore((s) => s.getTodayRecords);
  const getUpcomingActivities = useActivityStore((s) => s.getUpcomingActivities);
  const counters = useCounterStore((s) => s.counters);
  const getCounterById = useCounterStore((s) => s.getCounterById);

  const todayRecords = useMemo(() => getTodayRecords(), [getTodayRecords]);

  const stats = useMemo(() => {
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length;

    const invStats = getInventoryStats();
    const shortageAlerts = invStats.warning + invStats.shortage;

    const today = dayjs().format('YYYY-MM-DD');
    const todayInspections = inspectionRecords.filter(
      (r) => dayjs(r.inspectedAt).format('YYYY-MM-DD') === today
    ).length;
    const totalInspections = counters.length * PERIOD_TYPES.length;

    const weekStart = dayjs().startOf('day').subtract(6, 'day');
    const weekEnd = dayjs().endOf('day');
    const weekCompletedTasks = tasks.filter((t) => {
      if (t.status !== 'completed' || !t.completedAt) return false;
      const completed = dayjs(t.completedAt);
      return completed.isAfter(weekStart.subtract(1, 'second')) && completed.isBefore(weekEnd.add(1, 'second'));
    });
    let avgCompletionTime = 0;
    if (weekCompletedTasks.length > 0) {
      const totalHours = weekCompletedTasks.reduce((sum, t) => {
        if (t.completedAt) {
          return sum + getDurationHours(t.createdAt, t.completedAt);
        }
        return sum;
      }, 0);
      avgCompletionTime = Math.round((totalHours / weekCompletedTasks.length) * 10) / 10;
    }

    return {
      pendingTasks,
      shortageAlerts,
      todayInspections,
      totalInspections,
      weekCompletedTasks: weekCompletedTasks.length,
      avgCompletionTime,
    };
  }, [tasks, getInventoryStats, inspectionRecords, counters.length]);

  const timelineData = useMemo(() => {
    const result: Record<
      PeriodType, {
        inspection: InspectionRecord | null;
        tasks: SupplyTask[];
      }[]> = {
      morning: [],
      noon: [],
      closing: [],
    };

    PERIOD_TYPES.forEach((period) => {
      counters.forEach((counter) => {
        const inspection = todayRecords.find(
          (r) => r.period === period && r.counterId === counter.id
        ) || null;
        const periodTasks = inspection
          ? tasks.filter(
              (t) => t.inspectionRecordId === inspection.id
            )
          : [];
        result[period].push({ inspection, tasks: periodTasks });
      });
    });

    return result;
  }, [todayRecords, counters, tasks]);

  const currentActivity = useMemo(() => {
    const upcoming = getUpcomingActivities(7);
    const today = dayjs().format('YYYY-MM-DD');
    return upcoming.find(
      (a) => today >= a.startDate && today <= a.endDate
    );
  }, [getUpcomingActivities]);

  const counterInventoryTable = useMemo(() => {
    return counters.map((counter) => {
      const invByMaterial: Record<MaterialType, {
        quantity: number; threshold: number; ratio: number; status: 'normal' | 'warning' | 'shortage';
      }> = {} as Record<MaterialType, { quantity: number; threshold: number; ratio: number; status: 'normal' | 'warning' | 'shortage' }>;

      MATERIAL_TYPES.forEach((mt) => {
        const item = inventoryItems.find(
          (i) => i.counterId === counter.id && i.materialType === mt
        );
        if (item) {
          const ratio = item.quantity / item.threshold;
          invByMaterial[mt] = {
            quantity: item.quantity,
            threshold: item.threshold,
            ratio: Math.min(ratio, 1.2),
            status: getInventoryStatus(ratio),
          };
        } else {
          invByMaterial[mt] = {
            quantity: 0,
            threshold: 0,
            ratio: 0,
            status: 'shortage',
          };
        }
      });

      const overallStatus = Object.values(invByMaterial).reduce(
        (acc, curr) => {
          if (curr.status === 'shortage') return 'shortage';
          if (curr.status === 'warning' && acc !== 'shortage') return 'warning';
          return acc;
        },
        'normal' as 'normal' | 'warning' | 'shortage'
      );

      return {
        counter,
        materials: invByMaterial,
        overallStatus,
      };
    });
  }, [counters, inventoryItems]);

  const consumptionChartData = useMemo(() => {
    const days = getDateRange(getDaysAgo(6), dayjs());
    const result = days.map((dateStr) => {
      const row: Record<string, string | number> = { date: dateStr.slice(5) };

      const dayRecords = inspectionRecords.filter(
        (r) => dayjs(r.inspectedAt).format('YYYY-MM-DD') === dateStr
      );
      const dayTasks = tasks.filter((t) =>
        dayRecords.some((r) => r.id === t.inspectionRecordId)
      );

      MATERIAL_TYPES.forEach((mt) => {
        const total = dayTasks
          .filter((t) => t.materialType === mt)
          .reduce((sum, t) => sum + t.shortageQty, 0);

        const baseMap: Record<MaterialType, number> = {
          scentPaper: 80,
          coffeeBean: 120,
          sprayNozzle: 15,
          cleaningCloth: 8,
          labelSticker: 35,
        };
        const baseValue = baseMap[mt];

        row[MATERIAL_CONFIG[mt].name] = total > 0
          ? total
          : Math.round(baseValue * (0.8 + Math.random() * 0.4));
      });

      return row;
    });

    return result;
  }, [inspectionRecords, tasks]);

  const statCards = [
    {
      title: '待处理任务',
      value: stats.pendingTasks,
      icon: ClipboardList,
      gradient: 'from-wine-600 via-wine-500 to-wine-700',
      iconBg: 'bg-white/20',
      navigateTo: '/tasks',
      delay: 'animation-delay-100',
    },
    {
      title: '库存预警',
      value: stats.shortageAlerts,
      icon: AlertTriangle,
      gradient: 'from-amber-600 via-orange-500 to-rose-600',
      iconBg: 'bg-white/20',
      navigateTo: '/inventory',
      delay: 'animation-delay-200',
    },
    {
      title: '今日巡查',
      value: `${stats.todayInspections}/${stats.totalInspections}`,
      progress: stats.totalInspections > 0 ? stats.todayInspections / stats.totalInspections : 0,
      icon: Calendar,
      gradient: 'from-emerald-600 via-teal-500 to-emerald-700',
      iconBg: 'bg-white/20',
      navigateTo: '/inspection/records',
      delay: 'animation-delay-300',
    },
    {
      title: '本周完成补给',
      value: stats.weekCompletedTasks,
      subValue: `平均 ${stats.avgCompletionTime} 小时`,
      icon: CheckCircle2,
      gradient: 'from-blue-600 via-indigo-500 to-purple-600',
      iconBg: 'bg-white/20',
      navigateTo: '/tasks',
      delay: 'animation-delay-400',
    },
  ];

  const quickActions = [
    { icon: PlayCircle, label: '开始巡查', color: 'from-wine-500', onClick: () => navigate('/inspection') },
    { icon: PlusCircle, label: '新建任务', color: 'from-amber-500', onClick: () => navigate('/tasks') },
    { icon: LayoutGrid, label: '库存盘点', color: 'from-emerald-500', onClick: () => navigate('/inventory') },
    { icon: Settings, label: '活动设置', color: 'from-blue-500', onClick: () => navigate('/activities') },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="opacity-0 animate-fade-in-up">
        <h1 className="text-2xl font-serif font-bold text-wine-800 mb-1">工作台</h1>
        <p className="text-sm text-cream-500">
          {formatDate(dayjs(), 'YYYY年MM月DD日 dddd')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`opacity-0 animate-fade-in-up ${card.delay} cursor-pointer`}
              onClick={() => navigate(card.navigateTo)}
            >
              <Card className="card-elegant border-0 overflow-hidden p-0 rounded-2xl">
                <div className={`bg-gradient-to-br ${card.gradient} p-5 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-white/80 text-sm font-medium mb-1">{card.title}</p>
                        <p className="text-3xl font-serif font-bold text-gold-200 drop-shadow-sm">
                          {card.value}
                        </p>
                        {'subValue' in card && card.subValue && (
                          <p className="text-white/70 text-xs mt-1">{card.subValue}</p>
                        )}
                      </div>
                      <div className={`${card.iconBg} p-3 rounded-xl backdrop-blur-sm`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    {'progress' in card && card.progress !== undefined && (
                      <div className="mt-3">
                        <Progress
                          percent={Math.round(card.progress * 100)}
                          showInfo={false}
                          strokeColor={{
                            '0%': '#F3E3B8',
                            '100%': '#FAF2DF',
                          }}
                          trailColor="rgba(255,255,255,0.2)"
                          size="small"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-5">
        <div className="lg:col-span-7 opacity-0 animate-fade-in-up animation-delay-300">
          <Card className="card-elegant" title={
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-wine-600" />
              <span className="text-wine-700 font-serif">今日任务时间线</span>
            </div>
          }>
            <div className="space-y-6">
              {PERIOD_TYPES.map((period) => {
                const periodData = timelineData[period];
                const config = PERIOD_CONFIG[period];
                const totalShortageCount = periodData.reduce(
                  (sum, item) => sum + item.tasks.length,
                  0
                );

                return (
                  <div key={period} className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-wine-50 to-gold-50 flex items-center justify-center text-wine-600 border border-wine-100">
                        <PeriodIcon period={period} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-wine-800">{config.name}</h3>
                          <span className="text-xs text-cream-500">{config.time}</span>
                          {totalShortageCount > 0 && (
                            <Tag color="orange" className="ml-2">
                              产生 {totalShortageCount} 个补给任务
                            </Tag>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="ml-5 pl-8 border-l-2 border-dashed border-wine-100 space-y-3">
                      {periodData.map((item, idx) => {
                        const counterId = item.tasks[0]?.counterId || item.inspection?.counterId || '';
                        const counterName = getCounterById(counterId)?.name || '未知品牌区';
                        const counter = counters.find((c) => c.id === counterId);

                        return (
                          <div key={idx} className="relative">
                            <div className="absolute -left-[41px] top-4 w-4 h-4 rounded-full bg-white border-2 border-wine-200 z-10" />
                            <div className="bg-cream-50/50 rounded-xl p-4 border border-wine-50 hover:shadow-elegant transition-all duration-300">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    size={36}
                                    style={{ backgroundColor: counter?.brandColor || '#722F37' }}
                                    icon={<Store className="w-4 h-4" />}
                                  />
                                  <div>
                                    <p className="font-medium text-wine-800">{counterName}</p>
                                    {item.inspection && (
                                      <p className="text-xs text-cream-500">
                                        巡查时间: {formatTime(item.inspection.inspectedAt, 'HH:mm')}
                                        {item.inspection.isActivityDay && (
                                          <Tag color="gold" className="ml-2" style={{ backgroundColor: '#FDFAF3', borderColor: '#EBD088', color: '#926F2E' }}>
                                            活动日
                                          </Tag>
                                        )}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Tag
                                  className={
                                    item.inspection
                                      ? 'tag-status-normal'
                                      : 'tag-status-warning'
                                  }
                                >
                                  {item.inspection ? '已巡查' : '待巡查'}
                                </Tag>
                              </div>

                              {item.tasks.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-wine-100 space-y-2">
                                  {item.tasks.map((task) => {
                                    const matConfig = MATERIAL_CONFIG[task.materialType];
                                    return (
                                      <div
                                        key={task.id}
                                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white cursor-pointer"
                                        onClick={() => navigate(`/tasks/${task.id}`)}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: getTaskStatusColor(task.status) }}
                                          />
                                          <span className="text-sm text-wine-700">
                                            {matConfig.name}
                                          </span>
                                          <span className="text-xs text-cream-500">
                                            缺 {task.shortageQty} {matConfig.unit}
                                          </span>
                                        </div>
                                        <Tag
                                          className={TASK_STATUS_CONFIG[task.status].className}
                                        >
                                          {TASK_STATUS_CONFIG[task.status].name}
                                        </Tag>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-5">
          <div className="opacity-0 animate-fade-in-up animation-delay-400">
            <Card className="card-elegant" title={
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-wine-600" />
                <span className="text-wine-700 font-serif">快捷操作</span>
              </div>
            }>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <Tooltip key={idx} title={action.label}>
                      <button
                        onClick={action.onClick}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-cream-50 transition-all duration-300 group cursor-pointer"
                      >
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-elegant group-hover:shadow-gold-glow group-hover:scale-105 transition-all duration-300`}
                        >
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-sm font-medium text-wine-700">{action.label}</span>
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="opacity-0 animate-fade-in-up animation-delay-500">
            <Card className="card-elegant" title={
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-wine-600" />
                <span className="text-wine-700 font-serif">当前活动</span>
              </div>
            }>
              {currentActivity ? (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden h-28">
                    <img
                      src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=300&fit=crop"
                      alt="活动图片"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-wine-900/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-serif font-bold text-lg">
                        {currentActivity.name}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-wine-50">
                      <span className="text-cream-500">活动日期</span>
                      <span className="text-wine-700 font-medium">
                        {currentActivity.startDate} ~ {currentActivity.endDate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-wine-50">
                      <span className="text-cream-500">阈值加倍</span>
                      <Tag color="gold" className="tag-gold">
                        ×{currentActivity.thresholdMultiplier}
                      </Tag>
                    </div>
                    <div className="py-2">
                      <p className="text-cream-500 mb-2">适用品牌区</p>
                      <div className="flex flex-wrap gap-2">
                        {currentActivity.counterIds.map((cid) => {
                          const c = getCounterById(cid);
                          return c ? (
                            <Tag
                              key={cid}
                              style={{
                                backgroundColor: `${c.brandColor}15`,
                                borderColor: `${c.brandColor}40`,
                                color: c.brandColor,
                              }}
                            >
                              {c.name}
                            </Tag>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>

                  {currentActivity.description && (
                    <p className="text-xs text-cream-500 bg-cream-50 rounded-lg p-3">
                      {currentActivity.description}
                    </p>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-cream-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>暂无进行中的活动</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <div className="opacity-0 animate-fade-in-up animation-delay-400">
        <Card className="card-elegant" title={
          <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-wine-600" />
          <span className="text-wine-700 font-serif">各品牌区库存状态总览</span>
        </div>
        }>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px">
              <thead>
                <tr className="border-b border-wine-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-cream-500">品牌区</th>
                  {MATERIAL_TYPES.map((mt) => (
                    <th key={mt} className="text-left py-3 px-2 text-sm font-medium text-cream-500">
                      {MATERIAL_CONFIG[mt].name}
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 text-sm font-medium text-cream-500">综合状态</th>
                </tr>
              </thead>
              <tbody>
                {counterInventoryTable.map((row, idx) => (
                  <tr
                    key={row.counter.id}
                    className={`border-b border-wine-50 hover:bg-cream-50/50 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-cream-50/30'
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          size={32}
                          style={{ backgroundColor: row.counter.brandColor }}
                          icon={<Store className="w-4 h-4" />}
                        />
                        <span className="font-medium text-wine-800">{row.counter.name}</span>
                      </div>
                    </td>
                    {MATERIAL_TYPES.map((mt) => {
                      const mat = row.materials[mt];
                      const percent = Math.min(Math.round(mat.ratio * 100), 100);
                      const color = getStatusColor(mat.status);
                      return (
                        <td key={mt} className="py-4 px-2">
                          <Tooltip title={`库存: ${mat.quantity} / 阈值: ${mat.threshold}`}>
                            <div className="min-w-[100px]">
                              <Progress
                                percent={percent}
                                showInfo={false}
                                strokeColor={color}
                                trailColor="#F5E6E7"
                                size="small"
                              />
                              <p className="text-xs mt-1" style={{ color }}>
                                {mat.quantity}/{mat.threshold}
                              </p>
                            </div>
                          </Tooltip>
                        </td>
                      );
                    })}
                    <td className="py-4 px-4 text-center">
                      <Tag
                        className={
                          row.overallStatus === 'normal'
                            ? 'tag-status-normal'
                            : row.overallStatus === 'warning'
                            ? 'tag-status-warning'
                            : 'tag-status-danger'
                        }
                      >
                        {row.overallStatus === 'normal'
                          ? '正常'
                          : row.overallStatus === 'warning'
                          ? '预警'
                          : '缺货'}
                      </Tag>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="opacity-0 animate-fade-in-up animation-delay-500">
        <Card className="card-elegant" title={
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-wine-600" />
            <span className="text-wine-700 font-serif">近7天耗材消耗趋势</span>
          </div>
        }>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={consumptionChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  {MATERIAL_TYPES.map((mt) => (
                    <linearGradient
                      key={mt}
                      id={`gradient-${mt}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={MATERIAL_CONFIG[mt].color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={MATERIAL_CONFIG[mt].color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5E6E7" />
                <XAxis
                  dataKey="date"
                  stroke="#D0BA95"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#D0BA95"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #F5E6E7',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px -2px rgba(114, 47, 55, 0.12)',
                  }}
                  labelStyle={{
                    color: '#722F37',
                    fontWeight: 600,
                    marginBottom: '8px',
                  }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                  }}
                  iconType="circle"
                />
                {MATERIAL_TYPES.map((mt) => (
                  <Area
                    key={mt}
                    type="monotone"
                    dataKey={MATERIAL_CONFIG[mt].name}
                    stroke={MATERIAL_CONFIG[mt].color}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#gradient-${mt})`}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
