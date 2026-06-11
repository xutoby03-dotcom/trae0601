import { useMemo } from 'react';
import { BarChart3, Package, Scale, Box, Users, Trophy, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getTotalWeight, getTotalVolume, getWeightByPerson, getMostForgotten } from '@/utils/statistics';
import { formatWeight, formatVolume } from '@/utils/formatters';
import Avatar from '@/components/common/Avatar';
import EmptyState from '@/components/common/EmptyState';
import { CATEGORY_META } from '@/types';

export default function Statistics() {
  const currentTripId = useStore((s) => s.currentTripId);
  const trips = useStore((s) => s.trips);
  const peopleAll = useStore((s) => s.people);
  const equipmentAll = useStore((s) => s.equipment);

  const trip = useMemo(() => trips.find((t) => t.id === currentTripId) || null, [trips, currentTripId]);
  const people = useMemo(() => peopleAll.filter((p) => p.tripId === currentTripId), [peopleAll, currentTripId]);
  const equipment = useMemo(() => equipmentAll.filter((e) => e.tripId === currentTripId), [equipmentAll, currentTripId]);

  const totalWeight = useMemo(() => getTotalWeight(equipment), [equipment]);
  const totalVolume = useMemo(() => getTotalVolume(equipment), [equipment]);
  const weightByPerson = useMemo(() => getWeightByPerson(equipment, people), [equipment, people]);
  const mostForgotten = useMemo(() => getMostForgotten(equipment, 5), [equipment]);
  const maxWeight = weightByPerson[0]?.weight || 1;

  // 分类统计
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; weight: number }> = {};
    equipment.forEach((e) => {
      if (!stats[e.category]) {
        stats[e.category] = { count: 0, weight: 0 };
      }
      stats[e.category].count++;
      stats[e.category].weight += e.weightGrams;
    });
    return Object.entries(stats).sort((a, b) => b[1].weight - a[1].weight);
  }, [equipment]);

  if (!trip) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <EmptyState
          icon={BarChart3}
          title="请先创建露营计划"
          description="创建计划后才能查看数据统计"
        />
      </div>
    );
  }

  const trophyIcons = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-bark-500 flex items-center gap-2">
          <BarChart3 className="text-forest-600" size={26} />
          数据统计
        </h1>
        <p className="text-bark-500/60 mt-1 text-sm">
          装备总览、背负排行、遗忘统计
        </p>
      </div>

      {/* 总览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="card p-5">
          <div className="w-11 h-11 rounded-xl bg-forest-100 text-forest-600 flex items-center justify-center mb-3">
            <Package size={22} />
          </div>
          <div className="text-2xl font-bold text-bark-500">{equipment.length}</div>
          <div className="text-sm text-bark-500/60">装备总数</div>
        </div>
        <div className="card p-5">
          <div className="w-11 h-11 rounded-xl bg-warmorange-100 text-warmorange-600 flex items-center justify-center mb-3">
            <Scale size={22} />
          </div>
          <div className="text-2xl font-bold text-bark-500">{formatWeight(totalWeight)}</div>
          <div className="text-sm text-bark-500/60">总重量</div>
        </div>
        <div className="card p-5">
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
            <Box size={22} />
          </div>
          <div className="text-2xl font-bold text-bark-500">{formatVolume(totalVolume)}</div>
          <div className="text-sm text-bark-500/60">总体积</div>
        </div>
        <div className="card p-5">
          <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
            <Users size={22} />
          </div>
          <div className="text-2xl font-bold text-bark-500">{people.length}</div>
          <div className="text-sm text-bark-500/60">参与人数</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 背负排行 */}
        <div className="card p-6">
          <h2 className="font-semibold text-bark-500 text-lg flex items-center gap-2 mb-5">
            <Trophy size={20} className="text-warmorange-500" />
            背负重量排行
          </h2>
          {weightByPerson.length === 0 || weightByPerson.every((p) => p.weight === 0) ? (
            <div className="text-center py-8 text-bark-500/50 text-sm">
              还没有为人员分配装备
            </div>
          ) : (
            <div className="space-y-3.5">
              {weightByPerson.map((item, idx) => {
                const percent = maxWeight > 0 ? (item.weight / maxWeight) * 100 : 0;
                return (
                  <div key={item.person.id} className="animate-slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        {idx < 3 && item.weight > 0 && (
                          <span className="text-lg">{trophyIcons[idx]}</span>
                        )}
                        <Avatar name={item.person.name} color={item.person.avatarColor} size="sm" />
                        <span className="font-medium text-bark-500">{item.person.name}</span>
                        <span className="text-xs text-bark-500/50">({item.count}件)</span>
                      </div>
                      <span className="font-semibold text-forest-600 text-sm">
                        {formatWeight(item.weight)}
                      </span>
                    </div>
                    <div className="h-2.5 bg-cream-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-forest-400 to-forest-600 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 最常忘装备 */}
        <div className="card p-6">
          <h2 className="font-semibold text-bark-500 text-lg flex items-center gap-2 mb-5">
            <AlertTriangle size={20} className="text-warmorange-500" />
            最常遗漏装备
          </h2>
          {mostForgotten.length === 0 ? (
            <div className="text-center py-8 text-bark-500/50 text-sm">
              🎉 太棒了！还没有遗漏记录
            </div>
          ) : (
            <div className="space-y-3">
              {mostForgotten.map((item, idx) => {
                const maxCount = mostForgotten[0]?.count || 1;
                const percent = (item.count / maxCount) * 100;
                const categoryMeta = CATEGORY_META[item.equipment.category];
                return (
                  <div key={item.equipment.id} className="animate-slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{categoryMeta.emoji}</span>
                        <span className="font-medium text-bark-500">{item.equipment.name}</span>
                      </div>
                      <span className="badge bg-warmorange-100 text-warmorange-700">
                        遗漏 {item.count} 次
                      </span>
                    </div>
                    <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-warmorange-400 to-warmorange-600 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 分类统计 */}
      <div className="card p-6">
        <h2 className="font-semibold text-bark-500 text-lg flex items-center gap-2 mb-5">
          <Package size={20} className="text-forest-500" />
          分类统计
        </h2>
        {categoryStats.length === 0 ? (
          <div className="text-center py-8 text-bark-500/50 text-sm">
            暂无装备数据
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categoryStats.map(([cat, data]) => {
              const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META];
              return (
                <div
                  key={cat}
                  className={`${meta.color} rounded-xl p-4 text-center`}
                >
                  <div className="text-3xl mb-1">{meta.emoji}</div>
                  <div className="font-semibold mb-1">{meta.label}</div>
                  <div className="text-xs opacity-80">
                    {data.count} 件 · {formatWeight(data.weight)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
