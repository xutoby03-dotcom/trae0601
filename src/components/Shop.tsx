import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getSkins, updateSkin, getTotalCoins, updateTotalCoins, getEquippedSkin } from '@/store/indexedDB';
import { Skin } from '@/types/game';
import { ArrowLeft, Check, Lock, Coins } from 'lucide-react';

export const Shop = () => {
  const { setShowMenu, totalCoins, setTotalCoins, setCurrentSkin } = useGameStore();
  const [skins, setSkins] = useState<Skin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkins();
  }, []);

  const loadSkins = async () => {
    try {
      const loadedSkins = await getSkins();
      setSkins(loadedSkins);
      const coins = await getTotalCoins();
      setTotalCoins(coins);
      const equipped = await getEquippedSkin();
      if (equipped) setCurrentSkin(equipped);
    } catch (e) {
      console.error('Failed to load skins:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBuySkin = async (skin: Skin) => {
    if (totalCoins < skin.price) return;

    const newTotal = totalCoins - skin.price;
    const updatedSkin = { ...skin, owned: true };

    try {
      await updateSkin(updatedSkin);
      await updateTotalCoins(newTotal);
      setTotalCoins(newTotal);
      setSkins((prev) => prev.map((s) => (s.id === skin.id ? updatedSkin : s)));
    } catch (e) {
      console.error('Failed to buy skin:', e);
    }
  };

  const handleEquipSkin = async (skin: Skin) => {
    try {
      const updatedSkins = skins.map((s) => ({
        ...s,
        equipped: s.id === skin.id,
      }));

      for (const s of updatedSkins) {
        await updateSkin(s);
      }

      setSkins(updatedSkins);
      setCurrentSkin(skin);
    } catch (e) {
      console.error('Failed to equip skin:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowMenu('main')}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </button>
          <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-lg">{totalCoins}</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-8">🛒 角色商店</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {skins.map((skin) => (
            <div
              key={skin.id}
              className={`relative bg-gray-800/80 backdrop-blur rounded-2xl p-4 border-2 transition-all duration-300 ${
                skin.equipped
                  ? 'border-green-500 shadow-lg shadow-green-500/20'
                  : skin.owned
                  ? 'border-gray-600 hover:border-blue-500'
                  : 'border-gray-700'
              }`}
            >
              {skin.equipped && (
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              <div className="flex justify-center mb-4">
                <div
                  className="w-20 h-24 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: skin.colors.body + '30' }}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full mb-1"
                      style={{ backgroundColor: skin.colors.accent }}
                    />
                    <div
                      className="w-12 h-12 rounded-lg"
                      style={{ backgroundColor: skin.colors.body }}
                    />
                  </div>
                </div>
              </div>

              <h3 className="text-white font-bold text-center mb-3">{skin.name}</h3>

              {skin.owned ? (
                <button
                  onClick={() => !skin.equipped && handleEquipSkin(skin)}
                  disabled={skin.equipped}
                  className={`w-full py-2 rounded-xl font-bold text-sm transition-all ${
                    skin.equipped
                      ? 'bg-green-500/30 text-green-400 cursor-default'
                      : 'bg-blue-500 hover:bg-blue-400 text-white'
                  }`}
                >
                  {skin.equipped ? '已装备' : '装备'}
                </button>
              ) : (
                <button
                  onClick={() => handleBuySkin(skin)}
                  disabled={totalCoins < skin.price}
                  className={`w-full py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    totalCoins >= skin.price
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {totalCoins >= skin.price ? (
                    <>
                      <Coins className="w-4 h-4" />
                      {skin.price}
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      {skin.price}
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
