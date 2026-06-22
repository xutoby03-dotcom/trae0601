import { useTacticsStore } from '@/store/useTacticsStore';
import { Trash2, User, Disc, Route, Zap } from 'lucide-react';

export default function PropertiesPanel() {
  const {
    selectedId,
    selectedType,
    play,
    updatePlayerLabel,
    removePlayer,
    setRouteDrawingPlayer,
    removeFakeNode,
    updatePlayName,
    updateDuration,
    resetPlay,
  } = useTacticsStore();

  const selectedPlayer = selectedType === 'player'
    ? play.players.find((p) => p.id === selectedId)
    : null;
  const selectedFake = selectedType === 'fake'
    ? play.fakeNodes.find((f) => f.id === selectedId)
    : null;
  const selectedRoute = selectedType === 'route'
    ? play.routes.find((r) => r.id === selectedId)
    : null;

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedPlayer) {
      updatePlayerLabel(selectedPlayer.id, e.target.value);
    }
  };

  const handleRemovePlayer = () => {
    if (selectedPlayer) {
      removePlayer(selectedPlayer.id);
    }
  };

  const handleEditRoute = () => {
    if (selectedPlayer) {
      setRouteDrawingPlayer(selectedPlayer.id);
    }
  };

  const handleRemoveFake = () => {
    if (selectedFake) {
      removeFakeNode(selectedFake.id);
    }
  };

  return (
    <div className="w-64 bg-[#121a16] border-l border-[#1e2d24] flex flex-col">
      <div className="p-4 border-b border-[#1e2d24]">
        <h2
          className="text-sm font-bold tracking-wider"
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontFamily: "'Rajdhani', sans-serif",
          }}
        >
          属性面板
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-3">
          <div>
            <label
              className="text-xs text-gray-400 block mb-1"
              style={{ fontFamily: "'Roboto Mono', monospace" }}
            >
              战术名称
            </label>
            <input
              type="text"
              value={play.name}
              onChange={(e) => updatePlayName(e.target.value)}
              className="w-full bg-[#0a0f0d] border border-[#1e2d24] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#38b000] transition-colors"
              style={{ fontFamily: "'Roboto Mono', monospace" }}
            />
          </div>

          <div>
            <label
              className="text-xs text-gray-400 block mb-1"
              style={{ fontFamily: "'Roboto Mono', monospace" }}
            >
              总时长 ({play.duration.toFixed(1)}s)
            </label>
            <input
              type="range"
              min="2"
              max="20"
              step="0.5"
              value={play.duration}
              onChange={(e) => updateDuration(parseFloat(e.target.value))}
              className="w-full accent-[#38b000]"
            />
          </div>
        </div>

        <div className="h-px bg-[#1e2d24]" />

        {!selectedType && (
          <div className="text-center py-8">
            <User size={32} className="mx-auto mb-2 opacity-20" />
            <p
              className="text-xs text-gray-500"
              style={{ fontFamily: "'Roboto Mono', monospace" }}
            >
              选择元素查看属性
            </p>
          </div>
        )}

        {selectedPlayer && (
          <div className="space-y-4">
            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                background:
                  selectedPlayer.type === 'offense'
                    ? 'rgba(255, 107, 53, 0.1)'
                    : 'rgba(0, 119, 182, 0.1)',
                border: `1px solid ${
                  selectedPlayer.type === 'offense'
                    ? 'rgba(255, 107, 53, 0.3)'
                    : 'rgba(0, 119, 182, 0.3)'
                }`,
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                style={{
                  background:
                    selectedPlayer.type === 'offense' ? '#ff6b35' : '#0077b6',
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                {selectedPlayer.label}
              </div>
              <div>
                <p
                  className="text-sm font-bold text-white"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}
                >
                  {selectedPlayer.type === 'offense' ? '进攻队员' : '防守队员'}
                </p>
                <p
                  className="text-xs text-gray-400"
                  style={{ fontFamily: "'Roboto Mono', monospace" }}
                >
                  {selectedPlayer.startPosition.x.toFixed(1)},{' '}
                  {selectedPlayer.startPosition.y.toFixed(1)}
                </p>
              </div>
            </div>

            <div>
              <label
                className="text-xs text-gray-400 block mb-1"
                style={{ fontFamily: "'Roboto Mono', monospace" }}
              >
                编号
              </label>
              <input
                type="text"
                value={selectedPlayer.label}
                onChange={handleLabelChange}
                className="w-full bg-[#0a0f0d] border border-[#1e2d24] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#38b000] transition-colors"
                style={{ fontFamily: "'Roboto Mono', monospace" }}
              />
            </div>

            <button
              onClick={handleEditRoute}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#0a0f0d] border border-[#1e2d24] rounded text-sm text-white hover:border-[#38b000] transition-colors"
              style={{ fontFamily: "'Roboto Mono', monospace" }}
            >
              <Route size={16} />
              编辑路线
            </button>

            <button
              onClick={handleRemovePlayer}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-900/20 border border-red-800/30 rounded text-sm text-red-400 hover:bg-red-900/30 transition-colors"
              style={{ fontFamily: "'Roboto Mono', monospace" }}
            >
              <Trash2 size={16} />
              删除队员
            </button>
          </div>
        )}

        {selectedType === 'disc' && (
          <div className="space-y-4">
            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                background: 'rgba(255, 214, 10, 0.1)',
                border: '1px solid rgba(255, 214, 10, 0.3)',
              }}
            >
              <div className="w-10 h-10 rounded-full bg-[#ffd60a] flex items-center justify-center">
                <Disc size={20} className="text-[#1a472a]" />
              </div>
              <div>
                <p
                  className="text-sm font-bold text-white"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}
                >
                  飞盘
                </p>
                <p
                  className="text-xs text-gray-400"
                  style={{ fontFamily: "'Roboto Mono', monospace" }}
                >
                  {play.disc.position.x.toFixed(1)},{' '}
                  {play.disc.position.y.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedFake && (
          <div className="space-y-4">
            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                background: 'rgba(208, 0, 0, 0.1)',
                border: '1px solid rgba(208, 0, 0, 0.3)',
              }}
            >
              <div className="w-10 h-10 rounded-full bg-[#d00000] flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <p
                  className="text-sm font-bold text-white"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}
                >
                  假动作节点
                </p>
                <p
                  className="text-xs text-gray-400"
                  style={{ fontFamily: "'Roboto Mono', monospace" }}
                >
                  {selectedFake.time.toFixed(1)}s
                </p>
              </div>
            </div>

            <button
              onClick={handleRemoveFake}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-900/20 border border-red-800/30 rounded text-sm text-red-400 hover:bg-red-900/30 transition-colors"
              style={{ fontFamily: "'Roboto Mono', monospace" }}
            >
              <Trash2 size={16} />
              删除假动作
            </button>
          </div>
        )}

        {selectedRoute && (
          <div className="space-y-4">
            <div
              className="p-3 rounded-lg"
              style={{
                background: 'rgba(56, 176, 0, 0.1)',
                border: '1px solid rgba(56, 176, 0, 0.3)',
              }}
            >
              <p
                className="text-sm font-bold text-white mb-2"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                路线 - {play.players.find(p => p.id === selectedRoute.playerId)?.label}
              </p>
              <p
                className="text-xs text-gray-400"
                style={{ fontFamily: "'Roboto Mono', monospace" }}
              >
                关键帧: {selectedRoute.keyframes.length}
              </p>
            </div>
          </div>
        )}

        <div className="h-px bg-[#1e2d24]" />

        <button
          onClick={resetPlay}
          className="w-full py-2 px-3 bg-[#0a0f0d] border border-[#1e2d24] rounded text-sm text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
          style={{ fontFamily: "'Roboto Mono', monospace" }}
        >
          重置战术
        </button>
      </div>
    </div>
  );
}
