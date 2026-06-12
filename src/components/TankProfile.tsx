import { Droplets, Thermometer, Filter, User } from 'lucide-react';
import { useFishTankStore } from '@/store/useFishTankStore';
import { cn } from '@/lib/utils';

const statusConfig = {
  healthy: { label: '健康', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  sick: { label: '生病', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  quarantine: { label: '隔离', color: 'bg-amber-100 text-amber-700 border-amber-200' },
};

export default function TankProfile() {
  const { tank, fishes } = useFishTankStore();

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-sky-100 hover:shadow-xl transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={tank.photo}
          alt={tank.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sky-900/70 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6">
          <h2 className="text-2xl font-bold text-white mb-1">{tank.name}</h2>
          <p className="text-sky-100 text-sm flex items-center gap-1">
            <User size={14} />
            <span>负责人：{tank.owner}</span>
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-sky-50 rounded-xl p-4 text-center">
          <div className="flex justify-center mb-2">
            <Droplets className="text-sky-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-sky-900">{tank.capacity}<span className="text-sm font-normal text-sky-600">L</span></div>
          <div className="text-xs text-sky-500 mt-1">容量</div>
        </div>

        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <div className="flex justify-center mb-2">
            <Filter className="text-emerald-600" size={24} />
          </div>
          <div className="text-sm font-medium text-emerald-900">{tank.filterType}</div>
          <div className="text-xs text-emerald-500 mt-1">过滤系统</div>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="flex justify-center mb-2">
            <Thermometer className="text-amber-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-amber-900">
            {tank.minTemp}-{tank.maxTemp}<span className="text-sm font-normal">°C</span>
          </div>
          <div className="text-xs text-amber-500 mt-1">水温范围</div>
        </div>

        <div className="bg-rose-50 rounded-xl p-4 text-center">
          <div className="text-3xl mb-1">🐠</div>
          <div className="text-2xl font-bold text-rose-900">{fishes.length}<span className="text-sm font-normal">条</span></div>
          <div className="text-xs text-rose-500 mt-1">鱼只数量</div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>🐟</span>
          <span>鱼只清单</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {fishes.map((fish) => (
            <div
              key={fish.id}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
            >
              <span className="text-xl">{fish.avatar}</span>
              <div>
                <div className="text-sm font-medium text-gray-800">{fish.name}</div>
                <div className="text-xs text-gray-500">{fish.species}</div>
              </div>
              <span className={cn(
                'ml-2 px-2 py-0.5 text-xs rounded-full border',
                statusConfig[fish.status].color
              )}>
                {statusConfig[fish.status].label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}
