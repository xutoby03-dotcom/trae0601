import React from 'react';
import { calculateCapacityRatio } from '../utils/calculations';
import type { RecoveryPoint } from '../types';

interface CapacityProgressProps {
  point?: RecoveryPoint;
  ratio?: number;
  showLabel?: boolean;
  currentKg?: number;
  capacityKg?: number;
}

export const CapacityProgress: React.FC<CapacityProgressProps> = ({
  point,
  ratio: propRatio,
  showLabel = true,
  currentKg,
  capacityKg,
}) => {
  const ratio = propRatio !== undefined ? propRatio : (point ? calculateCapacityRatio(point) : 0);
  const percentage = Math.round(ratio * 100);
  const current = currentKg !== undefined ? currentKg : (point ? point.currentKg : 0);
  const capacity = capacityKg !== undefined ? capacityKg : (point ? point.capacityKg : 0);
  
  const getColor = () => {
    if (ratio >= 0.9) return 'bg-orange-500';
    if (ratio >= 0.7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">容量</span>
          <span className="font-medium text-gray-900">
            {current.toFixed(1)}/{capacity} kg
          </span>
        </div>
      )}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} rounded-full transition-all duration-500 ${
            ratio >= 0.9 ? 'animate-pulse' : ''
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-right text-xs text-gray-500 mt-1">
          {percentage}%
        </div>
      )}
    </div>
  );
};
