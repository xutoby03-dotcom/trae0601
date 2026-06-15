import { useState, useMemo } from 'react';
import { BarChart3, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  CLOTHING_TYPE_LABELS,
  SIZE_LIST,
  type ClothingType,
  type Size,
} from '@/types';

export default function ShortagePage() {
  const getShortageByClass = useAppStore((s) => s.getShortageByClass);
  const inventory = useAppStore((s) => s.inventory);
  const [selectedType, setSelectedType] = useState<ClothingType>('summer_short');

  const shortageData = useMemo(() => {
    return getShortageByClass();
  }, [getShortageByClass]);

  const classes = Object.keys(shortageData).sort();

  const getNetShortage = (className: string, size: Size) => {
    return shortageData[className]?.[selectedType]?.[size] || 0;
  };

  const getTotalBySize = (size: Size) => {
    return classes.reduce((sum, cls) => sum + getNetShortage(cls, size), 0);
  };

  const getInventoryQty = (size: Size) => {
    const item = inventory.find(
      (inv) => inv.clothingType === selectedType && inv.size === size
    );
    return item?.quantity || 0;
  };

  const getShortageColor = (value: number) => {
    if (value > 0) {
      if (value >= 3) return 'bg-red-100 text-red-700 border-red-200';
      if (value >= 2) return 'bg-orange-100 text-orange-700 border-orange-200';
      return 'bg-amber-50 text-amber-600 border-amber-200';
    }
    if (value < 0) {
      return 'bg-green-50 text-green-600 border-green-200';
    }
    return 'bg-slate-50 text-slate-500 border-slate-200';
  };

  const totalDemand = classes.reduce(
    (sum, cls) =>
      sum +
      SIZE_LIST.reduce((s, size) => {
        const v = getNetShortage(cls, size);
        return s + (v > 0 ? v : 0);
      }, 0),
    0
  );

  const totalSupply = classes.reduce(
    (sum, cls) =>
      sum +
      SIZE_LIST.reduce((s, size) => {
        const v = getNetShortage(cls, size);
        return s + (v < 0 ? -v : 0);
      }, 0),
    0
  );

  const netShortage = totalDemand - totalSupply;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">尺码缺口表</h2>
          <p className="text-sm text-slate-500 mt-1">
            按班级、尺码、衣服类型统计缺口
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <div className="text-sm text-slate-500">需求缺口</div>
              <div className="text-2xl font-bold text-red-600">
                {totalDemand}
                <span className="text-sm font-normal text-slate-400 ml-1">件</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <div className="text-sm text-slate-500">可供调换</div>
              <div className="text-2xl font-bold text-green-600">
                {totalSupply}
                <span className="text-sm font-normal text-slate-400 ml-1">件</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-sm text-slate-500">净缺口</div>
              <div
                className={`text-2xl font-bold ${
                  netShortage > 0
                    ? 'text-orange-600'
                    : netShortage < 0
                    ? 'text-green-600'
                    : 'text-slate-600'
                }`}
              >
                {netShortage > 0 ? '+' : ''}
                {netShortage}
                <span className="text-sm font-normal text-slate-400 ml-1">件</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(Object.keys(CLOTHING_TYPE_LABELS) as ClothingType[]).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedType === type
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {CLOTHING_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">
            {CLOTHING_TYPE_LABELS[selectedType]} - 尺码缺口详情
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            正数表示需要调入，负数表示可调出
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10">
                  班级
                </th>
                {SIZE_LIST.map((size) => (
                  <th
                    key={size}
                    className="px-3 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[60px]"
                  >
                    {size}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  合计
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.map((cls) => {
                const classTotal = SIZE_LIST.reduce(
                  (sum, size) => sum + getNetShortage(cls, size),
                  0
                );
                return (
                  <tr key={cls} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-700 sticky left-0 bg-white z-10">
                      {cls}
                    </td>
                    {SIZE_LIST.map((size) => {
                      const value = getNetShortage(cls, size);
                      return (
                        <td key={size} className="px-3 py-3 text-center">
                          {value !== 0 ? (
                            <span
                              className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-lg text-sm font-medium border ${
                                getShortageColor(value)
                              }`}
                            >
                              {value > 0 ? '+' : ''}
                              {value}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`font-semibold text-sm ${
                          classTotal > 0
                            ? 'text-red-600'
                            : classTotal < 0
                            ? 'text-green-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {classTotal > 0 ? '+' : ''}
                        {classTotal}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50/80 border-t-2 border-slate-200">
                <td className="px-4 py-3 text-sm font-semibold text-slate-700 sticky left-0 bg-slate-50 z-10">
                  年级合计
                </td>
                {SIZE_LIST.map((size) => {
                  const value = getTotalBySize(size);
                  return (
                    <td key={size} className="px-3 py-3 text-center">
                      <span
                        className={`font-bold text-sm ${
                          value > 0
                            ? 'text-red-600'
                            : value < 0
                            ? 'text-green-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {value > 0 ? '+' : ''}
                        {value}
                      </span>
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-center">
                  <span
                    className={`font-bold ${
                      netShortage > 0
                        ? 'text-red-600'
                        : netShortage < 0
                        ? 'text-green-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {netShortage > 0 ? '+' : ''}
                    {netShortage}
                  </span>
                </td>
              </tr>
              <tr className="bg-blue-50/50">
                <td className="px-4 py-3 text-sm font-semibold text-blue-700 sticky left-0 bg-blue-50/50 z-10">
                  现有库存
                </td>
                {SIZE_LIST.map((size) => {
                  const qty = getInventoryQty(size);
                  return (
                    <td key={size} className="px-3 py-3 text-center">
                      <span
                        className={`font-medium text-sm ${
                          qty === 0
                            ? 'text-red-500'
                            : qty <= 2
                            ? 'text-amber-500'
                            : 'text-blue-600'
                        }`}
                      >
                        {qty}
                      </span>
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-center">
                  <span className="font-semibold text-blue-700">
                    {SIZE_LIST.reduce((sum, s) => sum + getInventoryQty(s), 0)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h4 className="font-medium text-slate-700 mb-3">图例说明</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-red-100 border border-red-200"></span>
            <span className="text-slate-600">严重缺口 (≥3件)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-orange-100 border border-orange-200"></span>
            <span className="text-slate-600">中等缺口 (2件)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-amber-50 border border-amber-200"></span>
            <span className="text-slate-600">轻微缺口 (1件)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-green-50 border border-green-200"></span>
            <span className="text-slate-600">可调出 (负数)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-slate-50 border border-slate-200"></span>
            <span className="text-slate-600">无缺口</span>
          </div>
        </div>
      </div>
    </div>
  );
}
