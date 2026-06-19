import React from 'react';
import { Droplets, Clock, User, Sun, CloudSun, Cloud } from 'lucide-react';
import type { GardenBed } from '@shared/types.js';
import {
  CROP_STATUS_LABELS,
  SHADE_CONDITION_LABELS,
  CROP_EMOJIS,
  CROP_GROWTH_CYCLES,
} from '@shared/types.js';
import { formatDate, formatRelativeTime, getDaysSince } from '../utils/dateUtils.js';

interface GardenBedCardProps {
  gardenBed: GardenBed;
  growthProgress?: number;
  onClick?: () => void;
  showDetails?: boolean;
}

const GardenBedCard: React.FC<GardenBedCardProps> = ({
  gardenBed,
  growthProgress,
  onClick,
  showDetails = true,
}) => {
  const cropEmoji = CROP_EMOJIS[gardenBed.crop] || '🌱';
  const growthCycle = CROP_GROWTH_CYCLES[gardenBed.crop] || CROP_GROWTH_CYCLES['默认'];
  const daysSincePlanted = getDaysSince(gardenBed.plantDate);
  const progress =
    growthProgress ?? Math.min(100, Math.round((daysSincePlanted / growthCycle) * 100));

  const shadeIcon = {
    full_sun: Sun,
    partial_shade: CloudSun,
    full_shade: Cloud,
  }[gardenBed.shadeCondition];

  const ShadeIcon = shadeIcon;

  const statusColorClasses = {
    seedling: 'bg-sky-100 text-sky-700',
    growing: 'bg-primary-100 text-primary-700',
    mature: 'bg-sun-100 text-sun-700',
    harvesting: 'bg-soil-100 text-soil-700',
  }[gardenBed.status];

  return (
    <div
      onClick={onClick}
      className={`card card-hover cursor-pointer group overflow-hidden ${
        onClick ? '' : 'cursor-default'
      }`}
    >
      <div className="flex gap-4">
        <div className="relative w-28 h-28 rounded-xl overflow-hidden flex-shrink-0">
          {gardenBed.photoUrl ? (
            <img
              src={gardenBed.photoUrl}
              alt={gardenBed.crop}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-5xl">
              {cropEmoji}
            </div>
          )}
          <div className="absolute top-2 left-2 text-2xl drop-shadow">{cropEmoji}</div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-serif font-semibold text-lg text-forest-900 flex items-center gap-2">
                {gardenBed.bedNumber}
                <span className={`badge ${statusColorClasses}`}>
                  {CROP_STATUS_LABELS[gardenBed.status]}
                </span>
              </h3>
              <p className="text-forest-700 font-medium">{gardenBed.crop}</p>
            </div>
          </div>

          {showDetails && (
            <>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-forest-600">
                  <User size={14} />
                  <span>种植人：{gardenBed.growerName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-forest-600">
                  <Clock size={14} />
                  <span>播种：{formatDate(gardenBed.plantDate)}（{daysSincePlanted} 天）</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-forest-600">
                  <ShadeIcon size={14} />
                  <span>{SHADE_CONDITION_LABELS[gardenBed.shadeCondition]}</span>
                </div>
                {gardenBed.lastWateredAt && (
                  <div className="flex items-center gap-2 text-sm text-forest-600">
                    <Droplets size={14} />
                    <span>上次浇水：{formatRelativeTime(gardenBed.lastWateredAt)}</span>
                  </div>
                )}
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-forest-600 mb-1.5">
                  <span>生长进度</span>
                  <span className="font-medium text-primary-600">{progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GardenBedCard;
