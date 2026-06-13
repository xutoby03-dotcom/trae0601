import { Pencil, Trash2, Backpack, Phone, AlertTriangle, UserRound, Check } from 'lucide-react';
import type { Member } from '@/types';
import StrengthStars from './StrengthStars';
import { useAppStore } from '@/store/useAppStore';
import { getMemberTotalWeightGrams, getRecommendedLoadKg, formatWeight } from '@/utils/calculations';

interface Props {
  member: Member;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

export default function MemberCard({ member, onEdit, onDelete, compact = false }: Props) {
  const { supplies, assignments } = useAppStore();
  const weight = getMemberTotalWeightGrams(member.id, assignments, supplies);
  const recommended = getRecommendedLoadKg(member.strengthLevel);

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-parchment-50 border border-parchment-200">
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={member.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-inner"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center text-forest-600">
            <UserRound size={20} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-forest-800 text-sm truncate flex items-center gap-1.5">
            {member.name}
            {member.confirmed && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-forest-500 text-white">
                <Check size={10} strokeWidth={3} />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-earth-600">
            <StrengthStars level={member.strengthLevel} size={12} />
            <span className="flex items-center gap-0.5">
              <Backpack size={11} />
              {member.backpackCapacityKg}kg
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-earth-600">已分配</div>
          <div className="text-sm font-semibold text-forest-700">{formatWeight(weight)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-hover group relative">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-inner"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-forest-100 flex items-center justify-center text-forest-500">
                <UserRound size={32} />
              </div>
            )}
            {member.confirmed && (
              <span className="absolute -bottom-0.5 -right-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-forest-500 text-white ring-2 ring-white shadow-card">
                <Check size={14} strokeWidth={3} />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-display text-lg font-bold text-forest-800 leading-tight">
                  {member.name}
                </h4>
                <p className="text-xs text-earth-600 mt-0.5">
                  {member.confirmed ? '✓ 已确认出发' : '⏳ 待确认'}
                </p>
              </div>
              {(onEdit || onDelete) && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                      className="p-1.5 rounded-lg text-forest-600 hover:bg-forest-50 transition-all"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="p-1.5 rounded-lg text-firstaid-600 hover:bg-firstaid-50 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-earth-600">体力</span>
                <StrengthStars level={member.strengthLevel} />
              </div>
              <div className="flex items-center gap-1.5 text-sm text-forest-700">
                <Backpack size={14} />
                <span className="font-medium">{member.backpackCapacityKg}kg</span>
                <span className="text-earth-500 text-xs">容量</span>
              </div>
              <div className="text-sm">
                <span className="text-earth-500 text-xs">建议负重 </span>
                <span className="font-semibold text-forest-700">{recommended.toFixed(1)}kg</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-parchment-200 space-y-3">
          {member.allergies.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-firstaid-600 font-medium mb-1.5">
                <AlertTriangle size={12} />
                过敏情况
              </div>
              <div className="flex flex-wrap gap-1.5">
                {member.allergies.map((a) => (
                  <span
                    key={a}
                    className="tag bg-firstaid-50 text-firstaid-600 ring-1 ring-inset ring-firstaid-200"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Phone size={13} className="text-earth-500" />
            <span className="text-earth-600">紧急联系人：</span>
            <span className="font-medium text-forest-800">{member.emergencyContactName}</span>
            <span className="text-earth-400">·</span>
            <span className="font-mono text-forest-700">{member.emergencyContactPhone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
