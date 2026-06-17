import { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  EQUIPMENT_TYPE_LABELS,
  SKI_LEVEL_LABELS,
} from '@/types';
import type { Equipment, EquipmentType, AssignmentWarning } from '@/types';
import { cn } from '@/lib/utils';

const equipmentEmojis: Record<EquipmentType, string> = {
  snowboard: '🎿',
  shoes: '👟',
  helmet: '⛑️',
  goggles: '🥽',
  gloves: '🧤',
  protector: '🦺',
};

export default function AssignmentPage() {
  const { members, equipment, warnings, assignEquipment, recalculateWarnings } =
    useAppStore();
  const [expandedMember, setExpandedMember] = useState<string | null>(
    members[0]?.id || null
  );

  useEffect(() => {
    recalculateWarnings();
  }, [equipment, members, recalculateWarnings]);

  const getMemberWarnings = (memberId: string): AssignmentWarning[] => {
    return warnings.filter((w) => w.memberId === memberId);
  };

  const getAssignedEquipment = (memberId: string): Equipment[] => {
    return equipment.filter((e) => e.assignedTo === memberId);
  };

  const getUnassignedEquipment = (type: EquipmentType): Equipment[] => {
    return equipment.filter((e) => e.type === type && !e.assignedTo);
  };

  const handleAssign = (equipmentId: string, memberId: string | undefined) => {
    assignEquipment(equipmentId, memberId);
  };

  const errorCount = warnings.filter((w) => w.severity === 'error').length;
  const warningCount = warnings.filter((w) => w.severity === 'warning').length;

  const equipmentTypes: EquipmentType[] = [
    'snowboard',
    'shoes',
    'helmet',
    'goggles',
    'gloves',
    'protector',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">智能分配</h2>
          <p className="text-slate-500 mt-1">
            自动检查装备匹配情况，发现潜在问题
          </p>
        </div>
        <div className="flex items-center gap-3">
          {errorCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
              <span className="font-medium text-red-700">
                {errorCount} 个严重问题
              </span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="font-medium text-amber-700">
                {warningCount} 个提醒
              </span>
            </div>
          )}
          {warnings.length === 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="font-medium text-emerald-700">全部匹配正常</span>
            </div>
          )}
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl p-5 border border-red-100">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            问题汇总
          </h3>
          <div className="space-y-2">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl',
                  warning.severity === 'error'
                    ? 'bg-red-100/60 text-red-700'
                    : 'bg-amber-100/60 text-amber-700'
                )}
              >
                {warning.severity === 'error' ? (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="font-medium">{warning.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {members.map((member) => {
          const memberWarnings = getMemberWarnings(member.id);
          const assignedEquipment = getAssignedEquipment(member.id);
          const isExpanded = expandedMember === member.id;
          const hasErrors = memberWarnings.some((w) => w.severity === 'error');
          const hasWarnings = memberWarnings.some((w) => w.severity === 'warning');

          return (
            <div
              key={member.id}
              className={cn(
                'bg-white rounded-2xl border transition-all duration-300 overflow-hidden',
                hasErrors
                  ? 'border-red-200 shadow-lg shadow-red-100'
                  : hasWarnings
                  ? 'border-amber-200 shadow-md shadow-amber-50'
                  : 'border-slate-100 shadow-sm hover:shadow-md'
              )}
            >
              <div
                className="flex items-center justify-between p-5 cursor-pointer"
                onClick={() =>
                  setExpandedMember(isExpanded ? null : member.id)
                }
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-slate-800 text-lg">
                        {member.name}
                      </h3>
                      <span className="text-sm px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {SKI_LEVEL_LABELS[member.skiLevel]}
                      </span>
                      {member.hasMyopia && (
                        <span className="text-sm px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                          近视
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                      <span>身高 {member.height}cm</span>
                      <span>鞋码 {member.shoeSize}</span>
                      <span>已分配 {assignedEquipment.length} 件</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {hasErrors && (
                    <div className="flex items-center gap-1.5 text-red-500">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">
                        {memberWarnings.filter((w) => w.severity === 'error').length} 个问题
                      </span>
                    </div>
                  )}
                  {hasWarnings && !hasErrors && (
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">
                        {memberWarnings.length} 个提醒
                      </span>
                    </div>
                  )}
                  {memberWarnings.length === 0 && (
                    <div className="flex items-center gap-1.5 text-emerald-500">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">状态良好</span>
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                  {memberWarnings.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {memberWarnings.map((warning, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm',
                            warning.severity === 'error'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          )}
                        >
                          {warning.severity === 'error' ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <AlertTriangle className="w-4 h-4" />
                          )}
                          {warning.message}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {equipmentTypes.map((type) => {
                      const emoji = equipmentEmojis[type];
                      const itemsOfType = assignedEquipment.filter(
                        (e) => e.type === type
                      );
                      const unassignedItems = getUnassignedEquipment(type);

                      return (
                        <div
                          key={type}
                          className="bg-slate-50 rounded-xl p-3"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">{emoji}</span>
                            <span className="font-medium text-slate-700 text-sm">
                              {EQUIPMENT_TYPE_LABELS[type]}
                            </span>
                          </div>

                          {itemsOfType.length > 0 ? (
                            <div className="space-y-2">
                              {itemsOfType.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between bg-white rounded-lg p-2 border border-slate-200"
                                >
                                  <div className="text-sm">
                                    <div className="font-medium text-slate-700">
                                      {item.name || item.size}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      尺码：{item.size}
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAssign(item.id, undefined);
                                    }}
                                    className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                                  >
                                    移除
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400 text-center py-3">
                              未分配
                            </div>
                          )}

                          {unassignedItems.length > 0 && (
                            <select
                              className="w-full mt-2 text-sm px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600"
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssign(e.target.value, member.id);
                                  e.target.value = '';
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="">+ 添加装备</option>
                              {unassignedItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name || item.size} ({item.size})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
