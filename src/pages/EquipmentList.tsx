import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, X } from 'lucide-react';
import { useAppStore } from '@/store';
import { computeMaintenanceStatus } from '@/utils/maintenance';
import { EquipmentCard } from '@/components/EquipmentCard';
import { SPORT_TYPE_LABELS, type SportType } from '@/types';
import { cn } from '@/lib/utils';
import { SportIcon } from '@/components/SportIcon';

const sportFilters: (SportType | 'all')[] = [
  'all',
  'running',
  'badminton',
  'yoga',
  'swimming',
  'cycling',
  'basketball',
  'fitness',
  'other',
];

export default function EquipmentList() {
  const equipment = useAppStore((s) => s.equipment);
  const usageRecords = useAppStore((s) => s.usageRecords);
  const [filter, setFilter] = useState<SportType | 'all'>('all');

  const filteredEquipment =
    filter === 'all'
      ? equipment
      : equipment.filter((e) => e.sportType === filter);

  const sportCounts = sportFilters.reduce((acc, sport) => {
    if (sport === 'all') {
      acc.all = equipment.length;
    } else {
      acc[sport] = equipment.filter((e) => e.sportType === sport).length;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-warm-900">
            装备档案
          </h1>
          <p className="text-warm-500 mt-1">
            共 {equipment.length} 件装备，{equipment.filter((e) => e.status !== 'retired').length} 件正在使用
          </p>
        </div>
        <Link to="/equipment/new" className="btn-primary">
          <Plus size={16} />
          添加装备
        </Link>
      </div>

      {/* Filters */}
      <div className="card-base p-3 animate-fade-in-up" style={{ opacity: 0, animationDelay: '50ms' }}>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-warm-500 text-sm px-2">
            <Filter size={16} />
            筛选：
          </div>
          {sportFilters.map((sport) => {
            const isActive = filter === sport;
            const count = sportCounts[sport] || 0;
            if (sport !== 'all' && count === 0) return null;
            return (
              <button
                key={sport}
                onClick={() => setFilter(sport)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-warm-50 text-warm-600 hover:bg-warm-100'
                )}
              >
                {sport !== 'all' && <SportIcon type={sport} size={14} />}
                {sport === 'all' ? '全部' : SPORT_TYPE_LABELS[sport]}
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full',
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
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="btn-ghost text-xs ml-auto text-warm-500"
            >
              <X size={14} />
              清除筛选
            </button>
          )}
        </div>
      </div>

      {/* Equipment Grid */}
      {filteredEquipment.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEquipment.map((eq, i) => {
            const status = computeMaintenanceStatus(eq, usageRecords);
            return (
              <EquipmentCard
                key={eq.id}
                equipment={eq}
                maintenanceStatus={status}
                delay={i * 60}
              />
            );
          })}
        </div>
      ) : (
        <div className="card-base p-16 text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-warm-100 flex items-center justify-center mb-5">
            <Filter size={36} className="text-warm-400" />
          </div>
          <h3 className="font-display text-xl font-semibold text-warm-900">
            没有匹配的装备
          </h3>
          <p className="text-warm-500 mt-2">
            试试选择其他运动类型，或
            <button
              onClick={() => setFilter('all')}
              className="text-brand-600 font-medium hover:underline mx-1"
            >
              清除筛选
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
