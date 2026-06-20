import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Steps,
  Button,
  Tag,
  InputNumber,
  Space,
  message,
  Typography,
  Divider,
  Progress,
  Tooltip,
} from 'antd';
import {
  Sunrise,
  Sun,
  Moon,
  PlayCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  FileText,
  Coffee,
  SprayCan,
  Sparkles,
  Tag as TagIcon,
  AlertTriangle,
  XCircle,
  ArrowRight,
  PartyPopper,
  ClipboardList,
  Package,
  Clock,
  Calendar,
  Flame,
  CheckSquare,
  ListChecks,
} from 'lucide-react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import { useInventoryStore, useCounterStore, useInspectionStore, useActivityStore } from '@/stores';
import {
  MaterialType,
  MATERIAL_CONFIG,
  PeriodType,
  PERIOD_CONFIG,
} from '@/types/index';

const { Text, Title } = Typography;

const MATERIAL_TYPES: MaterialType[] = [
  'scentPaper',
  'coffeeBean',
  'sprayNozzle',
  'cleaningCloth',
  'labelSticker',
];

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

const STEPS = [
  { title: '选择品牌区', icon: <CheckSquare size={18} />, desc: '勾选要巡查的品牌区' },
  { title: '逐项登记', icon: <ListChecks size={18} />, desc: '录入各类耗材数量' },
  { title: '确认提交', icon: <ClipboardList size={18} />, desc: '核对缺货信息并提交' },
];

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

interface CounterQtyMap {
  [counterId: string]: {
    [materialType in MaterialType]?: number;
  };
}

export default function InspectionForm() {
  const navigate = useNavigate();
  const { counters } = useCounterStore();
  const { inventoryItems } = useInventoryStore();
  const { createInspection, getTodayRecords } = useInspectionStore();
  const { isActivityDay, getActivityMultiplier } = useActivityStore();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType | null>(null);
  const [periodStarted, setPeriodStarted] = useState(false);
  const [stepCurrent, setStepCurrent] = useState(0);
  const [selectedCounterIds, setSelectedCounterIds] = useState<string[]>([]);
  const [qtyMap, setQtyMap] = useState<CounterQtyMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    recordIds?: string[];
    createdTaskIds?: string[];
  } | null>(null);

  const todayRecords = getTodayRecords();

  const completedPeriods = useMemo(() => {
    const set = new Set<string>();
    todayRecords.forEach((r) => {
      const byCounter = todayRecords.filter(
        (rr) => rr.period === r.period && rr.counterId === r.counterId
      );
      if (byCounter.length > 0) {
        // 标记该period至少有一次记录
        set.add(`${r.period}-${r.counterId}`);
      }
    });
    return set;
  }, [todayRecords]);

  const currentPeriod = useMemo<PeriodType>(() => {
    const h = dayjs().hour();
    if (h < 11) return 'morning';
    if (h < 17) return 'noon';
    return 'closing';
  }, []);

  const startPeriod = (period: PeriodType) => {
    setSelectedPeriod(period);
    setPeriodStarted(true);
    setStepCurrent(0);
    setQtyMap({});
    setSubmitResult(null);
  };

  const getCounterInventory = (counterId: string) => {
    return inventoryItems.filter((i) => i.counterId === counterId);
  };

  const toggleCounter = (id: string) => {
    setSelectedCounterIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllCounters = () => {
    if (selectedCounterIds.length === counters.length) {
      setSelectedCounterIds([]);
    } else {
      setSelectedCounterIds(counters.map((c) => c.id));
    }
  };

  useEffect(() => {
    const next: CounterQtyMap = { ...qtyMap };
    let changed = false;
    selectedCounterIds.forEach((cid) => {
      if (!next[cid]) {
        const invs = getCounterInventory(cid);
        const init: { [k in MaterialType]?: number } = {};
        invs.forEach((inv) => {
          init[inv.materialType] = inv.quantity;
        });
        next[cid] = init;
        changed = true;
      }
    });
    if (changed) setQtyMap(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCounterIds]);

  const updateQty = (counterId: string, mat: MaterialType, v: number) => {
    setQtyMap((prev) => ({
      ...prev,
      [counterId]: {
        ...(prev[counterId] ?? {}),
        [mat]: v,
      },
    }));
  };

  const isShortageForMat = (counterId: string, mat: MaterialType): { is: boolean; eff: number; base: number } => {
    const inv = inventoryItems.find((i) => i.counterId === counterId && i.materialType === mat);
    if (!inv) return { is: false, eff: 0, base: 0 };
    const mult = getActivityMultiplier(counterId, dayjs().toDate());
    const eff = Math.ceil(inv.threshold * mult);
    const qty = qtyMap[counterId]?.[mat] ?? 0;
    return { is: qty < eff, eff, base: inv.threshold };
  };

  const allShortages = useMemo(() => {
    const list: {
      counterId: string;
      counterName: string;
      mat: MaterialType;
      qty: number;
      threshold: number;
      baseThreshold: number;
      isActivity: boolean;
    }[] = [];
    selectedCounterIds.forEach((cid) => {
      const counter = counters.find((c) => c.id === cid);
      if (!counter) return;
      const activity = isActivityDay(cid);
      MATERIAL_TYPES.forEach((mat) => {
        const { is, eff, base } = isShortageForMat(cid, mat);
        if (is) {
          list.push({
            counterId: cid,
            counterName: counter.name,
            mat,
            qty: qtyMap[cid]?.[mat] ?? 0,
            threshold: eff,
            baseThreshold: base,
            isActivity: activity,
          });
        }
      });
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCounterIds, qtyMap, inventoryItems]);

  const nextStep = () => setStepCurrent((s) => Math.min(STEPS.length - 1, s + 1));
  const prevStep = () => setStepCurrent((s) => Math.max(0, s - 1));

  const handleSubmit = async () => {
    if (!selectedPeriod) return;
    setSubmitting(true);
    try {
      const allRecordIds: string[] = [];
      const allTaskIds: string[] = [];

      for (const cid of selectedCounterIds) {
        const counter = counters.find((c) => c.id === cid);
        const guide = counter?.guides?.[0];
        const items = MATERIAL_TYPES.map((mat) => ({
          materialType: mat,
          quantity: qtyMap[cid]?.[mat] ?? 0,
        }));
        const res = await createInspection({
          counterId: cid,
          guideId: guide?.id ?? 'guide-1',
          guideName: guide?.name,
          period: selectedPeriod,
          items,
        });
        allRecordIds.push(res.record.id);
        allTaskIds.push(...res.createdTaskIds);
      }

      setSubmitResult({
        success: true,
        recordIds: allRecordIds,
        createdTaskIds: allTaskIds,
      });
      message.success(`巡查登记成功，共产生 ${allTaskIds.length} 个补货任务`);
    } catch {
      message.error('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitResult?.success) {
    const taskCount = submitResult.createdTaskIds?.length ?? 0;
    return (
      <div className="animate-fade-in-up">
        <Card className="card-elegant">
          <div className="py-10 flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-gold-50 to-status-normal/10 flex items-center justify-center">
                <CheckCircle2 size={72} className="text-status-normal success-checkmark" strokeWidth={1.5} />
              </div>
              <PartyPopper
                size={28}
                className="absolute -right-2 -top-1 text-gold-500 animate-pulse-slow"
                style={{ animationDelay: '0.3s' }}
              />
              <PartyPopper
                size={24}
                className="absolute -left-1 top-6 text-wine-400 animate-pulse-slow"
                style={{ animationDelay: '0.5s' }}
              />
            </div>
            <Title level={3} className="!text-wine-700 !font-serif !mb-2 !text-center">
              巡查登记成功！
            </Title>
            <Text type="secondary" className="text-sm mb-8 text-center max-w-md">
              已完成 <Text strong className="text-wine-600">{selectedPeriod && PERIOD_CONFIG[selectedPeriod].name}</Text> 时段巡查，
              共登记 <Text strong className="text-gold-600">{selectedCounterIds.length}</Text> 个品牌区
            </Text>

            <div className="grid grid-cols-3 gap-6 w-full max-w-xl mb-8">
              <div className="text-center p-5 rounded-xl bg-cream-50 border border-cream-200">
                <div className="text-3xl font-serif font-bold text-wine-600 mb-1">
                  {selectedCounterIds.length}
                </div>
                <Text type="secondary" className="text-xs">巡查品牌区</Text>
              </div>
              <div className="text-center p-5 rounded-xl bg-cream-50 border border-cream-200">
                <div className="text-3xl font-serif font-bold text-gold-600 mb-1">
                  {selectedCounterIds.length * 5}
                </div>
                <Text type="secondary" className="text-xs">登记条目</Text>
              </div>
              <div className="text-center p-5 rounded-xl bg-cream-50 border border-cream-200">
                <div className="text-3xl font-serif font-bold text-status-danger mb-1">
                  {taskCount}
                </div>
                <Text type="secondary" className="text-xs">产生补货任务</Text>
              </div>
            </div>

            <Space size={12}>
              <Button size="large" className="btn-secondary" onClick={() => navigate('/inspection/records')}>
                <span className="flex items-center gap-1.5">
                  <ListChecks size={16} />
                  查看巡查记录
                </span>
              </Button>
              {taskCount > 0 && (
                <Button
                  type="primary"
                  size="large"
                  className="btn-primary"
                  onClick={() => navigate('/tasks/board')}
                >
                  <span className="flex items-center gap-1.5">
                    <ArrowRight size={16} />
                    前往处理任务（{taskCount}）
                  </span>
                </Button>
              )}
              <Button
                size="large"
                type="default"
                onClick={() => {
                  setSubmitResult(null);
                  setPeriodStarted(false);
                  setSelectedPeriod(null);
                  setSelectedCounterIds([]);
                  setStepCurrent(0);
                  setQtyMap({});
                }}
              >
                继续新巡查
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    );
  }

  if (!periodStarted || !selectedPeriod) {
    return (
      <div className="animate-fade-in-up space-y-5">
        <Card className="card-elegant">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-wine-700 mb-1 flex items-center gap-2">
                <ClipboardList size={22} className="text-gold-500" />
                选择巡查时段
              </h2>
              <Text type="secondary" className="text-sm">
                请选择当前要进行的巡查时段，每个时段需对所有品牌区进行耗材检查
              </Text>
            </div>
            <Tag className="tag-gold">
              <Calendar size={12} />
              {dayjs().format('YYYY年MM月DD日')}
            </Tag>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {(Object.keys(PERIOD_CONFIG) as PeriodType[]).map((p, idx) => {
              const cfg = PERIOD_CONFIG[p];
              const PI = PERIOD_ICON[p];
              const isCurrent = currentPeriod === p;
              const doneCount = counters.filter((c) => completedPeriods.has(`${p}-${c.id}`)).length;
              const totalCount = counters.length;
              const isAllDone = doneCount === totalCount && totalCount > 0;

              return (
                <div
                  key={p}
                  className={clsx(
                    'stagger-item stagger-' + (idx + 1),
                    'relative rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer group',
                    isCurrent && !isAllDone
                      ? 'border-gold-400 bg-gradient-to-br from-gold-50/80 to-white breathing-gold'
                      : isAllDone
                      ? 'border-status-normal/40 bg-gradient-to-br from-status-normal/5 to-white'
                      : 'border-cream-200 bg-white hover:border-gold-300 hover:shadow-card-hover hover:-translate-y-0.5'
                  )}
                  onClick={() => startPeriod(p)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={clsx(
                        'w-14 h-14 rounded-2xl flex items-center justify-center',
                        isCurrent
                          ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-gold-glow'
                          : isAllDone
                          ? 'bg-gradient-to-br from-status-normal to-green-500 text-white'
                          : 'bg-cream-100 text-wine-500'
                      )}
                    >
                      <PI size={28} strokeWidth={2} />
                    </div>
                    {isCurrent && !isAllDone && (
                      <Tag className="tag-gold !border-gold-400 !bg-gold-100 animate-pulse-slow">
                        <Clock size={10} /> 当前时段
                      </Tag>
                    )}
                    {isAllDone && (
                      <Tag className="tag-status-normal">
                        <CheckCircle2 size={10} /> 已完成
                      </Tag>
                    )}
                  </div>

                  <h3 className="text-lg font-serif font-bold text-wine-700 mb-1">{cfg.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-cream-500 mb-4">
                    <Clock size={14} />
                    {cfg.time}
                  </div>

                  <div className="mb-5">
                    <div className="flex justify-between text-xs text-cream-500 mb-1">
                      <span>完成进度</span>
                      <span>
                        {doneCount}/{totalCount} 品牌区
                      </span>
                    </div>
                    <Progress
                      percent={totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0}
                      showInfo={false}
                      strokeWidth={6}
                      strokeColor={isAllDone ? '#4CAF50' : isCurrent ? '#C9A962' : '#D0BA95'}
                    />
                  </div>

                  <Button
                    type={isCurrent && !isAllDone ? 'primary' : 'default'}
                    size="large"
                    block
                    className={clsx(
                      isCurrent && !isAllDone ? 'btn-primary' : 'btn-secondary group-hover:bg-gold-50'
                    )}
                    icon={<PlayCircle size={16} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      startPeriod(p);
                    }}
                  >
                    立即开始
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-5">
      <Card className="card-elegant">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {(() => {
              const cfg = PERIOD_CONFIG[selectedPeriod];
              const PI = PERIOD_ICON[selectedPeriod];
              return (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gold-50 border border-gold-200">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 text-white flex items-center justify-center shadow-gold-glow">
                    <PI size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-wine-700 m-0">{cfg.name}</h3>
                    <Text type="secondary" className="text-xs">
                      <Clock size={12} className="inline mr-1" />
                      {cfg.time}
                    </Text>
                  </div>
                </div>
              );
            })()}
          </div>

          <div style={{ flex: 1, maxWidth: 720, minWidth: 400 }}>
            <Steps
              current={stepCurrent}
              size="small"
              items={STEPS.map((s, i) => ({
                title: s.title,
                subTitle: <Text type="secondary" className="text-xs">{s.desc}</Text>,
                icon: (
                  <span
                    className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                      stepCurrent > i
                        ? 'bg-status-normal text-white border-status-normal'
                        : stepCurrent === i
                        ? 'bg-gold-100 text-gold-600 border-gold-400'
                        : 'bg-white text-cream-500 border-cream-300'
                    )}
                  >
                    {stepCurrent > i ? <CheckCircle2 size={16} /> : s.icon}
                  </span>
                ),
              }))}
            />
          </div>

          <Button type="text" className="!text-cream-500" onClick={() => { setPeriodStarted(false); setSelectedPeriod(null); }}>
            返回时段选择
          </Button>
        </div>

        <Divider className="!my-2 !border-cream-100" />

        {stepCurrent === 0 && (
          <div className="step-content-enter py-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif font-semibold text-wine-700 mb-1 flex items-center gap-2">
                  <CheckSquare size={18} className="text-gold-500" />
                  选择要巡查的品牌区
                </h3>
                <Text type="secondary" className="text-xs">
                  已选 <Text strong className="text-wine-600">{selectedCounterIds.length}</Text> / {counters.length} 个品牌区
                </Text>
              </div>
              <Button onClick={selectAllCounters} className="btn-secondary">
                {selectedCounterIds.length === counters.length ? '取消全选' : '全选品牌区'}
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {counters.map((c, idx) => {
                const checked = selectedCounterIds.includes(c.id);
                const invs = getCounterInventory(c.id);
                const shortageCount = invs.filter((i) => {
                  const ratio = i.threshold > 0 ? i.quantity / i.threshold : 0;
                  return ratio < 0.5;
                }).length;
                const totalInvQty = invs.reduce((s, i) => s + i.quantity, 0);
                const onActivity = isActivityDay(c.id);
                return (
                  <div
                    key={c.id}
                    className={clsx(
                      'stagger-item',
                      `stagger-${(idx % 5) + 1}`,
                      'relative rounded-xl p-4 border-2 cursor-pointer transition-all duration-300 group',
                      checked
                        ? 'border-gold-400 bg-gradient-to-br from-gold-50/70 to-white shadow-gold-glow scale-[1.02]'
                        : 'border-cream-200 bg-white hover:border-wine-200 hover:shadow-elegant'
                    )}
                    onClick={() => toggleCounter(c.id)}
                  >
                    <div
                      className={clsx(
                        'absolute top-3 right-3 w-6 h-6 rounded-md flex items-center justify-center transition-all',
                        checked
                          ? 'bg-gold-500 text-white shadow-md'
                          : 'border-2 border-cream-300 bg-white group-hover:border-wine-300'
                      )}
                    >
                      {checked && <CheckCircle2 size={16} strokeWidth={3} />}
                    </div>

                    <div className="mb-3">
                      <div
                        className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center text-white text-lg font-serif font-bold shadow-elegant"
                        style={{ background: `linear-gradient(135deg, ${c.brandColor}, ${c.brandColor}cc)` }}
                      >
                        {c.name.charAt(0)}
                      </div>
                      <h4 className="font-serif font-bold text-wine-700 mb-0.5 pr-7">{c.name}</h4>
                      <Text type="secondary" className="text-xs">
                        {c.tastingTableCount}试台 · {c.displayBottleCount}陈列
                      </Text>
                    </div>

                    <div className="pt-3 border-t border-cream-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cream-500 flex items-center gap-1">
                          <Package size={12} /> 当前库存
                        </span>
                        <Text strong className="text-gold-600">
                          {totalInvQty.toLocaleString()}
                        </Text>
                      </div>
                      {shortageCount > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-cream-500 flex items-center gap-1">
                            <AlertTriangle size={12} /> 预警项
                          </span>
                          <Text strong className="text-status-danger">
                            {shortageCount} 项
                          </Text>
                        </div>
                      )}
                      {onActivity && (
                        <Tag className="!m-0 mt-1 !text-[10px] !px-1.5 !py-0 tag-status-warning">
                          <Flame size={10} /> 活动日
                        </Tag>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {stepCurrent === 1 && (
          <div className="step-content-enter py-2 space-y-6">
            {selectedCounterIds.map((cid, cIdx) => {
              const counter = counters.find((c) => c.id === cid);
              if (!counter) return null;
              const invs = getCounterInventory(cid);
              const onActivity = isActivityDay(cid);
              const mult = getActivityMultiplier(cid);

              return (
                <div
                  key={cid}
                  className={clsx('stagger-item', `stagger-${(cIdx % 5) + 1}`, 'rounded-2xl border border-cream-200 overflow-hidden')}
                >
                  <div
                    className="px-5 py-3.5 flex items-center justify-between flex-wrap gap-3"
                    style={{
                      background: `linear-gradient(90deg, ${counter.brandColor}10, transparent 70%)`,
                      borderBottom: `1px solid ${counter.brandColor}20`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-serif font-bold shadow-elegant"
                        style={{ background: `linear-gradient(135deg, ${counter.brandColor}, ${counter.brandColor}cc)` }}
                      >
                        {counter.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-wine-700 m-0">{counter.name}</h4>
                        <Text type="secondary" className="text-xs">
                          {counter.guides.map((g) => g.name).join('、')}
                        </Text>
                      </div>
                    </div>
                    {onActivity && (
                      <Tag className="tag-status-warning !text-xs">
                        <Flame size={12} /> 活动日 · 阈值 ×{mult}
                      </Tag>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-white">
                    {MATERIAL_TYPES.map((mat) => {
                      const cfg = MATERIAL_CONFIG[mat];
                      const inv = invs.find((i) => i.materialType === mat);
                      const baseQty = inv?.quantity ?? 0;
                      const baseTh = inv?.threshold ?? 0;
                      const effTh = onActivity ? Math.ceil(baseTh * mult) : baseTh;
                      const currentQty = qtyMap[cid]?.[mat] ?? baseQty;
                      const shortage = currentQty < effTh;
                      const percent = effTh > 0 ? Math.min(100, Math.round((currentQty / effTh) * 100)) : 0;

                      return (
                        <div
                          key={mat}
                          className={clsx(
                            'relative rounded-xl p-4 border transition-all duration-300',
                            shortage
                              ? 'border-status-danger/40 bg-gradient-to-br from-status-danger/5 to-white shadow-[0_0_0_3px_rgba(229,57,53,0.08)]'
                              : 'border-cream-200 bg-cream-50/40'
                          )}
                        >
                          {shortage && (
                            <div className="absolute -top-2 -right-2 z-10">
                              <Tag className="tag-status-danger !m-0 !text-[10px] shadow-sm">
                                <XCircle size={10} /> 缺货
                              </Tag>
                            </div>
                          )}

                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={clsx(
                                  'w-9 h-9 rounded-lg flex items-center justify-center shadow-sm',
                                  MATERIAL_ICON_BG[mat]
                                )}
                              >
                                {getMaterialIcon(mat, 16)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-wine-700">{cfg.name}</div>
                                <div className="text-[11px] text-cream-500 flex items-center gap-1">
                                  当前库存：
                                  <span className="line-through opacity-70">{baseQty.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            {onActivity && (
                              <Tooltip title={`活动日阈值调整：${baseTh} × ${mult} = ${effTh}`}>
                                <Tag className="!m-0 !text-[10px] !px-1.5 !py-0 tag-gold">
                                  ×{mult}
                                </Tag>
                              </Tooltip>
                            )}
                          </div>

                          <div className="mb-3 space-y-1">
                            <div className="flex justify-between text-[11px] text-cream-500">
                              <span>vs 阈值 {effTh.toLocaleString()}{cfg.unit}</span>
                              <span className={clsx(shortage ? 'text-status-danger font-semibold' : '')}>
                                {percent}%
                              </span>
                            </div>
                            <div
                              className={clsx(
                                'h-1 rounded-full overflow-hidden',
                                shortage ? 'progress-wrap-shortage' : percent < 80 ? 'progress-wrap-warning' : 'progress-wrap-normal'
                              )}
                            >
                              <div
                                className={clsx(
                                  'h-full rounded-full transition-all',
                                  shortage
                                    ? 'bg-gradient-to-r from-status-danger to-orange-400'
                                    : percent < 80
                                    ? 'bg-gradient-to-r from-status-warning to-yellow-400'
                                    : 'bg-gradient-to-r from-status-normal to-green-400'
                                )}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Button
                                shape="circle"
                                size="small"
                                className={clsx(
                                  '!border !w-7 !h-7 !min-w-0 !p-0 flex items-center justify-center',
                                  shortage
                                    ? '!border-status-danger/30 !text-status-danger hover:!bg-status-danger/10'
                                    : '!border-cream-200 !text-cream-500 hover:!bg-cream-100'
                                )}
                                onClick={() => updateQty(cid, mat, Math.max(0, currentQty - 5))}
                              >
                                <span className="text-xs font-bold -mt-0.5">-5</span>
                              </Button>
                              <Button
                                shape="circle"
                                size="small"
                                className="!border-cream-200 !w-7 !h-7 !min-w-0 !p-0 flex items-center justify-center !text-cream-500 hover:!bg-cream-100"
                                onClick={() => updateQty(cid, mat, Math.max(0, currentQty - 1))}
                              >
                                <span className="text-xs font-bold -mt-0.5">-1</span>
                              </Button>
                              <InputNumber
                                value={currentQty}
                                onChange={(v) => updateQty(cid, mat, Number(v) || 0)}
                                controls={false}
                                size="large"
                                min={0}
                                className={clsx(
                                  '!flex-1 inspection-qty-input',
                                  shortage ? 'inspection-qty-shortage' : 'inspection-qty-normal'
                                )}
                                style={{
                                  textAlign: 'center',
                                }}
                              />
                              <Button
                                shape="circle"
                                size="small"
                                className="!border-cream-200 !w-7 !h-7 !min-w-0 !p-0 flex items-center justify-center !text-cream-500 hover:!bg-cream-100"
                                onClick={() => updateQty(cid, mat, currentQty + 1)}
                              >
                                <span className="text-xs font-bold -mt-0.5">+1</span>
                              </Button>
                              <Button
                                shape="circle"
                                size="small"
                                className="!border-gold-300 !bg-gold-50 !w-7 !h-7 !min-w-0 !p-0 flex items-center justify-center !text-gold-700 hover:!bg-gold-100"
                                onClick={() => updateQty(cid, mat, currentQty + 5)}
                              >
                                <span className="text-xs font-bold -mt-0.5">+5</span>
                              </Button>
                            </div>
                            <div className="text-[10px] text-cream-500 text-center">
                              单位：{cfg.unit}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {stepCurrent === 2 && (
          <div className="step-content-enter py-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif font-semibold text-wine-700 flex items-center gap-2">
                    <AlertTriangle size={18} className={allShortages.length > 0 ? 'text-status-danger' : 'text-gold-500'} />
                    缺货项汇总
                  </h3>
                  <Tag className={allShortages.length > 0 ? 'tag-status-danger' : 'tag-status-normal'}>
                    {allShortages.length} 项
                  </Tag>
                </div>

                {allShortages.length === 0 ? (
                  <div className="rounded-2xl p-10 text-center bg-gradient-to-br from-status-normal/5 to-white border border-status-normal/20">
                    <CheckCircle2 size={56} className="text-status-normal mx-auto mb-3 opacity-80" />
                    <h4 className="font-serif font-semibold text-wine-700 mb-1">库存状态良好</h4>
                    <Text type="secondary" className="text-sm">
                      所有品牌区耗材均已达标，无需生成补货任务
                    </Text>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-cream-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-cream-50 border-b border-cream-200">
                          <th className="px-4 py-3 text-left text-wine-700 font-semibold">品牌区</th>
                          <th className="px-4 py-3 text-left text-wine-700 font-semibold">耗材</th>
                          <th className="px-4 py-3 text-right text-wine-700 font-semibold">当前</th>
                          <th className="px-4 py-3 text-right text-wine-700 font-semibold">阈值</th>
                          <th className="px-4 py-3 text-right text-wine-700 font-semibold">差量</th>
                          <th className="px-4 py-3 text-center text-wine-700 font-semibold">备注</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allShortages.map((s, i) => {
                          const cfg = MATERIAL_CONFIG[s.mat];
                          const diff = s.threshold - s.qty;
                          return (
                            <tr key={i} className="border-b border-cream-100 last:border-0 hover:bg-cream-50/60 transition-colors">
                              <td className="px-4 py-3 text-wine-700 font-medium">{s.counterName}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className={clsx('w-7 h-7 rounded-md flex items-center justify-center', MATERIAL_ICON_BG[s.mat])}>
                                    {getMaterialIcon(s.mat, 13)}
                                  </div>
                                  <span>{cfg.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right text-status-danger font-bold">{s.qty}</td>
                              <td className="px-4 py-3 text-right text-cream-500">{s.threshold}</td>
                              <td className="px-4 py-3 text-right text-status-danger font-bold">-{diff}</td>
                              <td className="px-4 py-3 text-center">
                                {s.isActivity ? (
                                  <Tag className="tag-status-warning !m-0 !text-[10px]">
                                    <Flame size={10} /> 活动日
                                  </Tag>
                                ) : (
                                  <span className="text-cream-400">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl p-5 bg-gradient-to-br from-gold-50/80 to-white border border-gold-200 shadow-sm">
                  <h4 className="font-serif font-bold text-wine-700 mb-4 flex items-center gap-2">
                    <ClipboardList size={18} className="text-gold-500" />
                    本次巡查摘要
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                      <Text type="secondary" className="text-sm">巡查时段</Text>
                      <Text strong className="text-wine-700">
                        {PERIOD_CONFIG[selectedPeriod].name}
                      </Text>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                      <Text type="secondary" className="text-sm">品牌区数量</Text>
                      <Text strong className="text-wine-700">{selectedCounterIds.length}</Text>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                      <Text type="secondary" className="text-sm">登记条目</Text>
                      <Text strong className="text-wine-700">{selectedCounterIds.length * 5}</Text>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                      <Text type="secondary" className="text-sm">缺货项</Text>
                      <Text strong className={allShortages.length > 0 ? 'text-status-danger' : 'text-status-normal'}>
                        {allShortages.length}
                      </Text>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Text type="secondary" className="text-sm flex items-center gap-1">
                        <Package size={14} /> 预计产生任务
                      </Text>
                      <span className="text-2xl font-serif font-bold text-status-danger">
                        {allShortages.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl p-4 bg-wine-50/50 border border-wine-100 text-xs text-cream-500 leading-relaxed">
                  <p className="mb-1.5 flex items-start gap-1">
                    <CheckCircle2 size={14} className="text-gold-500 mt-0.5 flex-shrink-0" />
                    提交后将自动更新各品牌区库存数量
                  </p>
                  <p className="mb-1.5 flex items-start gap-1">
                    <CheckCircle2 size={14} className="text-gold-500 mt-0.5 flex-shrink-0" />
                    缺货项将自动创建对应补货任务并分配导购
                  </p>
                  <p className="flex items-start gap-1">
                    <CheckCircle2 size={14} className="text-gold-500 mt-0.5 flex-shrink-0" />
                    活动日期间阈值已自动按活动倍率调整
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Divider className="!my-6 !border-cream-100" />

        <div className="flex items-center justify-between">
          <Button
            size="large"
            icon={<ChevronLeft size={16} />}
            onClick={stepCurrent > 0 ? prevStep : () => { setPeriodStarted(false); setSelectedPeriod(null); }}
            disabled={stepCurrent === 0 && periodStarted ? false : undefined}
            className={stepCurrent === 0 ? '!text-cream-500' : 'btn-secondary'}
            type={stepCurrent === 0 ? 'text' : 'default'}
          >
            {stepCurrent === 0 ? '返回时段选择' : '上一步'}
          </Button>

          <div className="flex items-center gap-2 text-sm text-cream-500">
            <Progress
              type="circle"
              size={44}
              percent={Math.round(((stepCurrent + 1) / STEPS.length) * 100)}
              strokeWidth={6}
              strokeColor="#C9A962"
              format={() => (
                <span className="text-xs font-semibold text-wine-700">
                  {stepCurrent + 1}/{STEPS.length}
                </span>
              )}
            />
            <span>
              步骤 {stepCurrent + 1} / {STEPS.length}
            </span>
          </div>

          {stepCurrent < STEPS.length - 1 ? (
            <Button
              type="primary"
              size="large"
              className="btn-primary"
              icon={<ChevronRight size={16} />}
              onClick={nextStep}
              disabled={stepCurrent === 0 && selectedCounterIds.length === 0}
            >
              {stepCurrent === 0 ? `下一步 · 登记 ${selectedCounterIds.length} 个品牌区` : '下一步 · 确认提交'}
            </Button>
          ) : (
            <Button
              type="primary"
              size="large"
              className="btn-primary"
              loading={submitting}
              onClick={handleSubmit}
              icon={<CheckCircle2 size={16} />}
            >
              确认并提交
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
