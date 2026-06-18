import { useState } from 'react';
import { AlertTriangle, Eye, X, Plus, Check, EyeOff } from 'lucide-react';
import { useDiveStore } from '@/store/useDiveStore';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import type { EquipmentType } from '@/types';
import { EQUIPMENT_TYPE_LABELS, SWIM_LEVEL_LABELS } from '@/types';

const equipmentCategories: { type: EquipmentType; icon: string }[] = [
  { type: 'mask', icon: '🤿' },
  { type: 'snorkel', icon: '🫧' },
  { type: 'fins', icon: '🦶' },
  { type: 'rashGuard', icon: '👕' },
  { type: 'lifeJacket', icon: '🦺' },
  { type: 'dryBag', icon: '🎒' },
  { type: 'actionCam', icon: '📷' },
];

export default function Allocation() {
  const {
    members,
    getMemberEquipment,
    getAvailableEquipment,
    addAllocation,
    removeAllocation,
    getWarnings,
    allocations,
  } = useDiveStore();

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    members[0]?.id || null
  );
  const [showAddPanel, setShowAddPanel] = useState<EquipmentType | null>(null);

  const warnings = getWarnings();
  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const memberEquipment = selectedMember ? getMemberEquipment(selectedMember.id) : [];

  const getMemberWarnings = (memberId: string) => {
    return warnings.filter((w) => w.memberId === memberId);
  };

  const handleAddEquipment = (equipmentId: string) => {
    if (selectedMemberId) {
      addAllocation(selectedMemberId, equipmentId);
      setShowAddPanel(null);
    }
  };

  const handleRemoveEquipment = (equipmentId: string) => {
    const allocation = allocations.find(
      (a) => a.memberId === selectedMemberId && a.equipmentId === equipmentId
    );
    if (allocation) {
      removeAllocation(allocation.id);
    }
  };

  const getEquipmentByType = (type: EquipmentType) => {
    return memberEquipment.filter((e) => e.type === type);
  };

  return (
    <div>
      <PageHeader
        title="智能分配"
        subtitle="为每位成员分配合适的潜水装备"
      />

      {warnings.length > 0 && (
        <div className="glass-card rounded-2xl p-6 mb-6 pulse-warning">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-coral-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-coral-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-coral-700 mb-2">
                分配告警 ({warnings.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {warnings.slice(0, 6).map((warning, index) => (
                  <div
                    key={index}
                    className={`text-sm p-3 rounded-lg ${
                      warning.severity === 'error'
                        ? 'bg-coral-50 text-coral-700'
                        : 'bg-sand-50 text-amber-700'
                    }`}
                  >
                    <span className="font-medium">
                      {warning.severity === 'error' ? '⚠️ ' : '💡 '}
                    </span>
                    {warning.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-4">
            <h3 className="font-display font-bold text-ocean-800 mb-4 px-2">
              团队成员
            </h3>
            <div className="space-y-2">
              {members.map((member) => {
                const memberWarns = getMemberWarnings(member.id);
                const eqCount = getMemberEquipment(member.id).length;
                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                      selectedMemberId === member.id
                        ? 'bg-gradient-to-r from-ocean-500 to-ocean-600 text-white shadow-lg shadow-ocean-500/30'
                        : 'hover:bg-ocean-50 text-ocean-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-xl shrink-0">
                      {member.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{member.name}</p>
                      <p className={`text-xs ${
                        selectedMemberId === member.id ? 'text-ocean-200' : 'text-ocean-500'
                      }`}>
                        {eqCount} 件装备 · {SWIM_LEVEL_LABELS[member.swimLevel]}
                      </p>
                    </div>
                    {memberWarns.length > 0 && (
                      <div className="w-6 h-6 rounded-full bg-coral-500 text-white text-xs flex items-center justify-center font-bold">
                        {memberWarns.length}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedMember ? (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ocean-100 to-ocean-200 flex items-center justify-center text-4xl">
                    {selectedMember.avatar}
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-ocean-800">
                      {selectedMember.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1 text-sm text-ocean-500">
                      <span>身高 {selectedMember.height}cm</span>
                      <span>·</span>
                      <span>脚码 {selectedMember.footSize}码</span>
                      <span>·</span>
                      <span>
                        {selectedMember.isMyopia
                          ? `近视 ${selectedMember.myopiaDegree}度`
                          : '视力正常'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {equipmentCategories.map((category) => {
                    const items = getEquipmentByType(category.type);
                    const available = getAvailableEquipment(category.type);
                    const hasItems = items.length > 0;

                    return (
                      <div
                        key={category.type}
                        className={`rounded-xl border-2 transition-all ${
                          hasItems
                            ? 'border-seafoam-200 bg-seafoam-50/50'
                            : 'border-ocean-100 bg-white/50'
                        }`}
                      >
                        <div className="flex items-center justify-between p-4 border-b border-ocean-100">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{category.icon}</span>
                            <span className="font-medium text-ocean-800">
                              {EQUIPMENT_TYPE_LABELS[category.type]}
                            </span>
                          </div>
                          <Badge variant={hasItems ? 'success' : 'default'} size="sm">
                            {items.length} 件
                          </Badge>
                        </div>

                        <div className="p-3 space-y-2 min-h-[80px]">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-white/70 group"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-ocean-800 truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-ocean-500">
                                  {item.size} · {item.owner}
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemoveEquipment(item.id)}
                                className="w-7 h-7 rounded-md flex items-center justify-center text-coral-500 hover:bg-coral-50 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}

                          {showAddPanel === category.type ? (
                            <div className="bg-ocean-50 rounded-lg p-3 space-y-2">
                              <p className="text-xs text-ocean-500 font-medium">
                                可分配的装备:
                              </p>
                              {available.length > 0 ? (
                                <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
                                  {available.map((eq) => (
                                    <button
                                      key={eq.id}
                                      onClick={() => handleAddEquipment(eq.id)}
                                      className="w-full text-left p-2 rounded-md bg-white hover:bg-ocean-100 transition-colors flex items-center justify-between"
                                    >
                                      <div>
                                        <p className="text-sm font-medium text-ocean-700">
                                          {eq.name}
                                        </p>
                                        <p className="text-xs text-ocean-500">
                                          {eq.size}
                                        </p>
                                      </div>
                                      <Plus className="w-4 h-4 text-ocean-500" />
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-ocean-400 text-center py-2">
                                  没有可用的装备
                                </p>
                              )}
                              <button
                                onClick={() => setShowAddPanel(null)}
                                className="w-full text-xs text-ocean-500 hover:text-ocean-700 py-1"
                              >
                                取消
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowAddPanel(category.type)}
                              className="w-full flex items-center justify-center gap-1 py-2 rounded-lg border-2 border-dashed border-ocean-200 text-ocean-500 hover:border-ocean-400 hover:text-ocean-700 transition-colors text-sm"
                            >
                              <Plus className="w-4 h-4" />
                              添加装备
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {getMemberWarnings(selectedMember.id).length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-display font-bold text-ocean-800 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-coral-500" />
                    针对 {selectedMember.name} 的提示
                  </h3>
                  <div className="space-y-2">
                    {getMemberWarnings(selectedMember.id).map((warning, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl flex items-start gap-3 ${
                          warning.severity === 'error'
                            ? 'bg-coral-50 text-coral-700'
                            : 'bg-sand-50 text-amber-700'
                        }`}
                      >
                        {warning.severity === 'error' ? (
                          <EyeOff className="w-5 h-5 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        )}
                        <p className="text-sm">{warning.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">👈</div>
              <p className="text-ocean-500">请从左侧选择一位成员</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
