import { useState } from 'react';
import {
  Droplets,
  AlertOctagon,
  PackageX,
  CheckCircle2,
  Wind,
  User,
  Filter,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { EQUIPMENT_TYPE_LABELS, EQUIPMENT_STATUS_LABELS } from '@/types';
import type { Equipment, ReturnRecord, EquipmentType } from '@/types';
import { cn } from '@/lib/utils';

export default function ReturnPage() {
  const { equipment, members, returnRecords, updateReturnRecord } = useAppStore();
  const [filterType, setFilterType] = useState<EquipmentType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'wet' | 'damaged' | 'lost' | 'normal'>('all');

  const getRecord = (equipmentId: string): ReturnRecord | undefined => {
    return returnRecords.find((r) => r.equipmentId === equipmentId);
  };

  const getOwnerName = (ownerId: string) => {
    const member = members.find((m) => m.id === ownerId);
    return member?.name || '未知';
  };

  const getAssignedName = (assignedTo?: string) => {
    if (!assignedTo) return '未分配';
    const member = members.find((m) => m.id === assignedTo);
    return member?.name || '未知';
  };

  const toggleWet = (equipId: string) => {
    const record = getRecord(equipId);
    updateReturnRecord(equipId, { isWet: !record?.isWet });
  };

  const toggleDamaged = (equipId: string) => {
    const record = getRecord(equipId);
    updateReturnRecord(equipId, { isDamaged: !record?.isDamaged });
  };

  const toggleLost = (equipId: string) => {
    const record = getRecord(equipId);
    updateReturnRecord(equipId, { isLost: !record?.isLost });
  };

  const setDriedBy = (equipId: string, memberId: string | undefined) => {
    updateReturnRecord(equipId, { driedBy: memberId });
  };

  const filteredEquipment = equipment.filter((e) => {
    if (filterType !== 'all' && e.type !== filterType) return false;

    if (filterStatus !== 'all') {
      const record = getRecord(e.id);
      if (filterStatus === 'wet' && !record?.isWet) return false;
      if (filterStatus === 'damaged' && !record?.isDamaged) return false;
      if (filterStatus === 'lost' && !record?.isLost) return false;
      if (filterStatus === 'normal' && (record?.isWet || record?.isDamaged || record?.isLost)) return false;
    }

    return true;
  });

  const wetCount = returnRecords.filter((r) => r.isWet).length;
  const damagedCount = returnRecords.filter((r) => r.isDamaged).length;
  const lostCount = returnRecords.filter((r) => r.isLost).length;
  const normalCount = equipment.length - wetCount - damagedCount - lostCount;

  const equipmentTypes: (EquipmentType | 'all')[] = [
    'all',
    'snowboard',
    'shoes',
    'helmet',
    'goggles',
    'gloves',
    'protector',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">归还确认</h2>
        <p className="text-slate-500 mt-1">滑雪归来，逐件检查装备状态，安排晾干</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={CheckCircle2}
          label="正常"
          count={normalCount}
          color="emerald"
          active={filterStatus === 'normal'}
          onClick={() => setFilterStatus(filterStatus === 'normal' ? 'all' : 'normal')}
        />
        <StatCard
          icon={Droplets}
          label="湿了"
          count={wetCount}
          color="blue"
          active={filterStatus === 'wet'}
          onClick={() => setFilterStatus(filterStatus === 'wet' ? 'all' : 'wet')}
        />
        <StatCard
          icon={AlertOctagon}
          label="损坏"
          count={damagedCount}
          color="amber"
          active={filterStatus === 'damaged'}
          onClick={() => setFilterStatus(filterStatus === 'damaged' ? 'all' : 'damaged')}
        />
        <StatCard
          icon={PackageX}
          label="丢失"
          count={lostCount}
          color="red"
          active={filterStatus === 'lost'}
          onClick={() => setFilterStatus(filterStatus === 'lost' ? 'all' : 'lost')}
        />
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-500">装备类型：</span>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {equipmentTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                filterType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
              )}
            >
              {type === 'all' ? '全部' : EQUIPMENT_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">
                  装备
                </th>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">
                  使用人
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-slate-600">
                  湿了
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-slate-600">
                  坏了
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-slate-600">
                  丢了
                </th>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">
                  晾干负责人
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipment.map((equip) => {
                const record = getRecord(equip.id);
                const isWet = record?.isWet || false;
                const isDamaged = record?.isDamaged || false;
                const isLost = record?.isLost || false;

                return (
                  <tr
                    key={equip.id}
                    className={cn(
                      'border-b border-slate-50 hover:bg-blue-50/30 transition-colors',
                      isLost && 'bg-red-50/50'
                    )}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                          <span className="text-xl">🎿</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">
                            {equip.name || EQUIPMENT_TYPE_LABELS[equip.type]}
                          </div>
                          <div className="text-xs text-slate-500">
                            {EQUIPMENT_TYPE_LABELS[equip.type]} · 尺码 {equip.size}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xs font-medium">
                          {getAssignedName(equip.assignedTo).charAt(0)}
                        </div>
                        <span className="text-sm text-slate-700">
                          {getAssignedName(equip.assignedTo)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleWet(equip.id)}
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                          isWet
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-blue-100 hover:text-blue-500'
                        )}
                      >
                        <Droplets className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleDamaged(equip.id)}
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                          isDamaged
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-amber-100 hover:text-amber-500'
                        )}
                      >
                        <AlertOctagon className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleLost(equip.id)}
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                          isLost
                            ? 'bg-red-500 text-white shadow-md shadow-red-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-500'
                        )}
                      >
                        <PackageX className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      {isWet ? (
                        <div className="flex items-center gap-2">
                          <Wind className="w-4 h-4 text-blue-400" />
                          <select
                            value={record?.driedBy || ''}
                            onChange={(e) =>
                              setDriedBy(
                                equip.id,
                                e.target.value || undefined
                              )
                            }
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white text-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                          >
                            <option value="">选择负责人</option>
                            {members.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredEquipment.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            没有符合条件的装备
          </div>
        )}
      </div>

      {wetCount > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Wind className="w-5 h-5 text-blue-500" />
            晾干任务分配
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {members.map((member) => {
              const memberEquip = returnRecords.filter(
                (r) => r.isWet && r.driedBy === member.id
              );
              if (memberEquip.length === 0) return null;

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">
                        {member.name}
                      </div>
                      <div className="text-xs text-blue-500">
                        负责 {memberEquip.length} 件装备晾干
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    {memberEquip.map((r) => {
                      const equip = equipment.find((e) => e.id === r.equipmentId);
                      if (!equip) return null;
                      return (
                        <div key={r.equipmentId} className="flex items-center gap-2">
                          <Droplets className="w-3.5 h-3.5 text-blue-400" />
                          <span>
                            {equip.name || EQUIPMENT_TYPE_LABELS[equip.type]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  count,
  color,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  color: 'emerald' | 'blue' | 'amber' | 'red';
  active?: boolean;
  onClick?: () => void;
}) {
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-600',
      iconBg: 'bg-emerald-500',
      active: 'ring-2 ring-emerald-400 ring-offset-2',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      iconBg: 'bg-blue-500',
      active: 'ring-2 ring-blue-400 ring-offset-2',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-600',
      iconBg: 'bg-amber-500',
      active: 'ring-2 ring-amber-400 ring-offset-2',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-600',
      iconBg: 'bg-red-500',
      active: 'ring-2 ring-red-400 ring-offset-2',
    },
  };

  const c = colorClasses[color];

  return (
    <button
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl p-5 border transition-all duration-200 text-left w-full',
        active ? c.border : 'border-slate-100 hover:shadow-md',
        active && c.active
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md',
            c.iconBg
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-800">{count}</div>
          <div className={cn('text-sm font-medium', c.text)}>{label}</div>
        </div>
      </div>
    </button>
  );
}
