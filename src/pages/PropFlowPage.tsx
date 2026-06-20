import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  AlertCircle,
  MapPinOff,
  ClipboardList,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { IssueType } from '@/types';
import CueSection from '@/components/prop/CueSection';

export default function PropFlowPage() {
  const { playId, sceneId } = useParams<{ playId: string; sceneId: string }>();
  const navigate = useNavigate();
  const {
    plays,
    getScenesByPlay,
    getCuesByScene,
    getAllPropFlowsByScene,
    selectPlay,
    selectScene,
    getUnresolvedIssues,
  } = useAppStore();

  const [expandedCueId, setExpandedCueId] = useState<string | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);

  const play = plays.find((p) => p.id === playId);
  const scenes = playId ? getScenesByPlay(playId) : [];
  const scene = scenes.find((s) => s.id === sceneId);
  const cues = useMemo(
    () => (sceneId ? getCuesByScene(sceneId) : []),
    [sceneId, getCuesByScene]
  );
  const allPropFlows = useMemo(
    () => (sceneId ? getAllPropFlowsByScene(sceneId) : []),
    [sceneId, getAllPropFlowsByScene]
  );

  const currentSceneIndex = scenes.findIndex((s) => s.id === sceneId);
  const hasPrevScene = currentSceneIndex > 0;
  const hasNextScene = currentSceneIndex < scenes.length - 1;

  const confirmedCount = allPropFlows.filter(
    (pf) => pf.status === 'confirmed'
  ).length;
  const issueCount = allPropFlows.filter(
    (pf) => pf.status === 'issue'
  ).length;
  const totalCount = allPropFlows.length;

  const firstCueId = cues.length > 0 ? cues[0].id : null;

  useEffect(() => {
    if (playId) {
      selectPlay(playId);
    }
  }, [playId, selectPlay]);

  useEffect(() => {
    if (sceneId) {
      selectScene(sceneId);
    }
  }, [sceneId, selectScene]);

  useEffect(() => {
    if (firstCueId && !expandedCueId) {
      setExpandedCueId(firstCueId);
    }
  }, [firstCueId, expandedCueId]);

  const goToPrevScene = () => {
    if (hasPrevScene && playId) {
      const prevScene = scenes[currentSceneIndex - 1];
      navigate(`/play/${playId}/scene/${prevScene.id}`);
    }
  };

  const goToNextScene = () => {
    if (hasNextScene && playId) {
      const nextScene = scenes[currentSceneIndex + 1];
      navigate(`/play/${playId}/scene/${nextScene.id}`);
    }
  };

  const progressPercent = totalCount > 0 ? (confirmedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-3 rounded-xl bg-stage-bg-card border border-stage-border text-stage-text-secondary hover:text-neon-green hover:border-neon-green/30 transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="text-sm text-stage-text-secondary mb-1">
              {play?.name}
            </div>
            <h1 className="text-3xl font-bold text-stage-text flex items-center gap-3">
              {scene?.name}
              <span className="text-lg font-normal text-stage-text-muted">
                {scene?.description}
              </span>
            </h1>
          </div>
        </div>

        {/* 场次切换 */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrevScene}
            disabled={!hasPrevScene}
            className={`p-3 rounded-xl border transition-all ${
              hasPrevScene
                ? 'bg-stage-bg-card border-stage-border text-stage-text-secondary hover:text-neon-green hover:border-neon-green/30'
                : 'bg-stage-bg-card/50 border-stage-border/50 text-stage-text-muted cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-base text-stage-text-secondary px-2">
            {currentSceneIndex + 1} / {scenes.length}
          </div>
          <button
            onClick={goToNextScene}
            disabled={!hasNextScene}
            className={`p-3 rounded-xl border transition-all ${
              hasNextScene
                ? 'bg-stage-bg-card border-stage-border text-stage-text-secondary hover:text-neon-green hover:border-neon-green/30'
                : 'bg-stage-bg-card/50 border-stage-border/50 text-stage-text-muted cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 进度条 */}
      <div className="bg-stage-bg-card rounded-2xl border border-stage-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-neon-green" />
              <span className="text-lg text-stage-text">
                共 {cues.length} 个 Cue
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-neon-green" />
              <span className="text-lg text-stage-text">
                已确认 {confirmedCount}/{totalCount}
              </span>
            </div>
            {issueCount > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-neon-red" />
                <span className="text-lg text-neon-red">
                  {issueCount} 个问题
                </span>
              </div>
            )}
          </div>
          <div className="text-2xl font-bold text-neon-green">
            {Math.round(progressPercent)}%
          </div>
        </div>
        <div className="h-3 bg-stage-bg-hover rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-green-dim to-neon-green rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 重点确认清单入口 */}
      {getUnresolvedIssues().length > 0 && (
        <div className="rounded-2xl border-2 border-neon-red/60 bg-neon-red/5 overflow-hidden">
          <button
            onClick={() => setShowChecklist(!showChecklist)}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-neon-red/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-neon-red/20 flex items-center justify-center animate-pulse-fast">
                <ClipboardList className="w-7 h-7 text-neon-red" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neon-red tracking-wide">
                  重点确认清单
                </h2>
                <p className="text-base text-neon-red/70 mt-1">
                  共 {getUnresolvedIssues().length} 条待处理问题，排练前必须逐项确认
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-neon-red/20 rounded-xl text-neon-red font-bold text-lg">
                {getUnresolvedIssues().length} 项
              </div>
              {showChecklist ? (
                <ChevronUp className="w-7 h-7 text-neon-red" />
              ) : (
                <ChevronDown className="w-7 h-7 text-neon-red" />
              )}
            </div>
          </button>

          {/* 展开的问题清单 */}
          {showChecklist && (
            <div className="px-5 pb-5 border-t border-neon-red/30 pt-4 space-y-3 animate-fade-in">
              {(() => {
                const priorityOrder: Record<IssueType, number> = {
                  lost: 0,
                  damaged: 1,
                  wrong_position: 2,
                };
                const typeConfig: Record<
                  IssueType,
                  { label: string; icon: typeof AlertOctagon; color: string; bg: string; border: string }
                > = {
                  lost: {
                    label: '遗失',
                    icon: AlertOctagon,
                    color: 'text-neon-red',
                    bg: 'bg-neon-red/15',
                    border: 'border-neon-red/40',
                  },
                  damaged: {
                    label: '损坏',
                    icon: AlertCircle,
                    color: 'text-neon-yellow',
                    bg: 'bg-neon-yellow/10',
                    border: 'border-neon-yellow/40',
                  },
                  wrong_position: {
                    label: '位置错误',
                    icon: MapPinOff,
                    color: 'text-neon-blue',
                    bg: 'bg-neon-blue/10',
                    border: 'border-neon-blue/40',
                  },
                };

                const sorted = [...getUnresolvedIssues()].sort(
                  (a, b) => priorityOrder[a.type] - priorityOrder[b.type]
                );

                return sorted.map((issue) => {
                  const cfg = typeConfig[issue.type];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={issue.id}
                      className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-11 h-11 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-6 h-6 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap mb-2">
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            <h4 className="text-xl font-bold text-stage-text">
                              {issue.prop.name}
                            </h4>
                          </div>
                          <div className="flex items-center gap-4 text-base text-stage-text-secondary flex-wrap">
                            <span>剧目：<span className="text-neon-green font-medium">{issue.playName}</span></span>
                            <span>场次：<span className="text-neon-green font-medium">{issue.sceneName}</span></span>
                            <span>Cue <span className="text-neon-green font-medium">{issue.cueNumber}</span> · {issue.cueName}</span>
                          </div>
                          <p className="text-base text-stage-text-secondary mt-2">
                            {issue.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      )}

      {/* Cue 列表 */}
      <div className="space-y-4">
        {cues.length > 0 ? (
          cues.map((cue) => (
            <CueSection
              key={cue.id}
              cue={cue}
              isExpanded={expandedCueId === cue.id}
            />
          ))
        ) : (
          <div className="bg-stage-bg-card rounded-2xl border border-stage-border p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-stage-bg-hover mx-auto mb-6 flex items-center justify-center">
              <Clock className="w-10 h-10 text-stage-text-muted" />
            </div>
            <h3 className="text-xl font-bold text-stage-text mb-2">
              本场次暂无 Cue 点
            </h3>
            <p className="text-base text-stage-text-secondary">
              请先添加 Cue 点和对应的道具流向
            </p>
          </div>
        )}
      </div>

      {/* 底部操作提示 */}
      <div className="bg-stage-bg-secondary/50 rounded-2xl border border-stage-border/50 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-neon-yellow/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-neon-yellow" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-stage-text mb-1">
              暗场操作提示
            </h4>
            <p className="text-base text-stage-text-secondary">
              请确认所有道具放置到位后再点击「确认放置完成」按钮。如发现问题（遗失、损坏、位置错误），请及时点击问题按钮报告，系统会自动记录并加入排练确认清单。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
