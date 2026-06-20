import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Droplets, Image, ArrowRight } from 'lucide-react';
import type { Model } from '@/types';
import { STAGE_NAMES, STAGE_COLORS, STAGE_ORDER } from '@/types';
import { formatDate } from '@/utils/time';

interface ModelCardProps {
  model: Model;
  index: number;
  onQuickAction?: (action: string, model: Model) => void;
}

export const ModelCard = memo(function ModelCard({ model, index, onQuickAction }: ModelCardProps) {
  const navigate = useNavigate();

  const animationClass = `animate-stagger-${Math.min((index % 3) + 1, 3)}`;
  const currentStageColor = STAGE_COLORS[model.currentStage];
  const currentStageIndex = STAGE_ORDER.indexOf(model.currentStage);

  const handleClick = () => {
    navigate(`/model/${model.id}`);
  };

  return (
    <div
      className={`bg-studio-card rounded-xl border border-studio-border shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer overflow-hidden group opacity-0 ${animationClass}`}
      onClick={handleClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={model.thumbnail}
          alt={model.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-studio-card via-transparent to-transparent" />
        
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-studio-card/90 backdrop-blur-sm rounded-md text-xs font-medium text-studio-text border border-studio-border">
            {model.scale}
          </span>
        </div>

        {model.isOnShelf && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-studio-rust/90 backdrop-blur-sm rounded-md text-xs font-medium text-white animate-pulse-slow">
              已停滞 {model.staleDays} 天
            </span>
          </div>
        )}

        {model.currentStage === 'completed' && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-studio-military/90 backdrop-blur-sm rounded-md text-xs font-medium text-white flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              已完成
            </span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: currentStageColor }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {STAGE_NAMES[model.currentStage]}
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-studio-text mb-1 group-hover:text-studio-copper transition-colors">
          {model.name}
        </h3>
        
        <div className="flex items-center gap-2 text-xs text-studio-muted mb-3">
          <Clock className="w-3 h-3" />
          <span>更新于 {formatDate(model.updatedAt)}</span>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-studio-muted mb-1.5">
            <span>进度</span>
            <span className="font-medium text-studio-text">{model.progress}%</span>
          </div>
          <div className="h-2 bg-studio-border rounded-full overflow-hidden">
            <div className="flex h-full">
              {STAGE_ORDER.map((stage, idx) => (
                <div
                  key={stage}
                  className="flex-1 transition-all duration-500"
                  style={{
                    backgroundColor: idx <= currentStageIndex ? STAGE_COLORS[stage] : '#3A3A42',
                    marginRight: idx < STAGE_ORDER.length - 1 ? '2px' : '0',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-studio-bg rounded-lg mb-4">
          <ArrowRight className="w-4 h-4 text-studio-copper flex-shrink-0 mt-0.5" />
          <p className="text-sm text-studio-text">{model.nextAction}</p>
        </div>

        <div className="flex gap-2">
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-studio-border/50 hover:bg-studio-copper text-studio-muted hover:text-white rounded-lg text-xs font-medium transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAction?.('formula', model);
            }}
          >
            <Droplets className="w-3.5 h-3.5" />
            配方
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-studio-border/50 hover:bg-studio-cobalt text-studio-muted hover:text-white rounded-lg text-xs font-medium transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAction?.('photo', model);
            }}
          >
            <Image className="w-3.5 h-3.5" />
            照片
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-studio-border/50 hover:bg-studio-military text-studio-muted hover:text-white rounded-lg text-xs font-medium transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAction?.('complete', model);
            }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            完成
          </button>
        </div>
      </div>
    </div>
  );
});
