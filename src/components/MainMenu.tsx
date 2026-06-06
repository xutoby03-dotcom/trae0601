import { useGameStore } from '@/store/gameStore';
import { ThemeType } from '@/types/game';
import { themeNames } from '@/game/Themes';
import { Play, ShoppingBag, Trophy, Settings, Music, Volume2, VolumeX } from 'lucide-react';

const themes: ThemeType[] = ['volcano', 'snow', 'space'];

const themeGradients: Record<ThemeType, string> = {
  volcano: 'from-orange-600 via-red-500 to-yellow-500',
  snow: 'from-blue-400 via-cyan-300 to-blue-200',
  space: 'from-purple-900 via-violet-700 to-fuchsia-600',
};

export const MainMenu = () => {
  const {
    currentTheme,
    setCurrentTheme,
    setShowMenu,
    totalCoins,
    bestDistance,
    bgmIndex,
    setBgmIndex,
    soundEnabled,
    toggleSound,
  } = useGameStore();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20 animate-pulse"
            style={{
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${['#FF6B35', '#00BFFF', '#9D4EDD'][i % 3]}, transparent)`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center mb-8">
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 mb-2 animate-pulse">
          无限跑酷
        </h1>
        <p className="text-gray-400 text-lg">挑战你的极限！</p>
      </div>

      <div className="relative z-10 flex gap-4 mb-8">
        <div className="bg-gray-800/80 backdrop-blur rounded-xl px-6 py-3 border border-gray-700">
          <p className="text-yellow-400 text-2xl font-bold">💰 {totalCoins}</p>
          <p className="text-gray-400 text-xs">总金币</p>
        </div>
        <div className="bg-gray-800/80 backdrop-blur rounded-xl px-6 py-3 border border-gray-700">
          <p className="text-green-400 text-2xl font-bold">🏃 {Math.floor(bestDistance)}m</p>
          <p className="text-gray-400 text-xs">最远距离</p>
        </div>
      </div>

      <div className="relative z-10 mb-8">
        <p className="text-gray-300 text-center mb-3 font-medium">选择主题</p>
        <div className="flex gap-3">
          {themes.map((theme) => (
            <button
              key={theme}
              onClick={() => setCurrentTheme(theme)}
              className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                currentTheme === theme
                  ? `bg-gradient-to-r ${themeGradients[theme]} text-white shadow-lg scale-105`
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
              }`}
            >
              {themeNames[theme]}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => setShowMenu('game')}
          className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-xl font-bold py-4 px-8 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-green-500/25 hover:shadow-2xl flex items-center justify-center gap-3"
        >
          <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
          开始游戏
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowMenu('shop')}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold py-3 px-4 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            商店
          </button>
          <button
            onClick={() => setShowMenu('leaderboard')}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            排行榜
          </button>
        </div>

        <button
          onClick={() => setShowMenu('settings')}
          className="bg-gray-700/70 hover:bg-gray-600/70 text-white font-bold py-3 px-6 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 border border-gray-600"
        >
          <Settings className="w-5 h-5" />
          设置
        </button>
      </div>

      <div className="relative z-10 mt-8 flex items-center gap-4">
        <button
          onClick={toggleSound}
          className="p-3 rounded-full bg-gray-700/70 hover:bg-gray-600/70 transition-colors border border-gray-600"
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-white" />
          ) : (
            <VolumeX className="w-5 h-5 text-gray-400" />
          )}
        </button>
        <button
          onClick={() => setBgmIndex((bgmIndex + 1) % 3)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-700/70 hover:bg-gray-600/70 transition-colors border border-gray-600 text-white"
        >
          <Music className="w-4 h-4" />
          <span className="text-sm">BGM {bgmIndex + 1}</span>
        </button>
      </div>

      <div className="relative z-10 mt-8 text-gray-500 text-sm text-center">
        <p>⬆️ 上键 / 上滑跳跃 | ⬇️ 下键 / 下滑滑铲</p>
        <p className="mt-1">触屏设备支持滑动操作</p>
      </div>
    </div>
  );
};
