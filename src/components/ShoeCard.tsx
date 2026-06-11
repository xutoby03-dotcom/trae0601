import { Link } from 'react-router-dom';
import { Lock, Plus, Edit3, Trash2, Trophy, Footprints } from 'lucide-react';
import { ShoeWithStats, SURFACE_LABELS, SURFACE_COLORS } from '@/types';
import LifeProgressBar from './LifeProgressBar';
import { useShoeStore } from '@/store';

interface Props {
  shoe: ShoeWithStats;
  onDelete?: (id: string) => void;
}

export default function ShoeCard({ shoe, onDelete }: Props) {
  const toggleRaceLock = useShoeStore((s) => s.toggleRaceLock);
  const deleteShoe = useShoeStore((s) => s.deleteShoe);

  const handleDelete = () => {
    if (confirm(`确定要删除 ${shoe.brand} ${shoe.model} 吗？相关跑步记录也会被删除。`)) {
      deleteShoe(shoe.id);
      onDelete?.(shoe.id);
    }
  };

  return (
    <div
      className={`card card-hover group animate-slide-up relative overflow-hidden ${
        shoe.lifePercentage >= 85 ? 'border-danger-500/30' : ''
      }`}
      style={{ animationDelay: '0ms' }}
    >
      {shoe.lifePercentage >= 85 && !shoe.isRaceLocked && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-danger-500/10 rounded-full blur-2xl" />
      )}
      {shoe.isRaceLocked && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-caution-500/10 rounded-full blur-2xl" />
      )}

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                shoe.photo
                  ? 'bg-cover bg-center'
                  : 'bg-gradient-to-br from-night-600 to-night-700'
              }`}
              style={shoe.photo ? { backgroundImage: `url(${shoe.photo})` } : {}}
            >
              {!shoe.photo && <Footprints className="w-6 h-6 text-gray-400" />}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{shoe.brand}</p>
              <h3 className="font-display font-semibold text-white text-base leading-tight max-w-[180px] truncate">
                {shoe.model}
              </h3>
            </div>
          </div>

          {shoe.isRaceLocked && (
            <span className="tag bg-caution-500/15 text-caution-500">
              <Trophy className="w-3 h-3" />
              比赛专用
            </span>
          )}
        </div>

        <div className="mb-4">
          <LifeProgressBar percentage={shoe.lifePercentage} />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-lg font-display font-bold text-white">
              {shoe.totalKilometers.toFixed(1)}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">已跑 km</p>
          </div>
          <div className="text-center border-x border-night-600">
            <p className="text-lg font-display font-bold text-gray-300">
              {shoe.remainingKilometers.toFixed(0)}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">剩余 km</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-display font-bold text-fresh-400">
              ¥{shoe.totalKilometers > 0 ? shoe.costPerKilometer.toFixed(1) : '-'}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">每公里</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {shoe.suitableSurfaces.slice(0, 3).map((s) => (
            <span key={s} className={`tag ${SURFACE_COLORS[s]}`}>
              {SURFACE_LABELS[s]}
            </span>
          ))}
          {shoe.suitableSurfaces.length > 3 && (
            <span className="tag bg-night-600 text-gray-400">
              +{shoe.suitableSurfaces.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-night-600">
          <Link
            to={`/run/new?shoeId=${shoe.id}`}
            className="flex-1 btn-primary !py-2 !px-3 text-sm flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            记录
          </Link>
          <Link
            to={`/shoe/${shoe.id}`}
            className="btn-ghost !p-2"
            title="查看详情"
          >
            <Edit3 className="w-4 h-4" />
          </Link>
          <button
            onClick={() => toggleRaceLock(shoe.id)}
            className={`btn-ghost !p-2 ${shoe.isRaceLocked ? 'text-caution-500' : ''}`}
            title={shoe.isRaceLocked ? '取消比赛锁定' : '设为比赛专用'}
          >
            <Lock className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="btn-ghost !p-2 hover:text-danger-500"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
