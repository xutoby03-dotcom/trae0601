import { Calendar, MapPin, Scale, Sparkles, Clock } from 'lucide-react';
import type { CoffeeBean } from '../types';
import { StatusBadge } from './StatusBadge';
import { getFlavorStatus, getRecommendedOpenDate, getStatusTip } from '../utils/flavorUtils';
import { formatDateChinese } from '../utils/dateUtils';
import { getFlavorStatusBorderColor } from '../utils/flavorUtils';

interface BeanCardProps {
  bean: CoffeeBean;
  onSetPick?: () => void;
  onDispense?: () => void;
  onRecordWaste?: () => void;
}

export function BeanCard({ bean, onSetPick, onDispense, onRecordWaste }: BeanCardProps) {
  const status = getFlavorStatus(bean);
  const borderColor = getFlavorStatusBorderColor(status);
  const recommendedDate = getRecommendedOpenDate(bean);
  const tip = getStatusTip(bean);
  const weightPercent = (bean.remainingWeight / bean.totalWeight) * 100;

  const canPick = status === 'best';

  return (
    <div
      className={`relative bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border-l-4 ${borderColor}`}
    >
      {bean.isTodayPick && canPick && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            <Sparkles className="w-3 h-3" />
            今日主推
          </span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-stone-800 leading-tight mb-1">
              {bean.name}
            </h3>
            <div className="flex items-center gap-1 text-stone-500 text-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span>{bean.origin}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="inline-block text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-md">
            {bean.processMethod}
          </span>
          <span className="inline-block text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-md">
            {bean.roastLevel}
          </span>
          <StatusBadge status={status} size="sm" />
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Calendar className="w-4 h-4 text-stone-400" />
            <span>烘焙日：{formatDateChinese(bean.roastDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Clock className="w-4 h-4 text-stone-400" />
            <span>建议开袋：{formatDateChinese(recommendedDate)}</span>
          </div>
        </div>

        <p className={`text-sm mb-4 ${
          status === 'expired' ? 'text-red-600 font-medium' :
          status === 'nearExpiry' ? 'text-amber-600 font-medium' :
          'text-stone-500'
        }`}>
          {tip}
        </p>

        <div className="mb-2">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-sm text-stone-500 flex items-center gap-1">
              <Scale className="w-4 h-4" />
              剩余克数
            </span>
            <span className="text-xl font-bold text-stone-800">
              {bean.remainingWeight}
              <span className="text-sm font-normal text-stone-400 ml-1">g</span>
            </span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                weightPercent > 50 ? 'bg-emerald-500' :
                weightPercent > 20 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${weightPercent}%` }}
            />
          </div>
          <p className="text-xs text-stone-400 mt-1 text-right">
            总量 {bean.totalWeight}g
          </p>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
          <button
            onClick={onSetPick}
            disabled={!canPick || bean.isTodayPick}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${
              !canPick
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : bean.isTodayPick
                ? 'bg-orange-100 text-orange-700 cursor-default'
                : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'
            }`}
          >
            {!canPick ? '未到风味期' : bean.isTodayPick ? '已设主推' : '设为主推'}
          </button>
          <button
            onClick={onDispense}
            disabled={bean.remainingWeight < 18}
            className="flex-1 py-2 px-3 text-sm font-medium rounded-lg bg-stone-800 text-white hover:bg-stone-900 active:scale-95 transition-all disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
          >
            出杯扣减
          </button>
          <button
            onClick={onRecordWaste}
            className="py-2 px-3 text-sm font-medium rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 active:scale-95 transition-all"
          >
            损耗
          </button>
        </div>
      </div>
    </div>
  );
}
