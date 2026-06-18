import { useState, useMemo } from 'react';
import {
  Droplets,
  Scissors,
  XCircle,
  Sparkles,
  User,
  StickyNote,
  HelpCircle,
  ClipboardList,
} from 'lucide-react';
import { useDiveStore } from '@/store/useDiveStore';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import type { Equipment } from '@/types';
import { EQUIPMENT_TYPE_LABELS } from '@/types';

interface CleanerStat {
  memberId: string | null;
  memberName: string;
  memberAvatar: string;
  total: number;
  waterIntrusion: number;
  scratches: number;
  lost: number;
  isUnassigned?: boolean;
}

export default function Return() {
  const {
    equipment,
    members,
    updateReturnCheck,
    getReturnCheck,
    returnChecks,
  } = useDiveStore();

  const [filter, setFilter] = useState<'all' | 'checked' | 'unchecked'>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [highlightCleanerId, setHighlightCleanerId] = useState<string | null>(null);

  const getEquipmentIcon = (type: string) => {
    const icons: Record<string, string> = {
      mask: '🤿',
      snorkel: '🫧',
      fins: '🦶',
      rashGuard: '👕',
      lifeJacket: '🦺',
      dryBag: '🎒',
      actionCam: '📷',
    };
    return icons[type] || '📦';
  };

  const isChecked = (eqId: string) => {
    const check = getReturnCheck(eqId);
    return check !== undefined;
  };

  const hasIssues = (eqId: string) => {
    const check = getReturnCheck(eqId);
    return check && (check.waterIntrusion || check.scratches || check.lost);
  };

  const normalizeCleanedById = (rawCleanedBy?: string): string | null => {
    if (!rawCleanedBy) return null;
    const byId = members.find((m) => m.id === rawCleanedBy);
    if (byId) return byId.id;
    const byName = members.find((m) => m.name === rawCleanedBy);
    if (byName) return byName.id;
    return rawCleanedBy;
  };

  const getCleanerMember = (
    equipmentId: string
  ): { id: string | null; name: string; avatar: string } | null => {
    const check = getReturnCheck(equipmentId);
    if (!check?.cleanedBy) return null;
    const normalizedId = normalizeCleanedById(check.cleanedBy);
    const member = members.find((m) => m.id === normalizedId);
    if (member) {
      return { id: member.id, name: member.name, avatar: member.avatar || '🧑' };
    }
    return {
      id: normalizedId,
      name: check.cleanedBy,
      avatar: '🧑',
    };
  };

  const cleanerStats = useMemo<CleanerStat[]>(() => {
    const statsMap = new Map<string | null, CleanerStat>();

    members.forEach((m) => {
      statsMap.set(m.id, {
        memberId: m.id,
        memberName: m.name,
        memberAvatar: m.avatar || '🧑',
        total: 0,
        waterIntrusion: 0,
        scratches: 0,
        lost: 0,
      });
    });

    statsMap.set(null, {
      memberId: null,
      memberName: '待认领',
      memberAvatar: '❓',
      total: 0,
      waterIntrusion: 0,
      scratches: 0,
      lost: 0,
      isUnassigned: true,
    });

    equipment.forEach((eq) => {
      if (eq.status === 'lost') return;

      const check = getReturnCheck(eq.id);

      if (check) {
        const rawCleaner = check.cleanedBy || null;
        let cleanerId: string | null = null;
        let cleanerName = '待认领';
        let cleanerAvatar = '❓';
        let isUnassigned = true;

        if (rawCleaner) {
          const byId = members.find((m) => m.id === rawCleaner);
          const byName = members.find((m) => m.name === rawCleaner);
          const matched = byId || byName;
          if (matched) {
            cleanerId = matched.id;
            cleanerName = matched.name;
            cleanerAvatar = matched.avatar || '🧑';
            isUnassigned = false;
          } else {
            cleanerId = rawCleaner;
            cleanerName = rawCleaner;
            cleanerAvatar = '🧑';
            isUnassigned = false;
          }
        }

        const stat = statsMap.get(cleanerId);
        if (!stat) {
          statsMap.set(cleanerId, {
            memberId: cleanerId,
            memberName: cleanerName,
            memberAvatar: cleanerAvatar,
            total: 0,
            waterIntrusion: 0,
            scratches: 0,
            lost: 0,
            isUnassigned,
          });
        }
        const targetStat = statsMap.get(cleanerId)!;
        targetStat.total++;
        if (check.waterIntrusion) targetStat.waterIntrusion++;
        if (check.scratches) targetStat.scratches++;
        if (check.lost) targetStat.lost++;
      } else {
        const unassignedStat = statsMap.get(null)!;
        unassignedStat.total++;
      }
    });

    return Array.from(statsMap.values()).filter((s) => s.total > 0);
  }, [equipment, members, returnChecks, getReturnCheck]);

  const filteredEquipment = equipment.filter((eq) => {
    if (filter === 'checked') return isChecked(eq.id);
    if (filter === 'unchecked') return !isChecked(eq.id);
    return true;
  });

  const toggleIssue = (
    equipmentId: string,
    field: 'waterIntrusion' | 'scratches' | 'lost'
  ) => {
    const current = getReturnCheck(equipmentId) || {
      waterIntrusion: false,
      scratches: false,
      lost: false,
    };
    updateReturnCheck(equipmentId, {
      ...current,
      [field]: !current[field],
    });
  };

  const setCleanedBy = (equipmentId: string, memberId: string) => {
    const current = getReturnCheck(equipmentId) || {
      waterIntrusion: false,
      scratches: false,
      lost: false,
    };
    updateReturnCheck(equipmentId, {
      ...current,
      cleanedBy: memberId || undefined,
    });
  };

  const setNotes = (equipmentId: string, notes: string) => {
    const current = getReturnCheck(equipmentId) || {
      waterIntrusion: false,
      scratches: false,
      lost: false,
    };
    updateReturnCheck(equipmentId, {
      ...current,
      notes,
    });
  };

  const handleToggleHighlight = (memberId: string | null) => {
    setHighlightCleanerId((prev) => (prev === memberId ? null : memberId));
  };

  const isHighlighted = (eqId: string) => {
    if (highlightCleanerId === null) return false;
    const cleaner = getCleanerMember(eqId);
    if (!cleaner) return highlightCleanerId === '';
    return cleaner.id === highlightCleanerId;
  };

  const stats = {
    total: equipment.length,
    checked: returnChecks.length,
    withIssues: returnChecks.filter(
      (r) => r.waterIntrusion || r.scratches || r.lost
    ).length,
    cleaned: returnChecks.filter((r) => r.cleanedBy).length,
  };

  const totalWaterIntrusion = returnChecks.filter((r) => r.waterIntrusion).length;
  const totalScratches = returnChecks.filter((r) => r.scratches).length;
  const totalLost = returnChecks.filter((r) => r.lost).length;
  const totalUnassigned = cleanerStats.find((s) => s.isUnassigned)?.total || 0;

  return (
    <div>
      <PageHeader
        title="归还检查"
        subtitle="行程结束后检查装备状态，明确清洗责任"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-ocean-500 mb-1">装备总数</p>
          <p className="font-display text-2xl font-bold text-ocean-800">
            {stats.total}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-ocean-500 mb-1">已检查</p>
          <p className="font-display text-2xl font-bold text-seafoam-600">
            {stats.checked}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-ocean-500 mb-1">有问题</p>
          <p className="font-display text-2xl font-bold text-coral-500">
            {stats.withIssues}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-ocean-500 mb-1">待清洗</p>
          <p className="font-display text-2xl font-bold text-sand-600">
            {stats.total - stats.cleaned}
          </p>
        </div>
      </div>

      {cleanerStats.length > 0 && (
        <div className="glass-card rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-ocean-600" />
            <h3 className="font-display font-bold text-ocean-800">
              责任人汇总
            </h3>
            <span className="text-sm text-ocean-500 ml-1">
              — 按人统计问题{highlightCleanerId !== null ? '，点击取消高亮' : '，点击名字高亮对应装备'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {cleanerStats.map((stat) => {
              const isHighlightedCard =
                highlightCleanerId === (stat.memberId || '');

              return (
                <button
                  key={stat.memberId || 'unassigned'}
                  onClick={() => handleToggleHighlight(stat.memberId || '')}
                  className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                    isHighlightedCard
                      ? 'border-ocean-500 bg-ocean-50 shadow-lg shadow-ocean-500/15 scale-[1.02]'
                      : stat.isUnassigned
                        ? 'border-sand-200 bg-sand-50/50 hover:border-sand-400 hover:bg-sand-50'
                        : 'border-ocean-100 bg-white/70 hover:border-ocean-300 hover:bg-ocean-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{stat.memberAvatar}</span>
                    <div className="min-w-0 flex-1">
                      <span
                        className={`font-display font-bold text-sm block truncate ${
                          isHighlightedCard ? 'text-ocean-700' : 'text-ocean-800'
                        }`}
                      >
                        {stat.memberName}
                      </span>
                      <span className="text-[10px] text-ocean-400">
                        {stat.total} 件装备
                      </span>
                    </div>
                    {isHighlightedCard && (
                      <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-ocean-500 animate-pulse" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Droplets className="w-3.5 h-3.5 text-coral-500" />
                      </div>
                      <p
                        className={`font-display font-bold text-lg leading-none ${
                          stat.waterIntrusion > 0
                            ? 'text-coral-600'
                            : 'text-ocean-300'
                        }`}
                      >
                        {stat.waterIntrusion}
                      </p>
                      <p className="text-[10px] text-ocean-500 mt-0.5">进水</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Scissors className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <p
                        className={`font-display font-bold text-lg leading-none ${
                          stat.scratches > 0
                            ? 'text-amber-600'
                            : 'text-ocean-300'
                        }`}
                      >
                        {stat.scratches}
                      </p>
                      <p className="text-[10px] text-ocean-500 mt-0.5">划痕</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <XCircle className="w-3.5 h-3.5 text-coral-600" />
                      </div>
                      <p
                        className={`font-display font-bold text-lg leading-none ${
                          stat.lost > 0 ? 'text-coral-700' : 'text-ocean-300'
                        }`}
                      >
                        {stat.lost}
                      </p>
                      <p className="text-[10px] text-ocean-500 mt-0.5">丢失</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        {stat.isUnassigned ? (
                          <HelpCircle className="w-3.5 h-3.5 text-sand-600" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-seafoam-500" />
                        )}
                      </div>
                      <p className="font-display font-bold text-lg leading-none text-ocean-600">
                        {stat.total}
                      </p>
                      <p className="text-[10px] text-ocean-500 mt-0.5">
                        {stat.isUnassigned ? '待认领' : '负责'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-ocean-100">
            <div className="flex items-center gap-4 text-sm text-ocean-500">
              <span className="flex items-center gap-1">
                <Droplets className="w-4 h-4 text-coral-500" />
                进水 {totalWaterIntrusion} 件
              </span>
              <span className="flex items-center gap-1">
                <Scissors className="w-4 h-4 text-amber-500" />
                划痕 {totalScratches} 件
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-coral-600" />
                丢失 {totalLost} 件
              </span>
              <span className="flex items-center gap-1">
                <HelpCircle className="w-4 h-4 text-sand-600" />
                待认领 {totalUnassigned} 件
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl p-2 mb-6 inline-flex">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-ocean-500 text-white shadow-lg'
              : 'text-ocean-600 hover:bg-ocean-50'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setFilter('checked')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'checked'
              ? 'bg-ocean-500 text-white shadow-lg'
              : 'text-ocean-600 hover:bg-ocean-50'
          }`}
        >
          已检查
        </button>
        <button
          onClick={() => setFilter('unchecked')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'unchecked'
              ? 'bg-ocean-500 text-white shadow-lg'
              : 'text-ocean-600 hover:bg-ocean-50'
          }`}
        >
          待检查
        </button>
      </div>

      <div className="space-y-3">
        {filteredEquipment.map((eq: Equipment) => {
          const check = getReturnCheck(eq.id);
          const checked = isChecked(eq.id);
          const issues = hasIssues(eq.id);
          const eqHighlighted = isHighlighted(eq.id);
          const isUnassignedMode = highlightCleanerId === '';
          const dimmed =
            highlightCleanerId !== null &&
            !eqHighlighted &&
            !(isUnassignedMode && !check?.cleanedBy);

          const showHighlight =
            highlightCleanerId !== null &&
            (eqHighlighted || (isUnassignedMode && !check?.cleanedBy));

          return (
            <div
              key={eq.id}
              className={`glass-card rounded-2xl overflow-hidden transition-all duration-200 ${
                selectedEquipment === eq.id ? 'shadow-float' : 'hover:shadow-lg'
              } ${
                showHighlight
                  ? 'ring-2 ring-ocean-500 ring-offset-2 shadow-lg shadow-ocean-500/20'
                  : ''
              } ${dimmed ? 'opacity-40' : ''}`}
            >
              <div
                className="p-5 cursor-pointer"
                onClick={() =>
                  setSelectedEquipment(
                    selectedEquipment === eq.id ? null : eq.id
                  )
                }
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-ocean-100 to-ocean-200 flex items-center justify-center text-3xl shrink-0">
                    {getEquipmentIcon(eq.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-ocean-800 truncate">
                        {eq.name}
                      </h3>
                      {checked ? (
                        <Badge variant="success" size="sm">
                          已检查
                        </Badge>
                      ) : (
                        <Badge variant="default" size="sm">
                          待检查
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-ocean-500">
                      {EQUIPMENT_TYPE_LABELS[eq.type]} · {eq.size} · 拥有者:{' '}
                      {eq.owner}
                    </p>
                    {check?.cleanedBy && (
                      <p className="text-xs text-seafoam-600 mt-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        由 {getCleanerMember(eq.id)?.name}{' '}
                        负责清洗
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {check?.waterIntrusion && (
                      <div
                        className="w-9 h-9 rounded-lg bg-coral-100 flex items-center justify-center"
                        title="进水"
                      >
                        <Droplets className="w-5 h-5 text-coral-600" />
                      </div>
                    )}
                    {check?.scratches && (
                      <div
                        className="w-9 h-9 rounded-lg bg-sand-100 flex items-center justify-center"
                        title="划痕"
                      >
                        <Scissors className="w-5 h-5 text-amber-600" />
                      </div>
                    )}
                    {check?.lost && (
                      <div
                        className="w-9 h-9 rounded-lg bg-coral-100 flex items-center justify-center"
                        title="丢失"
                      >
                        <XCircle className="w-5 h-5 text-coral-600" />
                      </div>
                    )}
                    {check?.cleanedBy && (
                      <div
                        className="w-9 h-9 rounded-lg bg-seafoam-100 flex items-center justify-center"
                        title="已分配清洗"
                      >
                        <Sparkles className="w-5 h-5 text-seafoam-600" />
                      </div>
                    )}
                    {!check?.cleanedBy && checked && (
                      <div
                        className="w-9 h-9 rounded-lg bg-sand-100 flex items-center justify-center"
                        title="待认领清洗"
                      >
                        <HelpCircle className="w-5 h-5 text-amber-600" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedEquipment === eq.id && (
                <div className="px-5 pb-5 border-t border-ocean-100 pt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-ocean-700 mb-2">
                      装备状态
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleIssue(eq.id, 'waterIntrusion');
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                          check?.waterIntrusion
                            ? 'border-coral-400 bg-coral-50 text-coral-700'
                            : 'border-ocean-200 bg-white text-ocean-600 hover:border-ocean-300'
                        }`}
                      >
                        <Droplets className="w-4 h-4" />
                        <span className="text-sm font-medium">进水</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleIssue(eq.id, 'scratches');
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                          check?.scratches
                            ? 'border-sand-400 bg-sand-50 text-amber-700'
                            : 'border-ocean-200 bg-white text-ocean-600 hover:border-ocean-300'
                        }`}
                      >
                        <Scissors className="w-4 h-4" />
                        <span className="text-sm font-medium">划痕</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleIssue(eq.id, 'lost');
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                          check?.lost
                            ? 'border-coral-500 bg-coral-50 text-coral-700'
                            : 'border-ocean-200 bg-white text-ocean-600 hover:border-ocean-300'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">丢失</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-ocean-700 mb-2">
                      <User className="w-4 h-4" />
                      谁负责清洗晾干
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {members.map((member) => (
                        <button
                          key={member.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCleanedBy(
                              eq.id,
                              check?.cleanedBy === member.id
                                ? ''
                                : member.id
                            );
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                            check?.cleanedBy === member.id
                              ? 'bg-seafoam-500 text-white shadow-md'
                              : 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100'
                          }`}
                        >
                          <span>{member.avatar}</span>
                          <span>{member.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-ocean-700 mb-2">
                      <StickyNote className="w-4 h-4" />
                      备注
                    </label>
                    <textarea
                      value={check?.notes || ''}
                      onChange={(e) => setNotes(eq.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="记录装备状态、损坏详情等..."
                      className="w-full px-4 py-2.5 rounded-xl border border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 outline-none transition-all bg-white resize-none text-sm"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredEquipment.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🏖️</div>
            <p className="text-ocean-500">
              {filter === 'checked'
                ? '还没有检查过的装备'
                : '所有装备都已检查完毕'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
