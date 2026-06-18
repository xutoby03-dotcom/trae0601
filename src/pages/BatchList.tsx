import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { useStore } from '@/store/useStore';
import BatchTable from '@/components/batch/BatchTable';
import type { Batch } from '@/types';

type FilterStatus = 'all' | Batch['status'];

export default function BatchList() {
  const navigate = useNavigate();
  const initData = useStore((state) => state.initData);
  const batches = useStore((state) => state.batches);
  const equipments = useStore((state) => state.equipments);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    initData();
  }, [initData]);

  const filteredBatches = batches.filter((batch) => {
    if (filterStatus === 'all') return true;
    return batch.status === filterStatus;
  });

  const statusOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'fermenting', label: '发酵中' },
    { value: 'completed', label: '已完成' },
    { value: 'abnormal', label: '异常' },
  ];

  const getStatusCount = (status: FilterStatus) => {
    if (status === 'all') return batches.length;
    return batches.filter((b) => b.status === status).length;
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">入箱记录</h1>
          <p className="text-sm text-gray-500 mt-1">管理所有批次的入箱记录</p>
        </div>
        <button
          onClick={() => navigate('/batches/new')}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增入箱
        </button>
      </div>

      <div className="card animate-fadeInUp" style={{ animationDelay: '50ms' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">状态筛选：</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilterStatus(option.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  filterStatus === option.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
                <span className={`ml-1 ${
                  filterStatus === option.value ? 'text-primary-100' : 'text-gray-400'
                }`}>
                  ({getStatusCount(option.value)})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <BatchTable batches={filteredBatches} equipments={equipments} />
    </div>
  );
}
