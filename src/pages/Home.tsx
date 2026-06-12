import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import type { Batch } from '@/types';
import { useBatchStore } from '@/store/batchStore';
import Header from '@/components/Header';
import StatsOverview from '@/components/StatsOverview';
import OvenStatus from '@/components/OvenStatus';
import BatchCard from '@/components/BatchCard';
import StatsPanel from '@/components/StatsPanel';
import BatchForm from '@/components/BatchForm';
import FinishForm from '@/components/FinishForm';

export default function Home() {
  const [showStats, setShowStats] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [finishingBatch, setFinishingBatch] = useState<Batch | null>(null);

  const getActiveBatches = useBatchStore((s) => s.getActiveBatches);
  const activeBatches = useMemo(() => getActiveBatches(), [getActiveBatches]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cream via-copper-50/30 to-copper-100/30">
      <Header showStats={showStats} onToggleStats={() => setShowStats((s) => !s)} />

      <main className="flex-1 px-4 md:px-8 py-6 max-w-[1600px] w-full mx-auto space-y-6">
        {!showStats ? (
          <>
            <StatsOverview />
            <OvenStatus />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-espresso-800">
                  进行中批次
                  <span className="ml-3 text-sm font-normal text-espresso-500">
                    共 {activeBatches.length} 批
                  </span>
                </h2>
                <button
                  onClick={() => setShowBatchForm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-copper-500 to-copper-600 text-white font-semibold shadow-lg shadow-copper-200 hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  新建批次
                </button>
              </div>

              {activeBatches.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {activeBatches.map((batch) => (
                    <BatchCard
                      key={batch.id}
                      batch={batch}
                      onFinish={(b) => setFinishingBatch(b)}
                    />
                  ))}
                </div>
              ) : (
                <div className="card-base py-16 text-center">
                  <div className="text-6xl mb-4">🍞</div>
                  <h3 className="font-display text-xl font-bold text-espresso-700 mb-2">
                    烤箱都在休息中
                  </h3>
                  <p className="text-espresso-500 mb-6">点击"新建批次"开始入炉登记</p>
                  <button
                    onClick={() => setShowBatchForm(true)}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    新建批次
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <StatsOverview />
            <StatsPanel />
          </>
        )}
      </main>

      {!showStats && (
        <button
          onClick={() => setShowBatchForm(true)}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-copper-500 to-copper-600 text-white shadow-2xl shadow-copper-400 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}

      {showBatchForm && <BatchForm onClose={() => setShowBatchForm(false)} />}
      {finishingBatch && (
        <FinishForm batch={finishingBatch} onClose={() => setFinishingBatch(null)} />
      )}
    </div>
  );
}
