import { Snowflake, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { StorageZone } from '@/types';
import { useFoodStore } from '@/store/useFoodStore';
import { FoodCard } from '@/components/food/FoodCard';
import { STORAGE_ZONE_LABEL, STORAGE_ZONE_EMOJI } from '@/utils/constants';
import { clsx } from 'clsx';

const zones: StorageZone[] = ['fridge', 'freezer', 'door'];

export function ZoneTabs() {
  const [active, setActive] = useState<StorageZone>('fridge');
  const getFoodsByZone = useFoodStore((s) => s.getFoodsByZone);
  const foods = getFoodsByZone(active);

  const zoneCounts = zones.reduce((acc, z) => {
    acc[z] = getFoodsByZone(z).length;
    return acc;
  }, {} as Record<StorageZone, number>);

  return (
    <section>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-2 border-b border-slate-100 bg-slate-50/50">
          <div className="flex gap-2 p-1">
            {zones.map((zone) => (
              <button
                key={zone}
                onClick={() => setActive(zone)}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-medium text-sm transition-all duration-300',
                  active === zone
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200/50'
                    : 'text-slate-600 hover:bg-white hover:text-slate-800'
                )}
              >
                <Snowflake className={clsx('w-4 h-4', active === zone && 'animate-pulse')} />
                <span>{STORAGE_ZONE_EMOJI[zone]} {STORAGE_ZONE_LABEL[zone]}</span>
                <span className={clsx(
                  'px-2 py-0.5 rounded-lg text-xs font-semibold',
                  active === zone ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                )}>
                  {zoneCounts[zone]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {foods.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-6xl mb-4">
                {active === 'fridge' ? '❄️' : active === 'freezer' ? '🧊' : '🚪'}
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">
                {STORAGE_ZONE_LABEL[active]}空空如也
              </h3>
              <p className="text-sm text-slate-500">点击左下角按钮录入食材吧</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {foods.map((food, idx) => (
                <div key={food.id} style={{ animationDelay: `${idx * 50}ms` }}>
                  <FoodCard food={food} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
