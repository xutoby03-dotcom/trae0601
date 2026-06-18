import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Clock, Thermometer, User } from 'lucide-react';
import { useBatchStore } from '@/store/useBatchStore';
import StatusBadge from '@/components/common/StatusBadge';
import ProgressBar from '@/components/common/ProgressBar';
import { COOKING_DURATION_MIN } from '@/utils/soupConfig';
import { formatTime, getDurationMinutes, formatDuration } from '@/utils/helpers';

export default function CookingPotsCard() {
  const navigate = useNavigate();
  const batches = useBatchStore((s) => s.batches);
  const cookingBatches = useMemo(
    () => batches.filter((b) => b.status === 'cooking' || b.status === 'preparing'),
    [batches]
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-fire-50 flex items-center justify-center text-fire-500">
            <Flame className="w-5 h-5 animate-pulse-slow" />
          </div>
          <h3 className="font-display text-lg font-bold text-broth-800">正在熬制</h3>
        </div>
        <span className="chip bg-fire-100 text-fire-600">{cookingBatches.length} 口锅</span>
      </div>

      {cookingBatches.length === 0 ? (
        <div className="py-12 text-center text-broth-400">
          <Flame className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>暂无正在熬制的汤底</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cookingBatches.map((b) => {
            const elapsed = getDurationMinutes(b.startTime);
            const total = COOKING_DURATION_MIN[b.soupType] || 180;
            const lastRecord = b.cookingRecords[b.cookingRecords.length - 1];

            return (
              <div
                key={b.id}
                onClick={() => navigate(`/batches/${b.id}`)}
                className="p-4 rounded-xl border border-broth-50 bg-gradient-to-br from-soup-50/50 to-white hover:shadow-warm hover:border-fire-100 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fire-400 to-fire-500 flex items-center justify-center text-white font-bold shadow-lg">
                        {b.potNumber.replace('号锅', '')}
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge type="soup" value={b.soupType} />
                        <StatusBadge type="fire" value={b.fireLevel} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-broth-500">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatTime(b.startTime)} 开始</span>
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{b.operator}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-broth-500">已熬制</p>
                    <p className="font-display text-lg font-bold text-broth-800">{formatDuration(elapsed)}</p>
                  </div>
                </div>

                <ProgressBar value={elapsed} max={total} color="fire" size="md" />

                {lastRecord && (
                  <div className="mt-3 flex items-center gap-4 text-xs text-broth-600">
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-fire-500" />
                      <span className="font-semibold">{lastRecord.temperature}°C</span>
                    </span>
                    <span>盐度 <span className="font-semibold">{lastRecord.salinity.toFixed(2)}%</span></span>
                    <span className="truncate opacity-70">「{lastRecord.tasteComment}」</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
