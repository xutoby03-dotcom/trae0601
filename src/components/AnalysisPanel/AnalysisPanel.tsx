import { useTacticsStore } from '@/store/useTacticsStore';
import {
  ChevronUp,
  ChevronDown,
  Target,
  Zap,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  Activity,
} from 'lucide-react';
import { calculateRouteLength } from '@/utils/pathCalculations';

export default function AnalysisPanel() {
  const {
    play,
    currentTime,
    showAnalysis,
    toggleAnalysis,
    showRoutes,
    showFakeNodes,
    showTransferWindows,
    showCollisionRisks,
    toggleRoutes,
    toggleFakeNodes,
    toggleTransferWindows,
    toggleCollisionRisks,
    highlightedPlayerId,
    setHighlightedPlayer,
  } = useTacticsStore();

  const totalOffensiveYards = play.routes
    .filter((r) => {
      const player = play.players.find((p) => p.id === r.playerId);
      return player?.type === 'offense';
    })
    .reduce((sum, r) => {
      const player = play.players.find((p) => p.id === r.playerId);
      if (!player) return sum;
      return sum + calculateRouteLength(player.startPosition, r.keyframes);
    }, 0);

  const goodWindows = play.transferWindows.filter((w) => w.quality === 'good').length;
  const greatWindows = play.transferWindows.filter((w) => w.quality === 'great').length;
  const excellentWindows = play.transferWindows.filter(
    (w) => w.quality === 'excellent',
  ).length;

  const highRisks = play.collisionRisks.filter((r) => r.severity === 'high').length;
  const mediumRisks = play.collisionRisks.filter((r) => r.severity === 'medium').length;
  const lowRisks = play.collisionRisks.filter((r) => r.severity === 'low').length;

  const activeGaps = play.gaps.filter(
    (g) => currentTime >= g.startTime && currentTime <= g.endTime,
  );

  return (
    <div
      className={`absolute bottom-28 left-0 right-0 mx-auto w-[90%] max-w-4xl transition-all duration-300 z-10 ${
        showAnalysis ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-[#121a16]/95 backdrop-blur-md rounded-t-xl border border-[#1e2d24] border-b-0 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e2d24]">
          <h3
            className="text-sm font-bold"
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            战术分析面板
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleRoutes}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                showRoutes ? 'bg-orange-500/20 text-orange-400' : 'text-white/40'
              }`}
              style={{ fontFamily: "'Roboto Mono', monospace" }}
            >
              {showRoutes ? <Eye size={12} /> : <EyeOff size={12} />}
              路线
            </button>
            <button
              onClick={toggleFakeNodes}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                showFakeNodes ? 'bg-red-500/20 text-red-400' : 'text-white/40'
              }`}
              style={{ fontFamily: "'Roboto Mono', monospace" }}
            >
              {showFakeNodes ? <Eye size={12} /> : <EyeOff size={12} />}
              假动作
            </button>
            <button
              onClick={toggleTransferWindows}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                showTransferWindows ? 'bg-green-500/20 text-green-400' : 'text-white/40'
              }`}
              style={{ fontFamily: "'Roboto Mono', monospace" }}
            >
              {showTransferWindows ? <Eye size={12} /> : <EyeOff size={12} />}
              传盘窗口
            </button>
            <button
              onClick={toggleCollisionRisks}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                showCollisionRisks ? 'bg-yellow-500/20 text-yellow-400' : 'text-white/40'
              }`}
              style={{ fontFamily: "'Roboto Mono', monospace" }}
            >
              {showCollisionRisks ? <Eye size={12} /> : <EyeOff size={12} />}
              撞线风险
            </button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-4 gap-4">
          <div className="bg-[#0a0f0d] rounded-lg p-3 border border-[#1e2d24]">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-green-400" />
              <span
                className="text-xs text-white/60"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                传盘窗口
              </span>
            </div>
            <div className="text-2xl font-bold text-green-400 mb-1" style={{ fontFamily: "'Roboto Mono', monospace" }}>
              {play.transferWindows.length}
            </div>
            <div className="flex gap-2 text-xs" style={{ fontFamily: "'Roboto Mono', monospace" }}>
              <span className="text-yellow-400">{excellentWindows}优</span>
              <span className="text-lime-400">{greatWindows}良</span>
              <span className="text-green-500">{goodWindows}好</span>
            </div>
          </div>

          <div className="bg-[#0a0f0d] rounded-lg p-3 border border-[#1e2d24]">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-yellow-400" />
              <span
                className="text-xs text-white/60"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                撞线风险
              </span>
            </div>
            <div className="text-2xl font-bold text-yellow-400 mb-1" style={{ fontFamily: "'Roboto Mono', monospace" }}>
              {play.collisionRisks.length}
            </div>
            <div className="flex gap-2 text-xs" style={{ fontFamily: "'Roboto Mono', monospace" }}>
              <span className="text-red-500">{highRisks}高</span>
              <span className="text-orange-400">{mediumRisks}中</span>
              <span className="text-yellow-500">{lowRisks}低</span>
            </div>
          </div>

          <div className="bg-[#0a0f0d] rounded-lg p-3 border border-[#1e2d24]">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-red-400" />
              <span
                className="text-xs text-white/60"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                假动作
              </span>
            </div>
            <div className="text-2xl font-bold text-red-400 mb-1" style={{ fontFamily: "'Roboto Mono', monospace" }}>
              {play.fakeNodes.length}
            </div>
            <div className="text-xs text-white/40" style={{ fontFamily: "'Roboto Mono', monospace" }}>
              迷惑防守次数
            </div>
          </div>

          <div className="bg-[#0a0f0d] rounded-lg p-3 border border-[#1e2d24]">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-orange-400" />
              <span
                className="text-xs text-white/60"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                进攻跑动
              </span>
            </div>
            <div className="text-2xl font-bold text-orange-400 mb-1" style={{ fontFamily: "'Roboto Mono', monospace" }}>
              {totalOffensiveYards.toFixed(0)}
              <span className="text-sm text-white/40"> yd</span>
            </div>
            <div className="text-xs text-white/40" style={{ fontFamily: "'Roboto Mono', monospace" }}>
              总跑动距离
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-purple-400" />
            <span
              className="text-xs font-bold text-white/70"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              跑位偏差统计
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {play.players
              .filter((player) => {
                const stats = play.deviationStats[player.id];
                return stats && stats.deviations.length > 0;
              })
              .map((player) => {
                const stats = play.deviationStats[player.id];
                const isOffense = player.type === 'offense';
                const severityColor =
                  stats.maxDeviation > 8
                    ? 'text-red-400'
                    : stats.maxDeviation > 5
                    ? 'text-yellow-400'
                    : 'text-green-400';
                const severityBg =
                  stats.maxDeviation > 8
                    ? 'bg-red-500/10 border-red-500/20'
                    : stats.maxDeviation > 5
                    ? 'bg-yellow-500/10 border-yellow-500/20'
                    : 'bg-green-500/10 border-green-500/20';

                const isCurrentHighlighted = highlightedPlayerId === player.id;

                return (
                  <div
                    key={player.id}
                    className={`p-2 rounded-lg border cursor-pointer transition-all ${
                      isCurrentHighlighted
                        ? 'ring-2 ring-purple-400/60 ring-offset-1 ring-offset-[#121a16]'
                        : ''
                    } ${severityBg}`}
                    onClick={() =>
                      setHighlightedPlayer(
                        isCurrentHighlighted ? null : player.id,
                      )
                    }
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{
                          background: isOffense ? '#ff6b35' : '#0077b6',
                          fontFamily: "'Rajdhani', sans-serif",
                        }}
                      >
                        {player.label}
                      </div>
                      <span
                        className="text-xs text-white/50"
                        style={{ fontFamily: "'Roboto Mono', monospace" }}
                      >
                        {isOffense ? '进攻' : '防守'}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/50">平均偏差</span>
                        <span
                          className={`font-mono ${severityColor}`}
                        >
                          {stats.avgDeviation.toFixed(2)} yd
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">最大偏差</span>
                        <span
                          className={`font-mono ${severityColor}`}
                        >
                          {stats.maxDeviation.toFixed(2)} yd
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">偏差点</span>
                        <span className="font-mono text-white/70">
                          @ {stats.maxDeviationTime.toFixed(1)}s
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            stats.maxDeviation > 8
                              ? 'bg-red-500'
                              : stats.maxDeviation > 5
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (stats.maxDeviation / 12) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            {play.players.filter((player) => {
              const stats = play.deviationStats[player.id];
              return stats && stats.deviations.length > 0;
            }).length === 0 && (
              <div className="col-span-full text-center py-4 text-xs text-white/30">
                暂无实测数据，在属性面板「实测」标签中录入点位后计算偏差
              </div>
            )}
          </div>
        </div>

        {activeGaps.length > 0 && (
          <div className="px-4 pb-4">
            <div
              className="text-xs text-white/60 mb-2"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              当前空档:
            </div>
            <div className="flex gap-2 flex-wrap">
              {activeGaps.map((gap) => {
                const player = play.players.find((p) => p.id === gap.playerId);
                return (
                  <div
                    key={gap.id}
                    className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30"
                    style={{ fontFamily: "'Roboto Mono', monospace" }}
                  >
                    {player?.label} - 最大距离 {gap.maxDistance.toFixed(1)}yd
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AnalysisToggle() {
  const { showAnalysis, toggleAnalysis } = useTacticsStore();

  return (
    <button
      onClick={toggleAnalysis}
      className="absolute bottom-32 right-4 z-20 p-3 rounded-full bg-[#121a16] border border-[#1e2d24] text-white/70 hover:text-white hover:border-green-500/50 transition-all"
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
    >
      {showAnalysis ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
    </button>
  );
}
