import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const GameOver = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(false);

  const {
    won = false,
    monstersKilled = 0,
    totalDamageDealt = 0,
    goldRemaining = 0,
    livesRemaining = 0,
    levelIndex = 0,
    mapName = '',
  } = (location.state as {
    won?: boolean;
    monstersKilled?: number;
    totalDamageDealt?: number;
    goldRemaining?: number;
    livesRemaining?: number;
    levelIndex?: number;
    mapName?: string;
  }) || {};

  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleRestart = () => {
    navigate(-1);
  };

  const handleBackToMenu = () => {
    navigate('/');
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="relative">
        <div className="absolute inset-0 blur-3xl opacity-50">
          <div
            className={`w-full h-full rounded-full ${
              won ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ transform: 'scale(1.5)' }}
          />
        </div>

        <div className="relative panel-glass rounded-3xl p-12 max-w-lg text-center">
          <div className="text-8xl mb-6 animate-bounce">
            {won ? '🏆' : '💀'}
          </div>

          <h1
            className={`text-5xl font-bold mb-4 glow-text ${
              won ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {won ? '胜利！' : '失败'}
          </h1>

          <p className="text-xl text-gray-400 mb-8">
            {won ? '恭喜你成功守住了基地！' : '基地被怪物攻破了...'}
          </p>

          {showStats && (
            <div className="bg-black/30 rounded-2xl p-6 mb-8 space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                {mapName && (
                  <span className="text-gray-300">📍 {mapName}</span>
                )}
                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-sm font-semibold">
                  第 {levelIndex + 1} 关
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">📊 战斗统计</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">击杀怪物</p>
                  <p className="text-2xl font-bold text-orange-400">{monstersKilled}</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">造成伤害</p>
                  <p className="text-2xl font-bold text-red-400">{Math.floor(totalDamageDealt)}</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">剩余金币</p>
                  <p className="text-2xl font-bold text-yellow-400">💰 {goldRemaining}</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">剩余生命</p>
                  <p className="text-2xl font-bold text-red-400">❤️ {livesRemaining}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              className="flex-1 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white btn-glow transition-all hover:scale-105"
              onClick={handleRestart}
            >
              🔄 再来一局
            </button>
            <button
              className="flex-1 py-4 rounded-xl font-semibold text-lg bg-gray-700 hover:bg-gray-600 text-white transition-all hover:scale-105"
              onClick={handleBackToMenu}
            >
              🏠 返回菜单
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
