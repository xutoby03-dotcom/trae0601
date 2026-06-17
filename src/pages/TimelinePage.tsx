import { useRef, useState } from 'react';
import { MapPin, Clock, ChevronDown, CheckCircle2, Circle } from 'lucide-react';
import { useWeddingStore } from '@/store/weddingStore';
import TaskCard from '@/components/TaskCard';

const nodeColors: Record<string, { bg: string; border: string; text: string }> = {
  '接亲': { bg: 'bg-rose-gold/10', border: 'border-rose-gold', text: 'text-rose-gold' },
  '外景': { bg: 'bg-sage/10', border: 'border-sage', text: 'text-sage' },
  '仪式': { bg: 'bg-champagne-gold/10', border: 'border-champagne-gold', text: 'text-champagne-gold' },
  '午宴': { bg: 'bg-purple-500/10', border: 'border-purple-500', text: 'text-purple-500' },
  '晚宴': { bg: 'bg-forest/10', border: 'border-forest', text: 'text-forest' },
};

export default function TimelinePage() {
  const timelineNodes = useWeddingStore(state => state.timelineNodes);
  const getTasksByNodeId = useWeddingStore(state => state.getTasksByNodeId);
  const [expandedNode, setExpandedNode] = useState<string | null>(timelineNodes[0]?.id || null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const sortedNodes = [...timelineNodes].sort((a, b) => a.sortOrder - b.sortOrder);

  const scrollToNode = (nodeId: string) => {
    setExpandedNode(nodeId);
    const element = nodeRefs.current[nodeId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getNodeProgress = (nodeId: string) => {
    const tasks = getTasksByNodeId(nodeId);
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'completed' || t.status === 'confirmed').length;
    return Math.round((completed / tasks.length) * 100);
  };

  return (
    <div className="animate-fade-in" style={{ opacity: 0 }}>
      <div className="mb-8">
        <h2 className="font-display text-4xl font-bold text-gray-800 mb-2">
          婚礼时间线
        </h2>
        <p className="text-gray-600">
          按时间顺序查看今日所有环节和任务分配
        </p>
      </div>

      <div className="flex gap-8">
        <div className="w-56 flex-shrink-0">
          <div className="sticky top-8">
            <h3 className="font-display text-lg font-semibold text-gray-800 mb-4">
              快速导航
            </h3>
            <div className="space-y-2">
              {sortedNodes.map((node, index) => {
                const colors = nodeColors[node.name];
                const progress = getNodeProgress(node.id);
                const isActive = expandedNode === node.id;
                const tasks = getTasksByNodeId(node.id);
                const hasLate = tasks.some(t => t.status === 'late');

                return (
                  <button
                    key={node.id}
                    onClick={() => scrollToNode(node.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 border-2 ${
                      isActive
                        ? `${colors.bg} ${colors.border} shadow-md`
                        : 'bg-white border-transparent hover:border-gray-200 hover:shadow-card'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center text-sm font-bold`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${isActive ? colors.text : 'text-gray-800'}`}>
                          {node.name}
                        </p>
                        <p className="text-xs text-gray-500">{node.time}</p>
                      </div>
                      {hasLate && (
                        <span className="w-2 h-2 rounded-full bg-wine animate-pulse-slow" />
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>完成进度</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.border.replace('border', 'bg')} transition-all duration-500`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          <div className="timeline-line" />

          <div className="space-y-12 pl-12">
            {sortedNodes.map((node, index) => {
              const colors = nodeColors[node.name];
              const tasks = getTasksByNodeId(node.id);
              const isExpanded = expandedNode === node.id;
              const progress = getNodeProgress(node.id);
              const hasLate = tasks.some(t => t.status === 'late');

              return (
                <div
                  key={node.id}
                  ref={el => { nodeRefs.current[node.id] = el; }}
                  className="relative animate-fade-in-up"
                  style={{ opacity: 0, animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`timeline-dot top-6 ${colors.border.replace('border', 'bg')} ${hasLate ? 'ring-4 ring-wine/20' : ''}`} />

                  <div
                    onClick={() => setExpandedNode(isExpanded ? null : node.id)}
                    className={`card p-6 cursor-pointer transition-all duration-300 ${
                      isExpanded ? 'shadow-card-hover ring-2 ' + colors.border.replace('border', 'ring-') : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center`}>
                          <span className={`text-2xl font-bold ${colors.text}`}>
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-display text-2xl font-bold text-gray-800">
                              {node.name}
                            </h3>
                            {progress === 100 ? (
                              <CheckCircle2 className="w-6 h-6 text-forest" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-300" />
                            )}
                            {hasLate && (
                              <span className="badge badge-late">有延误</span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{node.description}</p>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-champagne-gold" />
                              <span>{node.time}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-rose-gold" />
                              <span>{node.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={`${colors.text} font-medium`}>
                                {tasks.length} 项任务
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>

                    {progress > 0 && progress < 100 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                          <span>节点进度</span>
                          <span className={colors.text}>{progress}% 完成</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colors.border.replace('border', 'bg')} transition-all duration-500`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="mt-6 space-y-4 animate-fade-in" style={{ opacity: 0 }}>
                      {tasks.length > 0 ? (
                        tasks.map((task, taskIndex) => (
                          <TaskCard key={task.id} task={task} index={taskIndex} />
                        ))
                      ) : (
                        <div className="card p-8 text-center text-gray-500">
                          <p className="font-display text-lg">暂无任务</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
