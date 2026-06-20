import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Edit2, Droplets, Image, Clock } from 'lucide-react';
import { useModelStore } from '@/store/useModelStore';
import { StageTimeline } from '@/components/StageTimeline';
import { PaintFormulaCard, FormulaModal } from '@/components/PaintFormula';
import { PhotoGallery } from '@/components/PhotoGallery';
import { DryingTimer } from '@/components/DryingTimer';
import { formatDate } from '@/utils/time';
import type { PaintFormula, PaintStage } from '@/types';
import { STAGE_NAMES, STAGE_COLORS, STAGE_ORDER } from '@/types';

type TabType = 'overview' | 'formulas' | 'photos' | 'timer';

export const ModelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    models,
    stages,
    formulas,
    photos,
    advanceStage,
    deleteModel,
    addFormula,
    updateFormula,
    deleteFormula,
    addPhoto,
    deletePhoto,
    updateModel,
  } = useModelStore();

  const model = models.find((m) => m.id === id);
  const modelStages = stages.filter((s) => s.modelId === id);
  const modelFormulas = formulas.filter((f) => f.modelId === id);
  const modelPhotos = photos.filter((p) => p.modelId === id);

  const [activeTab, setActiveTab] = useState<TabType>(
    (searchParams.get('tab') as TabType) || 'overview'
  );
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<PaintFormula | null>(null);
  const [isEditingNextAction, setIsEditingNextAction] = useState(false);
  const [nextActionText, setNextActionText] = useState('');

  const activeStage = useMemo(
    () => modelStages.find((s) => s.status === 'active'),
    [modelStages]
  );

  const canAdvance = useMemo(() => {
    if (!model || model.currentStage === 'completed') return false;
    const currentIndex = STAGE_ORDER.indexOf(model.currentStage);
    return currentIndex < STAGE_ORDER.length - 1;
  }, [model]);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: '总览', icon: <Clock className="w-4 h-4" /> },
    { id: 'formulas', label: `配方 (${modelFormulas.length})`, icon: <Droplets className="w-4 h-4" /> },
    { id: 'photos', label: `照片 (${modelPhotos.length})`, icon: <Image className="w-4 h-4" /> },
    { id: 'timer', label: '干燥计时', icon: <Clock className="w-4 h-4" /> },
  ];

  if (!model) {
    return (
      <div className="min-h-screen bg-studio-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-studio-text mb-2">模型不存在</h2>
          <button
            onClick={() => navigate('/')}
            className="text-studio-copper hover:underline"
          >
            返回看板
          </button>
        </div>
      </div>
    );
  }

  const handleSaveFormula = (data: Omit<PaintFormula, 'id' | 'modelId' | 'stageId'>) => {
    if (editingFormula) {
      updateFormula(editingFormula.id, data);
    } else {
      addFormula({
        ...data,
        modelId: model.id,
        stageId: activeStage?.id || modelStages[0].id,
      });
    }
    setEditingFormula(null);
  };

  const handleEditFormula = (formula: PaintFormula) => {
    setEditingFormula(formula);
    setIsFormulaModalOpen(true);
  };

  const handleDeleteFormula = (id: string) => {
    if (confirm('确定要删除这个颜色配方吗？')) {
      deleteFormula(id);
    }
  };

  const handleDeleteModel = () => {
    if (confirm(`确定要删除「${model.name}」吗？此操作不可恢复。`)) {
      deleteModel(model.id);
      navigate('/');
    }
  };

  const handleSaveNextAction = () => {
    if (nextActionText.trim()) {
      updateModel(model.id, { nextAction: nextActionText.trim() });
    }
    setIsEditingNextAction(false);
  };

  const currentStageColor = STAGE_COLORS[model.currentStage as PaintStage];

  return (
    <div className="min-h-screen bg-studio-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-studio-muted hover:text-studio-text mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回看板
        </button>

        <div className="bg-studio-card rounded-2xl border border-studio-border overflow-hidden mb-6">
          <div className="relative h-64">
            <img
              src={model.thumbnail}
              alt={model.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-studio-card via-studio-card/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="font-display text-3xl font-bold text-white">{model.name}</h1>
                    <span className="px-2.5 py-1 bg-studio-card/80 backdrop-blur-sm rounded-md text-sm text-studio-text border border-studio-border">
                      {model.scale}
                    </span>
                    <span
                      className="px-2.5 py-1 rounded-md text-sm text-white"
                      style={{ backgroundColor: currentStageColor }}
                    >
                      {STAGE_NAMES[model.currentStage as PaintStage]}
                    </span>
                  </div>
                  <p className="text-studio-muted">
                    创建于 {formatDate(model.createdAt)} · 更新于 {formatDate(model.updatedAt)}
                  </p>
                </div>
                <button
                  onClick={handleDeleteModel}
                  className="p-2 bg-studio-rust/20 hover:bg-studio-rust text-studio-rust hover:text-white rounded-lg transition-colors"
                  title="删除项目"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-studio-border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-studio-copper">下一步行动</span>
                  {!isEditingNextAction && (
                    <button
                      onClick={() => {
                        setNextActionText(model.nextAction);
                        setIsEditingNextAction(true);
                      }}
                      className="p-1 text-studio-muted hover:text-studio-copper transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {isEditingNextAction ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nextActionText}
                      onChange={(e) => setNextActionText(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-studio-bg border border-studio-border rounded-lg text-studio-text focus:outline-none focus:border-studio-copper"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveNextAction();
                        if (e.key === 'Escape') setIsEditingNextAction(false);
                      }}
                    />
                    <button
                      onClick={handleSaveNextAction}
                      className="px-3 py-1.5 bg-studio-copper text-white rounded-lg text-sm"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setIsEditingNextAction(false)}
                      className="px-3 py-1.5 bg-studio-border text-studio-text rounded-lg text-sm"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <p className="text-studio-text">{model.nextAction}</p>
                )}
              </div>
              <div className="text-right ml-8">
                <div className="text-3xl font-bold text-studio-copper">{model.progress}%</div>
                <div className="text-sm text-studio-muted">总体进度</div>
              </div>
            </div>
          </div>

          <div className="border-t border-studio-border">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'text-studio-copper border-studio-copper bg-studio-copper/5'
                      : 'text-studio-muted border-transparent hover:text-studio-text hover:bg-studio-border/20'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              <StageTimeline
                stages={modelStages}
                onStageComplete={() => advanceStage(model.id)}
                canAdvance={canAdvance}
              />

              {modelFormulas.length > 0 && (
                <div className="bg-studio-card rounded-xl border border-studio-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-semibold text-studio-text">颜色配方</h3>
                    <button
                      onClick={() => setActiveTab('formulas')}
                      className="text-sm text-studio-copper hover:underline"
                    >
                      查看全部 {modelFormulas.length} 个
                    </button>
                  </div>
                  <div className="space-y-3">
                    {modelFormulas.slice(0, 3).map((formula) => (
                      <PaintFormulaCard key={formula.id} formula={formula} />
                    ))}
                  </div>
                </div>
              )}

              {modelPhotos.length > 0 && (
                <div className="bg-studio-card rounded-xl border border-studio-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-semibold text-studio-text">最近照片</h3>
                    <button
                      onClick={() => setActiveTab('photos')}
                      className="text-sm text-studio-copper hover:underline"
                    >
                      查看全部 {modelPhotos.length} 张
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {modelPhotos.slice(-4).map((photo) => (
                      <div
                        key={photo.id}
                        className="aspect-square rounded-lg overflow-hidden border border-studio-border"
                      >
                        <img
                          src={photo.data}
                          alt={photo.caption}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'formulas' && (
            <div className="bg-studio-card rounded-xl border border-studio-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold text-studio-text">颜色配方库</h3>
                <button
                  onClick={() => {
                    setEditingFormula(null);
                    setIsFormulaModalOpen(true);
                  }}
                  className="px-4 py-2 bg-studio-copper hover:bg-studio-copperDark text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Droplets className="w-4 h-4" />
                  添加配方
                </button>
              </div>

              {modelFormulas.length === 0 ? (
                <div className="text-center py-12">
                  <Droplets className="w-12 h-12 text-studio-muted mx-auto mb-3" />
                  <p className="text-studio-muted">还没有颜色配方</p>
                  <p className="text-sm text-studio-muted/70 mt-1">记录你使用的油漆品牌、编号和稀释比例</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modelFormulas.map((formula) => (
                    <PaintFormulaCard
                      key={formula.id}
                      formula={formula}
                      onEdit={() => handleEditFormula(formula)}
                      onDelete={() => handleDeleteFormula(formula.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <PhotoGallery
              photos={modelPhotos}
              stages={modelStages}
              modelId={model.id}
              defaultStageId={activeStage?.id || modelStages[0]?.id || ''}
              onAddPhoto={addPhoto}
              onDeletePhoto={deletePhoto}
            />
          )}

          {activeTab === 'timer' && (
            <DryingTimer modelId={model.id} modelName={model.name} />
          )}
        </div>
      </div>

      <FormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => {
          setIsFormulaModalOpen(false);
          setEditingFormula(null);
        }}
        onSave={handleSaveFormula}
        initialData={editingFormula || undefined}
      />
    </div>
  );
};
