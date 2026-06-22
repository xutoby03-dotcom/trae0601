import { useState, useMemo } from 'react';
import { ClipboardList, Check, RefreshCw, AlertTriangle, CheckCircle2, Circle, Filter, ChevronRight, MapPin, Clock, Flag, Target } from 'lucide-react';
import { useCheckpointStore } from '@/store/useCheckpointStore';
import type { InspectionCategory, InspectionItem } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';

interface GroupedItems {
  key: string;
  title: string;
  subtitle?: string;
  items: InspectionItem[];
  type: 'start' | 'checkpoint' | 'end' | 'global';
  iconColor: string;
}

export default function InspectionChecklist() {
  const { inspectionItems, checkpoints, generateChecklist, toggleInspectionItem, resetChecklist } = useCheckpointStore();
  const [activeCategory, setActiveCategory] = useState<InspectionCategory | 'all'>('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (key: string) => {
    const next = new Set(expandedGroups);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpandedGroups(next);
  };

  const checkedCount = inspectionItems.filter(item => item.isChecked).length;
  const totalCount = inspectionItems.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const categories: Array<{ key: InspectionCategory | 'all'; label: string }> = [
    { key: 'all', label: '全部' },
    { key: 'location', label: '点位位置' },
    { key: 'device', label: '打卡设备' },
    { key: 'backup', label: '备用标识' },
    { key: 'safety', label: '安全检查' },
  ];

  const getCategoryCount = (cat: InspectionCategory | 'all') => {
    if (cat === 'all') return inspectionItems.length;
    return inspectionItems.filter(i => i.category === cat).length;
  };

  const groupedItems = useMemo<GroupedItems[]>(() => {
    if (totalCount === 0) return [];

    const groups: GroupedItems[] = [];

    // 起点项（不含关联 checkpointId 的前几项）
    const startItems = inspectionItems.filter(
      (item) => !item.checkpointId && item.description.startsWith('起点')
    );
    if (startItems.length > 0) {
      groups.push({
        key: 'start',
        title: '起点 START',
        subtitle: '发令区准备',
        items: startItems,
        type: 'start',
        iconColor: 'from-green-400 to-emerald-500',
      });
    }

    // 按 checkpoints 顺序分组各点位
    const sortedCps = [...checkpoints].sort((a, b) => a.orderIndex - b.orderIndex);
    sortedCps.forEach((cp) => {
      const cpItems = inspectionItems.filter((item) => item.checkpointId === cp.id);
      if (cpItems.length > 0) {
        groups.push({
          key: `cp-${cp.id}`,
          title: `点位 ${cp.pointNumber}`,
          subtitle: cp.estimatedArrival ? `预计到达 ${cp.estimatedArrival}` : undefined,
          items: cpItems,
          type: 'checkpoint',
          iconColor: 'from-forest-400 to-forest-600',
        });
      }
    });

    // 终点项
    const endItems = inspectionItems.filter(
      (item) => !item.checkpointId && item.description.startsWith('终点')
    );
    if (endItems.length > 0) {
      groups.push({
        key: 'end',
        title: '终点 FINISH',
        subtitle: '计时与成绩区',
        items: endItems,
        type: 'end',
        iconColor: 'from-alert-red to-rose-500',
      });
    }

    // 全局项（所有点位打卡记录同步验证等）
    const globalItems = inspectionItems.filter(
      (item) =>
        !item.checkpointId &&
        !item.description.startsWith('起点') &&
        !item.description.startsWith('终点')
    );
    if (globalItems.length > 0) {
      groups.push({
        key: 'global',
        title: '全场总检查',
        subtitle: '赛事收尾确认',
        items: globalItems,
        type: 'global',
        iconColor: 'from-purple-400 to-purple-600',
      });
    }

    return groups;
  }, [inspectionItems, checkpoints, totalCount]);

  // 按分类过滤分组
  const filteredGroups = useMemo(() => {
    if (activeCategory === 'all') return groupedItems;
    return groupedItems
      .map((g) => ({
        ...g,
        items: g.items.filter((i) => i.category === activeCategory),
      }))
      .filter((g) => g.items.length > 0);
  }, [groupedItems, activeCategory]);

  const getGroupIcon = (type: GroupedItems['type']) => {
    switch (type) {
      case 'start': return <Flag className="w-5 h-5" />;
      case 'checkpoint': return <MapPin className="w-5 h-5" />;
      case 'end': return <Target className="w-5 h-5" />;
      case 'global': return <ClipboardList className="w-5 h-5" />;
    }
  };

  const getGroupProgress = (items: InspectionItem[]) => {
    const done = items.filter((i) => i.isChecked).length;
    return { done, total: items.length, pct: items.length > 0 ? (done / items.length) * 100 : 0 };
  };

  const ItemRow = ({ item }: { item: InspectionItem }) => (
    <div
      onClick={() => toggleInspectionItem(item.id)}
      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 group ml-4 border-l-2 ${
        item.isChecked
          ? 'bg-alert-green/5 border-l-alert-green/40'
          : 'bg-white/60 border-l-forest-200/60 hover:bg-forest-50/40 hover:border-l-forest-400'
      }`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 ${
        item.isChecked
          ? 'bg-alert-green border-alert-green text-white'
          : 'border-gray-300 group-hover:border-forest-400'
      }`}>
        {item.isChecked && (
          <Check className="w-3 h-3 animate-checkmark" strokeWidth={3} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`badge text-[10px] ${CATEGORY_COLORS[item.category]}`}>
            {CATEGORY_LABELS[item.category]}
          </span>
        </div>
        <p className={`text-sm transition-all duration-200 leading-relaxed ${
          item.isChecked ? 'text-gray-400 line-through' : 'text-gray-700'
        }`}>
          {item.description}
        </p>
      </div>

      <div className={`w-4 h-4 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
        item.isChecked ? 'text-alert-green' : 'text-gray-300 opacity-0 group-hover:opacity-100'
      }`}>
        {item.isChecked ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <Circle className="w-3 h-3" />
        )}
      </div>
    </div>
  );

  return (
    <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-forest-800">赛前巡检清单</h2>
            <p className="text-sm text-gray-500">
              {totalCount > 0
                ? `已完成 ${checkedCount} / ${totalCount} 项 · 按点位分组`
                : '点击生成按钮创建巡检清单'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalCount > 0 && (
            <button
              onClick={resetChecklist}
              className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
            >
              <RefreshCw className="w-4 h-4" />
              重置
            </button>
          )}
          <button
            onClick={generateChecklist}
            disabled={checkpoints.length === 0}
            className="btn-primary flex items-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            {totalCount > 0 ? '重新生成' : '生成清单'}
          </button>
        </div>
      </div>

      {checkpoints.length === 0 && (
        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>请先添加检查点后再生成巡检清单</p>
        </div>
      )}

      {checkpoints.length > 0 && totalCount === 0 && (
        <div className="text-center py-12 text-gray-400 border-2 border-dashed border-forest-200 rounded-xl bg-forest-50/30">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-forest-300" />
          <p className="text-forest-600 font-medium">准备就绪</p>
          <p className="text-sm">点击"生成清单"按钮创建赛前巡检清单</p>
        </div>
      )}

      {totalCount > 0 && (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">完成进度</span>
              <span className={`text-sm font-bold ${
                progress === 100 ? 'text-alert-green' :
                progress >= 50 ? 'text-forest-600' :
                'text-gray-500'
              }`}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out rounded-full ${
                  progress === 100
                    ? 'bg-gradient-to-r from-alert-green to-emerald-500'
                    : 'bg-gradient-to-r from-forest-400 to-forest-600'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            {progress === 100 && (
              <div className="mt-2 flex items-center gap-2 text-alert-green text-sm font-medium animate-pulse-soft">
                <CheckCircle2 className="w-4 h-4" />
                所有检查项已完成，可以开始比赛！
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  activeCategory === cat.key
                    ? `${CATEGORY_COLORS[cat.key as InspectionCategory] || 'bg-forest-600 text-white'}`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.key === 'all' && <Filter className="w-3.5 h-3.5" />}
                {cat.label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeCategory === cat.key
                    ? 'bg-white/20'
                    : 'bg-gray-200'
                }`}>
                  {getCategoryCount(cat.key)}
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
            {filteredGroups.map((group) => {
              const { done, total, pct } = getGroupProgress(group.items);
              const expanded = expandedGroups.has(group.key) || pct < 100;
              return (
                <div
                  key={group.key}
                  className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                    pct === 100
                      ? 'border-alert-green/30 bg-alert-green/[0.02]'
                      : 'border-gray-200 bg-white/60'
                  }`}
                >
                  <button
                    onClick={() => toggleGroup(group.key)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-forest-50/50 transition-colors text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${group.iconColor} text-white flex items-center justify-center shadow-sm`}>
                      {getGroupIcon(group.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-gray-800">
                          {group.title}
                        </span>
                        {group.type === 'checkpoint' && group.subtitle && (
                          <span className="flex items-center gap-1 text-xs text-terrain-600 bg-terrain-50 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            {group.subtitle}
                          </span>
                        )}
                        {(group.type === 'start' || group.type === 'end') && group.subtitle && (
                          <span className="text-xs text-gray-400">{group.subtitle}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 max-w-[160px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct === 100 ? 'bg-alert-green' : 'bg-forest-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={`text-[11px] font-medium ${
                          pct === 100 ? 'text-alert-green' : 'text-gray-500'
                        }`}>
                          {done}/{total}
                        </span>
                      </div>
                    </div>

                    <div className={`text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`}>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </button>

                  {expanded && (
                    <div className="px-4 pb-4 space-y-2 animate-fade-in">
                      {group.items.map((item) => (
                        <ItemRow key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredGroups.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                该分类下暂无检查项
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
