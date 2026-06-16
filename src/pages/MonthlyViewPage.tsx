import { Link } from 'react-router-dom';
import {
  Repeat,
  Clock,
  AlertTriangle,
  Layers,
  Leaf,
  ChevronRight,
  CalendarDays,
  AlertCircle,
  Ruler,
  Sparkles,
  AlertOctagon,
  TrendingDown,
  Package,
} from 'lucide-react';
import { format, differenceInMonths, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { usePlantStore } from '../store/plantStore';

export default function MonthlyViewPage() {
  const plants = usePlantStore((s) => s.plants);
  const repotRecords = usePlantStore((s) => s.repotRecords);
  const soilInventories = usePlantStore((s) => s.soilInventories);
  const isPlantInRecovery = usePlantStore((s) => s.isPlantInRecovery);
  const getRecoveryDaysLeft = usePlantStore((s) => s.getRecoveryDaysLeft);
  const getRepotRecordsByPlantId = usePlantStore((s) => s.getRepotRecordsByPlantId);

  const currentMonth = format(new Date(), 'yyyy年M月', { locale: zhCN });

  const plantsNeedingRepot = plants
    .filter((p) => p.isAlive)
    .map((p) => {
      const records = getRepotRecordsByPlantId(p.id);
      const lastRepot = records[0];
      const monthsSinceRepot = lastRepot
        ? differenceInMonths(new Date(), parseISO(lastRepot.date))
        : differenceInMonths(new Date(), parseISO(p.createdAt));
      return { plant: p, monthsSinceRepot, lastRepot };
    })
    .filter((x) => x.monthsSinceRepot >= 12)
    .sort((a, b) => b.monthsSinceRepot - a.monthsSinceRepot);

  const recoveringPlants = plants
    .filter((p) => p.isAlive && isPlantInRecovery(p.id))
    .map((p) => ({
      plant: p,
      daysLeft: getRecoveryDaysLeft(p.id),
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const deadPlants = plants.filter((p) => !p.isAlive);

  const lowSoilStock = soilInventories.filter(
    (s) => s.remainingLiters <= s.thresholdLiters
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-forest-800 flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-forest-600" />
            月度视图
          </h2>
          <p className="text-forest-500 mt-1 text-sm">{currentMonth} · 养护概览</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 animate-slide-up" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-clay-100 flex items-center justify-center">
              <Repeat className="w-5 h-5 text-clay-600" />
            </div>
            <div>
              <p className="text-2xl font-serif font-semibold text-forest-800">
                {plantsNeedingRepot.length}
              </p>
              <p className="text-xs text-forest-500">待换盆</p>
            </div>
          </div>
        </div>
        <div className="card p-4 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-leaf-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-leaf-600" />
            </div>
            <div>
              <p className="text-2xl font-serif font-semibold text-forest-800">
                {recoveringPlants.length}
              </p>
              <p className="text-xs text-forest-500">缓苗期</p>
            </div>
          </div>
        </div>
        <div className="card p-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-serif font-semibold text-forest-800">
                {deadPlants.length}
              </p>
              <p className="text-xs text-forest-500">已枯萎</p>
            </div>
          </div>
        </div>
        <div className="card p-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center">
              <Layers className="w-5 h-5 text-forest-600" />
            </div>
            <div>
              <p className="text-2xl font-serif font-semibold text-forest-800">
                {lowSoilStock.length}
              </p>
              <p className="text-xs text-forest-500">土壤告急</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5 animate-slide-up border-clay-200" style={{ animationDelay: '200ms' }}>
          <h3 className="font-serif text-xl font-semibold text-forest-800 flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-clay-100 flex items-center justify-center">
              <Repeat className="w-4 h-4 text-clay-600" />
            </div>
            该换盆了
          </h3>

          {plantsNeedingRepot.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-forest-200 mx-auto mb-2" />
              <p className="text-sm text-forest-400">所有植物状态良好，无需换盆</p>
            </div>
          ) : (
            <div className="space-y-2">
              {plantsNeedingRepot.slice(0, 5).map(({ plant, monthsSinceRepot, lastRepot }) => (
                <Link
                  key={plant.id}
                  to={`/plants/${plant.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-cream-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {plant.latestPhotoUrl ? (
                        <img src={plant.latestPhotoUrl} alt={plant.name} className="w-full h-full object-cover" />
                      ) : (
                        <Leaf className="w-5 h-5 text-forest-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-forest-800 text-sm">{plant.name}</p>
                      <p className="text-xs text-forest-500">
                        {lastRepot
                          ? `上次换盆：${format(parseISO(lastRepot.date), 'M月d日', { locale: zhCN })}`
                          : `入养${monthsSinceRepot}个月未换盆`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="tag-clay">
                      <Ruler className="w-3 h-3" />
                      {plant.potDiameterCm}cm · {monthsSinceRepot}个月
                    </span>
                    <ChevronRight className="w-4 h-4 text-forest-300 group-hover:text-forest-500 transition-colors" />
                  </div>
                </Link>
              ))}
              {plantsNeedingRepot.length > 5 && (
                <p className="text-center text-xs text-forest-400 pt-2">
                  还有 {plantsNeedingRepot.length - 5} 盆需要关注
                </p>
              )}
            </div>
          )}
        </div>

        <div className="card p-5 animate-slide-up border-leaf-200" style={{ animationDelay: '250ms' }}>
          <h3 className="font-serif text-xl font-semibold text-forest-800 flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-leaf-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-leaf-600" />
            </div>
            刚缓苗 / 缓苗中
          </h3>

          {recoveringPlants.length === 0 ? (
            <div className="text-center py-8">
              <Leaf className="w-10 h-10 text-forest-200 mx-auto mb-2" />
              <p className="text-sm text-forest-400">暂无缓苗中的植物</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recoveringPlants.map(({ plant, daysLeft }) => (
                <Link
                  key={plant.id}
                  to={`/plants/${plant.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-leaf-50 transition-colors group bg-leaf-50/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {plant.latestPhotoUrl ? (
                        <img src={plant.latestPhotoUrl} alt={plant.name} className="w-full h-full object-cover" />
                      ) : (
                        <Leaf className="w-5 h-5 text-forest-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-forest-800 text-sm">{plant.name}</p>
                      <p className="text-xs text-forest-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-leaf-600" />
                        少浇水，观察黄叶掉叶
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-lg font-serif font-semibold text-leaf-600">{daysLeft}</p>
                      <p className="text-xs text-leaf-500">天</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-forest-300 group-hover:text-forest-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5 animate-slide-up border-gray-200" style={{ animationDelay: '300ms' }}>
          <h3 className="font-serif text-xl font-semibold text-forest-800 flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-gray-500" />
            </div>
            死亡原因复盘
          </h3>

          {deadPlants.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-forest-200 mx-auto mb-2" />
              <p className="text-sm text-forest-400">所有植物都还健康活着</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deadPlants.map((p) => (
                <Link
                  key={p.id}
                  to={`/plants/${p.id}`}
                  className="block p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-forest-700 text-sm">{p.name}</p>
                      {p.species && <p className="text-xs text-forest-400">{p.species}</p>}
                    </div>
                    {p.deathDate && (
                      <span className="text-xs text-gray-400">
                        {format(parseISO(p.deathDate), 'yyyy.M.d', { locale: zhCN })}
                      </span>
                    )}
                  </div>
                  {p.deathReason && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">
                        <TrendingDown className="w-3 h-3 inline mr-1 text-gray-400" />
                        {p.deathReason}
                      </p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5 animate-slide-up border-forest-200" style={{ animationDelay: '350ms' }}>
          <h3 className="font-serif text-xl font-semibold text-forest-800 flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-forest-600" />
            </div>
            土壤库存
          </h3>

          <div className="space-y-3">
            {soilInventories.map((s) => {
              const isLow = s.remainingLiters <= s.thresholdLiters;
              const percentage = Math.min(
                100,
                (s.remainingLiters / (s.thresholdLiters * 2)) * 100
              );

              return (
                <div key={s.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-forest-700">{s.name}</span>
                    <span
                      className={`text-sm font-semibold ${
                        isLow ? 'text-clay-600' : 'text-forest-600'
                      }`}
                    >
                      {s.remainingLiters} L
                      {isLow && <span className="ml-1 text-xs">· 需补货</span>}
                    </span>
                  </div>
                  <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isLow ? 'bg-clay-400' : 'bg-forest-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {lowSoilStock.length > 0 && (
            <div className="mt-4 p-3 bg-clay-50 rounded-xl border border-clay-200">
              <p className="text-xs text-clay-700 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-clay-500 mt-0.5 flex-shrink-0" />
                <span>
                  {lowSoilStock.map((s) => s.name).join('、')} 库存不足，请及时采购
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
