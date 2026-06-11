import { useState, useMemo } from 'react';
import { ClipboardList, ChevronDown, ChevronUp, Backpack, Check, Users, Package, User, Copy, CheckCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getEquipmentByBag, getTotalWeight } from '@/utils/statistics';
import { formatWeight } from '@/utils/formatters';
import Avatar from '@/components/common/Avatar';
import EquipmentCard from '@/components/equipment/EquipmentCard';
import EmptyState from '@/components/common/EmptyState';
import type { Equipment } from '@/types';
import { STATUS_META } from '@/types';

type ViewMode = 'person' | 'bag';

export default function Checklist() {
  const currentTripId = useStore((s) => s.currentTripId);
  const trips = useStore((s) => s.trips);
  const peopleAll = useStore((s) => s.people);
  const equipmentAll = useStore((s) => s.equipment);
  const bulkSetStatus = useStore((s) => s.bulkSetStatusByPerson);

  const trip = useMemo(() => trips.find((t) => t.id === currentTripId) || null, [trips, currentTripId]);
  const people = useMemo(() => peopleAll.filter((p) => p.tripId === currentTripId), [peopleAll, currentTripId]);
  const allEquipment = useMemo(() => equipmentAll.filter((e) => e.tripId === currentTripId), [equipmentAll, currentTripId]);

  const [viewMode, setViewMode] = useState<ViewMode>('person');
  const [expandedPerson, setExpandedPerson] = useState<string | null>(people[0]?.id || null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [expandedBag, setExpandedBag] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const equipmentByPerson = useMemo(() => {
    const map: Record<string, Equipment[]> = {};
    people.forEach((p) => {
      map[p.id] = allEquipment.filter((e) => e.responsiblePersonId === p.id);
    });
    map['unassigned'] = allEquipment.filter((e) => !e.responsiblePersonId);
    return map;
  }, [people, allEquipment]);

  const equipmentByBag = useMemo(() => getEquipmentByBag(allEquipment), [allEquipment]);

  if (!trip) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <EmptyState
          icon={ClipboardList}
          title="请先创建露营计划"
          description="创建计划后才能查看分包清单"
        />
      </div>
    );
  }

  const handleMarkAllPacked = (personId: string) => {
    bulkSetStatus(personId, 'packed');
  };

  const generateChecklistText = () => {
    const lines: string[] = [];
    lines.push(`🏕️ ${trip?.location || '露营'} - 携带清单`);
    const days = trip?.days;
    let dateText = '日期待确认';
    if (days && days > 0) {
      dateText = days === 1 ? `${days}天` : `${days}天${days - 1}晚`;
    }
    lines.push(`📅 ${dateText}  ·  👥 ${people.length}人`);
    lines.push('');

    people.forEach((person, idx) => {
      const items = equipmentByPerson[person.id] || [];
      const weight = getTotalWeight(items);

      lines.push(`${idx + 1}. ${person.name}（${items.length}件 · ${formatWeight(weight)}）`);

      if (items.length === 0) {
        lines.push('   ⚪️ 暂无装备，请尽快分配');
      } else {
        items.forEach((eq, i) => {
          const statusEmoji = eq.status === 'packed' ? '✅' : eq.status === 'in_car' ? '🚗' : eq.status === 'at_risk' ? '⚠️' : '⬜️';
          const bagInfo = eq.bagName ? `  [${eq.bagName}]` : '';
          lines.push(`   ${statusEmoji} ${i + 1}. ${eq.name}${bagInfo}  ·  ${formatWeight(eq.weightGrams)}  ·  ${STATUS_META[eq.status].label}`);
        });
      }
      lines.push('');
    });

    if (equipmentByPerson['unassigned']?.length > 0) {
      lines.push(`⚠️ 未分配负责人（${equipmentByPerson['unassigned'].length}件）`);
      equipmentByPerson['unassigned'].forEach((eq, i) => {
        lines.push(`   ⬜️ ${i + 1}. ${eq.name}  ·  ${formatWeight(eq.weightGrams)}`);
      });
      lines.push('');
    }

    const totalWeight = getTotalWeight(allEquipment);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`📦 总计：${allEquipment.length}件装备  ·  ${formatWeight(totalWeight)}`);

    return lines.join('\n');
  };

  const handleCopyChecklist = async () => {
    const text = generateChecklistText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-bark-500 flex items-center gap-2">
          <ClipboardList className="text-forest-600" size={26} />
          分包清单
        </h1>
        <p className="text-bark-500/60 mt-1 text-sm">
          出发前核对打包，到营地后勾选归位
        </p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="card p-1.5 inline-flex">
          <button
            onClick={() => setViewMode('person')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'person'
                ? 'bg-forest-600 text-white shadow-softer'
                : 'text-bark-500/70 hover:bg-cream-100'
            }`}
          >
            <Users size={16} />
            按人员
          </button>
          <button
            onClick={() => setViewMode('bag')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'bag'
                ? 'bg-forest-600 text-white shadow-softer'
                : 'text-bark-500/70 hover:bg-cream-100'
            }`}
          >
            <Backpack size={16} />
            按包
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyChecklist}
            className={`btn transition-all ${
              copied
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-forest-600 text-white hover:bg-forest-700 shadow-softer'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle size={16} />
                已复制！
              </>
            ) : (
              <>
                <Copy size={16} />
                复制携带清单
              </>
            )}
          </button>
          <button
            onClick={() => setShowConfirm(!showConfirm)}
            className={`btn ${
              showConfirm
                ? 'bg-forest-100 text-forest-700 border border-forest-200'
                : 'bg-cream-100 text-bark-500 border border-cream-300/50'
            }`}
          >
            <Check size={16} />
            {showConfirm ? '隐藏归位勾选' : '营地归位模式'}
          </button>
        </div>
      </div>

      {viewMode === 'person' && (
        <div className="space-y-3">
          {people.map((person) => {
            const items = equipmentByPerson[person.id] || [];
            const weight = getTotalWeight(items);
            const isExpanded = expandedPerson === person.id;
            return (
              <div key={person.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedPerson(isExpanded ? null : person.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-cream-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={person.name} color={person.avatarColor} size="lg" />
                    <div className="text-left">
                      <div className="font-semibold text-bark-500">{person.name}</div>
                      <div className="text-xs text-bark-500/60">
                        {items.length} 件装备 · {formatWeight(weight)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!showConfirm && items.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAllPacked(person.id);
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg bg-forest-50 text-forest-700 hover:bg-forest-100 font-medium transition-colors"
                      >
                        全部已打包
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-bark-500/50" />
                    ) : (
                      <ChevronDown size={20} className="text-bark-500/50" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2.5 border-t border-cream-200/60 pt-4 animate-fade-in">
                    {items.length === 0 ? (
                      <div className="text-center py-6 text-sm text-bark-500/40">
                        还没有分配装备
                      </div>
                    ) : (
                      items.map((eq) => (
                        <EquipmentCard
                          key={eq.id}
                          equipment={eq}
                          showConfirm={showConfirm}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {equipmentByPerson['unassigned']?.length > 0 && (
            <div className="card overflow-hidden border-warmorange-200 bg-warmorange-50/30">
              <button
                onClick={() => setExpandedPerson(expandedPerson === 'unassigned' ? null : 'unassigned')}
                className="w-full p-4 flex items-center justify-between hover:bg-warmorange-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-warmorange-100 text-warmorange-700 flex items-center justify-center shadow-softer">
                    <User size={18} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-warmorange-700">未分配负责人</div>
                    <div className="text-xs text-warmorange-700/70">
                      {equipmentByPerson['unassigned'].length} 件装备待分配
                    </div>
                  </div>
                </div>
                {expandedPerson === 'unassigned' ? (
                  <ChevronUp size={20} className="text-warmorange-700/50" />
                ) : (
                  <ChevronDown size={20} className="text-warmorange-700/50" />
                )}
              </button>
              {expandedPerson === 'unassigned' && (
                <div className="px-4 pb-4 space-y-2.5 border-t border-warmorange-200/60 pt-4 animate-fade-in">
                  {equipmentByPerson['unassigned'].map((eq) => (
                    <EquipmentCard key={eq.id} equipment={eq} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {viewMode === 'bag' && (
        <div className="space-y-3">
          {Object.keys(equipmentByBag).length === 0 ? (
            <EmptyState
              icon={Package}
              title="还没有装备分配到包"
              description="在装备管理中为装备指定所属的包"
            />
          ) : (
            Object.entries(equipmentByBag).map(([bagName, items]) => {
              const weight = getTotalWeight(items);
              const isExpanded = expandedBag === bagName;
              return (
                <div key={bagName} className="card overflow-hidden">
                  <button
                    onClick={() => setExpandedBag(isExpanded ? null : bagName)}
                    className="w-full p-4 flex items-center justify-between hover:bg-cream-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cream-100 text-bark-500 flex items-center justify-center">
                        <Backpack size={22} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-bark-500">🎒 {bagName}</div>
                        <div className="text-xs text-bark-500/60">
                          {items.length} 件装备 · {formatWeight(weight)}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-bark-500/50" />
                    ) : (
                      <ChevronDown size={20} className="text-bark-500/50" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-2.5 border-t border-cream-200/60 pt-4 animate-fade-in">
                      {items.map((eq) => (
                        <EquipmentCard
                          key={eq.id}
                          equipment={eq}
                          showConfirm={showConfirm}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
