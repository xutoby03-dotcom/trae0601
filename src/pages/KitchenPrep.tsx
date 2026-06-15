import { useState } from 'react';
import { Printer, Clock, CheckCircle2, ChefHat, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { usePrepStore } from '@/stores/prepStore';
import { PREP_STATUS_META, MEAL_TYPE_META, ALLERGY_META } from '@/types';
import type { PrepStatus, MealType, AllergyType } from '@/types';
import AllergyBadge from '@/components/allergy/AllergyBadge';
import EmptyState from '@/components/common/EmptyState';

export default function KitchenPrep() {
  const { getTodayPrepItems, updatePrepStatus, printLabels, getGroupedByClass } = usePrepStore();
  const todayPrepItems = getTodayPrepItems();
  const [activeMeal, setActiveMeal] = useState<MealType>('lunch');
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const mealItems = todayPrepItems.filter((p) => p.mealType === activeMeal);
  const groupedByClass = getGroupedByClass(mealItems);

  const statusCounts = {
    pending: mealItems.filter((i) => i.status === 'pending').length,
    preparing: mealItems.filter((i) => i.status === 'preparing').length,
    ready: mealItems.filter((i) => i.status === 'ready').length,
    picked: mealItems.filter((i) => i.status === 'picked').length,
  };

  const toggleClass = (className: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(className)) {
      newExpanded.delete(className);
    } else {
      newExpanded.add(className);
    }
    setExpandedClasses(newExpanded);
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const selectAllInClass = (items: { id: string }[]) => {
    const newSelected = new Set(selectedItems);
    items.forEach((i) => newSelected.add(i.id));
    setSelectedItems(newSelected);
  };

  const handlePrintSelected = () => {
    const items = mealItems.filter((i) => selectedItems.has(i.id));
    if (items.length > 0) {
      printLabels(items);
    }
  };

  const handlePrintAll = () => {
    printLabels(mealItems);
  };

  const handleBatchUpdateStatus = (status: PrepStatus) => {
    selectedItems.forEach((id) => updatePrepStatus(id, status));
    setSelectedItems(new Set());
  };

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="card-body">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((meal) => {
                const meta = MEAL_TYPE_META[meal];
                const count = todayPrepItems.filter((p) => p.mealType === meal).length;
                const isActive = activeMeal === meal;
                return (
                  <button
                    key={meal}
                    onClick={() => setActiveMeal(meal)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.name}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-white/20' : 'bg-slate-200'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {selectedItems.size > 0 && (
                <>
                  <span className="text-sm text-slate-500">
                    已选 {selectedItems.size} 项
                  </span>
                  <button onClick={() => handleBatchUpdateStatus('preparing')} className="btn-warning text-xs">
                    <ChefHat size={14} />
                    开始制作
                  </button>
                  <button onClick={() => handleBatchUpdateStatus('ready')} className="btn-primary text-xs">
                    <CheckCircle2 size={14} />
                    标记就绪
                  </button>
                  <button onClick={handlePrintSelected} className="btn-secondary text-xs">
                    <Printer size={14} />
                    打印标签
                  </button>
                </>
              )}
              <button onClick={handlePrintAll} className="btn-secondary text-xs">
                <Printer size={14} />
                打印全部标签
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mt-5">
            <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <Clock size={20} className="text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-700">{statusCounts.pending}</p>
                <p className="text-xs text-slate-500">待备餐</p>
              </div>
            </div>
            <div className="bg-warning-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning-200 flex items-center justify-center">
                <ChefHat size={20} className="text-warning-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning-700">{statusCounts.preparing}</p>
                <p className="text-xs text-warning-600">制作中</p>
              </div>
            </div>
            <div className="bg-info-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info-200 flex items-center justify-center">
                <Package size={20} className="text-info-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-info-700">{statusCounts.ready}</p>
                <p className="text-xs text-info-600">已就绪</p>
              </div>
            </div>
            <div className="bg-primary-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-200 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-700">{statusCounts.picked}</p>
                <p className="text-xs text-primary-600">已领取</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {mealItems.length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedByClass).map(([className, items]) => {
            const isExpanded = expandedClasses.has(className) || expandedClasses.size === 0;
            const allSelected = items.every((i) => selectedItems.has(i.id));

            return (
              <div key={className} className="card overflow-hidden">
                <div
                  className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleClass(className)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (allSelected) {
                          const newSelected = new Set(selectedItems);
                          items.forEach((i) => newSelected.delete(i.id));
                          setSelectedItems(newSelected);
                        } else {
                          selectAllInClass(items);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <h3 className="font-semibold text-slate-800">{className}</h3>
                    <span className="text-sm text-slate-400">共 {items.length} 份</span>
                    <div className="flex gap-1">
                      {Array.from(new Set(items.flatMap((i) => i.allergies))).slice(0, 3).map((a) => (
                        <span key={a} className="text-lg">
                          {ALLERGY_META[a as AllergyType].icon}
                        </span>
                      ))}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-400" />
                  )}
                </div>

                {isExpanded && (
                  <div className="divide-y divide-slate-100">
                    {items.map((item) => {
                      const isSelected = selectedItems.has(item.id);
                      const statusMeta = PREP_STATUS_META[item.status];

                      return (
                        <div
                          key={item.id}
                          className={`px-6 py-3 flex items-center gap-4 transition-colors ${
                            isSelected ? 'bg-primary-50/50' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectItem(item.id)}
                            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-slate-800">{item.studentName}</p>
                              <span className={`badge ${statusMeta.className}`}>{statusMeta.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="line-through opacity-60">{item.originalDish}</span>
                              <span>→</span>
                              <span className="text-primary-600 font-medium">{item.replacementDish}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.allergies.map((a) => (
                              <AllergyBadge key={a} type={a} size="sm" />
                            ))}
                          </div>

                          <div className="flex items-center gap-1">
                            {(
                              [
                                ['preparing', '制作', 'btn-warning'],
                                ['ready', '就绪', 'btn-primary'],
                              ] as const
                            ).map(([status, label, btnClass]) => {
                              if (item.status === status) return null;
                              if (status === 'ready' && item.status === 'pending') return null;
                              return (
                                <button
                                  key={status}
                                  onClick={() => updatePrepStatus(item.id, status)}
                                  className={`${btnClass} !px-3 !py-1 !text-xs`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                            <button
                              onClick={() => printLabels([item])}
                              className="btn-secondary !px-2 !py-1 !text-xs"
                              title="打印标签"
                            >
                              <Printer size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="暂无备餐任务"
          description={`${MEAL_TYPE_META[activeMeal].name}暂无需制作的过敏餐`}
        />
      )}
    </div>
  );
}
