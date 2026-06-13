import { useMemo } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PackageOpen,
  UserRound,
  Mountain,
  RotateCcw,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import StrengthStars from '@/components/StrengthStars';
import LoadProgressBar from '@/components/LoadProgressBar';
import CategoryTag from '@/components/CategoryTag';
import ImportanceTag from '@/components/ImportanceTag';
import {
  getMemberTotalWeightGrams,
  getRecommendedLoadKg,
  getLoadStatus,
  getLoadRatioPercent,
  getSupplyRemainingQuantity,
  getUnassignedSupplies,
  formatWeight,
} from '@/utils/calculations';

export default function Checklist() {
  const { members, supplies, assignments, toggleMemberConfirmed, resetAll } = useAppStore();

  const confirmedMembers = members.filter((m) => m.confirmed);
  const unconfirmedMembers = members.filter((m) => !m.confirmed);
  const unassignedSupplies = useMemo(
    () => getUnassignedSupplies(supplies, assignments),
    [supplies, assignments]
  );

  const totalAssignedWeight = useMemo(() => {
    return assignments.reduce((sum, a) => {
      const s = supplies.find((x) => x.id === a.supplyId);
      return sum + (s ? s.weightGrams * a.quantityAssigned : 0);
    }, 0);
  }, [assignments, supplies]);

  const allReady =
    unconfirmedMembers.length === 0 && unassignedSupplies.length === 0 && members.length > 0;

  const memberStats = members.map((m) => {
    const weight = getMemberTotalWeightGrams(m.id, assignments, supplies);
    const recommended = getRecommendedLoadKg(m.strengthLevel);
    return {
      member: m,
      weight,
      recommended,
      status: getLoadStatus(weight, recommended),
      ratio: getLoadRatioPercent(weight, recommended),
      itemCount: assignments.filter((a) => a.memberId === m.id).length,
    };
  });

  const maxRatio = Math.max(...memberStats.map((s) => s.ratio), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="section-title mb-1">
            <ClipboardCheck size={24} />
            出发清单
          </h3>
          <p className="text-sm text-earth-600">
            出发前确认所有队员和物资准备就绪
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 ${
              allReady
                ? 'bg-forest-600 text-white shadow-card'
                : 'bg-warn-500 text-white shadow-card animate-pulse-warn'
            }`}
          >
            {allReady ? (
              <>
                <CheckCircle2 size={18} />
                全员就绪，可以出发！
              </>
            ) : (
              <>
                <AlertTriangle size={18} />
                还有 {unconfirmedMembers.length + unassignedSupplies.length} 项待确认
              </>
            )}
          </div>
          <button
            onClick={() => {
              if (confirm('确定重置所有数据为初始状态？')) {
                resetAll();
              }
            }}
            className="btn-secondary text-sm"
          >
            <RotateCcw size={14} />
            重置数据
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-earth-600 mb-2">
            <UserRound size={16} />
            <span className="text-sm">队员人数</span>
          </div>
          <div className="text-3xl font-display font-bold text-forest-800">
            {members.length}
          </div>
          <div className="text-xs text-earth-500 mt-1">
            {confirmedMembers.length} 已确认 · {unconfirmedMembers.length} 待确认
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-earth-600 mb-2">
            <PackageOpen size={16} />
            <span className="text-sm">物资种类</span>
          </div>
          <div className="text-3xl font-display font-bold text-forest-800">
            {supplies.length}
          </div>
          <div className="text-xs text-earth-500 mt-1">
            {unassignedSupplies.length} 种未分配
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-earth-600 mb-2">
            <Mountain size={16} />
            <span className="text-sm">总负重</span>
          </div>
          <div className="text-3xl font-display font-bold text-forest-800">
            {(totalAssignedWeight / 1000).toFixed(1)}
            <span className="text-lg ml-1 font-body font-medium text-earth-500">kg</span>
          </div>
          <div className="text-xs text-earth-500 mt-1">
            人均 {(totalAssignedWeight / 1000 / Math.max(members.length, 1)).toFixed(1)}kg
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-earth-600 mb-2">
            <ClipboardCheck size={16} />
            <span className="text-sm">分配项</span>
          </div>
          <div className="text-3xl font-display font-bold text-forest-800">
            {assignments.length}
          </div>
          <div className="text-xs text-earth-500 mt-1">
            已分配给 {new Set(assignments.map((a) => a.memberId)).size} 人
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-forest-100 text-forest-700">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h4 className="font-display font-bold text-forest-800">已确认队员</h4>
              <p className="text-xs text-earth-600">{confirmedMembers.length} 人准备就绪</p>
            </div>
          </div>
          {confirmedMembers.length === 0 ? (
            <div className="text-center py-8 text-earth-400">
              <CheckCircle2 size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">暂无已确认队员</p>
            </div>
          ) : (
            <div className="space-y-2">
              {confirmedMembers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-forest-50 border border-forest-100"
                >
                  {m.avatarUrl ? (
                    <img src={m.avatarUrl} alt={m.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-white" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-forest-200 flex items-center justify-center text-forest-700">
                      <UserRound size={18} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-forest-800 text-sm flex items-center gap-1.5">
                      {m.name}
                      <CheckCircle2 size={13} className="text-forest-600" />
                    </div>
                    <StrengthStars level={m.strengthLevel} size={11} />
                  </div>
                  <button
                    onClick={() => toggleMemberConfirmed(m.id)}
                    className="text-xs text-earth-500 hover:text-firstaid-600 transition-colors"
                  >
                    取消
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-warn-100 text-warn-600">
              <Clock size={18} />
            </div>
            <div>
              <h4 className="font-display font-bold text-forest-800">待确认队员</h4>
              <p className="text-xs text-earth-600">{unconfirmedMembers.length} 人等待确认</p>
            </div>
          </div>
          {unconfirmedMembers.length === 0 ? (
            <div className="text-center py-8 text-forest-400">
              <CheckCircle2 size={32} className="mx-auto mb-2 opacity-60" />
              <p className="text-sm">全员已确认 🎉</p>
            </div>
          ) : (
            <div className="space-y-2">
              {unconfirmedMembers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-warn-50 border border-warn-200 border-dashed"
                >
                  {m.avatarUrl ? (
                    <img src={m.avatarUrl} alt={m.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-white grayscale" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-parchment-200 flex items-center justify-center text-earth-500">
                      <UserRound size={18} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-forest-800 text-sm">{m.name}</div>
                    <StrengthStars level={m.strengthLevel} size={11} />
                  </div>
                  <button
                    onClick={() => toggleMemberConfirmed(m.id)}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    确认
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-firstaid-100 text-firstaid-600">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="font-display font-bold text-forest-800">未分配物资</h4>
              <p className="text-xs text-earth-600">{unassignedSupplies.length} 种物资无人携带</p>
            </div>
          </div>
          {unassignedSupplies.length === 0 ? (
            <div className="text-center py-8 text-forest-400">
              <PackageOpen size={32} className="mx-auto mb-2 opacity-60" />
              <p className="text-sm">所有物资已分配 ✓</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin pr-1">
              {unassignedSupplies.map((s) => {
                const remaining = getSupplyRemainingQuantity(s, assignments);
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-firstaid-50 border border-firstaid-100"
                  >
                    {s.photoUrl ? (
                      <img src={s.photoUrl} alt={s.name} className="w-9 h-9 rounded object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded bg-parchment-200 flex items-center justify-center text-earth-500">
                        <PackageOpen size={16} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-forest-800 text-sm truncate">{s.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <CategoryTag category={s.category} size="sm" />
                        <ImportanceTag importance={s.importance} size="sm" />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-firstaid-600">×{remaining}</div>
                      <div className="text-[10px] text-earth-500">{formatWeight(s.weightGrams * remaining)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h4 className="font-display font-bold text-forest-800 mb-4 flex items-center gap-2">
          <Mountain size={18} className="text-forest-600" />
          队员负重比例
        </h4>
        <div className="space-y-4">
          {memberStats.map(({ member, weight, recommended, status, ratio, itemCount }) => (
            <div key={member.id} className="space-y-2">
              <div className="flex items-center gap-3">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-600">
                    <UserRound size={16} />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-forest-800 text-sm flex items-center gap-2">
                      {member.name}
                      <StrengthStars level={member.strengthLevel} size={11} />
                      <span className="text-xs text-earth-500">({itemCount} 件)</span>
                    </span>
                    <span className="text-xs text-earth-600">
                      建议负重 {recommended.toFixed(1)}kg
                    </span>
                  </div>
                  <LoadProgressBar
                    ratioPercent={ratio}
                    status={status}
                    actualGrams={weight}
                    recommendedKg={recommended}
                  />
                </div>
              </div>

              <div className="relative h-8 bg-parchment-100 rounded-lg overflow-hidden ml-11">
                <div
                  className={`absolute left-0 top-0 bottom-0 rounded-lg transition-all duration-500 ease-out ${
                    status === 'normal'
                      ? 'bg-gradient-to-r from-forest-400 to-forest-600'
                      : status === 'warning'
                        ? 'bg-gradient-to-r from-warn-400 to-warn-500'
                        : 'bg-gradient-to-r from-firstaid-400 to-firstaid-600 animate-pulse-warn'
                  }`}
                  style={{ width: `${Math.min(ratio, 100)}%` }}
                />
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="text-xs font-bold text-white drop-shadow-sm">
                    {formatWeight(weight)} ({ratio.toFixed(0)}%)
                  </span>
                </div>
                <div
                  className="absolute top-0 bottom-0 w-px bg-forest-900/30"
                  style={{ left: `${(100 / maxRatio) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
