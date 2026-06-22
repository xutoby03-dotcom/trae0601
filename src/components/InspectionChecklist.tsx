import { useState } from 'react';
import { ClipboardList, Check, RefreshCw, AlertTriangle, CheckCircle2, Circle, Filter } from 'lucide-react';
import { useCheckpointStore } from '@/store/useCheckpointStore';
import type { InspectionCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';

export default function InspectionChecklist() {
  const { inspectionItems, checkpoints, generateChecklist, toggleInspectionItem, resetChecklist } = useCheckpointStore();
  const [activeCategory, setActiveCategory] = useState<InspectionCategory | 'all'>('all');

  const checkedCount = inspectionItems.filter(item => item.isChecked).length;
  const totalCount = inspectionItems.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const filteredItems = activeCategory === 'all'
    ? inspectionItems
    : inspectionItems.filter(item => item.category === activeCategory);

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
                ? `已完成 ${checkedCount} / ${totalCount} 项`
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

          <div className="flex flex-wrap gap-2 mb-4">
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

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => toggleInspectionItem(item.id)}
                className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all duration-300 group ${
                  item.isChecked
                    ? 'bg-alert-green/5 border border-alert-green/20'
                    : 'bg-white/50 border border-gray-100 hover:bg-forest-50/50 hover:border-forest-200'
                }`}
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 ${
                  item.isChecked
                    ? 'bg-alert-green border-alert-green text-white'
                    : 'border-gray-300 group-hover:border-forest-400'
                }`}>
                  {item.isChecked && (
                    <Check className="w-4 h-4 animate-checkmark" strokeWidth={3} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge text-[10px] ${CATEGORY_COLORS[item.category]}`}>
                      {CATEGORY_LABELS[item.category]}
                    </span>
                  </div>
                  <p className={`text-sm transition-all duration-200 ${
                    item.isChecked ? 'text-gray-400 line-through' : 'text-gray-700'
                  }`}>
                    {item.description}
                  </p>
                </div>

                <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  item.isChecked ? 'text-alert-green' : 'text-gray-300 opacity-0 group-hover:opacity-100'
                }`}>
                  {item.isChecked ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              该分类下暂无检查项
            </div>
          )}
        </>
      )}
    </div>
  );
}
