import { useState, useEffect } from 'react';
import { Plus, Leaf, Clock, AlertTriangle, Package, TrendingUp, Bell } from 'lucide-react';
import { useBatchStore } from '@/store/useBatchStore';
import BatchCard from '@/components/BatchCard';
import BatchForm from '@/components/BatchForm';
import FilterForm from '@/components/FilterForm';
import BatchDetail from '@/components/BatchDetail';
import StatCard from '@/components/StatCard';
import { Batch, BatchFormData, FilterFormData, FilterStatus } from '@/types';
import { isToday } from '@/utils/time';

const filterTabs: { key: FilterStatus; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'overdue', label: '已超时' },
  { key: 'brewing', label: '浸泡中' },
  { key: 'ready', label: '待过滤' },
  { key: 'filtered', label: '在售中' },
  { key: 'off_shelf', label: '已下架' },
];

export default function BatchList() {
  const { teas, batches, initData, addBatch, filterBatch, offShelfBatch, getTeaById } = useBatchStore();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [filterBatchId, setFilterBatchId] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  
  useEffect(() => {
    if (!useBatchStore.getState().initialized) {
      initData();
    }
  }, [initData]);
  
  useEffect(() => {
    const overdueBatches = batches.filter((b) => b.status === 'overdue');
    if (overdueBatches.length > 0) {
      setShowReminder(true);
      const timer = setTimeout(() => setShowReminder(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [batches]);
  
  const todayBatches = batches.filter((b) => isToday(b.startTime));
  const brewingCount = batches.filter((b) => ['brewing', 'ready', 'overdue'].includes(b.status)).length;
  const filteredCount = batches.filter((b) => b.status === 'filtered').length;
  const overdueCount = batches.filter((b) => b.status === 'overdue').length;
  
  const filteredBatches = batches
    .filter((batch) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'brewing') return batch.status === 'brewing';
      if (activeFilter === 'ready') return batch.status === 'ready';
      if (activeFilter === 'overdue') return batch.status === 'overdue';
      if (activeFilter === 'filtered') return batch.status === 'filtered';
      if (activeFilter === 'off_shelf') return batch.status === 'off_shelf';
      return true;
    })
    .sort((a, b) => {
      const statusOrder = ['overdue', 'ready', 'brewing', 'filtered', 'off_shelf'];
      const aIndex = statusOrder.indexOf(a.status);
      const bIndex = statusOrder.indexOf(b.status);
      if (aIndex !== bIndex) return aIndex - bIndex;
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });
  
  const handleAddBatch = (data: BatchFormData) => {
    addBatch(data);
    setShowBatchForm(false);
  };
  
  const handleFilterBatch = (batchId: string) => {
    setFilterBatchId(batchId);
    setSelectedBatch(null);
  };
  
  const handleFilterSubmit = (data: FilterFormData) => {
    if (filterBatchId) {
      filterBatch(filterBatchId, data);
      setFilterBatchId(null);
    }
  };
  
  const handleViewBatch = (batch: Batch) => {
    setSelectedBatch(batch);
  };
  
  const handleDetailFilter = () => {
    if (selectedBatch) {
      setFilterBatchId(selectedBatch.id);
      setSelectedBatch(null);
    }
  };
  
  const handleDetailOffShelf = () => {
    if (selectedBatch) {
      offShelfBatch(selectedBatch.id, '手动下架');
      setSelectedBatch(null);
    }
  };
  
  const filterBatchData = filterBatchId ? batches.find((b) => b.id === filterBatchId) : null;
  const filterBatchTea = filterBatchData ? getTeaById(filterBatchData.teaId) : null;
  const selectedBatchTea = selectedBatch ? getTeaById(selectedBatch.teaId) : null;
  
  return (
    <div className="min-h-screen bg-cream-100">
      {showReminder && overdueCount > 0 && (
        <div className="fixed top-4 right-4 z-40 animate-slide-up">
          <div className="bg-coral-500 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3">
            <Bell className="w-5 h-5 animate-bounce" />
            <div>
              <p className="font-medium">有 {overdueCount} 个批次已超时！</p>
              <p className="text-sm opacity-90">请尽快过滤处理</p>
            </div>
          </div>
        </div>
      )}
      
      <header className="bg-white/80 backdrop-blur-md border-b border-cream-200 sticky top-0 z-30">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-matcha-500 text-white flex items-center justify-center shadow-md shadow-matcha-200">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 font-serif">冷泡茶管理</h1>
                <p className="text-xs text-gray-500">Cold Brew Tea Manager</p>
              </div>
            </div>
            <button
              onClick={() => setShowBatchForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-matcha-500 text-white rounded-xl font-medium hover:bg-matcha-600 transition-all shadow-md shadow-matcha-200 hover:shadow-lg hover:shadow-matcha-300 hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              新建批次
            </button>
          </div>
        </div>
      </header>
      
      <main className="container py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="今日批次"
            value={todayBatches.length}
            icon={<Package className="w-5 h-5" />}
            subtitle="个批次"
            color="matcha"
          />
          <StatCard
            title="浸泡中"
            value={brewingCount}
            icon={<Clock className="w-5 h-5" />}
            subtitle="进行中"
            color="amber"
          />
          <StatCard
            title="在售中"
            value={filteredCount}
            icon={<TrendingUp className="w-5 h-5" />}
            subtitle="可售卖"
            color="forest"
          />
          <StatCard
            title="已超时"
            value={overdueCount}
            icon={<AlertTriangle className="w-5 h-5" />}
            subtitle="待处理"
            trend={overdueCount > 0 ? 'down' : 'neutral'}
            color="coral"
          />
        </div>
        
        <div className="bg-white rounded-2xl p-2 mb-6 shadow-sm inline-flex gap-1 flex-wrap">
          {filterTabs.map((tab) => {
            const count = tab.key === 'all' 
              ? batches.length 
              : batches.filter((b) => b.status === tab.key).length;
            
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeFilter === tab.key
                    ? 'bg-matcha-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  activeFilter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        
        {filteredBatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBatches.map((batch, index) => (
              <div key={batch.id} style={{ animationDelay: `${index * 50}ms` }}>
                <BatchCard
                  batch={batch}
                  tea={getTeaById(batch.teaId)}
                  onFilter={handleFilterBatch}
                  onView={handleViewBatch}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto bg-cream-200 rounded-3xl flex items-center justify-center mb-4">
              <Leaf className="w-10 h-10 text-cream-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 font-serif mb-2">暂无批次</h3>
            <p className="text-gray-400 mb-6">点击右上角按钮新建第一批次冷泡茶</p>
            <button
              onClick={() => setShowBatchForm(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-matcha-500 text-white rounded-xl font-medium hover:bg-matcha-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              新建批次
            </button>
          </div>
        )}
      </main>
      
      {showBatchForm && (
        <BatchForm
          teas={teas}
          onSubmit={handleAddBatch}
          onClose={() => setShowBatchForm(false)}
        />
      )}
      
      {filterBatchId && filterBatchData && (
        <FilterForm
          batch={filterBatchData}
          tea={filterBatchTea}
          onSubmit={handleFilterSubmit}
          onClose={() => setFilterBatchId(null)}
        />
      )}
      
      {selectedBatch && (
        <BatchDetail
          batch={selectedBatch}
          tea={selectedBatchTea}
          onClose={() => setSelectedBatch(null)}
          onFilter={handleDetailFilter}
          onOffShelf={handleDetailOffShelf}
        />
      )}
    </div>
  );
}
