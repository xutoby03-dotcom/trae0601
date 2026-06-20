import { useState, useMemo } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { useModelStore } from '@/store/useModelStore';
import { ModelCard } from '@/components/ModelCard';
import { NewModelModal } from '@/components/NewModelModal';
import { FormulaModal } from '@/components/PaintFormula';
import { useStaleCheck } from '@/hooks/useStaleCheck';
import type { Model, PaintFormula } from '@/types';
import { STAGE_NAMES, STAGE_ORDER } from '@/types';

export const Dashboard = () => {
  const { models, advanceStage, addFormula, stages } = useModelStore();
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');

  useStaleCheck();

  const activeModels = useMemo(() => {
    return models.filter((m) => !m.isOnShelf);
  }, [models]);

  const filteredModels = useMemo(() => {
    let filtered = activeModels;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.scale.toLowerCase().includes(query)
      );
    }

    if (stageFilter !== 'all') {
      filtered = filtered.filter((m) => m.currentStage === stageFilter);
    }

    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [activeModels, searchQuery, stageFilter]);

  const handleQuickAction = (action: string, model: Model) => {
    if (action === 'complete') {
      if (confirm(`确定将「${model.name}」的当前阶段标记为完成吗？`)) {
        advanceStage(model.id);
      }
    } else if (action === 'formula') {
      setSelectedModel(model);
      setIsFormulaModalOpen(true);
    } else if (action === 'photo') {
      window.location.href = `/model/${model.id}?tab=photos`;
    }
  };

  const handleAddFormula = (data: Omit<PaintFormula, 'id' | 'modelId' | 'stageId'>) => {
    if (!selectedModel) return;
    const modelStages = stages.filter((s) => s.modelId === selectedModel.id);
    const activeStage = modelStages.find((s) => s.status === 'active') || modelStages[0];
    
    addFormula({
      ...data,
      modelId: selectedModel.id,
      stageId: activeStage.id,
    });
  };

  const stats = useMemo(() => {
    const total = activeModels.length;
    const completed = activeModels.filter((m) => m.currentStage === 'completed').length;
    const inProgress = total - completed;
    const avgProgress = total > 0
      ? Math.round(activeModels.reduce((sum, m) => sum + m.progress, 0) / total)
      : 0;

    return { total, completed, inProgress, avgProgress };
  }, [activeModels]);

  return (
    <div className="min-h-screen bg-studio-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-studio-text mb-2">
              涂装进度看板
            </h1>
            <p className="text-studio-muted">
              共 {stats.total} 个项目 · 进行中 {stats.inProgress} · 已完成 {stats.completed} · 平均进度 {stats.avgProgress}%
            </p>
          </div>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-studio-copper hover:bg-studio-copperDark text-white rounded-xl font-medium shadow-lg hover:shadow-glow-copper transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            新建模型
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-studio-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索模型名称或比例..."
              className="w-full pl-10 pr-4 py-2.5 bg-studio-card border border-studio-border rounded-xl text-studio-text placeholder-studio-muted focus:outline-none focus:border-studio-copper transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-studio-muted" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-4 py-2.5 bg-studio-card border border-studio-border rounded-xl text-studio-text focus:outline-none focus:border-studio-copper transition-colors cursor-pointer"
            >
              <option value="all">全部阶段</option>
              {STAGE_ORDER.map((stage) => (
                <option key={stage} value={stage}>
                  {STAGE_NAMES[stage]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredModels.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-studio-card rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-10 h-10 text-studio-muted" />
            </div>
            <h3 className="text-xl font-medium text-studio-text mb-2">
              {searchQuery || stageFilter !== 'all' ? '没有找到匹配的模型' : '还没有模型项目'}
            </h3>
            <p className="text-studio-muted mb-6">
              {searchQuery || stageFilter !== 'all' ? '尝试调整搜索条件' : '点击上方按钮创建你的第一个模型涂装项目'}
            </p>
            {!searchQuery && stageFilter === 'all' && (
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="px-6 py-2.5 bg-studio-copper hover:bg-studio-copperDark text-white rounded-lg font-medium transition-colors"
              >
                新建模型
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map((model, index) => (
              <ModelCard
                key={model.id}
                model={model}
                index={index}
                onQuickAction={handleQuickAction}
              />
            ))}
          </div>
        )}
      </div>

      <NewModelModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      <FormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => {
          setIsFormulaModalOpen(false);
          setSelectedModel(null);
        }}
        onSave={handleAddFormula}
      />
    </div>
  );
};
