import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Backpack,
  Lock,
  X,
  Plus,
  Minus,
  CheckCircle2,
  Route,
  UserRound,
  PackageOpen,
  GripVertical,
  Users,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import LoadProgressBar from '@/components/LoadProgressBar';
import StrengthStars from '@/components/StrengthStars';
import ImportanceTag from '@/components/ImportanceTag';
import CategoryTag from '@/components/CategoryTag';
import {
  getMemberTotalWeightGrams,
  getRecommendedLoadKg,
  getLoadStatus,
  getLoadRatioPercent,
  getSupplyRemainingQuantity,
  formatWeight,
  getUnassignedSupplies,
} from '@/utils/calculations';
import type { Member, Supply, Assignment } from '@/types';

interface AssignmentItemProps {
  assignment: Assignment;
  supply: Supply;
  member: Member;
}

function AssignmentItem({ assignment, supply, member }: AssignmentItemProps) {
  const { unassignSupply, updateAssignmentQuantity, toggleSegmentUsed, segments } = useAppStore();
  const isFirstAid = supply.category === 'first_aid';
  const availableQty = assignment.quantityAssigned - assignment.usedSegments.length;

  return (
    <div className="p-3 rounded-lg bg-parchment-50 border border-parchment-200 hover:border-forest-300 transition-colors group">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 opacity-30 group-hover:opacity-60 transition-opacity cursor-grab">
          <GripVertical size={14} className="text-earth-500" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-forest-800 text-sm">{supply.name}</span>
            <CategoryTag category={supply.category} size="sm" />
            {isFirstAid && (
              <span className="tag bg-firstaid-50 text-firstaid-600 ring-1 ring-inset ring-firstaid-200">
                <Lock size={10} />
                急救
              </span>
            )}
            {supply.isFragile && (
              <span className="tag bg-warn-50 text-warn-600 ring-1 ring-inset ring-warn-200">
                🥚 易碎
              </span>
            )}
          </div>
          <div className="text-xs text-earth-600 mt-1">
            {formatWeight(supply.weightGrams)} × {assignment.quantityAssigned} ={' '}
            <span className="font-semibold text-forest-700">
              {formatWeight(supply.weightGrams * assignment.quantityAssigned)}
            </span>
          </div>

          {supply.isConsumable && segments.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-1 text-[10px] text-earth-600 mb-1">
                <Route size={10} />
                路段消耗标记：
              </div>
              <div className="flex flex-wrap gap-1">
                {segments.map((seg) => {
                  const used = assignment.usedSegments.includes(seg.id);
                  const usedCount = assignment.usedSegments.length;
                  const maxQty = assignment.quantityAssigned;
                  const isDisabled = !used && usedCount >= maxQty;
                  return (
                    <button
                      key={seg.id}
                      disabled={isDisabled}
                      onClick={() => toggleSegmentUsed(assignment.id, seg.id)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                        used
                          ? 'bg-forest-600 text-white line-through opacity-70'
                          : isDisabled
                            ? 'bg-parchment-200 text-parchment-400 cursor-not-allowed'
                            : 'bg-white text-forest-700 border border-parchment-300 hover:bg-forest-50 hover:border-forest-300'
                      }`}
                    >
                      {used && <CheckCircle2 size={9} className="inline mr-0.5" />}
                      段{seg.order}
                    </button>
                  );
                })}
              </div>
              {assignment.usedSegments.length > 0 && (
                <div className="text-[10px] text-earth-500 mt-1">
                  已用 {assignment.usedSegments.length}/{assignment.quantityAssigned} · 剩余 {availableQty} 件
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1 bg-white rounded-lg border border-parchment-200 p-0.5">
            <button
              onClick={() =>
                updateAssignmentQuantity(assignment.id, assignment.quantityAssigned - 1)
              }
              disabled={assignment.quantityAssigned <= 1}
              className="p-1 rounded text-earth-500 hover:bg-parchment-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="text-sm font-semibold text-forest-800 w-6 text-center">
              {assignment.quantityAssigned}
            </span>
            <button
              onClick={() =>
                updateAssignmentQuantity(assignment.id, assignment.quantityAssigned + 1)
              }
              disabled={getSupplyRemainingQuantity(supply, useAppStore.getState().assignments) <= 0}
              className="p-1 rounded text-earth-500 hover:bg-parchment-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
          {isFirstAid ? (
            <span className="text-[10px] text-firstaid-600 flex items-center gap-0.5">
              <Lock size={10} />
              不可移除
            </span>
          ) : (
            <button
              onClick={() => unassignSupply(assignment.id)}
              className="p-1 rounded text-earth-400 hover:bg-firstaid-50 hover:text-firstaid-600 transition-colors"
              title="移除此物资"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface MemberPanelProps {
  member: Member;
  highlightSupplyId: string | null;
  onHighlightConsumed: () => void;
}

function MemberPanel({ member, highlightSupplyId, onHighlightConsumed }: MemberPanelProps) {
  const { supplies, assignments, assignSupply } = useAppStore();
  const [showAssign, setShowAssign] = useState(false);

  const memberAssignments = assignments.filter((a) => a.memberId === member.id);
  const weight = getMemberTotalWeightGrams(member.id, assignments, supplies);
  const recommended = getRecommendedLoadKg(member.strengthLevel);
  const status = getLoadStatus(weight, recommended);
  const ratio = getLoadRatioPercent(weight, recommended);

  const unassignedSupplies = useMemo(() => {
    const list = getUnassignedSupplies(supplies, assignments);
    if (highlightSupplyId) {
      const idx = list.findIndex((s) => s.id === highlightSupplyId);
      if (idx > 0) {
        const [item] = list.splice(idx, 1);
        list.unshift(item);
      }
    }
    return list;
  }, [supplies, assignments, highlightSupplyId]);

  return (
    <div
      className={`card flex flex-col h-full ${
        status === 'overload' ? 'ring-2 ring-firstaid-300 animate-pulse-warn' : ''
      }`}
    >
      <div className="p-4 border-b border-parchment-200 bg-gradient-to-r from-white to-parchment-50">
        <div className="flex items-start gap-3">
          <div className="relative">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="w-12 h-12 rounded-full object-cover ring-3 ring-white shadow-inner"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-forest-100 flex items-center justify-center text-forest-500">
                <UserRound size={24} />
              </div>
            )}
            {member.confirmed && (
              <span className="absolute -bottom-0.5 -right-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-forest-500 text-white ring-2 ring-white text-[10px]">
                ✓
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-bold text-forest-800 leading-tight">
              {member.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <StrengthStars level={member.strengthLevel} size={12} />
              <span className="text-xs text-earth-600 flex items-center gap-0.5">
                <Backpack size={11} />
                {member.backpackCapacityKg}kg
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <LoadProgressBar
            ratioPercent={ratio}
            status={status}
            actualGrams={weight}
            recommendedKg={recommended}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2 min-h-0">
        {memberAssignments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-earth-500">
            <Backpack size={32} className="mb-2 opacity-40" />
            <p className="text-sm">暂无分配物资</p>
            <p className="text-xs mt-1 opacity-70">从下方选择或拖拽物资</p>
          </div>
        ) : (
          memberAssignments.map((a) => {
            const supply = supplies.find((s) => s.id === a.supplyId);
            if (!supply) return null;
            return (
              <AssignmentItem
                key={a.id}
                assignment={a}
                supply={supply}
                member={member}
              />
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-parchment-200 relative">
        <button
          onClick={() => setShowAssign(!showAssign)}
          className="w-full btn-secondary text-sm py-2"
          disabled={unassignedSupplies.length === 0}
        >
          <Plus size={14} />
          添加物资
        </button>
        {showAssign && unassignedSupplies.length > 0 && (
          <div className="absolute bottom-full left-3 right-3 mb-2 card p-2 max-h-64 overflow-y-auto scrollbar-thin z-20 shadow-card-hover">
            <div className="text-xs font-medium text-earth-600 mb-2 px-1">可分配物资</div>
            <div className="space-y-1">
              {unassignedSupplies.map((s) => {
                const remaining = getSupplyRemainingQuantity(s, assignments);
                const isHighlighted = s.id === highlightSupplyId;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      assignSupply(s.id, member.id, 1);
                      if (isHighlighted) onHighlightConsumed();
                      if (remaining <= 1) setShowAssign(false);
                    }}
                    className={`w-full text-left flex items-center gap-2 p-2 rounded-md transition-colors ${
                      isHighlighted
                        ? 'bg-forest-100 border-2 border-forest-500 shadow-card'
                        : 'hover:bg-forest-50'
                    }`}
                  >
                    <span className="text-sm text-forest-800 flex-1 truncate">{s.name}</span>
                    <CategoryTag category={s.category} />
                    <span className="text-xs text-earth-600">×{remaining}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Allocation() {
  const { members, supplies, assignments } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const clearHighlight = () => {
    setSearchParams({}, { replace: true });
  };

  const unassigned = useMemo(() => getUnassignedSupplies(supplies, assignments), [supplies, assignments]);

  useEffect(() => {
    if (highlightId && !unassigned.find((s) => s.id === highlightId)) {
      clearHighlight();
    }
  }, [highlightId, unassigned]);

  const totalWeight = useMemo(() => {
    return supplies.reduce((sum, s) => sum + s.weightGrams * s.quantity, 0);
  }, [supplies]);

  const assignedWeight = useMemo(() => {
    return assignments.reduce((sum, a) => {
      const s = supplies.find((x) => x.id === a.supplyId);
      return sum + (s ? s.weightGrams * a.quantityAssigned : 0);
    }, 0);
  }, [assignments, supplies]);

  if (members.length === 0) {
    return (
      <div className="card p-16 text-center">
        <Users size={48} className="mx-auto text-forest-300 mb-4" />
        <h4 className="font-display text-lg font-bold text-forest-800 mb-1">暂无队员</h4>
        <p className="text-sm text-earth-600">请先在"队员档案"中添加队员</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="section-title mb-1">
            <Backpack size={24} />
            物资分配
          </h3>
          <p className="text-sm text-earth-600">
            已分配 {formatWeight(assignedWeight)} / 总计 {formatWeight(totalWeight)} · 剩余
            {unassigned.length} 种物资待分配
          </p>
        </div>
      </div>

      {unassigned.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <PackageOpen size={16} className="text-warn-600" />
            <span className="font-medium text-forest-800">待分配物资池</span>
            <span className="text-xs text-earth-600">
              （点击队员面板"添加物资"按钮进行分配）
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {unassigned.map((s) => {
              const remaining = getSupplyRemainingQuantity(s, assignments);
              const isHighlighted = s.id === highlightId;
              return (
                <div
                  key={s.id}
                  className={`p-2.5 rounded-lg transition-all cursor-default ${
                    isHighlighted
                      ? 'bg-forest-100 border-2 border-forest-500 shadow-card-hover ring-2 ring-forest-300 animate-pulse-warn'
                      : 'bg-parchment-50 border border-parchment-200 hover:border-warn-400 hover:shadow-card'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {s.photoUrl ? (
                      <img src={s.photoUrl} alt={s.name} className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-forest-100 flex items-center justify-center text-forest-500">
                        <PackageOpen size={14} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-forest-800 truncate">{s.name}</div>
                      <div className="text-[10px] text-earth-600 flex items-center gap-1">
                        <CategoryTag category={s.category} size="sm" />
                        <span>×{remaining}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div
        className={`grid gap-4 ${
          members.length === 1
            ? 'grid-cols-1'
            : members.length === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : members.length === 3
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
        }`}
      >
        {members.map((member, i) => (
          <div
            key={member.id}
            style={{ animationDelay: `${i * 80}ms` }}
            className="animate-fade-up opacity-0 min-h-[480px]"
          >
            <MemberPanel member={member} highlightSupplyId={highlightId} onHighlightConsumed={clearHighlight} />
          </div>
        ))}
      </div>
    </div>
  );
}


