import { useState } from 'react';
import {
  Package,
  Plus,
  Minus,
  Shirt,
  Sun,
  Snowflake,
  Activity,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  CLOTHING_TYPE_LABELS,
  SIZE_LIST,
  type ClothingType,
  type Size,
} from '@/types';

const clothingIcons: Record<ClothingType, typeof Shirt> = {
  summer_short: Sun,
  summer_long: Sun,
  winter_coat: Snowflake,
  sportswear: Activity,
};

export default function InventoryPage() {
  const inventory = useAppStore((s) => s.inventory);
  const updateInventory = useAppStore((s) => s.updateInventory);
  const [selectedType, setSelectedType] = useState<ClothingType>('summer_short');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustSize, setAdjustSize] = useState<Size>('150');
  const [adjustQuantity, setAdjustQuantity] = useState(1);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');

  const getQuantity = (size: Size) => {
    const item = inventory.find(
      (inv) => inv.clothingType === selectedType && inv.size === size
    );
    return item?.quantity || 0;
  };

  const totalQuantity = SIZE_LIST.reduce((sum, size) => sum + getQuantity(size), 0);

  const handleAdjust = () => {
    const delta = adjustType === 'in' ? adjustQuantity : -adjustQuantity;
    updateInventory(
      selectedType,
      adjustSize,
      delta,
      '王老师',
      adjustType === 'in' ? '手动入库' : '手动出库'
    );
    setShowAdjustModal(false);
    setAdjustQuantity(1);
  };

  const Icon = clothingIcons[selectedType];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">库存管理</h2>
          <p className="text-sm text-slate-500 mt-1">
            查看和管理各尺码校服库存
          </p>
        </div>
        <button
          onClick={() => setShowAdjustModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all active:scale-[0.98] shadow-sm shadow-blue-200"
        >
          <Package className="w-4 h-4" />
          库存调整
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.keys(CLOTHING_TYPE_LABELS) as ClothingType[]).map((type) => {
          const TypeIcon = clothingIcons[type];
          const total = SIZE_LIST.reduce(
            (sum, size) =>
              sum +
              (inventory.find((inv) => inv.clothingType === type && inv.size === size)
                ?.quantity || 0),
            0
          );
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedType === type
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <TypeIcon
                  className={`w-5 h-5 ${
                    selectedType === type ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    selectedType === type ? 'text-blue-700' : 'text-slate-600'
                  }`}
                >
                  {CLOTHING_TYPE_LABELS[type]}
                </span>
              </div>
              <div
                className={`text-2xl font-bold ${
                  selectedType === type ? 'text-blue-600' : 'text-slate-700'
                }`}
              >
                {total}
                <span className="text-sm font-normal text-slate-400 ml-1">件</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                {CLOTHING_TYPE_LABELS[selectedType]}
              </h3>
              <p className="text-sm text-slate-500">库存详情</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{totalQuantity}</div>
            <div className="text-xs text-slate-400">总库存</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  尺码
                </th>
                <th className="px-5 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  120
                </th>
                <th className="px-5 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  130
                </th>
                <th className="px-5 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  140
                </th>
                <th className="px-5 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  150
                </th>
                <th className="px-5 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  160
                </th>
                <th className="px-5 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  170
                </th>
                <th className="px-5 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  180
                </th>
                <th className="px-5 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  190
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-5 py-4 text-sm font-medium text-slate-700">
                  数量
                </td>
                {SIZE_LIST.map((size) => {
                  const qty = getQuantity(size);
                  return (
                    <td key={size} className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-lg font-semibold text-sm ${
                          qty === 0
                            ? 'bg-red-50 text-red-600'
                            : qty <= 3
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-green-50 text-green-600'
                        }`}
                      >
                        {qty}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAdjustModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
              <h3 className="text-lg font-semibold">库存调整</h3>
              <p className="text-sm text-blue-100 mt-0.5">
                {CLOTHING_TYPE_LABELS[selectedType]}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  调整类型
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAdjustType('in')}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      adjustType === 'in'
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    入库
                  </button>
                  <button
                    onClick={() => setAdjustType('out')}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      adjustType === 'out'
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                    出库
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  选择尺码
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {SIZE_LIST.map((size) => (
                    <button
                      key={size}
                      onClick={() => setAdjustSize(size)}
                      className={`py-2 rounded-lg font-medium text-sm transition-all ${
                        adjustSize === size
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  数量
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setAdjustQuantity(Math.max(1, adjustQuantity - 1))
                    }
                    className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={adjustQuantity}
                    onChange={(e) =>
                      setAdjustQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="flex-1 text-center py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                  <button
                    onClick={() => setAdjustQuantity(adjustQuantity + 1)}
                    className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAdjust}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-white transition-all active:scale-[0.98] ${
                    adjustType === 'in'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  确认{adjustType === 'in' ? '入库' : '出库'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
