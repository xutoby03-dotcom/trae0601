import { useState } from 'react';
import { Plus, Minus, Check, Package, AlertCircle, ChefHat } from 'lucide-react';
import { usePotStore } from '../store/usePotStore';
import { Card } from '../components/ui';
import { cn } from '../lib/utils';
import type { ItemName } from '../types';

const itemOptions: { value: ItemName; label: string; emoji: string }[] = [
  { value: '鸭脖', label: '鸭脖', emoji: '🦆' },
  { value: '鸡爪', label: '鸡爪', emoji: '🐔' },
  { value: '豆干', label: '豆干', emoji: '🫘' },
];

const complaintTypes = [
  '口味偏咸',
  '口味偏淡',
  '香味不足',
  '颜色不对',
  '口感问题',
  '其他',
];

export default function Production() {
  const { pots, addProductionBatch, addComplaint, currentOperator } = usePotStore();
  const [selectedPotId, setSelectedPotId] = useState(pots[0]?.id || '');
  const [selectedItem, setSelectedItem] = useState<ItemName>('鸭脖');
  const [quantity, setQuantity] = useState(20);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [complaintType, setComplaintType] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');

  const allBatches = pots
    .flatMap((pot) =>
      pot.productionBatches.map((batch) => ({
        ...batch,
        potName: pot.name,
      }))
    )
    .sort((a, b) => new Date(b.outTime).getTime() - new Date(a.outTime).getTime());

  const handleSubmit = () => {
    addProductionBatch(selectedPotId, {
      itemName: selectedItem,
      quantity,
      outTime: new Date().toISOString(),
      operator: currentOperator,
      hasComplaint: false,
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleComplaintClick = (batchId: string) => {
    setSelectedBatchId(batchId);
    setComplaintType('');
    setComplaintDesc('');
    setShowComplaintModal(true);
  };

  const handleSubmitComplaint = () => {
    if (!selectedBatchId || !complaintType) return;

    addComplaint(selectedBatchId, {
      complaintType,
      description: complaintDesc,
    });

    setShowComplaintModal(false);
    setSelectedBatchId(null);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">出品记录</h1>
          <p className="text-stone-500 mt-1">每批出品挂到具体卤锅，方便追溯品质</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg animate-slide-up">
            <Check className="w-5 h-5" />
            <span className="font-medium">已登记出品</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="批次登记">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                选择卤锅
              </label>
              <div className="grid grid-cols-4 gap-2">
                {pots.map((pot) => (
                  <button
                    key={pot.id}
                    onClick={() => setSelectedPotId(pot.id)}
                    className={cn(
                      'p-2.5 rounded-lg border-2 transition-all text-center',
                      selectedPotId === pot.id
                        ? 'border-braised-red-500 bg-braised-red-50'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    )}
                  >
                    <p className="font-medium text-sm text-stone-800">{pot.name}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{pot.soupLevel}% 汤位</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                选择品类
              </label>
              <div className="grid grid-cols-3 gap-3">
                {itemOptions.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setSelectedItem(item.value)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all text-center',
                      selectedItem === item.value
                        ? 'border-braised-red-500 bg-braised-red-50'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    )}
                  >
                    <span className="text-3xl">{item.emoji}</span>
                    <p className="mt-2 font-medium text-stone-800">{item.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                数量（斤）
              </label>
              <div className="flex items-center justify-center gap-4 p-4 bg-stone-50 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 5))}
                  className="w-12 h-12 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-5 h-5 text-stone-500" />
                </button>
                <div className="text-center min-w-[100px]">
                  <span className="text-4xl font-bold font-mono text-stone-800">
                    {quantity}
                  </span>
                  <p className="text-sm text-stone-500 mt-1">斤</p>
                </div>
                <button
                  onClick={() => setQuantity(quantity + 5)}
                  className="w-12 h-12 rounded-xl bg-braised-red-500 hover:bg-braised-red-600 flex items-center justify-center transition-colors text-white"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-stone-500">
                <ChefHat className="w-4 h-4 inline mr-1" />
                操作员：{currentOperator}
              </div>
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-braised-red-600 hover:bg-braised-red-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                <Package className="w-5 h-5" />
                登记出锅
              </button>
            </div>
          </div>
        </Card>

        <Card title="今日统计">
          <div className="space-y-4">
            {itemOptions.map((item) => {
              const todayBatches = allBatches.filter(
                (b) =>
                  b.itemName === item.value &&
                  new Date(b.outTime).toDateString() === new Date().toDateString()
              );
              const totalQty = todayBatches.reduce((sum, b) => sum + b.quantity, 0);
              const complaintCount = todayBatches.filter((b) => b.hasComplaint).length;

              return (
                <div
                  key={item.value}
                  className="flex items-center justify-between p-4 bg-stone-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.emoji}</span>
                    <div>
                      <p className="font-medium text-stone-800">{item.label}</p>
                      <p className="text-xs text-stone-500">{todayBatches.length} 批次</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold font-mono text-stone-800">
                      {totalQty}
                      <span className="text-sm font-normal text-stone-500 ml-1">斤</span>
                    </p>
                    {complaintCount > 0 && (
                      <p className="text-xs text-red-500 mt-0.5">{complaintCount} 单客诉</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card title="出品记录">
        {allBatches.length === 0 ? (
          <p className="text-stone-400 text-center py-8">暂无出品记录</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-stone-500 border-b border-stone-200">
                  <th className="text-left py-3 px-4 font-medium">出锅时间</th>
                  <th className="text-left py-3 px-4 font-medium">卤锅</th>
                  <th className="text-left py-3 px-4 font-medium">品类</th>
                  <th className="text-right py-3 px-4 font-medium">数量</th>
                  <th className="text-left py-3 px-4 font-medium">操作人</th>
                  <th className="text-center py-3 px-4 font-medium">状态</th>
                  <th className="text-center py-3 px-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {allBatches.map((batch) => (
                  <tr key={batch.id} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="py-3 px-4 text-stone-600">
                      {new Date(batch.outTime).toLocaleString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-braised-red-100 text-braised-red-700 text-xs rounded-full font-medium">
                        {batch.potName}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-stone-800">{batch.itemName}</td>
                    <td className="py-3 px-4 text-right font-mono text-stone-700">
                      {batch.quantity} 斤
                    </td>
                    <td className="py-3 px-4 text-stone-600">{batch.operator}</td>
                    <td className="py-3 px-4 text-center">
                      {batch.hasComplaint ? (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                          有客诉
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                          正常
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {!batch.hasComplaint && (
                        <button
                          onClick={() => handleComplaintClick(batch.id)}
                          className="text-stone-400 hover:text-red-500 transition-colors text-xs"
                        >
                          标记客诉
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showComplaintModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-stone-800">标记客诉</h3>
                <p className="text-sm text-stone-500">请选择客诉类型</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  客诉类型
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {complaintTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setComplaintType(type)}
                      className={cn(
                        'px-3 py-2 rounded-lg border text-sm transition-all',
                        complaintType === type
                          ? 'border-red-500 bg-red-50 text-red-700 font-medium'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  详细描述
                </label>
                <textarea
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  placeholder="请描述具体情况..."
                  className="w-full h-20 px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowComplaintModal(false)}
                className="flex-1 px-4 py-2.5 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitComplaint}
                disabled={!complaintType}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors',
                  complaintType
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                )}
              >
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
