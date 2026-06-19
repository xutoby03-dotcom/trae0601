import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shuffle,
  Save,
  Users,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Info,
  Fish,
  Wine,
  Moon,
  GripVertical,
} from 'lucide-react';
import { usePlanStore } from '@/store/usePlanStore';
import { useMemberStore } from '@/store/useMemberStore';
import { cn } from '@/lib/utils';
import { ALLERGY_OPTIONS, RELIGIOUS_DIET_OPTIONS } from '../../../shared/types';

export default function SeatingArrangement() {
  const { id } = useParams<{ id: string }>();
  const {
    currentPlan,
    seating,
    conflicts,
    fetchPlanById,
    generateSeating,
    saveSeating,
    getConflicts,
    loading,
  } = usePlanStore();
  const { members, fetchMembers } = useMemberStore();

  const [localTables, setLocalTables] = useState<Table[]>([]);
  const [draggedMember, setDraggedMember] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPlanById(id);
      fetchMembers();
    }
  }, [id, fetchPlanById, fetchMembers]);

  useEffect(() => {
    if (seating?.tables) {
      setLocalTables(seating.tables);
    }
  }, [seating]);

  useEffect(() => {
    if (id && localTables.length > 0) {
      getConflicts(id);
    }
  }, [id, localTables, getConflicts]);

  const assignedMemberIds = localTables.flatMap((t) => t.memberIds);
  const unassignedMembers = members.filter((m) => !assignedMemberIds.includes(m.id));

  const handleGenerateSeating = async () => {
    if (id) {
      await generateSeating(id);
    }
  };

  const handleSaveSeating = async () => {
    if (id) {
      await saveSeating(id, localTables);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    }
  };

  const handleDragStart = (memberId: string) => {
    setDraggedMember(memberId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnTable = (tableId: number) => {
    if (!draggedMember) return;

    setLocalTables((prev) => {
      const newTables = prev.map((table) => {
        if (table.memberIds.includes(draggedMember!)) {
          return {
            ...table,
            memberIds: table.memberIds.filter((id) => id !== draggedMember),
          };
        }
        return table;
      });

      return newTables.map((table) => {
        if (table.id === tableId) {
          const maxSeats = currentPlan?.seatsPerTable || 10;
          if (table.memberIds.length >= maxSeats) {
            return table;
          }
          return {
            ...table,
            memberIds: [...table.memberIds, draggedMember!],
          };
        }
        return table;
      });
    });

    setDraggedMember(null);
  };

  const handleDropUnassigned = () => {
    if (!draggedMember) return;

    setLocalTables((prev) =>
      prev.map((table) => ({
        ...table,
        memberIds: table.memberIds.filter((id) => id !== draggedMember),
      }))
    );

    setDraggedMember(null);
  };

  const handleMoveMember = (memberId: string, fromTableId: number, toTableId: number) => {
    if (fromTableId === toTableId) return;

    setLocalTables((prev) =>
      prev.map((table) => {
        if (table.id === fromTableId) {
          return {
            ...table,
            memberIds: table.memberIds.filter((id) => id !== memberId),
          };
        }
        if (table.id === toTableId) {
          const maxSeats = currentPlan?.seatsPerTable || 10;
          if (table.memberIds.length >= maxSeats) {
            return table;
          }
          return {
            ...table,
            memberIds: [...table.memberIds, memberId],
          };
        }
        return table;
      })
    );
  };

  const getMemberById = (memberId: string) => members.find((m) => m.id === memberId);

  const getTableConflicts = (tableId: number) =>
    conflicts.filter((c) => c.tableId === tableId);

  const getMemberBadges = (member: Member) => {
    const badges: { icon: React.ComponentType<{ size?: number }>; label: string; color: string }[] = [];

    member.allergies.forEach((allergy) => {
      const option = ALLERGY_OPTIONS.find((o) => o.value === allergy);
      if (option) {
        badges.push({
          icon: Fish,
          label: option.label,
          color: 'bg-red-50 text-red-700 border-red-200',
        });
      }
    });

    if (member.religiousDiet) {
      const option = RELIGIOUS_DIET_OPTIONS.find((o) => o.value === member.religiousDiet);
      if (option) {
        badges.push({
          icon: Moon,
          label: option.label,
          color: 'bg-purple-50 text-purple-700 border-purple-200',
        });
      }
    }

    if (!member.drinksAlcohol) {
      badges.push({
        icon: Wine,
        label: '不喝酒',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
      });
    }

    return badges;
  };

  const getConflictIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return AlertTriangle;
      case 'medium':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getConflictColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-danger-50 border-danger-200 text-danger-700';
      case 'medium':
        return 'bg-warning-50 border-warning-200 text-warning-700';
      default:
        return 'bg-info-50 border-info-200 text-info-700';
    }
  };

  const getConflictTypeLabel = (type: string) => {
    switch (type) {
      case 'allergy':
        return '过敏冲突';
      case 'vegetarian':
        return '素食不足';
      case 'religious':
        return '宗教禁忌';
      case 'seating':
        return '座位容量';
      case 'spiciness':
        return '辣度不匹配';
      case 'alcohol':
        return '酒精配置';
      default:
        return '其他冲突';
    }
  };

  if (!currentPlan && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">方案不存在</p>
        <Link to="/plans" className="btn-primary mt-4">
          返回方案列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <Link
            to={`/plans/${id}`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            返回方案详情
          </Link>
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
            智能分桌
          </h1>
          <p className="text-slate-500">
            {currentPlan?.name} · {currentPlan?.restaurant}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerateSeating}
            className="btn-secondary"
            disabled={loading}
          >
            <Shuffle size={16} />
            重新分配
          </button>
          <button
            onClick={handleSaveSeating}
            className="btn-primary relative"
            disabled={loading || localTables.length === 0}
          >
            <Save size={16} />
            保存方案
            {showSaveSuccess && (
              <span className="absolute inset-0 flex items-center justify-center bg-primary-600 rounded-lg animate-fade-in">
                <CheckCircle size={16} className="mr-2" />
                已保存
              </span>
            )}
          </button>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <AlertTriangle size={18} className="text-warning-500" />
            冲突检测 ({conflicts.length}项)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {conflicts.map((conflict, index) => {
              const Icon = getConflictIcon(conflict.severity);
              return (
                <div
                  key={index}
                  className={cn(
                    'p-4 rounded-xl border animate-fade-in-up',
                    getConflictColor(conflict.severity)
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <Icon size={18} className="flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/50">
                          {getConflictTypeLabel(conflict.type)}
                        </span>
                        {conflict.tableId && (
                          <span className="text-xs font-medium">
                            #{conflict.tableId}桌
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium">{conflict.message}</p>
                      <p className="text-xs mt-1 opacity-75">
                        建议：{conflict.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-6">
            <h3 className="font-display text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users size={18} />
              待分配成员 ({unassignedMembers.length})
            </h3>

            {unassignedMembers.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle size={32} className="text-success-500 mx-auto mb-2" />
                <p className="text-sm text-slate-500">所有成员已分配</p>
              </div>
            ) : (
              <div
                className="space-y-2 max-h-[600px] overflow-y-auto pr-1"
                onDragOver={handleDragOver}
                onDrop={handleDropUnassigned}
              >
                {unassignedMembers.map((member) => (
                  <div
                    key={member.id}
                    draggable
                    onDragStart={() => handleDragStart(member.id)}
                    className={cn(
                      'p-3 rounded-xl border border-slate-200 bg-white cursor-move hover:border-primary-300 hover:bg-primary-50 transition-all animate-fade-in-up',
                      draggedMember === member.id && 'opacity-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical size={14} className="text-slate-400" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">
                          {member.name}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getMemberBadges(member).slice(0, 2).map((badge, i) => (
                            <span
                              key={i}
                              className={cn('text-xs px-1.5 py-0.5 rounded border', badge.color)}
                            >
                              {badge.label}
                            </span>
                          ))}
                          {getMemberBadges(member).length > 2 && (
                            <span className="text-xs px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600">
                              +{getMemberBadges(member).length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-medium text-slate-900 mb-3">图例说明</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-red-100 border border-red-200"></span>
                  <span className="text-slate-600">过敏/高风险</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-purple-100 border border-purple-200"></span>
                  <span className="text-slate-600">宗教禁忌</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-100 border border-amber-200"></span>
                  <span className="text-slate-600">不饮酒</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200"></span>
                  <span className="text-slate-600">素食</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {localTables.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shuffle size={32} className="text-primary-600" />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                开始智能分桌
              </h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                系统将根据成员的饮食禁忌和偏好，智能分配座位以避免冲突。
                分配后您可以手动拖拽调整。
              </p>
              <button
                onClick={handleGenerateSeating}
                className="btn-primary"
                disabled={loading}
              >
                <Shuffle size={16} />
                一键智能分配
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {localTables.map((table, tableIndex) => {
                const tableConflicts = getTableConflicts(table.id);
                const hasHighRisk = tableConflicts.some((c) => c.severity === 'high');
                const memberList = table.memberIds
                  .map(getMemberById)
                  .filter(Boolean) as Member[];

                return (
                  <div
                    key={table.id}
                    className={cn(
                      'card p-6 transition-all animate-fade-in-up',
                      selectedTable === table.id && 'ring-2 ring-primary-400',
                      hasHighRisk && 'border-danger-300 bg-danger-50/30'
                    )}
                    style={{ animationDelay: `${tableIndex * 100}ms` }}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDropOnTable(table.id)}
                    onClick={() => setSelectedTable(table.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                          {table.name}
                          {tableConflicts.length > 0 && (
                            <span className="badge bg-danger-100 text-danger-700 animate-pulse-soft">
                              {tableConflicts.length} 项冲突
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {memberList.length} / {currentPlan?.seatsPerTable} 人
                        </p>
                      </div>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-teal-100 flex items-center justify-center border-4 border-primary-200">
                        <span className="font-display text-xl font-bold text-primary-700">
                          {table.id}
                        </span>
                      </div>
                    </div>

                    {tableConflicts.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {tableConflicts.map((conflict, i) => {
                          const Icon = getConflictIcon(conflict.severity);
                          return (
                            <div
                              key={i}
                              className={cn(
                                'p-2 rounded-lg border text-xs flex items-start gap-2',
                                getConflictColor(conflict.severity)
                              )}
                            >
                              <Icon size={14} className="flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium">{conflict.message}</p>
                                <p className="opacity-75 mt-0.5">
                                  建议：{conflict.suggestion}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {memberList.map((member) => {
                        const badges = getMemberBadges(member);
                        return (
                          <div
                            key={member.id}
                            draggable
                            onDragStart={() => handleDragStart(member.id)}
                            className={cn(
                              'p-3 rounded-xl border transition-all cursor-move group',
                              member.confirmed
                                ? 'bg-white border-slate-200 hover:border-primary-300'
                                : 'bg-slate-50 border-slate-200 border-dashed'
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <GripVertical
                                size={14}
                                className="text-slate-300 group-hover:text-slate-500 transition-colors mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <p className="font-medium text-slate-900 text-sm truncate">
                                    {member.name}
                                  </p>
                                  {!member.confirmed && (
                                    <span className="text-xs text-warning-600">
                                      (未确认)
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {badges.map((badge, i) => (
                                    <span
                                      key={i}
                                      className={cn(
                                        'text-xs px-1.5 py-0.5 rounded border',
                                        badge.color
                                      )}
                                    >
                                      {badge.label}
                                    </span>
                                  ))}
                                </div>
                                {member.notes && (
                                  <p className="text-xs text-slate-400 mt-1 truncate">
                                    {member.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {Array.from({
                        length: (currentPlan?.seatsPerTable || 10) - memberList.length,
                      }).map((_, i) => (
                        <div
                          key={`empty-${i}`}
                          className="p-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center"
                        >
                          <span className="text-xs text-slate-400">空位</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <label className="text-xs font-medium text-slate-500 block mb-2">
                        快速移动至其他桌
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {localTables
                          .filter((t) => t.id !== table.id)
                          .map((t) => (
                            <button
                              key={t.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                const memberToMove = memberList[0];
                                if (memberToMove) {
                                  handleMoveMember(memberToMove.id, table.id, t.id);
                                }
                              }}
                              disabled={memberList.length === 0}
                              className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              → {t.name}
                            </button>
                          ))}
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
  );
}
