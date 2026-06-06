import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MAP_CONFIGS, DIFFICULTY_CONFIGS } from '../configs';
import { MapConfig, Difficulty } from '../types';

export const MainMenu = () => {
  const navigate = useNavigate();
  const [selectedMap, setSelectedMap] = useState<MapConfig | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleStartGame = (map: MapConfig) => {
    navigate('/game', { state: { mapId: map.id, difficulty: map.difficulty } });
  };

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'easy': return 'text-green-400 border-green-500/50';
      case 'normal': return 'text-yellow-400 border-yellow-500/50';
      case 'hard': return 'text-red-400 border-red-500/50';
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-500/10 animate-float"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 4 + 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center mb-12">
        <h1 className="text-6xl font-bold mb-4 glow-text text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
          塔防战争
        </h1>
        <p className="text-xl text-gray-400">Tower Defense</p>
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-200">
          选择地图
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {MAP_CONFIGS.map((map) => (
            <div
              key={map.id}
              className={`panel-glass rounded-xl p-6 cursor-pointer btn-glow transition-all duration-300 hover:scale-105 ${
                selectedMap?.id === map.id ? 'ring-2 ring-blue-400' : ''
              }`}
              onClick={() => setSelectedMap(map)}
            >
              <div
                className="w-full h-32 rounded-lg mb-4 flex items-center justify-center"
                style={{ backgroundColor: map.background }}
              >
                <div className="text-4xl">
                  {map.difficulty === 'easy' ? '🌲' : map.difficulty === 'normal' ? '🏜️' : '❄️'}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{map.name}</h3>
              <div className={`inline-block px-3 py-1 rounded-full text-sm border ${getDifficultyColor(map.difficulty)}`}>
                {DIFFICULTY_CONFIGS[map.difficulty].name}
              </div>
              <div className="mt-3 text-sm text-gray-400">
                <p>💰 初始金币: {DIFFICULTY_CONFIGS[map.difficulty].startingGold}</p>
                <p>❤️ 初始生命: {DIFFICULTY_CONFIGS[map.difficulty].startingLives}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              selectedMap
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white btn-glow animate-pulse-glow'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
            onClick={() => selectedMap && handleStartGame(selectedMap)}
            disabled={!selectedMap}
          >
            🎮 开始游戏
          </button>
          <button
            className="px-8 py-4 rounded-xl font-semibold text-lg bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300 btn-glow"
            onClick={() => setShowInfo(!showInfo)}
          >
            📖 游戏说明
          </button>
        </div>
      </div>

      {showInfo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowInfo(false)}>
          <div className="panel-glass rounded-2xl p-8 max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-3xl font-bold mb-6 text-center glow-text text-blue-400">游戏说明</h2>
            
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold text-green-400 mb-3">🎯 游戏目标</h3>
                <p className="text-gray-300">建造防御塔阻止怪物到达终点。坚持10波怪物攻击即可获胜！</p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-green-400 mb-3">🏗️ 防御塔类型</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                      <div className="w-4 h-4 bg-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-400">狙击塔</p>
                      <p className="text-sm text-gray-400">高伤害单体攻击，射程远，适合对付Boss</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[8px] border-l-red-500 border-y-[6px] border-y-transparent" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-400">爆破塔</p>
                      <p className="text-sm text-gray-400">范围爆炸伤害，适合对付成群的普通怪物</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                      <div className="w-6 h-1.5 bg-blue-500 rotate-45" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-400">冰霜塔</p>
                      <p className="text-sm text-gray-400">减速敌人，控制能力强，配合其他塔使用效果更佳</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-green-400 mb-3">👾 怪物类型</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#88cc88]" />
                    <span className="text-gray-300">普通怪物 - 标准敌人</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#888888]" />
                    <span className="text-gray-300">装甲怪物 - 高血量有护甲</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#cc88cc]" />
                    <span className="text-gray-300">飞行怪物 - 移动速度快</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#ff4444]" />
                    <span className="text-gray-300">Boss - 超高血量</span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-green-400 mb-3">💡 操作提示</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>• 点击右侧塔类型，然后点击地图上的空位建塔</li>
                  <li>• 点击已建造的塔可以升级或出售</li>
                  <li>• 每座塔最高可升级到3级</li>
                  <li>• 使用底部速度控制可以加速游戏</li>
                  <li>• 击杀怪物获得金币，漏怪扣除生命值</li>
                </ul>
              </section>
            </div>

            <button
              className="w-full mt-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold transition-colors"
              onClick={() => setShowInfo(false)}
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
