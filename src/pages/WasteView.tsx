import { useState } from 'react';
import { TrendingDown, ArrowLeft, Plus, Filter } from 'lucide-react';
import { useCoffeeStore } from '../store/useCoffeeStore';
import type { WasteType } from '../types';
import { formatDateChinese } from '../utils/dateUtils';

export function WasteView() {
  const { wasteRecords, beans, recordWaste, getBeanById } = useCoffeeStore();
  const [filterType, setFilterType] = useState<WasteType | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedBeanId, setSelectedBeanId] = useState('');
  const [wasteType, setWasteType] = useState<WasteType>('试机');
  const [wasteWeight, setWasteWeight] = useState('');
  const [wasteNote, setWasteNote] = useState('');

  const filteredRecords = wasteRecords.filter(
    (r) => filterType === 'all' || r.wasteType === filterType
  );

  const totalWaste = wasteRecords.reduce((sum, r) => sum + r.weight, 0);
  const wasteByType = wasteRecords.reduce((acc, r) => {
    acc[r.wasteType] = (acc[r.wasteType] || 0) + r.weight;
    return acc;
  }, {} as Record<string, number>);

  const handleSubmit = () => {
    if (!selectedBeanId || !wasteWeight) return;
    recordWaste(selectedBeanId, wasteType, Number(wasteWeight), wasteNote);
    setShowForm(false);
    setSelectedBeanId('');
    setWasteWeight('');
    setWasteNote('');
  };

  const availableBeans = beans.filter((b) => b.remainingWeight > 0);

  const wasteTypeColors: Record<string, string> = {
    '试机': 'bg-blue-100 text-blue-700',
    '撒漏': 'bg-amber-100 text-amber-700',
    '校磨': 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 -ml-2 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-stone-800">损耗记录</h1>
                  <p className="text-sm text-stone-500">试机 · 撒漏 · 校磨</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">记一笔</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-stone-200">
            <p className="text-sm text-stone-500 mb-1">总损耗</p>
            <p className="text-2xl font-bold text-stone-800">
              {totalWaste}<span className="text-sm font-normal text-stone-400 ml-1">g</span>
            </p>
          </div>
          {(['试机', '撒漏', '校磨'] as WasteType[]).map((type) => (
            <div key={type} className="bg-white rounded-xl p-4 border border-stone-200">
              <p className="text-sm text-stone-500 mb-1">{type}</p>
              <p className="text-2xl font-bold text-stone-800">
                {wasteByType[type] || 0}<span className="text-sm font-normal text-stone-400 ml-1">g</span>
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <h2 className="font-medium text-stone-800">记录列表</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-stone-400" />
              <div className="flex gap-1">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    filterType === 'all'
                      ? 'bg-stone-800 text-white'
                      : 'text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  全部
                </button>
                {(['试机', '撒漏', '校磨'] as WasteType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      filterType === type
                        ? 'bg-stone-800 text-white'
                        : 'text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {filteredRecords.length === 0 ? (
              <div className="py-12 text-center">
                <TrendingDown className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-400">暂无损耗记录</p>
              </div>
            ) : (
              filteredRecords.map((record) => {
                const bean = getBeanById(record.beanId);
                return (
                  <div
                    key={record.id}
                    className="flex items-center justify-between px-5 py-4 hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${wasteTypeColors[record.wasteType]}`}
                      >
                        {record.wasteType}
                      </span>
                      <div>
                        <p className="font-medium text-stone-800">{bean?.name || '未知豆子'}</p>
                        <p className="text-xs text-stone-400">
                          {formatDateChinese(record.createdAt)}
                          {record.note && ` · ${record.note}`}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-stone-800">
                      -{record.weight}<span className="text-sm font-normal text-stone-400 ml-1">g</span>
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-800">记录损耗</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  选择豆子
                </label>
                <select
                  value={selectedBeanId}
                  onChange={(e) => setSelectedBeanId(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent"
                >
                  <option value="">请选择咖啡豆</option>
                  {availableBeans.map((bean) => (
                    <option key={bean.id} value={bean.id}>
                      {bean.name} (剩余 {bean.remainingWeight}g)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  损耗类型
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['试机', '撒漏', '校磨'] as WasteType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setWasteType(type)}
                      className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                        wasteType === type
                          ? 'bg-stone-800 text-white border-stone-800'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  损耗克数 (g)
                </label>
                <input
                  type="number"
                  value={wasteWeight}
                  onChange={(e) => setWasteWeight(e.target.value)}
                  placeholder="请输入克数"
                  className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent text-lg font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  备注（可选）
                </label>
                <textarea
                  value={wasteNote}
                  onChange={(e) => setWasteNote(e.target.value)}
                  placeholder="补充说明..."
                  rows={2}
                  className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!selectedBeanId || !wasteWeight || Number(wasteWeight) <= 0}
                className="w-full py-3 bg-stone-800 text-white font-medium rounded-lg hover:bg-stone-900 active:scale-98 transition-all disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
              >
                确认记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
