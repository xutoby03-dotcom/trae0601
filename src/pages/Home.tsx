import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, SortDesc, Trophy, Activity } from 'lucide-react';
import ShoeCard from '@/components/ShoeCard';
import { useShoeStore } from '@/store';

type SortMode = 'life' | 'price' | 'date' | 'km';

export default function Home() {
  const getSortedShoes = useShoeStore((s) => s.getSortedShoes);
  const getTotalStats = useShoeStore((s) => s.getTotalStats);
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('life');
  const [showRaceOnly, setShowRaceOnly] = useState(false);

  const allShoes = getSortedShoes();
  const stats = getTotalStats();

  const filteredShoes = useMemo(() => {
    let result = allShoes;

    if (showRaceOnly) {
      result = result.filter((s) => s.isRaceLocked);
    } else {
      result = result.filter((s) => !s.isRaceLocked);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.brand.toLowerCase().includes(q) ||
          s.model.toLowerCase().includes(q)
      );
    }

    if (sortMode === 'price') {
      result = [...result].sort((a, b) => b.costPerKilometer - a.costPerKilometer);
    } else if (sortMode === 'date') {
      result = [...result].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    } else if (sortMode === 'km') {
      result = [...result].sort((a, b) => b.totalKilometers - a.totalKilometers);
    }

    return result;
  }, [allShoes, search, sortMode, showRaceOnly]);

  const raceShoes = allShoes.filter((s) => s.isRaceLocked);
  const retiringShoes = allShoes.filter((s) => s.lifePercentage >= 70 && !s.isRaceLocked);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">
            我的鞋柜
          </h1>
          <p className="text-gray-400">
            共 <span className="text-white font-semibold">{stats.totalShoes}</span> 双鞋 · 
            在役 <span className="text-fresh-400 font-semibold">{stats.activeShoes}</span> 双 · 
            累计 <span className="text-energy-400 font-semibold">{stats.totalDistance.toFixed(1)}</span> 公里
          </p>
        </div>

        <Link to="/shoe/new" className="btn-primary inline-flex items-center gap-2 self-start md:self-auto">
          <Plus className="w-5 h-5" />
          添加新鞋
        </Link>
      </div>

      {(retiringShoes.length > 0 || raceShoes.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {retiringShoes.length > 0 && (
            <div className="card border-danger-500/30 bg-gradient-to-br from-danger-500/5 to-transparent">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-danger-500" />
                <h3 className="font-display font-semibold text-white">即将退役</h3>
                <span className="tag bg-danger-500/20 text-danger-500 ml-auto">{retiringShoes.length} 双</span>
              </div>
              <p className="text-sm text-gray-300">
                这些鞋已超过 70% 寿命，建议减少日常使用频率。
              </p>
            </div>
          )}
          {raceShoes.length > 0 && (
            <div className="card border-caution-500/30 bg-gradient-to-br from-caution-500/5 to-transparent">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-caution-500" />
                <h3 className="font-display font-semibold text-white">比赛专用</h3>
                <span className="tag bg-caution-500/20 text-caution-500 ml-auto">{raceShoes.length} 双</span>
              </div>
              <p className="text-sm text-gray-300">
                锁定的比赛鞋不参与日常推荐，留给重要赛事！
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="搜索品牌或型号..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-night-800 rounded-full px-3 py-2 border border-night-600">
            <SortDesc className="w-4 h-4 text-gray-400" />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="bg-transparent text-sm text-gray-200 outline-none cursor-pointer"
            >
              <option value="life">按剩余寿命</option>
              <option value="km">按总里程</option>
              <option value="price">按每公里成本</option>
              <option value="date">按启用日期</option>
            </select>
          </div>

          <button
            onClick={() => setShowRaceOnly(!showRaceOnly)}
            className={`btn-ghost !px-4 !py-2 flex items-center gap-1.5 text-sm ${
              showRaceOnly ? 'bg-caution-500/15 text-caution-500 hover:bg-caution-500/20' : ''
            }`}
          >
            <Trophy className="w-4 h-4" />
            仅看比赛鞋
          </button>
        </div>
      </div>

      {filteredShoes.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-full bg-night-700 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="font-display font-semibold text-white text-lg mb-2">
            {search ? '没有找到匹配的跑鞋' : '鞋柜里还没有鞋'}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {search ? '换个关键词试试吧' : '添加你的第一双跑鞋，开始记录里程'}
          </p>
          {!search && (
            <Link to="/shoe/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              添加新鞋
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filteredShoes.map((shoe) => (
            <ShoeCard key={shoe.id} shoe={shoe} />
          ))}
        </div>
      )}
    </div>
  );
}
