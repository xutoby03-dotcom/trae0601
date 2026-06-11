import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Plus, Trash2, Calendar, DollarSign, Footprints, Trophy } from 'lucide-react';
import { useShoeStore } from '@/store';
import { SURFACE_LABELS, SURFACE_COLORS, WEATHER_ICONS } from '@/types';
import LifeProgressBar from '@/components/LifeProgressBar';
import StarRating from '@/components/StarRating';

export default function ShoeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const getShoeById = useShoeStore((s) => s.getShoeById);
  const getShoesWithStats = useShoeStore((s) => s.getShoesWithStats);
  const getRunsByShoeId = useShoeStore((s) => s.getRunsByShoeId);
  const deleteShoe = useShoeStore((s) => s.deleteShoe);
  const deleteRun = useShoeStore((s) => s.deleteRun);

  const shoe = getShoeById(id!);
  const shoeWithStats = getShoesWithStats().find((s) => s.id === id);
  const runs = getRunsByShoeId(id!);

  if (!shoe || !shoeWithStats) {
    return (
      <div className="animate-fade-in">
        <Link to="/" className="btn-ghost inline-flex items-center gap-2 mb-6 -ml-2">
          <ArrowLeft className="w-5 h-5" />
          返回鞋柜
        </Link>
        <div className="card text-center py-16">
          <p className="text-gray-400">未找到该跑鞋</p>
        </div>
      </div>
    );
  }

  const handleDeleteShoe = () => {
    if (confirm(`确定要删除 ${shoe.brand} ${shoe.model} 吗？相关跑步记录也会被删除。`)) {
      deleteShoe(id!);
      navigate('/');
    }
  };

  const handleDeleteRun = (runId: string) => {
    if (confirm('确定要删除这条跑步记录吗？')) {
      deleteRun(runId);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="btn-ghost !p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Link to={`/run/new?shoeId=${shoe.id}`} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            记录跑步
          </Link>
          <Link to={`/shoe/${shoe.id}/edit`} className="btn-secondary inline-flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            编辑
          </Link>
          <button onClick={handleDeleteShoe} className="btn-ghost hover:text-danger-500">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-night-800 to-night-900">
        <div className="flex flex-col md:flex-row gap-6">
          <div
            className={`w-full md:w-48 h-48 rounded-xl overflow-hidden ${
              shoe.photo ? 'bg-cover bg-center' : 'bg-night-700 flex items-center justify-center'
            }`}
            style={shoe.photo ? { backgroundImage: `url(${shoe.photo})` } : {}}
          >
            {!shoe.photo && <Footprints className="w-16 h-16 text-night-500" />}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <p className="text-sm text-gray-400 font-medium">{shoe.brand}</p>
                {shoe.isRaceLocked && (
                  <span className="tag bg-caution-500/15 text-caution-500">
                    <Trophy className="w-3 h-3" />
                    比赛专用
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-display font-bold text-white">{shoe.model}</h1>
            </div>

            <div className="max-w-md">
              <LifeProgressBar percentage={shoeWithStats.lifePercentage} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">已跑里程</p>
                <p className="text-2xl font-display font-bold text-white">{shoeWithStats.totalKilometers.toFixed(1)}<span className="text-sm text-gray-400 ml-1">km</span></p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">剩余寿命</p>
                <p className="text-2xl font-display font-bold text-gray-300">{shoeWithStats.remainingKilometers.toFixed(0)}<span className="text-sm text-gray-400 ml-1">km</span></p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />每公里成本
                </p>
                <p className="text-2xl font-display font-bold text-fresh-400">
                  ¥{shoeWithStats.totalKilometers > 0 ? shoeWithStats.costPerKilometer.toFixed(2) : '-'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />跑步次数
                </p>
                <p className="text-2xl font-display font-bold text-energy-400">{shoeWithStats.runCount}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">适合路面</p>
              <div className="flex flex-wrap gap-2">
                {shoe.suitableSurfaces.map((s) => (
                  <span key={s} className={`tag ${SURFACE_COLORS[s]}`}>
                    {SURFACE_LABELS[s]}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-400">
              <p>买入价：<span className="text-gray-200 font-medium">¥{shoe.purchasePrice}</span></p>
              <p>启用日期：<span className="text-gray-200 font-medium">{shoe.startDate}</span></p>
              <p>寿命上限：<span className="text-gray-200 font-medium">{shoe.maxKilometers} km</span></p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-display font-bold text-white mb-4">跑步记录</h2>
        {runs.length === 0 ? (
          <div className="card text-center py-12">
            <Footprints className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 text-sm mb-4">还没有跑步记录</p>
            <Link to={`/run/new?shoeId=${shoe.id}`} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              记录第一次跑步
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {runs.map((run, idx) => (
              <div key={run.id} className="card !p-4 group animate-slide-up" style={{ animationDelay: `${idx * 30}ms` }}>
                <div className="flex items-center gap-4">
                  <div className="w-14 text-center flex-shrink-0">
                    <p className="text-2xl font-display font-bold text-energy-400 leading-none">
                      {run.kilometers.toFixed(1)}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">km</p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-medium text-white">{run.date}</p>
                      <span className={`tag ${SURFACE_COLORS[run.surface]}`}>
                        {SURFACE_LABELS[run.surface]}
                      </span>
                      <span className="text-sm">{WEATHER_ICONS[run.weather]}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StarRating rating={run.feelRating} readonly size="sm" />
                      {run.wearNotes && (
                        <p className="text-xs text-gray-400 truncate">📝 {run.wearNotes}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteRun(run.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-night-700 text-gray-400 hover:text-danger-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
