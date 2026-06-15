import React from 'react';
import { usePlanStore } from '../store/usePlanStore';
import { TimelineNode } from '../types';
import { TimelineItem } from './TimelineItem';
import { Plus, Clock, PartyPopper, ArrowUp, ArrowDown, Pencil } from 'lucide-react';
import { TimelineModal } from './TimelineModal';

export const Timeline: React.FC = () => {
  const timeline = usePlanStore((s) => s.plan.timeline);
  const revealSecrets = usePlanStore((s) => s.revealSecrets);
  const updateTimelineNode = usePlanStore((s) => s.updateTimelineNode);
  const [editingNode, setEditingNode] = React.useState<{ node?: TimelineNode } | null>(null);

  const moveNode = (id: string, dir: -1 | 1) => {
    const idx = timeline.findIndex((n) => n.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= timeline.length) return;
    const a = timeline[idx];
    const b = timeline[swapIdx];
    updateTimelineNode(a.id, { order: b.order });
    updateTimelineNode(b.id, { order: a.order });
  };

  const completed = timeline.filter((n) => n.completed).length;

  return (
    <section className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-slate2-800 flex items-center gap-2">
            <span>⏰</span>
            <span>当天时间线</span>
            <span className="ml-2 text-base font-body font-normal text-slate2-500 bg-slate2-100 px-3 py-1 rounded-full">
              已完成 {completed}/{timeline.length}
            </span>
          </h2>
          <p className="mt-1 text-slate2-500 text-sm">
            从接人到收场，按部就班不慌不忙 🎯
            {!revealSecrets && (
              <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                🔒 保密模式
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setEditingNode({})}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-coral-500 to-orange-400 text-white rounded-full font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          添加节点
        </button>
      </div>

      <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-card border border-slate2-100 overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cream-200/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-mint-200/30 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        {timeline.length === 0 ? (
          <div className="text-center py-16 text-slate2-400">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <p className="text-lg mb-2">还没有时间线节点</p>
            <p className="text-sm">点击右上角添加，规划当天流程</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-8 top-2 bottom-2 w-1 bg-gradient-to-b from-coral-400 via-cream-400 to-mint-400 rounded-full"></div>

            <div className="space-y-5">
              {timeline.map((node, idx) => (
                <div key={node.id} className="relative pl-16 md:pl-20 group">
                  <TimelineItem
                    node={node}
                    index={idx}
                    isLast={idx === timeline.length - 1}
                    onEdit={() => setEditingNode({ node })}
                    onMoveUp={() => moveNode(node.id, -1)}
                    onMoveDown={() => moveNode(node.id, 1)}
                    canMoveUp={idx > 0}
                    canMoveDown={idx < timeline.length - 1}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editingNode && (
        <TimelineModal
          node={editingNode.node}
          onClose={() => setEditingNode(null)}
        />
      )}
    </section>
  );
};
