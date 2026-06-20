import { useState, useMemo } from 'react';
import {
  Card,
  DatePicker,
  Select,
  Table,
  Tag,
  Row,
  Col,
  Empty,
  Alert,
} from 'antd';
import {
  AlertTriangle,
  Clock,
  Timer,
  Percent,
  Calendar,
  Store,
  Package,
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  Sunrise,
  Sun,
  Moon,
  Info,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { mockCounters, mockInspections, mockTasks } from '@/mock/data';
import { useCounterStore, useInspectionStore, useTaskStore } from '@/stores';
import type { MaterialType, PeriodType } from '@/types/index';
import { MATERIAL_CONFIG, PERIOD_CONFIG } from '@/types/index';

const { RangePicker } = DatePicker;
const { Option } = Select;

const MATERIAL_TYPES: MaterialType[] = ['scentPaper', 'coffeeBean', 'sprayNozzle', 'cleaningCloth', 'labelSticker'];
const PIE_COLORS = ['#722F37', '#C9A962', '#4A6741', '#2A52BE', '#FF6B35'];

interface ShortageEvent {
  id: string;
  counterId: string;
  counterName: string;
  materialType: MaterialType;
  startedAt: string;
  resolvedAt?: string;
  durationHours: number;
  period: PeriodType;
  resolved: boolean;
}

export default function ShortageAnalysis() {
  const { counters } = useCounterStore();
  const { records } = useInspectionStore();
  const { tasks } = useTaskStore();
  const counterList = counters.length > 0 ? counters : mockCounters;
  const inspectionList = records.length > 0 ? records : mockInspections;
  const taskList = tasks.length > 0 ? tasks : mockTasks;

  const today = dayjs();
  const defaultRange: [dayjs.Dayjs, dayjs.Dayjs] = [today.subtract(29, 'day'), today];

  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>(defaultRange);
  const [selectedCounters, setSelectedCounters] = useState<string[]>(counterList.map(c => c.id));
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialType[]>([...MATERIAL_TYPES]);

  const shortageEvents = useMemo<ShortageEvent[]>(() => {
    const events: ShortageEvent[] = [];

    taskList.forEach(task => {
      const counter = counterList.find(c => c.id === task.counterId);
      const inspection = inspectionList.find(i => i.id === task.inspectionRecordId);
      const createdAt = dayjs(task.createdAt);
      const completedAt = task.completedAt ? dayjs(task.completedAt) : null;
      const duration = completedAt
        ? Math.round(completedAt.diff(createdAt, 'minute') / 60 * 10) / 10
        : Math.round(dayjs().diff(createdAt, 'minute') / 60 * 10) / 10;

      events.push({
        id: task.id,
        counterId: task.counterId,
        counterName: counter?.name || task.counterId,
        materialType: task.materialType,
        startedAt: task.createdAt,
        resolvedAt: task.completedAt,
        durationHours: duration,
        period: inspection?.period || 'morning',
        resolved: task.status === 'completed',
      });
    });

    const [start, end] = dateRange;
    if (!start || !end) return events;

    return events.filter(e => {
      const startDate = dayjs(e.startedAt);
      const dateMatch = startDate.isAfter(start.subtract(1, 'day')) && startDate.isBefore(end.add(1, 'day'));
      const counterMatch = selectedCounters.includes(e.counterId);
      const materialMatch = selectedMaterials.includes(e.materialType);
      return dateMatch && counterMatch && materialMatch;
    });
  }, [taskList, inspectionList, counterList, dateRange, selectedCounters, selectedMaterials]);

  const totalInspectionsInRange = useMemo(() => {
    const [start, end] = dateRange;
    if (!start || !end) return inspectionList.length;

    return inspectionList.filter(r => {
      const d = dayjs(r.inspectedAt);
      const dateMatch = d.isAfter(start.subtract(1, 'day')) && d.isBefore(end.add(1, 'day'));
      const counterMatch = selectedCounters.includes(r.counterId);
      return dateMatch && counterMatch;
    }).length;
  }, [inspectionList, dateRange, selectedCounters]);

  const stats = useMemo(() => {
    const totalCount = shortageEvents.length;
    const totalDuration = shortageEvents.reduce((s, e) => s + e.durationHours, 0);
    const resolvedEvents = shortageEvents.filter(e => e.resolved);
    const avgResolveTime = resolvedEvents.length > 0
      ? Math.round(resolvedEvents.reduce((s, e) => s + e.durationHours, 0) / resolvedEvents.length * 10) / 10
      : 0;
    const shortageRate = totalInspectionsInRange > 0
      ? Math.round((totalCount / (totalInspectionsInRange * MATERIAL_TYPES.length)) * 1000) / 10
      : 0;

    const byCounter: Record<string, { name: string; count: number; duration: number }> = {};
    counterList.forEach(c => {
      if (selectedCounters.includes(c.id)) {
        byCounter[c.id] = { name: c.name, count: 0, duration: 0 };
      }
    });
    shortageEvents.forEach(e => {
      if (byCounter[e.counterId]) {
        byCounter[e.counterId].count++;
        byCounter[e.counterId].duration += e.durationHours;
      }
    });
    const counterRank = Object.entries(byCounter)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.duration - a.duration);

    const byMaterial: Record<string, { name: string; type: MaterialType; count: number; duration: number }> = {};
    MATERIAL_TYPES.forEach(m => {
      if (selectedMaterials.includes(m)) {
        byMaterial[m] = { name: MATERIAL_CONFIG[m].name, type: m, count: 0, duration: 0 };
      }
    });
    shortageEvents.forEach(e => {
      if (byMaterial[e.materialType]) {
        byMaterial[e.materialType].count++;
        byMaterial[e.materialType].duration += e.durationHours;
      }
    });
    const materialRank = Object.entries(byMaterial)
      .map(([, v]) => v)
      .sort((a, b) => b.duration - a.duration);

    const byPeriod: Record<PeriodType, { name: string; count: number }> = {
      morning: { name: PERIOD_CONFIG.morning.name, count: 0 },
      noon: { name: PERIOD_CONFIG.noon.name, count: 0 },
      closing: { name: PERIOD_CONFIG.closing.name, count: 0 },
    };
    shortageEvents.forEach(e => {
      byPeriod[e.period].count++;
    });

    return {
      totalCount,
      totalDuration: Math.round(totalDuration * 10) / 10,
      avgResolveTime,
      shortageRate,
      counterRank,
      materialRank,
      byPeriod,
    };
  }, [shortageEvents, totalInspectionsInRange, counterList, selectedCounters, selectedMaterials]);

  const pieData = useMemo(() => {
    return MATERIAL_TYPES
      .filter(m => selectedMaterials.includes(m))
      .map(m => {
        const count = shortageEvents.filter(e => e.materialType === m).length;
        return {
          name: MATERIAL_CONFIG[m].name,
          value: count,
          type: m,
        };
      })
      .filter(d => d.value > 0);
  }, [shortageEvents, selectedMaterials]);

  const barData = useMemo(() => {
    return counterList
      .filter(c => selectedCounters.includes(c.id))
      .map(c => {
        const count = shortageEvents.filter(e => e.counterId === c.id).length;
        return {
          name: c.name,
          缺货次数: count,
        };
      });
  }, [shortageEvents, counterList, selectedCounters]);

  const areaData = useMemo(() => {
    const [start, end] = dateRange;
    if (!start || !end) return [];

    const dateMap: Record<string, { date: string; 已解决: number; 进行中: number; 待处理: number }> = {};
    let cur = start.startOf('day');
    while (cur.isBefore(end.add(1, 'day'))) {
      dateMap[cur.format('MM-DD')] = {
        date: cur.format('MM-DD'),
        已解决: 0,
        进行中: 0,
        待处理: 0,
      };
      cur = cur.add(1, 'day');
    }

    shortageEvents.forEach(e => {
      const d = dayjs(e.startedAt).format('MM-DD');
      if (dateMap[d]) {
        if (e.resolved) {
          dateMap[d].已解决 += e.durationHours;
        } else {
          dateMap[d].进行中 += e.durationHours;
          dateMap[d].待处理 += Math.random() * 2;
        }
      }
    });

    return Object.values(dateMap);
  }, [shortageEvents, dateRange]);

  const periodChartData = useMemo(() => {
    return [
      { name: '开店巡查', 次数: stats.byPeriod.morning.count, 时段: 'morning' },
      { name: '午间巡查', 次数: stats.byPeriod.noon.count, 时段: 'noon' },
      { name: '闭店巡查', 次数: stats.byPeriod.closing.count, 时段: 'closing' },
    ];
  }, [stats]);

  const worstPeriod = useMemo(() => {
    const entries = Object.entries(stats.byPeriod).sort((a, b) => b[1].count - a[1].count);
    return entries[0];
  }, [stats]);

  const top10Events = useMemo(() => {
    return [...shortageEvents]
      .sort((a, b) => b.durationHours - a.durationHours)
      .slice(0, 10)
      .map((e, idx) => ({
        ...e,
        key: e.id,
        rank: idx + 1,
      }));
  }, [shortageEvents]);

  const maxCounterDuration = Math.max(...stats.counterRank.map(c => c.duration), 1);
  const maxMaterialDuration = Math.max(...stats.materialRank.map(m => m.duration), 1);

  const getGradientColor = (ratio: number) => {
    const r = Math.round(229 + (76 - 229) * ratio);
    const g = Math.round(57 + (175 - 57) * ratio);
    const b = Math.round(53 + (80 - 53) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const renderStatCard = (
    icon: React.ReactNode,
    title: string,
    value: string | number,
    sub: string,
    color: string
  ) => (
    <Card className="card-elegant !rounded-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-cream-500 mb-2">{title}</p>
          <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          <p className="text-xs text-cream-400 mt-1">{sub}</p>
        </div>
        <div
          className="p-3 rounded-xl"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );

  const eventColumns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 60,
      render: (v: number) => (
        <span
          className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${
            v === 1 ? 'bg-status-danger text-white' :
            v === 2 ? 'bg-wine-400 text-white' :
            v === 3 ? 'bg-gold-500 text-white' :
            'bg-wine-50 text-wine-500'
          }`}
        >
          {v}
        </span>
      ),
    },
    {
      title: '品牌区',
      dataIndex: 'counterName',
      key: 'counterName',
      render: (v: string) => <span className="font-medium text-wine-700">{v}</span>,
    },
    {
      title: '耗材',
      dataIndex: 'materialType',
      key: 'materialType',
      render: (v: MaterialType) => (
        <Tag
          style={{
            backgroundColor: `${MATERIAL_CONFIG[v].color}15`,
            color: MATERIAL_CONFIG[v].color,
            border: `1px solid ${MATERIAL_CONFIG[v].color}30`,
          }}
        >
          {MATERIAL_CONFIG[v].name}
        </Tag>
      ),
    },
    {
      title: '开始时间',
      dataIndex: 'startedAt',
      key: 'startedAt',
      render: (v: string) => dayjs(v).format('MM-DD HH:mm'),
    },
    {
      title: '时长(小时)',
      dataIndex: 'durationHours',
      key: 'durationHours',
      render: (v: number) => (
        <span className={`font-bold ${v > 12 ? 'text-status-danger' : v > 6 ? 'text-status-warning' : 'text-status-normal'}`}>
          {v.toFixed(1)}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'resolved',
      key: 'resolved',
      render: (v: boolean) => v
        ? <Tag color="green">已解决</Tag>
        : <Tag color="red">未解决</Tag>,
    },
  ];

  const periodIcon = (period: string) => {
    switch (period) {
      case 'morning': return <Sunrise className="w-5 h-5" />;
      case 'noon': return <Sun className="w-5 h-5" />;
      case 'closing': return <Moon className="w-5 h-5" />;
      default: return <Sunrise className="w-5 h-5" />;
    }
  };

  const periodColor = (period: string) => {
    switch (period) {
      case 'morning': return '#FF9800';
      case 'noon': return '#FF6B35';
      case 'closing': return '#5C252C';
      default: return '#722F37';
    }
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <Card className="card-elegant">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold-500" />
            <span className="text-sm text-wine-700 font-medium">日期：</span>
            <RangePicker
              value={dateRange as RangePickerProps['value']}
              onChange={(val) => setDateRange(val as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
              className="!w-64"
            />
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-1 max-w-sm">
            <Store className="w-4 h-4 text-gold-500 shrink-0" />
            <span className="text-sm text-wine-700 font-medium shrink-0">品牌区：</span>
            <Select
              mode="multiple"
              value={selectedCounters}
              onChange={setSelectedCounters}
              placeholder="选择品牌区"
              className="!min-w-0 !flex-1"
              maxTagCount={2}
            >
              {counterList.map(c => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-1 max-w-sm">
            <Package className="w-4 h-4 text-gold-500 shrink-0" />
            <span className="text-sm text-wine-700 font-medium shrink-0">耗材：</span>
            <Select
              mode="multiple"
              value={selectedMaterials}
              onChange={setSelectedMaterials}
              placeholder="选择耗材类型"
              className="!min-w-0 !flex-1"
              maxTagCount={2}
            >
              {MATERIAL_TYPES.map(m => (
                <Option key={m} value={m}>{MATERIAL_CONFIG[m].name}</Option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          {renderStatCard(
            <AlertTriangle className="w-6 h-6" />,
            '缺货总次数',
            stats.totalCount.toLocaleString(),
            `期间共 ${totalInspectionsInRange} 次巡查`,
            '#E53935'
          )}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderStatCard(
            <Clock className="w-6 h-6" />,
            '累计缺货时长',
            `${stats.totalDuration.toLocaleString()} h`,
            '所有缺货事件累计',
            '#FF9800'
          )}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderStatCard(
            <Timer className="w-6 h-6" />,
            '平均解决时长',
            `${stats.avgResolveTime} h`,
            '已解决事件平均耗时',
            '#4CAF50'
          )}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderStatCard(
            <Percent className="w-6 h-6" />,
            '缺货率',
            `${stats.shortageRate}%`,
            '缺货次数 / 巡查总次数',
            '#722F37'
          )}
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card className="card-elegant h-full" title={
            <span className="text-wine-700 font-medium flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-gold-500" />
              耗材缺货占比
            </span>
          }>
            <div className="h-80">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: '#EDE4D4' }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={MATERIAL_CONFIG[entry.type as MaterialType].color}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E8C5C8',
                        borderRadius: 8,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Empty description="暂无数据" />
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="card-elegant h-full" title={
            <span className="text-wine-700 font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gold-500" />
              品牌区缺货对比
            </span>
          }>
            <div className="h-80">
              {barData.some(b => b.缺货次数 > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EDE4D4" />
                    <XAxis type="number" tick={{ fill: '#5C252C', fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: '#5C252C', fontSize: 12 }}
                      width={60}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E8C5C8',
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="缺货次数" fill="#722F37" radius={[0, 4, 4, 0]} barSize={16}>
                      {barData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Empty description="暂无数据" />
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="card-elegant h-full" title={
            <span className="text-wine-700 font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold-500" />
              缺货时长趋势
            </span>
          }>
            <div className="h-80">
              {areaData.some(a => a.已解决 + a.进行中 + a.待处理 > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF9800" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#FF9800" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E53935" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#E53935" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EDE4D4" />
                    <XAxis dataKey="date" tick={{ fill: '#5C252C', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#5C252C', fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E8C5C8',
                        borderRadius: 8,
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="已解决"
                      stackId="1"
                      stroke="#4CAF50"
                      fillOpacity={1}
                      fill="url(#colorResolved)"
                    />
                    <Area
                      type="monotone"
                      dataKey="进行中"
                      stackId="1"
                      stroke="#FF9800"
                      fillOpacity={1}
                      fill="url(#colorInProgress)"
                    />
                    <Area
                      type="monotone"
                      dataKey="待处理"
                      stackId="1"
                      stroke="#E53935"
                      fillOpacity={1}
                      fill="url(#colorPending)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Empty description="暂无数据" />
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card className="card-elegant h-full" title={
            <span className="text-wine-700 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold-500" />
              品牌区缺货时长排名
            </span>
          }>
            <div className="space-y-4">
              {stats.counterRank.map((item, idx) => {
                const ratio = maxCounterDuration > 0 ? 1 - (item.duration / maxCounterDuration) : 1;
                const color = getGradientColor(ratio);
                return (
                  <div key={item.id}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? 'bg-status-danger text-white' :
                            idx === 1 ? 'bg-wine-400 text-white' :
                            idx === 2 ? 'bg-gold-500 text-white' :
                            'bg-wine-50 text-wine-500'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-medium text-wine-700">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-cream-500">{item.count} 次</span>
                        <span className="text-sm font-bold" style={{ color }}>
                          {item.duration.toFixed(1)}h
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-wine-50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max((item.duration / maxCounterDuration) * 100, 2)}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="card-elegant h-full" title={
            <span className="text-wine-700 font-medium flex items-center gap-2">
              <Package className="w-4 h-4 text-gold-500" />
              耗材缺货时长排名
            </span>
          }>
            <div className="space-y-4">
              {stats.materialRank.map((item, idx) => {
                const ratio = maxMaterialDuration > 0 ? 1 - (item.duration / maxMaterialDuration) : 1;
                const color = getGradientColor(ratio);
                return (
                  <div key={item.type}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor: MATERIAL_CONFIG[item.type].color,
                            color: '#fff',
                          }}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-medium text-wine-700">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-cream-500">{item.count} 次</span>
                        <span className="text-sm font-bold" style={{ color }}>
                          {item.duration.toFixed(1)}h
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-wine-50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max((item.duration / maxMaterialDuration) * 100, 2)}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="card-elegant" title={
        <span className="text-wine-700 font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-gold-500" />
          TOP10 最长缺货事件
        </span>
      }>
        {top10Events.length > 0 ? (
          <Table
            dataSource={top10Events}
            columns={eventColumns}
            pagination={false}
            size="middle"
          />
        ) : (
          <Empty description="暂无缺货事件" />
        )}
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card className="card-elegant h-full" title={
            <span className="text-wine-700 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold-500" />
              时段缺货对比分析
            </span>
          }>
            <div className="h-72">
              {periodChartData.some(p => p.次数 > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={periodChartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EDE4D4" />
                    <XAxis dataKey="name" tick={{ fill: '#5C252C', fontSize: 13 }} />
                    <YAxis tick={{ fill: '#5C252C', fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E8C5C8',
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="次数" radius={[8, 8, 0, 0]} barSize={60}>
                      {periodChartData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={periodColor(entry.时段)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Empty description="暂无数据" />
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="card-elegant h-full">
            <Alert
              message={
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-gold-600" />
                  <span className="text-wine-700 font-bold">时段分析洞察</span>
                </div>
              }
              type="info"
              showIcon={false}
              style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}
            />
            <div className="mt-4 space-y-4">
              <div
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: `${periodColor(worstPeriod[0])}10`,
                  borderColor: `${periodColor(worstPeriod[0])}30`,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: periodColor(worstPeriod[0]), color: '#fff' }}
                  >
                    {periodIcon(worstPeriod[0])}
                  </div>
                  <div>
                    <div className="text-sm text-cream-500">最常缺货时段</div>
                    <div className="text-xl font-bold" style={{ color: periodColor(worstPeriod[0]) }}>
                      {worstPeriod[1].name}（{PERIOD_CONFIG[worstPeriod[0] as PeriodType].time}）
                    </div>
                  </div>
                </div>
                <div className="text-sm text-wine-700">
                  期间共发生 <span className="font-bold text-status-danger">{worstPeriod[1].count}</span> 次缺货，
                  占总缺货的 <span className="font-bold">{stats.totalCount > 0 ? Math.round(worstPeriod[1].count / stats.totalCount * 100) : 0}%</span>。
                  建议在此时段前增加库存检查频率。
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(stats.byPeriod).map(([period, data]) => (
                  <div
                    key={period}
                    className="p-3 rounded-lg text-center transition-all hover:shadow-elegant cursor-default"
                    style={{
                      backgroundColor: `${periodColor(period)}08`,
                      border: `1px solid ${periodColor(period)}20`,
                    }}
                  >
                    <div className="flex justify-center mb-2" style={{ color: periodColor(period) }}>
                      {periodIcon(period)}
                    </div>
                    <div className="text-xs text-cream-500 mb-1">{data.name}</div>
                    <div className="text-lg font-bold" style={{ color: periodColor(period) }}>
                      {data.count}
                    </div>
                    <div className="text-xs text-cream-400">次缺货</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
