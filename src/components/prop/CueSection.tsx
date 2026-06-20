import { useState } from 'react';
import { ChevronDown, ChevronUp, Zap, CheckCircle2, Clock } from 'lucide-react';
import type { Cue } from '@/types';
import PropFlowCard from './PropFlowCard';
import { useAppStore } from '@/store/appStore';

interface CueSectionProps {
  cue: Cue;
  isExpanded?: boolean;
}

export default function CueSection({ cue, isExpanded = false }: CueSectionProps) {
  const [expanded, setExpanded] = useState(isExpanded);
  const { getPropFlowsByCue } = useAppStore();
  const propFlows = getPropFlowsByCue(cue.id);

  const confirmedCount = propFlows.filter((pf) => pf.status === 'confirmed').length;
  const totalCount = propFlows.length;
  const issueCount = propFlows.filter((pf) => pf.status === 'issue').length;
  const allConfirmed = confirmedCount === totalCount && totalCount > 0;

  return (
    <div
      className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
        allConfirmed
          ? 'border-neon-green/40 bg-neon-green/5'
          : issueCount > 0
          ? 'border-neon-red/40 bg-neon-red/5'
          : 'border-stage-border bg-stage-bg-card'
      }`}
    >
      {/* Cue 标题栏 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-stage-bg-hover/50 transition-colors"
      >
        <div className="flex items-center gap-5">
          {/* Cue 编号 */}
          <div
            className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl ${
              allConfirmed
                ? 'bg-neon-green text-black'
                : issueCount > 0
                ? 'bg-neon-red text-white'
                : 'bg-stage-bg-hover text-neon-green'
            }`}
          >
            {cue.number}
          </div>

          {/* Cue 信息 */}
          <div>
            <div className="flex items-center gap-3">
              <Zap
                className={`w-5 h-5 ${
                  allConfirmed
                    ? 'text-neon-green'
                    : issueCount > 0
                    ? 'text-neon-red'
                    : 'text-neon-yellow'
                }`}
              />
              <h3 className="text-2xl font-bold text-stage-text">{cue.name}</h3>
            </div>
            <p className="text-base text-stage-text-secondary mt-1">
              {cue.description}
            </p>
          </div>
        </div>

        {/* 状态和展开按钮 */}
        <div className="flex items-center gap-4">
          {/* 进度标签 */}
          <div className="text-right">
            <div
              className={`text-lg font-bold ${
                allConfirmed
                  ? 'text-neon-green'
                  : issueCount > 0
                  ? 'text-neon-red'
                  : 'text-stage-text'
              }`}
            >
              {confirmedCount}/{totalCount}
            </div>
            <div className="text-sm text-stage-text-muted">
              道具已确认
            </div>
          </div>

          {/* 问题数量 */}
          {issueCount > 0 && (
            <div className="px-3 py-1.5 bg-neon-red/20 text-neon-red rounded-lg text-sm font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {issueCount} 问题
            </div>
          )}

          {/* 全部完成图标 */}
          {allConfirmed && (
            <div className="p-2 bg-neon-green/20 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-neon-green" />
            </div>
          )}

          {/* 展开/收起 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-2 rounded-lg hover:bg-stage-bg-hover text-stage-text-secondary hover:text-stage-text transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-6 h-6" />
            ) : (
              <ChevronDown className="w-6 h-6" />
            )}
          </button>
        </div>
      </button>

      {/* 道具流向列表 */}
      {expanded && (
        <div className="px-6 pb-6 space-y-4 border-t border-stage-border/50 pt-5 animate-fade-in">
          {propFlows.length > 0 ? (
            propFlows.map((pf) => (
              <PropFlowCard key={pf.id} propFlow={pf} />
            ))
          ) : (
            <div className="py-10 text-center text-stage-text-muted">
              该 Cue 暂无道具
            </div>
          )}
        </div>
      )}
    </div>
  );
}
