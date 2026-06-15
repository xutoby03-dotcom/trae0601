import { Coffee, Droplets, Thermometer, Timer, Scale, Filter as FilterIcon, Gauge } from 'lucide-react';
import { useCoffeeStore } from '@/store/coffeeStore';
import { ROAST_LABELS } from '@/types';
import { useMemo } from 'react';

export default function TodayRecommendedCard() {
  const records = useCoffeeStore((s) => s.records);

  const recommended = useMemo(() => {
    return records.find((r) => r.isTodayRecommended) || null;
  }, [records]);

  if (!recommended) {
    return (
      <div className="card card-hover border-2 border-dashed border-coffee-300 bg-coffee-50/50">
        <div className="p-8 text-center">
          <Coffee className="w-12 h-12 mx-auto text-coffee-400 mb-3" strokeWidth={1.5} />
          <h3 className="font-display text-xl font-semibold text-coffee-600 mb-2">暂无今日推荐</h3>
          <p className="text-sm text-coffee-500">在参数表中选择一条记录，标记为今日推荐</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-hover border-2 border-matcha shadow-lg animate-fade-in-up">
      <div className="bg-matcha px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Coffee className="w-5 h-5" />
          <span className="font-semibold">今天推荐刻度</span>
        </div>
        <span className="badge bg-white/20 text-white">
          {ROAST_LABELS[recommended.roastLevel]}
        </span>
      </div>
      <div className="p-6">
        <div className="mb-4">
          <h2 className="font-display text-2xl font-bold text-coffee-800 mb-1">
            {recommended.beanName}
          </h2>
          <p className="text-sm text-coffee-500">批次：{recommended.batchDate}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-coffee-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-coffee-500 text-xs mb-1">
              <Gauge className="w-3.5 h-3.5" />
              <span>{recommended.grinder}</span>
            </div>
            <p className="text-2xl font-bold text-coffee-800">
              {recommended.grindSetting}
              <span className="text-sm font-normal text-coffee-500 ml-1">格</span>
            </p>
          </div>

          <div className="bg-coffee-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-coffee-500 text-xs mb-1">
              <Thermometer className="w-3.5 h-3.5" />
              <span>水温</span>
            </div>
            <p className="text-2xl font-bold text-coffee-800">
              {recommended.waterTemp}
              <span className="text-sm font-normal text-coffee-500 ml-1">℃</span>
            </p>
          </div>

          <div className="bg-coffee-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-coffee-500 text-xs mb-1">
              <Scale className="w-3.5 h-3.5" />
              <span>粉水比</span>
            </div>
            <p className="text-2xl font-bold text-coffee-800">{recommended.ratio}</p>
          </div>

          <div className="bg-coffee-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-coffee-500 text-xs mb-1">
              <Droplets className="w-3.5 h-3.5" />
              <span>注水段数</span>
            </div>
            <p className="text-2xl font-bold text-coffee-800">
              {recommended.pourStages}
              <span className="text-sm font-normal text-coffee-500 ml-1">段</span>
            </p>
          </div>

          <div className="bg-coffee-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-coffee-500 text-xs mb-1">
              <Timer className="w-3.5 h-3.5" />
              <span>出杯时间</span>
            </div>
            <p className="text-2xl font-bold text-coffee-800">
              {recommended.brewTime}
              <span className="text-sm font-normal text-coffee-500 ml-1">秒</span>
            </p>
          </div>

          <div className="bg-coffee-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-coffee-500 text-xs mb-1">
              <FilterIcon className="w-3.5 h-3.5" />
              <span>滤杯</span>
            </div>
            <p className="text-2xl font-bold text-coffee-800 text-lg">{recommended.dripper}</p>
          </div>
        </div>

        {recommended.flavorNotes && (
          <div className="mt-4 pt-4 border-t border-coffee-100">
            <p className="text-sm text-coffee-600 italic">
              <span className="font-medium not-italic text-coffee-700">风味：</span>
              {recommended.flavorNotes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
