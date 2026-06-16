import { Coffee, Settings } from 'lucide-react';
import type { Grinder, CoffeeBean } from '../types';
import { getFlavorStatus } from '../utils/flavorUtils';
import { StatusBadge } from './StatusBadge';

interface GrinderCardProps {
  grinder: Grinder;
  bean?: CoffeeBean;
  onDispense: (grams: number) => void;
  onBind: () => void;
}

export function GrinderCard({ grinder, bean, onDispense, onBind }: GrinderCardProps) {
  const weightPercent = bean ? (bean.remainingWeight / bean.totalWeight) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
              <Coffee className="w-6 h-6 text-stone-600" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800">{grinder.name}</h3>
              {bean ? (
                <StatusBadge status={getFlavorStatus(bean)} size="sm" />
              ) : (
                <span className="text-xs text-stone-400">未绑定豆仓</span>
              )}
            </div>
          </div>
          <button
            onClick={onBind}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {bean ? (
          <>
            <div className="mb-4">
              <p className="text-sm font-medium text-stone-700 mb-1">{bean.name}</p>
              <p className="text-xs text-stone-500">{bean.origin}</p>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-stone-500">剩余豆量</span>
                <span className="text-lg font-bold text-stone-800">
                  {bean.remainingWeight}
                  <span className="text-xs font-normal text-stone-400 ml-1">g</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    weightPercent > 50 ? 'bg-emerald-500' :
                    weightPercent > 20 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${weightPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onDispense(18)}
                disabled={bean.remainingWeight < 18}
                className="py-3 px-4 text-sm font-semibold rounded-lg bg-stone-800 text-white hover:bg-stone-900 active:scale-95 transition-all disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
              >
                单份 18g
              </button>
              <button
                onClick={() => onDispense(36)}
                disabled={bean.remainingWeight < 36}
                className="py-3 px-4 text-sm font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:scale-95 transition-all disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
              >
                双份 36g
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Coffee className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-400 text-sm mb-3">尚未绑定咖啡豆</p>
            <button
              onClick={onBind}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-stone-800 text-white hover:bg-stone-900 transition-colors"
            >
              绑定豆仓
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
