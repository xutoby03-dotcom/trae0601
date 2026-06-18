import { useState } from 'react';
import { Droplets, Scissors, XCircle, Sparkles, User, StickyNote } from 'lucide-react';
import { useDiveStore } from '@/store/useDiveStore';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import type { Equipment } from '@/types';
import { EQUIPMENT_TYPE_LABELS } from '@/types';

export default function Return() {
  const { equipment, members, updateReturnCheck, getReturnCheck, returnChecks } =
    useDiveStore();

  const [filter, setFilter] = useState<'all' | 'checked' | 'unchecked'>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

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

  const getCleanedByName = (memberId?: string) => {
    if (!memberId) return null;
    const member = members.find((m) => m.id === memberId);
    return member ? member.name : null;
  };

  const stats = {
    total: equipment.length,
    checked: returnChecks.length,
    withIssues: returnChecks.filter(
      (r) => r.waterIntrusion || r.scratches || r.lost
    ).length,
    cleaned: returnChecks.filter((r) => r.cleanedBy).length,
  };

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

          return (
            <div
              key={eq.id}
              className={`glass-card rounded-2xl overflow-hidden transition-all ${
                selectedEquipment === eq.id ? 'shadow-float' : 'hover:shadow-lg'
              }`}
            >
              <div
                className="p-5 cursor-pointer"
                onClick={() =>
                  setSelectedEquipment(selectedEquipment === eq.id ? null : eq.id)
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
                      {EQUIPMENT_TYPE_LABELS[eq.type]} · {eq.size} · 拥有者: {eq.owner}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {check?.waterIntrusion && (
                      <div className="w-9 h-9 rounded-lg bg-coral-100 flex items-center justify-center" title="进水">
                        <Droplets className="w-5 h-5 text-coral-600" />
                      </div>
                    )}
                    {check?.scratches && (
                      <div className="w-9 h-9 rounded-lg bg-sand-100 flex items-center justify-center" title="划痕">
                        <Scissors className="w-5 h-5 text-amber-600" />
                      </div>
                    )}
                    {check?.lost && (
                      <div className="w-9 h-9 rounded-lg bg-coral-100 flex items-center justify-center" title="丢失">
                        <XCircle className="w-5 h-5 text-coral-600" />
                      </div>
                    )}
                    {check?.cleanedBy && (
                      <div className="w-9 h-9 rounded-lg bg-seafoam-100 flex items-center justify-center" title="已分配清洗">
                        <Sparkles className="w-5 h-5 text-seafoam-600" />
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
                              check?.cleanedBy === member.id ? '' : member.id
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
              {filter === 'checked' ? '还没有检查过的装备' : '所有装备都已检查完毕'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
