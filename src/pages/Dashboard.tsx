import { useState, useMemo } from 'react';
import { Coffee, Filter } from 'lucide-react';
import { useBatchStore } from '../store/useBatchStore';
import { getBatchStatus } from '../utils/statusUtils';
import type { BatchStatus, StatusFilter } from '../types';
import BatchCard from '../components/BatchCard';
import BrewingModal from '../components/BrewingModal';

const filterOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'resting', label: '养豆中' },
  { value: 'optimal', label: '最佳风味' },
  { value: 'declining', label: '风味下降' },
  { value: 'low_stock', label: '余量不足' },
  { value: 'unopened', label: '未开封' },
];

export default function Dashboard() {
  const { batches, addRecord, selectedFilter, setSelectedFilter } = useBatchStore();
  const [brewingModalOpen, setBrewingModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const filteredBatches = useMemo(() => {
    if (selectedFilter === 'all') return batches;
    return batches.filter((batch) => {
      const status = getBatchStatus(batch);
      return status === selectedFilter;
    });
  }, [batches, selectedFilter]);

  const sortedBatches = useMemo(() => {
    const statusPriority: Record<BatchStatus, number> = {
      low_stock: 0,
      expired: 1,
      declining: 2,
      optimal: 3,
      resting: 4,
      unopened: 5,
    };

    return [...filteredBatches].sort((a, b) => {
      const statusA = getBatchStatus(a);
      const statusB = getBatchStatus(b);
      return statusPriority[statusA] - statusPriority[statusB];
    });
  }, [filteredBatches]);

  const selectedBatch = batches.find((b) => b.id === selectedBatchId);

  const handleQuickBrew = (batchId: string) => {
    setSelectedBatchId(batchId);
    setBrewingModalOpen(true);
  };

  const handleBrewSubmit = (data: {
    grams: number;
    method: any;
    grindSize: number | null;
    waterTemp: number | null;
    ratio: string | null;
    rating: number | null;
    feedback: string | null;
  }) => {
    if (!selectedBatchId) return;

    addRecord({
      batchId: selectedBatchId,
      date: new Date().toISOString().split('T')[0],
      ...data,
    });
  };

  const stats = useMemo(() => {
    const resting = batches.filter((b) => getBatchStatus(b) === 'resting').length;
    const optimal = batches.filter((b) => getBatchStatus(b) === 'optimal').length;
    const lowStock = batches.filter((b) => getBatchStatus(b) === 'low_stock').length;
    const totalWeight = batches.reduce((sum, b) => sum + b.currentWeight, 0);
    return { resting, optimal, lowStock, totalWeight };
  }, [batches]);

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-coffee-900 font-serif mb-2">
            我的咖啡豆
          </h1>
          <p className="text-coffee-500">
            追踪每一批豆子的养豆进度和剩余克数
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4">
            <div className="text-sm text-coffee-500 mb-1">总批次</div>
            <div className="text-2xl font-bold text-coffee-900 font-serif">
              {batches.length}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-amber-600 mb-1">养豆中</div>
            <div className="text-2xl font-bold text-amber-600 font-serif">
              {stats.resting}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-matcha-600 mb-1">最佳风味</div>
            <div className="text-2xl font-bold text-matcha-600 font-serif">
              {stats.optimal}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-sunset-500 mb-1">余量不足</div>
            <div className="text-2xl font-bold text-sunset-500 font-serif">
              {stats.lowStock}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter size={18} className="text-coffee-400 flex-shrink-0" />
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedFilter(option.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                selectedFilter === option.value
                  ? 'bg-coffee-800 text-white shadow-md'
                  : 'bg-white text-coffee-600 hover:bg-coffee-50 border border-coffee-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {sortedBatches.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cream-100 flex items-center justify-center">
              <Coffee className="w-10 h-10 text-coffee-300" />
            </div>
            <p className="text-coffee-500 mb-4">暂无咖啡豆</p>
            <p className="text-coffee-400 text-sm">点击右上角「添加豆子」开始记录</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedBatches.map((batch, index) => (
              <div
                key={batch.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <BatchCard
                  batch={batch}
                  onQuickBrew={() => handleQuickBrew(batch.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <BrewingModal
        isOpen={brewingModalOpen}
        onClose={() => {
          setBrewingModalOpen(false);
          setSelectedBatchId(null);
        }}
        onSubmit={handleBrewSubmit}
        batchName={selectedBatch?.origin || ''}
        currentWeight={selectedBatch?.currentWeight || 0}
      />
    </div>
  );
}
