import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '@/game/Engine';
import { useGameStore } from '@/store/gameStore';
import { useAudio } from '@/hooks/useAudio';
import { saveRecord, getTotalCoins, updateTotalCoins, getBestDistance } from '@/store/indexedDB';
import { GameStats } from '@/types/game';
import { Pause, Play, Home, RotateCcw, ArrowUp, ArrowDown, X } from 'lucide-react';

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const touchStartY = useRef<number | null>(null);

  const {
    currentTheme,
    currentSkin,
    setStats,
    stats,
    setShowMenu,
    setTotalCoins,
    setBestDistance,
    bgmIndex,
    bgmVolume,
    soundEnabled,
  } = useGameStore();

  const [isPaused, setIsPaused] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [finalStats, setFinalStats] = useState<GameStats | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const prevShieldRef = useRef(0);

  const {
    initAudioContext,
    playJumpSound,
    playSlideSound,
    playCoinSound,
    playGameOverSound,
    playShieldSound,
    playShieldBreakSound,
    startBGM,
    stopBGM,
    setBGMVolume,
  } = useAudio();

  const handleStatsUpdate = useCallback(
    (newStats: GameStats) => {
      if (newStats.coins > stats.coins && soundEnabled) {
        playCoinSound();
      }
      if (newStats.shieldTime > 0 && prevShieldRef.current <= 0 && soundEnabled) {
        playShieldSound();
      }
      prevShieldRef.current = newStats.shieldTime;
      setStats(newStats);
    },
    [stats.coins, setStats, playCoinSound, playShieldSound, soundEnabled]
  );

  const handleGameOver = useCallback(
    async (gameOverStats: GameStats) => {
      if (soundEnabled) {
        playGameOverSound();
      }
      stopBGM();
      setFinalStats(gameOverStats);
      setShowGameOver(true);

      try {
        await saveRecord({
          distance: gameOverStats.distance,
          coins: gameOverStats.coins,
          theme: currentTheme,
          timestamp: Date.now(),
        });

        const currentTotal = await getTotalCoins();
        const newTotal = currentTotal + gameOverStats.coins;
        await updateTotalCoins(newTotal);
        setTotalCoins(newTotal);

        const bestDist = await getBestDistance();
        setBestDistance(bestDist);
        setIsNewRecord(gameOverStats.distance >= bestDist && gameOverStats.distance > 0);
      } catch (e) {
        console.error('Failed to save record:', e);
      }
    },
    [currentTheme, soundEnabled, playGameOverSound, stopBGM, setTotalCoins, setBestDistance]
  );

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (engineRef.current) {
        engineRef.current.resize(canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const engine = new GameEngine(canvas);
    engine.setTheme(currentTheme);
    if (currentSkin) {
      engine.setSkin(currentSkin);
    }
    engine.setOnStatsUpdate(handleStatsUpdate);
    engine.setOnGameOver(handleGameOver);
    engine.setOnShieldBreak(() => {
      if (soundEnabled) playShieldBreakSound();
    });
    engineRef.current = engine;

    initAudioContext();
    engine.start();

    if (soundEnabled) {
      startBGM(bgmIndex, bgmVolume);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      engine.stop();
      stopBGM();
    };
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setTheme(currentTheme);
    }
  }, [currentTheme]);

  useEffect(() => {
    if (currentSkin && engineRef.current) {
      engineRef.current.setSkin(currentSkin);
    }
  }, [currentSkin]);

  useEffect(() => {
    setBGMVolume(bgmVolume);
  }, [bgmVolume, setBGMVolume]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      if (e.key === 'Escape') {
        togglePause();
        return;
      }

      if (isPaused || showGameOver) return;

      if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        engineRef.current.jump();
        if (soundEnabled) playJumpSound();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        engineRef.current.slide();
        if (soundEnabled) playSlideSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, showGameOver, soundEnabled, playJumpSound, playSlideSound]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isPaused || showGameOver || !engineRef.current || touchStartY.current === null) return;

    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (diff > 50) {
      engineRef.current.jump();
      if (soundEnabled) playJumpSound();
    } else if (diff < -50) {
      engineRef.current.slide();
      if (soundEnabled) playSlideSound();
    }

    touchStartY.current = null;
  };

  const togglePause = () => {
    if (!engineRef.current) return;

    if (isPaused) {
      engineRef.current.resume();
      if (soundEnabled) startBGM(bgmIndex, bgmVolume);
    } else {
      engineRef.current.pause();
      stopBGM();
    }
    setIsPaused(!isPaused);
  };

  const handleRestart = () => {
    if (!engineRef.current) return;
    setShowGameOver(false);
    setFinalStats(null);
    setIsNewRecord(false);
    engineRef.current.start();
    if (soundEnabled) startBGM(bgmIndex, bgmVolume);
  };

  const handleBackToMenu = () => {
    stopBGM();
    setShowMenu('main');
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />

      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 pointer-events-auto">
          <p className="text-white font-bold text-lg">🏃 {Math.floor(stats.distance)}m</p>
        </div>
        <div className="flex items-center gap-3">
          {stats.shieldTime > 0 && (
            <div className="bg-cyan-500/30 backdrop-blur-sm rounded-xl px-4 py-2 border border-cyan-400/50 animate-pulse">
              <p className="text-cyan-300 font-bold text-lg flex items-center gap-2">
                🛡️ {(stats.shieldTime / 1000).toFixed(1)}s
              </p>
            </div>
          )}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2">
            <p className="text-yellow-400 font-bold text-lg">💰 {stats.coins}</p>
          </div>
          <button
            onClick={togglePause}
            className="bg-black/40 backdrop-blur-sm rounded-xl p-3 pointer-events-auto hover:bg-black/60 transition-colors"
          >
            {isPaused ? (
              <Play className="w-5 h-5 text-white" />
            ) : (
              <Pause className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 pointer-events-none md:hidden">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            if (!isPaused && !showGameOver && engineRef.current) {
              engineRef.current.jump();
              if (soundEnabled) playJumpSound();
            }
          }}
          className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center pointer-events-auto active:bg-white/30 transition-colors border-2 border-white/30"
        >
          <ArrowUp className="w-8 h-8 text-white" />
        </button>
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            if (!isPaused && !showGameOver && engineRef.current) {
              engineRef.current.slide();
              if (soundEnabled) playSlideSound();
            }
          }}
          className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center pointer-events-auto active:bg-white/30 transition-colors border-2 border-white/30"
        >
          <ArrowDown className="w-8 h-8 text-white" />
        </button>
      </div>

      {isPaused && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-800/90 rounded-3xl p-8 text-center border border-gray-600 max-w-sm w-full mx-4">
            <h2 className="text-3xl font-bold text-white mb-6">⏸️ 游戏暂停</h2>
            <div className="space-y-3">
              <button
                onClick={togglePause}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                <Play className="w-5 h-5" />
                继续游戏
              </button>
              <button
                onClick={handleRestart}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                <RotateCcw className="w-5 h-5" />
                重新开始
              </button>
              <button
                onClick={handleBackToMenu}
                className="w-full bg-gray-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-600 transition-colors"
              >
                <Home className="w-5 h-5" />
                返回主菜单
              </button>
            </div>
          </div>
        </div>
      )}

      {showGameOver && finalStats && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-8 text-center border border-gray-600 max-w-sm w-full mx-4">
            <button
              onClick={handleBackToMenu}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-4xl font-black text-red-500 mb-2">游戏结束</h2>

            {isNewRecord && (
              <div className="bg-yellow-500/20 text-yellow-400 font-bold py-2 px-4 rounded-full inline-block mb-4 animate-pulse">
                🎉 新纪录！
              </div>
            )}

            <div className="space-y-4 my-6">
              <div className="bg-gray-700/50 rounded-2xl p-4">
                <p className="text-gray-400 text-sm mb-1">本局距离</p>
                <p className="text-3xl font-black text-green-400">{Math.floor(finalStats.distance)}m</p>
              </div>
              <div className="bg-gray-700/50 rounded-2xl p-4">
                <p className="text-gray-400 text-sm mb-1">收集金币</p>
                <p className="text-3xl font-black text-yellow-400">💰 {finalStats.coins}</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleRestart}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-transform text-lg"
              >
                <RotateCcw className="w-5 h-5" />
                再来一局
              </button>
              <button
                onClick={handleBackToMenu}
                className="w-full bg-gray-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-600 transition-colors"
              >
                <Home className="w-5 h-5" />
                返回主菜单
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
