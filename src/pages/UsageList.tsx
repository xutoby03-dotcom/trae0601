import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Filter,
  Clock,
  MapPin,
  Gauge,
  Wallet,
  Trash2,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatDate, formatDuration } from '@/utils/date';
import { SPORT_TYPE_LABELS, INTENSITY_LABELS, INTENSITY_COLORS, type SportType } from '@/types';
import { SportIcon } from '@/components/SportIcon';
import { cn } from '@/lib/utils';

export default function UsageList() {
  const equipment = useAppStore((s) => s.equipment);
  const usageRecords = useAppStore((s) => s.usageRecords);
  const deleteUsageRecord = useAppStore((s) => s.deleteUsageRecord);

  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredRecords =
    equipmentFilter === 'all'
      ? usageRecords
      : usageRecords.filter((r) => r.equipmentId === equipmentFilter);

  const totalCost = filteredRecords.reduce((s, r) => s + (r.maintenanceCost || 0), 0);
  const totalMinutes = filteredRecords.reduce((s, r) => s + r.durationMinutes, 0);
  const totalKm = filteredRecords.reduce((s, r) => s + (r.distanceKm || 0), 0);

  const getEquipmentName = (id: string) =>
    equipment.find((e) => e.id === id)?.name || '未知装备';

  const getEquipmentSport = (id: string): SportType | null =>
    (equipment.find((e) => e.id === id)?.sportType as SportType) || null;

  const handleDelete = (id: string, equipmentName: string) => {
    if (confirm(`确定要删除「${equipmentName}」的这条使用记录吗？`)) {
      deleteUsageRecord(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-warm-900">
            使用记录
          </h1>
          <p className="text-warm-500 mt-1">
            共 {filteredRecords.length} 条记录
            {filteredRecords.length !== usageRecords.length &&
              ` / 全部 ${usageRecords.length} 条`}
          </p>
        </div>
        <Link to="/usage/new" className="btn-primary">
          <Plus size={16} />
          新增记录
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-base p-5 animate-fade-in-up" style={{ opacity: 0 }}>
          <div className="flex items-center gap-2 text-warm-500 text-sm mb-2">
            <FileText size={14} />
            记录条数
          </div>
          <p className="font-display text-2xl font-bold text-warm-900">
            {filteredRecords.length}
          </p>
        </div>
        <div className="card-base p-5 animate-fade-in-up" style={{ opacity: 0, animationDelay: '50ms' }}>
          <div className="flex items-center gap-2 text-warm-500 text-sm mb-2">
            <Clock size={14} />
            总时长
          </div>
          <p className="font-display text-2xl font-bold text-warm-900">
            {formatDuration(totalMinutes)}
          </p>
        </div>
        <div className="card-base p-5 animate-fade-in-up" style={{ opacity: 0, animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 text-warm-500 text-sm mb-2">
            <Gauge size={14} />
            总里程
          </div>
          <p className="font-display text-2xl font-bold text-warm-900">
            {totalKm.toFixed(1)}
            <span className="text-sm font-normal text-warm-500 ml-1">km</span>
          </p>
        </div>
        <div className="card-base p-5 animate-fade-in-up" style={{ opacity: 0, animationDelay: '150ms' }}>
          <div className="flex items-center gap-2 text-warm-500 text-sm mb-2">
            <Wallet size={14} />
            总花费
          </div>
          <p className="font-display text-2xl font-bold text-warm-900">
            ¥{totalCost}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="card-base p-4 animate-fade-in-up" style={{ opacity: 0, animationDelay: '200ms' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-warm-500 text-sm shrink-0">
            <Filter size={16} />
            装备筛选：
          </div>
          <div className="flex flex-wrap gap-2 flex-1">
            <button
              onClick={() => setEquipmentFilter('all')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                equipmentFilter === 'all'
                  ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-warm-50 text-warm-600 hover:bg-warm-100'
              )}
            >
              全部装备
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  equipmentFilter === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-warm-200 text-warm-600'
                )}
              >
                {usageRecords.length}
              </span>
            </button>
            {equipment.map((eq) => {
              const count = usageRecords.filter((r) => r.equipmentId === eq.id).length;
              if (count === 0) return null;
              const sport = getEquipmentSport(eq.id);
              const isActive = equipmentFilter === eq.id;
              return (
                <button
                  key={eq.id}
                  onClick={() => setEquipmentFilter(eq.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all max-w-[200px]',
                    isActive
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/20'
                      : 'bg-warm-50 text-warm-600 hover:bg-warm-100'
                  )}
                >
                  {sport && <SportIcon type={sport} size={12} />}
                  <span className="truncate">{eq.name}</span>
                  <span
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded-full shrink-0',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-warm-200 text-warm-600'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          {equipmentFilter !== 'all' && (
            <button
              onClick={() => setEquipmentFilter('all')}
              className="btn-ghost text-xs text-warm-500 shrink-0"
            >
              <X size={14} />
              清除
            </button>
          )}
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record, i) => {
            const eqName = getEquipmentName(record.equipmentId);
            const sport = getEquipmentSport(record.equipmentId);
            const isExpanded = expandedId === record.id;
            const isMaintenance = record.location === '保养维护';
            return (
              <div
                key={record.id}
                className="card-base overflow-hidden animate-fade-in-up"
                style={{ opacity: 0, animationDelay: `${250 + i * 30}ms` }}
              >
                <div
                  className="p-5 cursor-pointer hover:bg-warm-50/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-xl bg-warm-50 border border-warm-100 flex items-center justify-center shrink-0">
                        {sport ? (
                          <SportIcon type={sport} size={20} className="text-warm-600" />
                        ) : (
                          <FileText size={20} className="text-warm-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-warm-900">
                            {formatDate(record.date)}
                          </span>
                          <span className="text-warm-400">·</span>
                          <span className="text-warm-600 truncate">{eqName}</span>
                          {SPORT_TYPE_LABELS && sport && (
                            <>
                              <span className="text-warm-300">·</span>
                              <span className="text-xs text-warm-500">
                                {SPORT_TYPE_LABELS[sport]}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mt-2">
                          {!isMaintenance && (
                            <>
                              <span
                                className={`badge ${INTENSITY_COLORS[record.intensity]}`}
                              >
                                {INTENSITY_LABELS[record.intensity]}
                              </span>
                              {record.durationMinutes > 0 && (
                                <span className="badge bg-warm-100 text-warm-600">
                                  <Clock size={10} />
                                  {formatDuration(record.durationMinutes)}
                                </span>
                              )}
                            </>
                          )}
                          {isMaintenance && (
                            <span className="badge bg-teal-100 text-teal-700">
                              保养记录
                            </span>
                          )}
                          {record.distanceKm && (
                            <span className="badge bg-sky-50 text-sky-600">
                              <MapPin size={10} />
                              {record.distanceKm} km
                            </span>
                          )}
                          {record.maintenanceCost > 0 && (
                            <span className="badge bg-emerald-50 text-emerald-600">
                              <Wallet size={10} />
                              ¥{record.maintenanceCost}
                            </span>
                          )}
                          {!isMaintenance && record.location && (
                            <span className="badge bg-violet-50 text-violet-600">
                              <MapPin size={10} />
                              {record.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(record.id, eqName);
                        }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-warm-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-warm-400">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-warm-100">
                    <div className="pt-4 space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-warm-500 mb-1">使用时长</p>
                          <p className="font-medium text-warm-800">
                            {record.durationMinutes > 0
                              ? formatDuration(record.durationMinutes)
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-warm-500 mb-1">运动强度</p>
                          <p className="font-medium text-warm-800">
                            {!isMaintenance ? INTENSITY_LABELS[record.intensity] : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-warm-500 mb-1">运动里程</p>
                          <p className="font-medium text-warm-800">
                            {record.distanceKm ? `${record.distanceKm} km` : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-warm-500 mb-1">维护花费</p>
                          <p className="font-medium text-warm-800">
                            ¥{record.maintenanceCost}
                          </p>
                        </div>
                      </div>
                      {!isMaintenance && record.location && (
                        <div>
                          <p className="text-xs text-warm-500 mb-1">运动场地</p>
                          <p className="font-medium text-warm-800 flex items-center gap-1.5">
                            <MapPin size={14} className="text-warm-400" />
                            {record.location}
                          </p>
                        </div>
                      )}
                      {record.wearNotes && (
                        <div>
                          <p className="text-xs text-warm-500 mb-1">磨损 / 备注</p>
                          <div className="bg-warm-50 rounded-xl px-4 py-3 text-sm text-warm-700">
                            {record.wearNotes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="card-base p-16 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-warm-100 flex items-center justify-center mb-5">
              <FileText size={36} className="text-warm-400" />
            </div>
            <h3 className="font-display text-xl font-semibold text-warm-900">
              还没有使用记录
            </h3>
            <p className="text-warm-500 mt-2 mb-5">
              {equipmentFilter !== 'all'
                ? '该装备暂时没有记录，换个装备看看？'
                : '记录每一次运动，才能更好地管理装备寿命'}
            </p>
            <div className="flex items-center justify-center gap-3">
              {equipmentFilter !== 'all' && (
                <button
                  onClick={() => setEquipmentFilter('all')}
                  className="btn-secondary"
                >
                  <X size={14} />
                  清除筛选
                </button>
              )}
              <Link to="/usage/new" className="btn-primary">
                <Plus size={14} />
                添加第一条记录
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
