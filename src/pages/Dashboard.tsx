import { useNavigate } from 'react-router-dom';
import {
  Film,
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  Clock,
  Package,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import PlayCard from '@/components/play/PlayCard';
import SceneTimeline from '@/components/play/SceneTimeline';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    plays,
    selectedPlayId,
    selectedSceneId,
    selectPlay,
    getScenesByPlay,
    getUnresolvedIssues,
    getChecklist,
    getAllPropFlowsByScene,
  } = useAppStore();

  const selectedPlay = plays.find((p) => p.id === selectedPlayId);
  const scenes = selectedPlayId ? getScenesByPlay(selectedPlayId) : [];
  const unresolvedIssues = getUnresolvedIssues();
  const checklist = getChecklist();

  // 统计数据
  const totalProps = selectedSceneId
    ? getAllPropFlowsByScene(selectedSceneId).length
    : 0;
  const confirmedProps = selectedSceneId
    ? getAllPropFlowsByScene(selectedSceneId).filter(
        (pf) => pf.status === 'confirmed'
      ).length
    : 0;
  const pendingChecklist = checklist.filter((item) => !item.checked).length;

  const handlePlaySelect = (playId: string) => {
    selectPlay(playId);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-stage-text tracking-wide">
          控制台
        </h1>
        <p className="text-lg text-stage-text-secondary mt-2">
          选择剧目和场次，查看道具流向
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-stage-bg-card rounded-2xl border border-stage-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-neon-green/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-neon-green" />
            </div>
            <span className="text-3xl font-bold text-stage-text">
              {totalProps}
            </span>
          </div>
          <div className="text-base text-stage-text-secondary">
            本场道具总数
          </div>
        </div>

        <div className="bg-stage-bg-card rounded-2xl border border-stage-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-neon-green/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-neon-green" />
            </div>
            <span className="text-3xl font-bold text-neon-green">
              {confirmedProps}
            </span>
          </div>
          <div className="text-base text-stage-text-secondary">
            已确认道具
          </div>
        </div>

        <div
          className="bg-stage-bg-card rounded-2xl border border-stage-border p-6 cursor-pointer hover:border-neon-red/50 transition-all"
          onClick={() => navigate('/issues')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-neon-red/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-neon-red" />
            </div>
            <span
              className={`text-3xl font-bold ${
                unresolvedIssues.length > 0 ? 'text-neon-red' : 'text-stage-text'
              }`}
            >
              {unresolvedIssues.length}
            </span>
          </div>
          <div className="text-base text-stage-text-secondary">
            待处理问题
          </div>
        </div>

        <div
          className="bg-stage-bg-card rounded-2xl border border-stage-border p-6 cursor-pointer hover:border-neon-yellow/50 transition-all"
          onClick={() => navigate('/checklist')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-neon-yellow/10 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-neon-yellow" />
            </div>
            <span
              className={`text-3xl font-bold ${
                pendingChecklist > 0 ? 'text-neon-yellow' : 'text-stage-text'
              }`}
            >
              {pendingChecklist}
            </span>
          </div>
          <div className="text-base text-stage-text-secondary">
            待确认清单
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 剧目列表 */}
        <div className="lg:col-span-1">
          <div className="bg-stage-bg-card rounded-2xl border border-stage-border p-6">
            <h2 className="text-xl font-bold text-stage-text mb-6 flex items-center gap-3">
              <Film className="w-6 h-6 text-neon-green" />
              剧目列表
            </h2>
            <div className="space-y-4">
              {plays.map((play) => (
                <PlayCard
                  key={play.id}
                  play={play}
                  isSelected={play.id === selectedPlayId}
                  onClick={() => handlePlaySelect(play.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 场次时间线 */}
        <div className="lg:col-span-2">
          {selectedPlayId ? (
            <SceneTimeline
              playId={selectedPlayId}
              selectedSceneId={selectedSceneId}
            />
          ) : (
            <div className="bg-stage-bg-card rounded-2xl border border-stage-border p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-stage-bg-hover mx-auto mb-6 flex items-center justify-center">
                <Film className="w-10 h-10 text-stage-text-muted" />
              </div>
              <h3 className="text-xl font-bold text-stage-text mb-2">
                请选择一个剧目
              </h3>
              <p className="text-base text-stage-text-secondary">
                从左侧列表中选择一个剧目，查看其场次时间线
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 当前选中信息 */}
      {selectedPlay && (
        <div className="bg-neon-green/5 rounded-2xl border border-neon-green/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-neon-green/70 mb-1">
                当前选中
              </div>
              <h3 className="text-2xl font-bold text-neon-green">
                {selectedPlay.name}
                {selectedSceneId && scenes.find((s) => s.id === selectedSceneId)
                  ? ` · ${
                      scenes.find((s) => s.id === selectedSceneId)?.name
                    }`
                  : ''}
              </h3>
            </div>
            {selectedSceneId && (
              <button
                onClick={() =>
                  navigate(`/play/${selectedPlayId}/scene/${selectedSceneId}`)
                }
                className="px-6 py-3 bg-neon-green text-black rounded-xl font-bold text-lg hover:bg-neon-green-dim transition-colors flex items-center gap-2"
              >
                查看道具流向
                <Clock className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
