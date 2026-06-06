import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getTopRecords } from '@/store/indexedDB';
import { GameRecord } from '@/types/game';
import { themeNames } from '@/game/Themes';
import { ArrowLeft, Trophy, Medal, Coins } from 'lucide-react';

export const Leaderboard = () => {
  const { setShowMenu } = useGameStore();
  const [tab, setTab] = useState<'distance' | 'coins'>('distance');
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, [tab]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await getTopRecords(tab, 10);
      setRecords(data);
    } catch (e) {
      console.error('Failed to load records:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return 'text-yellow-400';
      case 1:
        return 'text-gray-300';
      case 2:
        return 'text-amber-600';
      default:
        return 'text-gray-500';
    }
  };

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

        <h1 className="text-3xl font-bold text-white text-center mb-2 flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          排行榜
        </h1>
        <p className="text-gray-400 text-center mb-8">挑战最强跑者！</p>

        <div className="flex gap-2 mb-6 bg-gray-800/50 p-1 rounded-xl">
          <button
            onClick={() => setTab('distance')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
              tab === 'distance'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🏃 最远距离
          </button>
          <button
            onClick={() => setTab('coins')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
              tab === 'coins'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            💰 最多金币
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-gray-400 py-8">加载中...</div>
          ) : records.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Medal className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无记录</p>
              <p className="text-sm mt-1">快去创造你的第一个记录吧！</p>
            </div>
          ) : (
            records.map((record, index) => (
              <div
                key={record.id}
                className={`flex items-center gap-4 bg-gray-800/70 backdrop-blur rounded-xl p-4 border transition-all ${
                  index < 3 ? 'border-gray-600' : 'border-gray-700/50'
                }`}
              >
                <div className={`text-2xl font-black w-8 text-center ${getMedalColor(index)}`}>
                  {index < 3 ? (
                    <Medal className={`w-7 h-7 ${getMedalColor(index)}`} />
                  ) : (
                    index + 1
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold">
                      {tab === 'distance'
                        ? `${Math.floor(record.distance)}m`
                        : `${record.coins} 金币`}
                    </span>
                    {tab === 'distance' && record.distance > 1000 && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                        千米跑者
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span>{themeNames[record.theme]}</span>
                    <span>·</span>
                    <span>{formatDate(record.timestamp)}</span>
                  </div>
                </div>

                <div className="text-right">
                  {tab === 'distance' ? (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Coins className="w-4 h-4" />
                      <span className="font-bold">{record.coins}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-green-400">
                      <span className="font-bold">{Math.floor(record.distance)}m</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
