import { useNavigate } from 'react-router-dom';
import { Droplets, Clock, Scale, Coffee, Package } from 'lucide-react';
import type { CoffeeBatch } from '../types';
import StatusBadge from './StatusBadge';
import FlavorTags from './FlavorTags';
import { getBatchStatus, getStatusInfo, getRestingProgress, getWeightProgress, getDaysUntilOptimal } from '../utils/statusUtils';
import { daysSince, formatDateShort } from '../utils/dateUtils';

interface BatchCardProps {
  batch: CoffeeBatch;
  onQuickBrew?: () => void;
}

export default function BatchCard({ batch, onQuickBrew }: BatchCardProps) {
  const navigate = useNavigate();
  const status = getBatchStatus(batch);
  const statusInfo = getStatusInfo(status);
  const restingProgress = getRestingProgress(batch);
  const weightProgress = getWeightProgress(batch);
  const daysUntilOptimal = getDaysUntilOptimal(batch);

  const handleClick = () => {
    navigate(`/batch/${batch.id}`);
  };

  return (
    <div
      className="card relative overflow-hidden cursor-pointer group flex flex-col"
      onClick={handleClick}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 z-10 transition-all duration-300"
        style={{ backgroundColor: statusInfo.color }}
      />

      <div className="relative h-32 bg-gradient-to-br from-cream-100 to-cream-50 overflow-hidden">
        {batch.photo ? (
          <img
            src={batch.photo}
            alt={batch.origin}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-coffee-300">
            <Package className="w-12 h-12 mb-1" />
            <span className="text-xs font-medium">袋身照片</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <StatusBadge status={status} size="sm" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent" />
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-coffee-900 font-serif truncate group-hover:text-coffee-700 transition-colors">
            {batch.origin}
          </h3>
          <p className="text-sm text-coffee-500 mt-0.5">
            {batch.processMethod}
          </p>
        </div>

        <div className="mb-3">
          <FlavorTags tags={batch.flavorTags} maxTags={3} size="sm" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-coffee-600 flex-1">
              <Scale size={14} />
              <span>剩余</span>
              <span className="font-semibold text-coffee-800">
                {batch.currentWeight}g
              </span>
              <span className="text-coffee-400">/ {batch.initialWeight}g</span>
            </div>
          </div>

          <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${weightProgress}%`,
                backgroundColor:
                  weightProgress > 50
                    ? '#81C784'
                    : weightProgress > 20
                    ? '#FFB74D'
                    : '#E57373',
              }}
            />
          </div>

          {batch.openDate && (
            <>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-coffee-600">
                  <Clock size={14} />
                  <span>已开封 {daysSince(batch.openDate)} 天</span>
                </div>
                {daysUntilOptimal !== null && (
                  <span className="text-amber-600 font-medium">
                    还需 {daysUntilOptimal} 天养豆
                  </span>
                )}
              </div>

              {status === 'resting' && (
                <div className="h-1.5 bg-amber-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${restingProgress}%` }}
                  />
                </div>
              )}
            </>
          )}

          {!batch.openDate && (
            <div className="flex items-center gap-1.5 text-sm text-coffee-500">
              <Coffee size={14} />
              <span>未开封 · 烘焙于 {formatDateShort(batch.roastDate)}</span>
            </div>
          )}
        </div>

        {batch.openDate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickBrew?.();
            }}
            className="mt-4 w-full py-2.5 rounded-xl bg-coffee-50 text-coffee-700 font-medium text-sm hover:bg-coffee-100 transition-all duration-200 flex items-center justify-center gap-2 group-hover:bg-coffee-800 group-hover:text-cream-50"
          >
            <Droplets size={16} />
            记录出豆
          </button>
        )}
      </div>
    </div>
  );
}
