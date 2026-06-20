import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, RefreshCw, Trash2, ArrowRight, AlertTriangle, Wrench, Package, Calendar } from 'lucide-react';
import { useModelStore } from '@/store/useModelStore';
import type { ShelfReason } from '@/types';
import { SHELF_REASON_NAMES, STAGE_NAMES, STAGE_COLORS } from '@/types';
import { formatDate } from '@/utils/time';

const shelfReasonIcons: Record<ShelfReason, React.ReactNode> = {
  'touch-up': <Wrench className="w-4 h-4" />,
  'parts-missing': <Package className="w-4 h-4" />,
  'replan': <Calendar className="w-4 h-4" />,
  'other': <AlertTriangle className="w-4 h-4" />,
};

export const ShelfZone = () => {
  const navigate = useNavigate();
  const { models, restoreFromShelf, moveToShelf, deleteModel } = useModelStore();
  const [filter, setFilter] = useState<ShelfReason | 'all'>('all');

  const shelfModels = models.filter((m) => m.isOnShelf);

  const filteredModels = filter === 'all'
    ? shelfModels
    : shelfModels.filter((m) => m.shelfReason === filter);

  const handleRestore = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    if (confirm(`确定恢复「${model?.name}」的制作吗？`)) {
      restoreFromShelf(modelId);
    }
  };

  const handleChangeReason = (modelId: string, reason: ShelfReason) => {
    moveToShelf(modelId, reason);
  };

  const handleDelete = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    if (confirm(`确定要归档并删除「${model?.name}」吗？此操作不可恢复。`)) {
      deleteModel(modelId);
    }
  };

  const reasonStats = [
    { reason: 'all' as const, label: '全部', count: shelfModels.length },
    { reason: 'touch-up' as const, label: '需要补漆', count: shelfModels.filter((m) => m.shelfReason === 'touch-up').length },
    { reason: 'parts-missing' as const, label: '缺少补件', count: shelfModels.filter((m) => m.shelfReason === 'parts-missing').length },
    { reason: 'replan' as const, label: '重新规划', count: shelfModels.filter((m) => m.shelfReason === 'replan').length },
    { reason: 'other' as const, label: '其他原因', count: shelfModels.filter((m) => m.shelfReason === 'other').length },
  ];

  return (
    <div className="min-h-screen bg-studio-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-studio-rust/20 rounded-xl flex items-center justify-center">
              <Archive className="w-6 h-6 text-studio-rust" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-studio-text">搁置区</h1>
              <p className="text-studio-muted">长时间未操作的模型会自动移动到这里</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {reasonStats.map((item) => (
            <button
              key={item.reason}
              onClick={() => setFilter(item.reason)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === item.reason
                  ? 'bg-studio-rust text-white'
                  : 'bg-studio-card text-studio-muted hover:text-studio-text border border-studio-border hover:border-studio-rust/50'
              }`}
            >
              {item.label}
              <span className="ml-2 px-1.5 py-0.5 bg-black/20 rounded text-xs">
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {filteredModels.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-studio-card rounded-full flex items-center justify-center mx-auto mb-4">
              <Archive className="w-10 h-10 text-studio-muted" />
            </div>
            <h3 className="text-xl font-medium text-studio-text mb-2">搁置区是空的</h3>
            <p className="text-studio-muted">
              {filter !== 'all' ? '当前筛选条件下没有搁置的模型' : '超过7天未操作的模型会自动移动到这里'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-2.5 bg-studio-copper hover:bg-studio-copperDark text-white rounded-lg font-medium transition-colors"
            >
              返回进度看板
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredModels.map((model) => (
              <div
                key={model.id}
                className="bg-studio-card rounded-xl border border-studio-border overflow-hidden hover:border-studio-rust/30 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative sm:w-48 h-36 sm:h-auto flex-shrink-0">
                    <img
                      src={model.thumbnail}
                      alt={model.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-studio-rust/90 backdrop-blur-sm rounded-md text-xs font-medium text-white flex items-center gap-1 animate-pulse-slow">
                        <AlertTriangle className="w-3 h-3" />
                        已停滞 {model.staleDays} 天
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-display text-lg font-semibold text-studio-text">
                            {model.name}
                          </h3>
                          <span className="px-2 py-0.5 bg-studio-border rounded text-xs text-studio-muted">
                            {model.scale}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded text-xs text-white"
                            style={{ backgroundColor: STAGE_COLORS[model.currentStage] }}
                          >
                            {STAGE_NAMES[model.currentStage]}
                          </span>
                        </div>

                        <p className="text-sm text-studio-muted mb-3">
                          上次更新: {formatDate(model.updatedAt)} · 进度: {model.progress}%
                        </p>

                        <div className="flex items-start gap-2 p-3 bg-studio-bg rounded-lg mb-4">
                          <ArrowRight className="w-4 h-4 text-studio-rust flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-studio-text">下一步: {model.nextAction}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-studio-muted">搁置原因:</span>
                          {(Object.keys(SHELF_REASON_NAMES) as ShelfReason[]).map((reason) => (
                            <button
                              key={reason}
                              onClick={() => handleChangeReason(model.id, reason)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                                model.shelfReason === reason
                                  ? 'bg-studio-rust/20 text-studio-rust border border-studio-rust/30'
                                  : 'bg-studio-border/50 text-studio-muted hover:text-studio-text hover:bg-studio-border'
                              }`}
                            >
                              {shelfReasonIcons[reason]}
                              {SHELF_REASON_NAMES[reason]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex sm:flex-col gap-2">
                        <button
                          onClick={() => navigate(`/model/${model.id}`)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-studio-cobalt hover:bg-studio-cobalt/80 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          查看详情
                        </button>
                        <button
                          onClick={() => handleRestore(model.id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-studio-copper hover:bg-studio-copperDark text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-4 h-4" />
                          恢复制作
                        </button>
                        <button
                          onClick={() => handleDelete(model.id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-studio-border hover:bg-studio-rust/20 text-studio-muted hover:text-studio-rust rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                          归档删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {shelfModels.length > 0 && (
          <div className="mt-8 p-4 bg-studio-card rounded-xl border border-studio-border">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-studio-rust flex-shrink-0 mt-0.5" />
              <div className="text-sm text-studio-muted">
                <p className="font-medium text-studio-text mb-1">温馨提示</p>
                <p>搁置区的模型已超过7天没有操作。建议定期回顾搁置的项目，要么恢复制作，要么果断归档。</p>
                <p className="mt-1">记住：完成一个旧项目比开十个新项目更有成就感！🎨</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
