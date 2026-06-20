import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  DatePicker,
  Select,
  Tag,
  Typography,
  Divider,
  Progress,
  Checkbox,
  Empty,
  Space,
} from 'antd';
import {
  Sunrise,
  Sun,
  Moon,
  Calendar,
  FileText,
  Coffee,
  SprayCan,
  Sparkles,
  Tag as TagIcon,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ClipboardList,
  Package,
  XCircle,
  ChevronDown,
  ChevronUp,
  ListChecks,
  BarChart3,
  User,
  Clock,
} from 'lucide-react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

import { useInspectionStore, useCounterStore } from '@/stores';
import {
  MaterialType,
  MATERIAL_CONFIG,
  PeriodType,
  PERIOD_CONFIG,
  InspectionRecord,
  InspectionItem,
} from '@/types/index';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Text } = Typography;

const MATERIAL_ICON_BG: Record<MaterialType, string> = {
  scentPaper: 'icon-bg-wine',
  coffeeBean: 'icon-bg-coffee',
  sprayNozzle: 'icon-bg-green',
  cleaningCloth: 'icon-bg-blue',
  labelSticker: 'icon-bg-gold',
};

const PERIOD_ICON: Record<PeriodType, React.ComponentType<Record<string, unknown>>> = {
  morning: Sunrise,
  noon: Sun,
  closing: Moon,
};

const PERIOD_BG_COLOR: Record<PeriodType, string> = {
  morning: 'from-orange-100 via-amber-50 to-yellow-50',
  noon: 'from-sky-100 via-blue-50 to-indigo-50',
  closing: 'from-purple-100 via-indigo-50 to-slate-50',
};

const getMaterialIcon = (type: MaterialType, size = 20) => {
  const IconMap: Record<MaterialType, React.ComponentType<Record<string, unknown>>> = {
    scentPaper: FileText,
    coffeeBean: Coffee,
    sprayNozzle: SprayCan,
    cleaningCloth: Sparkles,
    labelSticker: TagIcon,
  };
  const Comp = IconMap[type];
  const cfg = MATERIAL_CONFIG[type];
  return <Comp size={size} strokeWidth={2} color={cfg.color} />;
};

const getStatusOfItem = (item: InspectionItem): 'normal' | 'shortage' => {
  return item.quantity < item.threshold ? 'shortage' : 'normal';
};

interface GroupedRecords {
  [dateStr: string]: InspectionRecord[];
}

export default function InspectionRecords() {
  const { records, fetchRecords } = useInspectionStore();
  const { counters } = useCounterStore();

  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ]);
  const [selectedCounterIds, setSelectedCounterIds] = useState<string[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<PeriodType[]>([]);
  const [onlyShortage, setOnlyShortage] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const counterNameMap = useMemo(() => {
    const m = new Map<string, string>();
    counters.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [counters]);

  const counterGuideMap = useMemo(() => {
    const m = new Map<string, Map<string, string>>();
    counters.forEach((c) => {
      const gm = new Map<string, string>();
      c.guides.forEach((g) => gm.set(g.id, g.name));
      m.set(c.id, gm);
    });
    return m;
  }, [counters]);

  const getGuideName = (counterId: string, guideId: string) => {
    return counterGuideMap.get(counterId)?.get(guideId) ?? `导购-${guideId.slice(-3)}`;
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (dateRange[0] && dayjs(r.inspectedAt).isBefore(dateRange[0].startOf('day'))) return false;
      if (dateRange[1] && dayjs(r.inspectedAt).isAfter(dateRange[1].endOf('day'))) return false;
      if (selectedCounterIds.length > 0 && !selectedCounterIds.includes(r.counterId)) return false;
      if (selectedPeriods.length > 0 && !selectedPeriods.includes(r.period)) return false;
      if (onlyShortage) {
        const hasShortage = r.items.some((i) => getStatusOfItem(i) === 'shortage');
        if (!hasShortage) return false;
      }
      return true;
    });
  }, [records, dateRange, selectedCounterIds, selectedPeriods, onlyShortage]);

  const groupedRecords = useMemo<GroupedRecords>(() => {
    const g: GroupedRecords = {};
    filteredRecords.forEach((r) => {
      const d = dayjs(r.inspectedAt).format('YYYY-MM-DD');
      if (!g[d]) g[d] = [];
      g[d].push(r);
    });
    const sortedKeys = Object.keys(g).sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf());
    const ordered: GroupedRecords = {};
    sortedKeys.forEach((k) => (ordered[k] = g[k]));
    return ordered;
  }, [filteredRecords]);

  const stats = useMemo(() => {
    const totalInspections = filteredRecords.length;
    let totalShortages = 0;
    let taskCount = 0;
    const shortageRecordCount = new Set<string>();

    filteredRecords.forEach((r) => {
      const sCount = r.items.filter((i) => getStatusOfItem(i) === 'shortage').length;
      totalShortages += sCount;
      if (sCount > 0) shortageRecordCount.add(r.id);
      if (r.generatedTaskCount) taskCount += r.generatedTaskCount;
    });

    return {
      totalInspections,
      taskCount,
      avgShortage: totalInspections > 0 ? (totalShortages / totalInspections).toFixed(1) : '0',
      shortageRecordCount: shortageRecordCount.size,
    };
  }, [filteredRecords]);

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const dateEntries = Object.entries(groupedRecords);

  const todayStr = dayjs().format('YYYY-MM-DD');
  const yesterdayStr = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

  const formatDateLabel = (d: string) => {
    if (d === todayStr) return '今天';
    if (d === yesterdayStr) return '昨天';
    const day = dayjs(d);
    const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][day.day()];
    return `${day.month() + 1}月${day.date()}日 · ${weekday}`;
  };

  const formatDateSubtitle = (d: string) => {
    return dayjs(d).format('YYYY年MM月DD日');
  };

  return (
    <div className="animate-fade-in-up space-y-5">
      <Card className="card-elegant">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-wine-700 mb-1 flex items-center gap-2">
              <ListChecks size={22} className="text-gold-500" />
              巡查记录
            </h2>
            <Text type="secondary" className="text-sm">
              查看历史巡查记录、缺货情况和耗材登记详情
            </Text>
          </div>
          <Tag className="tag-gold">
            <Calendar size={12} />
            共 {stats.totalInspections} 条记录
          </Tag>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Text type="secondary" className="text-xs whitespace-nowrap">
              <Calendar size={12} className="inline mr-1" />
              日期：
            </Text>
            <RangePicker
              value={dateRange as [dayjs.Dayjs, dayjs.Dayjs]}
              onChange={(v) => setDateRange(v as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
              allowClear
              className="!rounded-lg"
              size="middle"
            />
          </div>

          <div className="flex items-center gap-2">
            <Text type="secondary" className="text-xs whitespace-nowrap">
              品牌区：
            </Text>
            <Select
              mode="multiple"
              allowClear
              placeholder="全部品牌区"
              size="middle"
              style={{ minWidth: 220 }}
              value={selectedCounterIds}
              onChange={setSelectedCounterIds}
              options={counters.map((c) => ({ label: c.name, value: c.id }))}
              maxTagCount="responsive"
              className="!rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2">
            <Text type="secondary" className="text-xs whitespace-nowrap">
              时段：
            </Text>
            <Select
              mode="multiple"
              allowClear
              placeholder="全部时段"
              size="middle"
              style={{ minWidth: 180 }}
              value={selectedPeriods}
              onChange={setSelectedPeriods}
              options={(Object.keys(PERIOD_CONFIG) as PeriodType[]).map((p) => ({
                label: PERIOD_CONFIG[p].name,
                value: p,
              }))}
              maxTagCount="responsive"
              className="!rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Checkbox checked={onlyShortage} onChange={(e) => setOnlyShortage(e.target.checked)}>
              <span className="text-sm text-cream-500 flex items-center gap-1">
                <AlertTriangle size={12} className="text-status-warning" />
                只看有缺货的
              </span>
            </Checkbox>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <div className="stagger-item stagger-1 card-elegant rounded-2xl p-5 bg-gradient-to-br from-wine-50/80 to-white border border-wine-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl icon-bg-wine flex items-center justify-center">
              <ClipboardList size={18} className="text-wine-500" />
            </div>
          </div>
          <Text type="secondary" className="text-xs block mb-1">总巡查次数</Text>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-serif font-bold text-wine-600">{stats.totalInspections}</span>
            <Text type="secondary" className="text-xs">次</Text>
          </div>
        </div>

        <div className="stagger-item stagger-2 card-elegant rounded-2xl p-5 bg-gradient-to-br from-gold-50/80 to-white border border-gold-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl icon-bg-gold flex items-center justify-center">
              <Package size={18} className="text-gold-500" />
            </div>
          </div>
          <Text type="secondary" className="text-xs block mb-1">产生任务数</Text>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-serif font-bold text-gold-600">{stats.taskCount}</span>
            <Text type="secondary" className="text-xs">个</Text>
          </div>
        </div>

        <div className="stagger-item stagger-3 card-elegant rounded-2xl p-5 bg-gradient-to-br from-orange-50/80 to-white border border-orange-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(255,152,0,0.12), rgba(255,152,0,0.05))' }}>
              <AlertTriangle size={18} className="text-status-warning" />
            </div>
          </div>
          <Text type="secondary" className="text-xs block mb-1">含缺货记录</Text>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-serif font-bold text-status-warning">{stats.shortageRecordCount}</span>
            <Text type="secondary" className="text-xs">次</Text>
          </div>
        </div>

        <div className="stagger-item stagger-4 card-elegant rounded-2xl p-5 bg-gradient-to-br from-rose-50/80 to-white border border-rose-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(229,57,53,0.1), rgba(229,57,53,0.05))' }}>
              <BarChart3 size={18} className="text-status-danger" />
            </div>
          </div>
          <Text type="secondary" className="text-xs block mb-1">平均缺货数/次</Text>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-serif font-bold text-status-danger">{stats.avgShortage}</span>
            <Text type="secondary" className="text-xs">项</Text>
          </div>
        </div>
      </div>

      <Card className="card-elegant">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif font-semibold text-wine-700 flex items-center gap-2">
            <Calendar size={18} className="text-gold-500" />
            巡查时间轴
          </h3>
          <Space size={8} className="text-xs text-cream-500">
            <Tag className="!m-0 tag-status-normal !text-[10px] !px-2">正常</Tag>
            <Tag className="!m-0 tag-status-danger !text-[10px] !px-2">缺货</Tag>
            <Tag className="!m-0 tag-status-warning !text-[10px] !px-2">活动日</Tag>
          </Space>
        </div>

        {dateEntries.length === 0 ? (
          <div className="py-16">
            <Empty description={<span className="text-cream-500">暂无符合条件的巡查记录</span>} />
          </div>
        ) : (
          <div className="space-y-8">
            {dateEntries.map(([dateStr, dayRecords], dateIdx) => {
              const dateShortages = dayRecords.reduce(
                (sum, r) => sum + r.items.filter((i) => getStatusOfItem(i) === 'shortage').length,
                0
              );
              return (
                <div key={dateStr} className={clsx('relative pl-6', dateIdx < dateEntries.length - 1 && 'pb-2')}>
                  <div className="absolute left-0 top-2 flex flex-col items-center z-10">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-wine-500 flex items-center justify-center shadow-elegant">
                      <Clock size={12} className="text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  <div className="mb-4 ml-2 flex items-end justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-wine-700 m-0 flex items-center gap-2">
                        {formatDateLabel(dateStr)}
                        <Text type="secondary" className="text-xs font-normal">
                          {formatDateSubtitle(dateStr)}
                        </Text>
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-cream-500">
                      <span className="flex items-center gap-1">
                        <ClipboardList size={12} />
                        {dayRecords.length} 次巡查
                      </span>
                      {dateShortages > 0 && (
                        <span className="flex items-center gap-1 text-status-danger">
                          <XCircle size={12} />
                          {dateShortages} 项缺货
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 ml-2">
                    {dayRecords
                      .sort((a, b) => dayjs(b.inspectedAt).valueOf() - dayjs(a.inspectedAt).valueOf())
                      .map((record, rIdx) => {
                        const pCfg = PERIOD_CONFIG[record.period];
                        const PI = PERIOD_ICON[record.period];
                        const shortageCount = record.items.filter(
                          (i) => getStatusOfItem(i) === 'shortage'
                        ).length;
                        const isExpanded = expandedCards.has(record.id);
                        const counterName = counterNameMap.get(record.counterId) ?? '未知品牌区';
                        const counter = counters.find((c) => c.id === record.counterId);

                        return (
                          <div
                            key={record.id}
                            className={clsx(
                              'stagger-item',
                              `stagger-${(rIdx % 5) + 1}`,
                              'rounded-2xl border border-cream-200 overflow-hidden transition-all duration-300 bg-white hover:shadow-elegant',
                              shortageCount > 0 && 'border-l-4 border-l-status-danger/60'
                            )}
                          >
                            <div
                              className={clsx(
                                'px-5 py-4 cursor-pointer transition-all',
                                `bg-gradient-to-r ${PERIOD_BG_COLOR[record.period]}`
                              )}
                              onClick={() => toggleCard(record.id)}
                            >
                              <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                  <div
                                    className={clsx(
                                      'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm',
                                      record.period === 'morning' &&
                                        'bg-gradient-to-br from-orange-400 to-amber-500 text-white',
                                      record.period === 'noon' &&
                                        'bg-gradient-to-br from-sky-400 to-blue-500 text-white',
                                      record.period === 'closing' &&
                                        'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                                    )}
                                  >
                                    <PI size={26} strokeWidth={2} />
                                  </div>

                                  <div className="min-w-[200px]">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-serif font-bold text-wine-700 m-0 text-base">
                                        {counterName}
                                      </h4>
                                      {counter && (
                                        <span
                                          className="w-5 h-5 rounded-md inline-flex items-center justify-center text-[10px] text-white font-bold"
                                          style={{ background: counter.brandColor }}
                                        >
                                          {counter.name.charAt(0)}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-cream-500">
                                      <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {dayjs(record.inspectedAt).format('HH:mm')}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <User size={12} />
                                        {getGuideName(record.counterId, record.guideId)}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        {pCfg.name}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    {shortageCount > 0 ? (
                                      <Tag
                                        className="!m-0 tag-status-danger !text-xs !px-3 !py-0.5"
                                        icon={<XCircle size={11} />}
                                      >
                                        缺货 {shortageCount} 项
                                      </Tag>
                                    ) : (
                                      <Tag
                                        className="!m-0 tag-status-normal !text-xs !px-3 !py-0.5"
                                        icon={<CheckCircle2 size={11} />}
                                      >
                                        全部正常
                                      </Tag>
                                    )}

                                    {record.isActivityDay && (
                                      <Tag
                                        className="!m-0 tag-status-warning !text-xs !px-3 !py-0.5"
                                        icon={<Flame size={11} />}
                                      >
                                        活动日×{record.thresholdMultiplier ?? 1.5}
                                      </Tag>
                                    )}

                                    {record.generatedTaskCount && record.generatedTaskCount > 0 ? (
                                      <Tag className="!m-0 tag-gold !text-xs !px-3 !py-0.5" icon={<Package size={11} />}>
                                        任务 {record.generatedTaskCount}
                                      </Tag>
                                    ) : null}
                                  </div>

                                  <div className="w-8 h-8 rounded-full bg-white/60 border border-cream-200 flex items-center justify-center transition-transform">
                                    {isExpanded ? (
                                      <ChevronUp size={16} className="text-wine-500" />
                                    ) : (
                                      <ChevronDown size={16} className="text-cream-500" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="p-5 bg-white border-t border-cream-100 animate-fade-in-up">
                                <div className="mb-4 flex items-center justify-between">
                                  <h5 className="font-serif font-semibold text-wine-700 m-0 flex items-center gap-2 text-sm">
                                    <FileText size={14} className="text-gold-500" />
                                    5类耗材登记详情
                                  </h5>
                                  <Text type="secondary" className="text-xs">
                                    数量 vs 阈值（活动日已自动换算）
                                  </Text>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                  {record.items.map((item) => {
                                    const cfg = MATERIAL_CONFIG[item.materialType];
                                    const status = getStatusOfItem(item);
                                    const percent =
                                      item.threshold > 0
                                        ? Math.min(100, Math.round((item.quantity / item.threshold) * 100))
                                        : 0;
                                    return (
                                      <div
                                        key={item.materialType}
                                        className={clsx(
                                          'rounded-xl p-4 border transition-all',
                                          status === 'shortage'
                                            ? 'border-status-danger/30 bg-gradient-to-br from-status-danger/5 to-white'
                                            : 'border-cream-200 bg-cream-50/40'
                                        )}
                                      >
                                        <div className="flex items-center gap-2 mb-3">
                                          <div
                                            className={clsx(
                                              'w-9 h-9 rounded-lg flex items-center justify-center',
                                              MATERIAL_ICON_BG[item.materialType]
                                            )}
                                          >
                                            {getMaterialIcon(item.materialType, 16)}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-wine-700 truncate">
                                              {cfg.name}
                                            </div>
                                            {status === 'shortage' ? (
                                              <span className="text-[10px] text-status-danger flex items-center gap-0.5">
                                                <XCircle size={9} /> 低于阈值
                                              </span>
                                            ) : (
                                              <span className="text-[10px] text-status-normal flex items-center gap-0.5">
                                                <CheckCircle2 size={9} /> 正常
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        <div className="mb-3">
                                          <div className="flex items-baseline justify-between mb-1">
                                            <div className="flex items-baseline gap-1">
                                              <span
                                                className={clsx(
                                                  'text-2xl font-serif font-bold',
                                                  status === 'shortage'
                                                    ? 'text-status-danger'
                                                    : 'text-wine-600'
                                                )}
                                              >
                                                {item.quantity.toLocaleString()}
                                              </span>
                                              <span className="text-[10px] text-cream-500">
                                                {cfg.unit}
                                              </span>
                                            </div>
                                            <span className="text-[11px] text-cream-500">
                                              阈值 {item.threshold}
                                            </span>
                                          </div>
                                          <Progress
                                            percent={percent}
                                            showInfo={false}
                                            size="small"
                                            strokeWidth={6}
                                            strokeColor={
                                              status === 'shortage'
                                                ? ['#E53935', '#FF7043']
                                                : percent < 80
                                                ? ['#FF9800', '#FFC107']
                                                : ['#4CAF50', '#8BC34A']
                                            }
                                          />
                                        </div>

                                        {status === 'shortage' && (
                                          <div className="flex items-center justify-between pt-2 border-t border-cream-100">
                                            <Text type="secondary" className="text-[10px]">
                                              差量
                                            </Text>
                                            <Text strong className="text-status-danger text-xs">
                                              -{item.threshold - item.quantity} {cfg.unit}
                                            </Text>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                <Divider className="!my-4 !border-cream-100" />

                                <div className="flex items-center justify-between flex-wrap gap-3 text-xs">
                                  <Space size={12} wrap>
                                    <span className="flex items-center gap-1 text-cream-500">
                                      <User size={12} />
                                      巡查导购：
                                      <Text strong className="text-wine-700">
                                        {getGuideName(record.counterId, record.guideId)}
                                      </Text>
                                    </span>
                                    <span className="flex items-center gap-1 text-cream-500">
                                      <Clock size={12} />
                                      完成时间：
                                      <Text strong className="text-wine-700">
                                        {dayjs(record.inspectedAt).format('YYYY-MM-DD HH:mm:ss')}
                                      </Text>
                                    </span>
                                    <span className="flex items-center gap-1 text-cream-500">
                                      <Package size={12} />
                                      记录ID：
                                      <Text code className="!text-[10px] !bg-cream-50">
                                        {record.id}
                                      </Text>
                                    </span>
                                  </Space>

                                  {record.generatedTaskCount && record.generatedTaskCount > 0 && (
                                    <Tag className="!m-0 tag-gold !text-xs">
                                      已自动生成 {record.generatedTaskCount} 个补货任务
                                    </Tag>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
