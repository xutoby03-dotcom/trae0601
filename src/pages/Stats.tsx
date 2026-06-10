import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  Gift,
  Package,
  Play,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { useToyStore } from '@/store/useToyStore';
import type { Toy } from '@/types';
import { STATUS_LABELS } from '@/types';

export default function Stats() {
  const { toys, getPlayCount, getLastPlayTime, getToysByStatus } = useToyStore();

  const awayToys = getToysByStatus('away');
  const totalToys = toys.length;
  const activeToys = toys.filter((t) => t.status !== 'away');

  const toysWithPlayCount = activeToys
    .map((toy) => ({
      toy,
      playCount: getPlayCount(toy.id),
      lastPlayTime: getLastPlayTime(toy.id),
    }))
    .sort((a, b) => b.playCount - a.playCount);

  const mostPlayed = toysWithPlayCount.slice(0, 5);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const longIdleToys = activeToys
    .filter((toy) => {
      const lastPlay = getLastPlayTime(toy.id);
      if (!lastPlay) return true;
      return new Date(lastPlay) < thirtyDaysAgo;
    })
    .sort((a, b) => {
      const aLast = getLastPlayTime(a.id);
      const bLast = getLastPlayTime(b.id);
      if (!aLast && !bLast) return 0;
      if (!aLast) return -1;
      if (!bLast) return 1;
      return new Date(aLast).getTime() - new Date(bLast).getTime();
    });

  const formatDaysAgo = (dateStr: string | null) => {
    if (!dateStr) return '从未玩过';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    if (days < 30) return `${Math.floor(days / 7)}周前`;
    return `${Math.floor(days / 30)}个月前`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const statusBreakdown = [
    { status: 'playing', color: 'bg-mint-500' },
    { status: 'stored', color: 'bg-sky-500' },
    { status: 'cleaning', color: 'bg-yellow-500' },
    { status: 'giving', color: 'bg-pink-500' },
  ];

  const totalActive = activeToys.length;
  const statusPercentages = statusBreakdown.map((s) => ({
    ...s,
    count: getToysByStatus(s.status as any).length,
    percentage: totalActive > 0
      ? (getToysByStatus(s.status as any).length / totalActive) * 100
      : 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-mint-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center">
          <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <h1 className="font-bold text-gray-800 ml-2">数据统计</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* 总览卡片 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-2">
              <Package className="text-primary-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{totalToys}</p>
            <p className="text-xs text-gray-500">玩具总数</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-mint-100 rounded-xl flex items-center justify-center mb-2">
              <Play className="text-mint-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{activeToys.length}</p>
            <p className="text-xs text-gray-500">在库玩具</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center mb-2">
              <Gift className="text-pink-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{awayToys.length}</p>
            <p className="text-xs text-gray-500">已送出</p>
          </div>
        </div>

        {/* 状态分布 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-500" />
            状态分布
          </h3>
          <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 mb-3">
            {statusPercentages.map((s) => (
              <div
                key={s.status}
                className={s.color}
                style={{ width: `${s.percentage}%` }}
              />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {statusPercentages.map((s) => (
              <div key={s.status}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className={cn('w-2.5 h-2.5 rounded-full', s.color)} />
                  <span className="text-xs text-gray-500">
                    {STATUS_LABELS[s.status as keyof typeof STATUS_LABELS]}
                  </span>
                </div>
                <p className="font-bold text-gray-700">{s.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 最常玩排行 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-mint-500" />
            最常玩玩具 TOP 5
          </h3>
          {mostPlayed.length > 0 ? (
            <div className="space-y-3">
              {mostPlayed.map((item, index) => (
                <Link
                  key={item.toy.id}
                  to={`/toy/${item.toy.id}`}
                  className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
                      index === 0
                        ? 'bg-yellow-400 text-white'
                        : index === 1
                        ? 'bg-gray-300 text-white'
                        : index === 2
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {item.toy.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      上次玩：{formatDaysAgo(item.lastPlayTime)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-500">{item.playCount}</p>
                    <p className="text-xs text-gray-400">次</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <p>暂无玩耍记录</p>
            </div>
          )}
        </div>

        {/* 长期闲置 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-yellow-500" />
            长期闲置玩具
            <span className="text-xs font-normal text-gray-400">（超过30天）</span>
          </h3>
          {longIdleToys.length > 0 ? (
            <div className="space-y-3">
              {longIdleToys.slice(0, 5).map((toy) => {
                const lastPlay = getLastPlayTime(toy.id);
                return (
                  <Link
                    key={toy.id}
                    to={`/toy/${toy.id}`}
                    className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-2xl">
                      ⏰
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {toy.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {lastPlay
                          ? `上次玩：${formatDate(lastPlay)}`
                          : '从未被拿出来玩过'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                        {formatDaysAgo(lastPlay)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <p>太棒了！没有长期闲置的玩具</p>
            </div>
          )}
        </div>

        {/* 已送出玩具 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Gift size={18} className="text-pink-500" />
            已送出的玩具
          </h3>
          {awayToys.length > 0 ? (
            <div className="space-y-2">
              {awayToys.map((toy) => (
                <div
                  key={toy.id}
                  className="flex items-center gap-3 p-2 -mx-2 rounded-xl bg-gray-50"
                >
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center text-xl">
                    🎁
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-700 truncate">{toy.name}</p>
                    <p className="text-xs text-gray-400">{toy.category}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {getPlayCount(toy.id)} 次玩耍
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <p>还没有送出过玩具</p>
            </div>
          )}
        </div>

        {/* 小提示 */}
        <div className="bg-mint-50 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-mint-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-mint-800 text-sm">温馨提示</p>
              <p className="text-mint-600 text-xs mt-1">
                定期轮换玩具可以保持孩子的新鲜感。建议每1-2周轮换一批玩具，让每件玩具都能被充分利用哦！
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
