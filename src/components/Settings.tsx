import { useGameStore } from '@/store/gameStore';
import { ArrowLeft, Volume2, Music, Info } from 'lucide-react';

export const Settings = () => {
  const { setShowMenu, bgmVolume, setBgmVolume, soundEnabled, toggleSound } = useGameStore();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowMenu('main')}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </button>
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-8">⚙️ 设置</h1>

        <div className="space-y-4">
          <div className="bg-gray-800/70 backdrop-blur rounded-2xl p-5 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Volume2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">音效</h3>
                  <p className="text-gray-400 text-sm">游戏音效开关</p>
                </div>
              </div>
              <button
                onClick={toggleSound}
                className={`w-14 h-8 rounded-full transition-all relative ${
                  soundEnabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                    soundEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="bg-gray-800/70 backdrop-blur rounded-2xl p-5 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <Music className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">背景音乐音量</h3>
                <p className="text-gray-400 text-sm">调整 BGM 音量大小</p>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={bgmVolume}
              onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-gray-400 text-sm mt-2">
              <span>静音</span>
              <span>{Math.round(bgmVolume * 100)}%</span>
              <span>最大</span>
            </div>
          </div>

          <div className="bg-gray-800/70 backdrop-blur rounded-2xl p-5 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500/20 rounded-xl">
                <Info className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">操作说明</h3>
              </div>
            </div>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>🎮 <strong>桌面端：</strong></p>
              <ul className="list-disc list-inside ml-2 text-gray-400 space-y-1">
                <li>↑ 上方向键 / 空格键：跳跃</li>
                <li>↓ 下方向键：滑铲</li>
                <li>ESC：暂停游戏</li>
              </ul>
              <p className="mt-3">📱 <strong>移动端：</strong></p>
              <ul className="list-disc list-inside ml-2 text-gray-400 space-y-1">
                <li>上滑：跳跃</li>
                <li>下滑：滑铲</li>
                <li>点击暂停按钮：暂停游戏</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-800/70 backdrop-blur rounded-2xl p-5 border border-gray-700">
            <div className="text-center">
              <h3 className="text-white font-bold mb-2">关于游戏</h3>
              <p className="text-gray-400 text-sm">无限跑酷 v1.0.0</p>
              <p className="text-gray-500 text-xs mt-1">一款简单好玩的横版跑酷小游戏</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
