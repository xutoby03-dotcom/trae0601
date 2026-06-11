import { useState } from 'react';
import { ChevronDown, Pencil, Trash2, Check, Car, AlertTriangle, ClipboardList, User } from 'lucide-react';
import type { Equipment, EquipmentStatus } from '@/types';
import { CATEGORY_META, STATUS_META } from '@/types';
import { useStore } from '@/store/useStore';
import { formatWeight, formatVolume } from '@/utils/formatters';
import Avatar from '@/components/common/Avatar';

interface EquipmentCardProps {
  equipment: Equipment;
  showStatusSelector?: boolean;
  showConfirm?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const STATUS_OPTIONS: EquipmentStatus[] = ['unassigned', 'packed', 'in_car', 'at_risk'];

const STATUS_ICONS = {
  unassigned: ClipboardList,
  packed: Check,
  in_car: Car,
  at_risk: AlertTriangle,
};

export default function EquipmentCard({
  equipment,
  showStatusSelector = true,
  showConfirm = false,
  onEdit,
  onDelete,
}: EquipmentCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const person = useStore((s) =>
    equipment.responsiblePersonId
      ? s.people.find((p) => p.id === equipment.responsiblePersonId) || null
      : null
  );
  const setEquipmentStatus = useStore((s) => s.setEquipmentStatus);
  const toggleConfirmed = useStore((s) => s.toggleConfirmedAtCamp);

  const categoryMeta = CATEGORY_META[equipment.category];
  const statusMeta = STATUS_META[equipment.status];

  return (
    <div
      className={`card p-3.5 card-hover animate-fade-in ${
        showConfirm && equipment.confirmedAtCamp ? 'ring-2 ring-forest-400/50 bg-forest-50/50' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0">{categoryMeta.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-bark-500 text-sm truncate">{equipment.name}</div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className={`badge ${categoryMeta.color}`}>{categoryMeta.label}</span>
              <span className="text-xs text-bark-500/60">
                {formatWeight(equipment.weightGrams)} · {formatVolume(equipment.volumeLiters)}
              </span>
            </div>
            {(person || equipment.bagName) && (
              <div className="flex items-center gap-2 mt-2">
                {person && (
                  <div className="flex items-center gap-1.5">
                    <Avatar name={person.name} color={person.avatarColor} size="sm" />
                    <span className="text-xs text-bark-500/70">{person.name}</span>
                  </div>
                )}
                {!person && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                      <User size={12} />
                    </div>
                    <span className="text-xs text-bark-500/40">未分配</span>
                  </div>
                )}
                {equipment.bagName && (
                  <span className="text-xs text-bark-500/70 bg-cream-100 px-2 py-0.5 rounded-full">
                    🎒 {equipment.bagName}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {showConfirm && (
            <button
              onClick={() => toggleConfirmed(equipment.id)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                equipment.confirmedAtCamp
                  ? 'bg-forest-500 text-white animate-bounce-soft'
                  : 'bg-cream-100 text-bark-500/40 hover:bg-cream-200'
              }`}
              title={equipment.confirmedAtCamp ? '已归位' : '标记归位'}
            >
              <Check size={16} />
            </button>
          )}

          {showStatusSelector && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`badge ${statusMeta.bgColor} border cursor-pointer hover:shadow-softer transition-all`}
              >
                <span>{statusMeta.emoji}</span>
                <span className="hidden sm:inline">{statusMeta.label}</span>
                <ChevronDown size={12} className={`transition-transform ${showMenu ? 'rotate-180' : ''}`} />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-card border border-cream-200 py-1 min-w-[140px]">
                    {STATUS_OPTIONS.map((status) => {
                      const optMeta = STATUS_META[status];
                      const Icon = STATUS_ICONS[status];
                      return (
                        <button
                          key={status}
                          onClick={() => {
                            setEquipmentStatus(equipment.id, status);
                            setShowMenu(false);
                          }}
                          className={`w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-cream-50 transition-colors ${
                            equipment.status === status ? 'bg-cream-100' : ''
                          }`}
                        >
                          <Icon size={14} className={optMeta.color} />
                          <span className={optMeta.color}>{optMeta.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {onEdit && (
            <button
              onClick={onEdit}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-bark-500/50 hover:bg-cream-100 hover:text-bark-500 transition-all"
            >
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-bark-500/50 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {equipment.notes && (
        <div className="mt-2 text-xs text-bark-500/60 bg-cream-50 rounded-lg px-2.5 py-1.5 border-l-2 border-warmorange-300">
          📝 {equipment.notes}
        </div>
      )}
    </div>
  );
}
