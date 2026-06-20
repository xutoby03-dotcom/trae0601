import { Link } from 'react-router-dom';
import { DAMAGE_LABEL_MAP } from '@/utils/constants';
import type { AlertItem, Toy } from '@/types';

interface AlertCardItemProps {
  alert: AlertItem & { toy: Toy };
  animationDelay?: number;
}

export default function AlertCardItem({ alert, animationDelay = 0 }: AlertCardItemProps) {
  const damageMeta = DAMAGE_LABEL_MAP.get(alert.type);

  return (
    <div
      className="relative p-4 rounded-2xl-plus bg-gradient-to-r from-alert-50 to-white border-2 border-alert-100 shadow-soft opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="absolute inset-0 rounded-2xl-plus border border-alert-200/60 animate-pulse-glow pointer-events-none" />
      <div className="relative flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-alert-100 flex items-center justify-center text-xl shrink-0">
          ⚠️
        </div>
        <div className="flex-1 min-w-0">
          <Link
            to={`/toys/${alert.toy.id}`}
            className="font-bold text-gray-800 hover:text-alert-400 transition-colors truncate block mb-1"
          >
            {alert.toy.name}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="tag bg-white/80 text-alert-400 border border-alert-100">
              {damageMeta?.icon || '❓'} {damageMeta?.label || '异常'}
            </span>
            <span className="tag bg-alert-400 text-white">建议停用</span>
          </div>
          {alert.notes && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{alert.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}
