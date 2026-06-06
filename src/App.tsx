import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { initDB, initSkins, getTotalCoins, getBestDistance, getEquippedSkin, getSetting, saveSetting } from '@/store/indexedDB';
import { MainMenu } from '@/components/MainMenu';
import { GameCanvas } from '@/components/GameCanvas';
import { Shop } from '@/components/Shop';
import { Leaderboard } from '@/components/Leaderboard';
import { Settings } from '@/components/Settings';

function App() {
  const { showMenu, setShowMenu, setTotalCoins, setBestDistance, setCurrentSkin, setBgmIndex, setBgmVolume, toggleSound, soundEnabled } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initDB();
        await initSkins();
        setDbReady(true);

        const coins = await getTotalCoins();
        setTotalCoins(coins);

        const bestDist = await getBestDistance();
        setBestDistance(bestDist);

        const equippedSkin = await getEquippedSkin();
        if (equippedSkin) {
          setCurrentSkin(equippedSkin);
        }

        const savedBgmIndex = await getSetting('bgmIndex', 0);
        setBgmIndex(savedBgmIndex);

        const savedBgmVolume = await getSetting('bgmVolume', 0.3);
        setBgmVolume(savedBgmVolume);

        const savedSoundEnabled = await getSetting('soundEnabled', true);
        if (savedSoundEnabled !== soundEnabled) {
          toggleSound();
        }

        setShowMenu('main');
      } catch (e) {
        console.error('Failed to initialize app:', e);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const { bgmIndex, bgmVolume, soundEnabled: soundEnabledState } = useGameStore();

  useEffect(() => {
    if (dbReady) {
      saveSetting('bgmIndex', bgmIndex).catch(() => {});
    }
  }, [bgmIndex, dbReady]);

  useEffect(() => {
    if (dbReady) {
      saveSetting('bgmVolume', bgmVolume).catch(() => {});
    }
  }, [bgmVolume, dbReady]);

  useEffect(() => {
    if (dbReady) {
      saveSetting('soundEnabled', soundEnabledState).catch(() => {});
    }
  }, [soundEnabledState, dbReady]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {showMenu === 'main' && <MainMenu />}
      {showMenu === 'game' && <GameCanvas />}
      {showMenu === 'shop' && <Shop />}
      {showMenu === 'leaderboard' && <Leaderboard />}
      {showMenu === 'settings' && <Settings />}
    </div>
  );
}

export default App;
