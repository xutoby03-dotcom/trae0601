import { useState } from 'react';
import { useTacticsStore } from '@/store/useTacticsStore';
import { Trash2, User, Disc, Route, Zap, Plus, MapPin, Activity } from 'lucide-react';
import type { Point } from '@/types';

export default function PropertiesPanel() {
  const {
    selectedId,
    selectedType,
    play,
    currentTime,
    updatePlayerLabel,
    removePlayer,
    setRouteDrawingPlayer,
    removeFakeNode,
    updatePlayName,
    updateDuration,
    resetPlay,
    addActualPosition,
    removeActualPosition,
    clearActualPositions,
    updateActualPosition,
    calculateDeviations,
  } = useTacticsStore();

  const [newPosTime, setNewPosTime] = useState('');
  const [newPosX, setNewPosX] = useState('');
  const [newPosY, setNewPosY] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'actual'>('basic');

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

            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('basic')}
                className={`flex-1 py-1.5 text-xs rounded transition-colors ${
                  activeTab === 'basic'
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white/80'
                }`}
                style={{ fontFamily: "'Roboto Mono', monospace" }}
              >
                基础
              </button>
              <button
                onClick={() => setActiveTab('actual')}
                className={`flex-1 py-1.5 text-xs rounded transition-colors ${
                  activeTab === 'actual'
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white/80'
                }`}
                style={{ fontFamily: "'Roboto Mono', monospace" }}
              >
                实测
              </button>
            </div>

            {activeTab === 'basic' && (
              <div className="space-y-3">
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

            {activeTab === 'actual' && (
              <div className="space-y-3">
                {play.deviationStats[selectedPlayer.id] && (
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      background: 'rgba(56, 176, 0, 0.05)',
                      border: '1px solid rgba(56, 176, 0, 0.2)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Activity size={14} className="text-green-400" />
                      <span
                        className="text-xs font-bold text-green-400"
                        style={{ fontFamily: "'Rajdhani', sans-serif" }}
                      >
                        偏差统计
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">平均偏差</p>
                        <p className="text-white font-mono">
                          {play.deviationStats[selectedPlayer.id].avgDeviation.toFixed(2)} yd
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">最大偏差</p>
                        <p className="text-orange-400 font-mono">
                          {play.deviationStats[selectedPlayer.id].maxDeviation.toFixed(2)} yd
                        </p>
                        <p className="text-gray-500 text-[10px]">
                          @ {play.deviationStats[selectedPlayer.id].maxDeviationTime.toFixed(1)}s
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-[#0a0f0d] border border-[#1e2d24]">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={14} className="text-purple-400" />
                    <span
                      className="text-xs font-bold text-white"
                      style={{ fontFamily: "'Rajdhani', sans-serif" }}
                    >
                      添加实测点位
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <label className="text-[10px] text-gray-500">时间(s)</label>
                      <input
                        type="number"
                        value={newPosTime}
                        onChange={(e) => setNewPosTime(e.target.value)}
                        placeholder={currentTime.toFixed(1)}
                        step="0.1"
                        min="0"
                        max={play.duration}
                        className="w-full bg-[#0a0f0d] border border-[#1e2d24] rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-[#38b000]"
                        style={{ fontFamily: "'Roboto Mono', monospace" }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">X</label>
                      <input
                        type="number"
                        value={newPosX}
                        onChange={(e) => setNewPosX(e.target.value)}
                        placeholder="0"
                        step="0.1"
                        className="w-full bg-[#0a0f0d] border border-[#1e2d24] rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-[#38b000]"
                        style={{ fontFamily: "'Roboto Mono', monospace" }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">Y</label>
                      <input
                        type="number"
                        value={newPosY}
                        onChange={(e) => setNewPosY(e.target.value)}
                        placeholder="0"
                        step="0.1"
                        className="w-full bg-[#0a0f0d] border border-[#1e2d24] rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-[#38b000]"
                        style={{ fontFamily: "'Roboto Mono', monospace" }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const time = parseFloat(newPosTime) || currentTime;
                        const x = parseFloat(newPosX);
                        const y = parseFloat(newPosY);
                        if (!isNaN(x) && !isNaN(y)) {
                          addActualPosition(selectedPlayer.id, time, { x, y });
                          setNewPosTime('');
                          setNewPosX('');
                          setNewPosY('');
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#38b000]/20 border border-[#38b000]/30 rounded text-xs text-green-400 hover:bg-[#38b000]/30 transition-colors"
                      style={{ fontFamily: "'Roboto Mono', monospace" }}
                    >
                      <Plus size={14} />
                      添加
                    </button>
                    <button
                      onClick={() => {
                        const time = parseFloat(newPosTime) || currentTime;
                        addActualPosition(
                          selectedPlayer.id,
                          time,
                          selectedPlayer.startPosition,
                        );
                      }}
                      className="flex-1 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white/60 hover:bg-white/10 transition-colors"
                      style={{ fontFamily: "'Roboto Mono', monospace" }}
                    >
                      当前位置
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-xs text-gray-400"
                      style={{ fontFamily: "'Roboto Mono', monospace" }}
                    >
                      已记录 {play.actualPositions.filter(p => p.playerId === selectedPlayer.id).length} 个点位
                    </span>
                    <button
                      onClick={() => clearActualPositions(selectedPlayer.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                      style={{ fontFamily: "'Roboto Mono', monospace" }}
                    >
                      清除
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {play.actualPositions
                      .filter(p => p.playerId === selectedPlayer.id)
                      .sort((a, b) => a.time - b.time)
                      .map((pos) => (
                        <div
                          key={pos.id}
                          className="flex items-center justify-between p-2 bg-[#0a0f0d] border border-[#1e2d24] rounded text-xs"
                        >
                          <span
                            className="text-purple-400"
                            style={{ fontFamily: "'Roboto Mono', monospace" }}
                          >
                            {pos.time.toFixed(1)}s
                          </span>
                          <span
                            className="text-white/70"
                            style={{ fontFamily: "'Roboto Mono', monospace" }}
                          >
                            ({pos.position.x.toFixed(1)}, {pos.position.y.toFixed(1)})
                          </span>
                          <button
                            onClick={() => removeActualPosition(pos.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                <button
                  onClick={() => calculateDeviations()}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#38b000]/20 border border-[#38b000]/30 rounded text-sm text-green-400 hover:bg-[#38b000]/30 transition-colors"
                  style={{ fontFamily: "'Roboto Mono', monospace" }}
                >
                  <Activity size={16} />
                  计算偏差
                </button>
              </div>
            )}
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
