import { Coffee, Droplets, Flame } from 'lucide-react';
import type { FlavorWithStock } from '../../types';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '../../utils/date';

interface FlavorCardProps {
  flavor: FlavorWithStock;
  onConsume?: () => void;
  onEdit?: () => void;
  onClick?: () => void;
  index?: number;
}

const roastLevelLabels = {
  light: '浅烘',
  medium: '中烘',
  dark: '深烘',
};

export function FlavorCard({ flavor, onConsume, onEdit, onClick, index = 0 }: FlavorCardProps) {
  const animationDelay = `${index * 0.05}s`;

  return (
    <div
      className={`card-hover group animate-fade-in-up ${onClick ? 'cursor-pointer' : ''}`}
      style={{ animationDelay, opacity: 0 }}
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden bg-cream-100">
        <img
          src={flavor.boxPhoto}
          alt={flavor.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <StatusBadge status={flavor.stockStatus} />
        </div>
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="absolute top-3 left-3 btn-ghost p-2 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            编辑
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-display text-lg font-bold text-coffee-900">{flavor.name}</h3>
            <p className="text-sm text-coffee-500">{flavor.brand}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-bold text-coffee-800">{flavor.totalStock}</p>
            <p className="text-xs text-coffee-500">颗库存</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-coffee-600 mb-3">
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-accent-orange" />
            强度 {flavor.intensity}/12
          </span>
          <span className="flex items-center gap-1">
            <Coffee className="w-3.5 h-3.5 text-coffee-600" />
            {roastLevelLabels[flavor.roastLevel]}
          </span>
          <span className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            ¥{flavor.unitPrice.toFixed(1)}
          </span>
        </div>

        {flavor.nearestExpiry && (
          <p className="text-xs text-coffee-400 mb-3">
            最近过期: {formatDate(flavor.nearestExpiry)}
          </p>
        )}

        {onConsume && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConsume();
            }}
            disabled={flavor.totalStock === 0 || flavor.stockStatus === 'expired'}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            快速取用
          </button>
        )}
      </div>
    </div>
  );
}
