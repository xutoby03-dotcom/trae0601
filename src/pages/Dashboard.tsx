import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Sparkles,
  Bell,
  Calendar,
  Clock,
  Plus,
  ArrowRight,
  X,
  MapPin,
  RefreshCw,
  Droplets,
  CircleDot,
  CheckCircle2,
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import StatusBadge from '../components/common/StatusBadge';
import StarRating from '../components/common/StarRating';
import AlertCard from '../components/common/AlertCard';
import { getBoxStatus } from '../utils/alerts';
import { formatRelativeTime, formatHours } from '../utils/date';
import { cn } from '../lib/utils';
import { CleanRecord, ClumpLevel } from '../types';

const Dashboard: React.FC = () => {
  const {
    members,
    cats,
    litterBoxes,
    records,
    alerts,
    currentMemberId,
    addRecord,
  } = useAppStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBoxId, setSelectedBoxId] = useState<string>('');

  const [formMemberId, setFormMemberId] = useState(currentMemberId);
  const [formCleanTime, setFormCleanTime] = useState('');
  const [formSmellLevel, setFormSmellLevel] = useState<1 | 2 | 3 | 4 | 5>(2);
  const [formClumpLevel, setFormClumpLevel] = useState<ClumpLevel>('少');
  const [formAddedLitter, setFormAddedLitter] = useState(false);
  const [formAddedAmount, setFormAddedAmount] = useState(0);
  const [formIsFullChange, setFormIsFullChange] = useState(false);
  const [formNote, setFormNote] = useState('');

  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  const totalBoxes = litterBoxes.length;
  const totalAlerts = alerts.length;

  const todayRecords = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).toISOString();
    return records.filter((r) => r.cleanTime >= todayStart);
  }, [records]);

  const todayCleanCount = todayRecords.length;

  const monthRecords = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();
    return records.filter((r) => r.cleanTime >= monthStart);
  }, [records]);

  const monthCleanCount = monthRecords.length;

  const boxStatusMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getBoxStatus>>();
    litterBoxes.forEach((box) => {
      map.set(box.id, getBoxStatus(box, records));
    });
    return map;
  }, [litterBoxes, records]);

  const recentRecords = useMemo(() => {
    return [...records]
      .sort(
        (a, b) =>
          new Date(b.cleanTime).getTime() - new Date(a.cleanTime).getTime()
      )
      .slice(0, 10);
  }, [records]);

  const getMember = (id: string) => members.find((m) => m.id === id);
  const getCat = (id: string) => cats.find((c) => c.id === id);
  const getBox = (id: string) => litterBoxes.find((b) => b.id === id);

  useEffect(() => {
    const itemsToAnimate: string[] = [];
    litterBoxes.forEach((box) => itemsToAnimate.push(`box-${box.id}`));
    recentRecords.forEach((record) => itemsToAnimate.push(`record-${record.id}`));

    itemsToAnimate.forEach((id, index) => {
      setTimeout(() => {
        setVisibleItems((prev) => new Set([...prev, id]));
      }, 50 * index);
    });
  }, [litterBoxes.length, recentRecords.length]);

  const openQuickRecord = (boxId: string) => {
    setSelectedBoxId(boxId);
    setFormMemberId(currentMemberId);
    setFormCleanTime(new Date().toISOString().slice(0, 16));
    setFormSmellLevel(2);
    setFormClumpLevel('少');
    setFormAddedLitter(false);
    setFormAddedAmount(0);
    setFormIsFullChange(false);
    setFormNote('');
    setModalOpen(true);
  };

  const handleSubmitRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoxId || !formMemberId || !formCleanTime) return;

    const newRecord: Omit<CleanRecord, 'id'> = {
      litterBoxId: selectedBoxId,
      memberId: formMemberId,
      cleanTime: new Date(formCleanTime).toISOString(),
      smellLevel: formSmellLevel,
      clumpLevel: formClumpLevel,
      addedLitter: formAddedLitter,
      addedAmount: formAddedAmount,
      isFullChange: formIsFullChange,
      note: formNote || undefined,
    };

    addRecord(newRecord);
    setModalOpen(false);
  };

  const statCards = [
    {
      label: '总猫砂盆数',
      value: totalBoxes,
      unit: '个',
      icon: Layers,
      bg: 'bg-[#A8C5A0]/15',
      iconColor: 'text-[#6B8E7A]',
      borderColor: 'border-[#A8C5A0]/30',
    },
    {
      label: '今日已清理',
      value: todayCleanCount,
      unit: '次',
      icon: Sparkles,
      bg: 'bg-[#E8C77A]/15',
      iconColor: 'text-[#C9A54A]',
      borderColor: 'border-[#E8C77A]/30',
    },
    {
      label: '待处理告警',
      value: totalAlerts,
      unit: '条',
      icon: Bell,
      bg: 'bg-[#D4896A]/15',
      iconColor: 'text-[#D4896A]',
      borderColor: 'border-[#D4896A]/30',
    },
    {
      label: '本月总清理',
      value: monthCleanCount,
      unit: '次',
      icon: Calendar,
      bg: 'bg-[#C48E9F]/15',
      iconColor: 'text-[#C48E9F]',
      borderColor: 'border-[#C48E9F]/30',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6F0] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#5C5040] tracking-tight">
            欢迎回来 🌿
          </h1>
          <p className="text-[#8B7E6B] text-base">
            让我们一起保持猫咪小窝的清洁舒适
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={cn(
                  'bg-white rounded-3xl p-5 lg:p-6 border shadow-sm transition-all duration-500 hover:shadow-lg hover:-translate-y-1',
                  card.borderColor
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out both',
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      'p-3 rounded-2xl',
                      card.bg
                    )}
                  >
                    <Icon
                      size={24}
                      className={card.iconColor}
                      strokeWidth={2}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl lg:text-4xl font-bold text-[#5C5040]">
                      {card.value}
                    </span>
                    <span className="text-sm text-[#8B7E6B] font-medium">
                      {card.unit}
                    </span>
                  </div>
                  <p className="text-sm text-[#A09484]">{card.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {alerts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#D4896A]/15">
                <Bell size={20} className="text-[#D4896A]" strokeWidth={2} />
              </div>
              <h2 className="text-xl font-semibold text-[#5C5040]">
                智能提醒
              </h2>
              <span className="px-2.5 py-1 rounded-full bg-[#D4896A]/20 text-[#8B4A2A] text-sm font-medium">
                {alerts.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#A8C5A0]/15">
                <Layers size={20} className="text-[#6B8E7A]" strokeWidth={2} />
              </div>
              <h2 className="text-xl font-semibold text-[#5C5040]">
                猫砂盆状态
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-5 lg:gap-6">
            {litterBoxes.map((box) => {
              const statusInfo = boxStatusMap.get(box.id);
              const lastCleanMember = statusInfo?.lastCleanMember
                ? getMember(statusInfo.lastCleanMember)
                : null;
              const boxCats = box.catIds
                .map((id) => getCat(id))
                .filter(Boolean);
              const isVisible = visibleItems.has(`box-${box.id}`);

              return (
                <div
                  key={box.id}
                  className={cn(
                    'bg-white rounded-3xl overflow-hidden border border-[#E8DFD2] shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1',
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4'
                  )}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={box.photo}
                      alt={box.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      {statusInfo && (
                        <StatusBadge
                          status={statusInfo.status}
                          size="sm"
                        />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-lg font-bold text-white drop-shadow-sm">
                        {box.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-2 text-[#8B7E6B] text-sm">
                      <MapPin size={14} strokeWidth={2} />
                      <span>{box.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#A09484]">使用猫咪</span>
                      <div className="flex -space-x-2">
                        {boxCats.map((cat) =>
                          cat ? (
                            <div
                              key={cat.id}
                              className="w-7 h-7 rounded-full bg-[#FAF6F0] border-2 border-white flex items-center justify-center text-sm shadow-sm"
                              title={cat.name}
                            >
                              {cat.avatar}
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>

                    {statusInfo?.lastCleanTime ? (
                      <div className="bg-[#FAF6F0] rounded-2xl p-3 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-[#A09484]">
                          <Clock size={12} strokeWidth={2} />
                          <span>上次清理 · {formatHours(statusInfo.hoursSinceLastClean)}前</span>
                        </div>
                        {lastCleanMember && (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                              style={{ backgroundColor: `${lastCleanMember.color}20` }}
                            >
                              {lastCleanMember.avatar}
                            </div>
                            <span className="text-sm font-medium text-[#5C5040]">
                              {lastCleanMember.name}
                            </span>
                            <span className="text-xs text-[#A09484]">
                              {formatRelativeTime(statusInfo.lastCleanTime)}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-[#FAF6F0] rounded-2xl p-3 text-sm text-[#A09484]">
                        暂无清理记录
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => openQuickRecord(box.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#D4896A] text-white text-sm font-medium transition-all duration-300 hover:bg-[#C47A5B] hover:shadow-md active:scale-95"
                      >
                        <Plus size={16} strokeWidth={2.5} />
                        快速记录
                      </button>
                      <Link
                        to={`/litter-boxes/${box.id}`}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-2xl border border-[#E8DFD2] text-[#8B7E6B] text-sm font-medium transition-all duration-300 hover:bg-[#FAF6F0] hover:text-[#5C5040]"
                      >
                        <span>详情</span>
                        <ArrowRight size={14} strokeWidth={2} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#8BA4B8]/15">
                <Clock size={20} className="text-[#6B8698]" strokeWidth={2} />
              </div>
              <h2 className="text-xl font-semibold text-[#5C5040]">最近活动</h2>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#E8DFD2] shadow-sm overflow-hidden">
            {recentRecords.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-[#FAF6F0] flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-[#A8C5A0]" strokeWidth={1.5} />
                </div>
                <p className="text-[#8B7E6B]">暂无清理记录</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F0E8DB]">
                {recentRecords.map((record, index) => {
                  const member = getMember(record.memberId);
                  const box = getBox(record.litterBoxId);
                  const isVisible = visibleItems.has(`record-${record.id}`);

                  return (
                    <div
                      key={record.id}
                      className={cn(
                        'p-5 lg:p-6 transition-all duration-500 hover:bg-[#FAF6F0]',
                        isVisible
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 -translate-x-4'
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg shadow-sm"
                            style={{
                              backgroundColor: member ? `${member.color}20` : '#FAF6F0',
                            }}
                          >
                            {member?.avatar || '👤'}
                          </div>
                          {index === 0 && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#A8C5A0] border-2 border-white flex items-center justify-center">
                              <CircleDot size={8} className="text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-2.5">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="font-semibold text-[#5C5040]">
                              {member?.name || '未知成员'}
                            </span>
                            <span className="text-[#C4B9A8]">·</span>
                            <span className="text-sm text-[#8B7E6B]">
                              清理了 <span className="font-medium text-[#5C5040]">{box?.name || '未知猫砂盆'}</span>
                            </span>
                            <span className="text-xs text-[#A09484] ml-auto">
                              {formatRelativeTime(record.cleanTime)}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            <StarRating
                              value={record.smellLevel}
                              size="sm"
                              showLabel={false}
                            />

                            <div className="flex items-center gap-1.5 text-xs text-[#8B7E6B]">
                              <span className="w-2 h-2 rounded-full bg-[#A8C5A0]" />
                              <span>结团 {record.clumpLevel}</span>
                            </div>

                            {record.addedLitter && (
                              <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-[#8BA4B8]/15 text-[#6B8698]">
                                <Droplets size={12} strokeWidth={2} />
                                <span>补砂 {record.addedAmount}g</span>
                              </div>
                            )}

                            {record.isFullChange && (
                              <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-[#C48E9F]/15 text-[#A46B80]">
                                <RefreshCw size={12} strokeWidth={2} />
                                <span>整盆换砂</span>
                              </div>
                            )}
                          </div>

                          {record.note && (
                            <p className="text-sm text-[#A09484] italic bg-[#FAF6F0] rounded-xl px-3 py-2">
                              "{record.note}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div
            className="relative bg-[#FAF6F0] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{ animation: 'modalIn 0.3s ease-out' }}
          >
            <div className="bg-gradient-to-r from-[#D4896A] to-[#C48E9F] p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">快速记录清理</h3>
                  <p className="text-white/80 text-sm mt-1">
                    {getBox(selectedBoxId)?.name || '选择猫砂盆'}
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 rounded-2xl bg-white/15 transition-colors hover:bg-white/25"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitRecord} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#5C5040]">
                  负责人
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setFormMemberId(m.id)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all',
                        formMemberId === m.id
                          ? 'border-[#D4896A] bg-white shadow-md'
                          : 'border-transparent bg-white/60 hover:bg-white'
                      )}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                        style={{ backgroundColor: `${m.color}25` }}
                      >
                        {m.avatar}
                      </div>
                      <span className="text-xs font-medium text-[#5C5040]">
                        {m.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#5C5040]">
                  清理时间
                </label>
                <input
                  type="datetime-local"
                  value={formCleanTime}
                  onChange={(e) => setFormCleanTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-[#E8DFD2] text-[#5C5040] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4896A]/50 focus:border-[#D4896A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#5C5040]">
                  异味等级
                </label>
                <div className="bg-white rounded-2xl p-3 border border-[#E8DFD2]">
                  <StarRating
                    value={formSmellLevel}
                    onChange={setFormSmellLevel}
                    size="lg"
                    interactive
                    showLabel
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#5C5040]">
                  结团情况
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['少', '中', '多'] as ClumpLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormClumpLevel(level)}
                      className={cn(
                        'py-2.5 rounded-2xl text-sm font-medium transition-all border-2',
                        formClumpLevel === level
                          ? 'border-[#D4896A] bg-[#D4896A] text-white shadow-md'
                          : 'border-transparent bg-white text-[#8B7E6B] hover:bg-[#FAF6F0]'
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer p-4 rounded-2xl bg-white border border-[#E8DFD2] hover:border-[#D4896A]/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#8BA4B8]/15">
                      <Droplets size={16} className="text-[#6B8698]" strokeWidth={2} />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#5C5040] block">
                        补充猫砂
                      </span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'w-11 h-6 rounded-full relative transition-colors',
                      formAddedLitter ? 'bg-[#A8C5A0]' : 'bg-[#D4CCC0]'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                        formAddedLitter ? 'translate-x-5' : 'translate-x-0.5'
                      )}
                    />
                  </div>
                  <input
                    type="checkbox"
                    checked={formAddedLitter}
                    onChange={(e) => {
                      setFormAddedLitter(e.target.checked);
                      if (!e.target.checked) setFormAddedAmount(0);
                      else setFormAddedAmount(200);
                    }}
                    className="hidden"
                  />
                </label>

                {formAddedLitter && (
                  <div className="pl-2 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#8B7E6B] w-16">补砂量</span>
                      <input
                        type="range"
                        min="100"
                        max="1000"
                        step="100"
                        value={formAddedAmount}
                        onChange={(e) =>
                          setFormAddedAmount(Number(e.target.value))
                        }
                        className="flex-1 accent-[#D4896A]"
                      />
                      <span className="text-sm font-medium text-[#5C5040] w-16 text-right">
                        {formAddedAmount}g
                      </span>
                    </div>
                  </div>
                )}

                <label className="flex items-center justify-between cursor-pointer p-4 rounded-2xl bg-white border border-[#E8DFD2] hover:border-[#C48E9F]/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#C48E9F]/15">
                      <RefreshCw size={16} className="text-[#A46B80]" strokeWidth={2} />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#5C5040] block">
                        整盆换砂
                      </span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'w-11 h-6 rounded-full relative transition-colors',
                      formIsFullChange ? 'bg-[#C48E9F]' : 'bg-[#D4CCC0]'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                        formIsFullChange ? 'translate-x-5' : 'translate-x-0.5'
                      )}
                    />
                  </div>
                  <input
                    type="checkbox"
                    checked={formIsFullChange}
                    onChange={(e) => setFormIsFullChange(e.target.checked)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#5C5040]">
                  备注（可选）
                </label>
                <textarea
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="记录特殊情况..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-[#E8DFD2] text-[#5C5040] text-sm placeholder:text-[#C4B9A8] focus:outline-none focus:ring-2 focus:ring-[#D4896A]/50 focus:border-[#D4896A] transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-white border border-[#E8DFD2] text-[#8B7E6B] font-medium transition-all hover:bg-[#FAF6F0]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#D4896A] to-[#C48E9F] text-white font-medium transition-all hover:shadow-lg active:scale-95"
                >
                  确认记录
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
