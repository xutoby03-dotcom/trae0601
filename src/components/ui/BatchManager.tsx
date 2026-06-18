import { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import type { InventoryBatch } from '../../types';
import { formatDate } from '../../utils/date';

export interface BatchManagerProps {
  batches: InventoryBatch[];
  onAddBatch?: (quantity: number, expiryDate: string) => void;
  onMarkStatus: (batchId: string, status: 'expired' | 'damp' | 'normal') => void;
  showAddForm?: boolean;
}

const statusBadgeClass = {
  normal: 'badge-normal',
  expired: 'badge-expired',
  damp: 'badge-damp',
};

const statusLabels = {
  normal: '正常',
  expired: '已过期',
  damp: '已受潮',
};

export function BatchManager({ batches, onAddBatch, onMarkStatus, showAddForm = true }: BatchManagerProps) {
  const [quantity, setQuantity] = useState(10);
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddBatch) return;
    onAddBatch(quantity, expiryDate);
    setQuantity(10);
  };

  const normalCount = batches.filter(b => b.status === 'normal').reduce((s, b) => s + b.quantity, 0);
  const dampCount = batches.filter(b => b.status === 'damp').reduce((s, b) => s + b.quantity, 0);
  const expiredCount = batches.filter(b => b.status === 'expired').reduce((s, b) => s + b.quantity, 0);
  const totalAvailable = normalCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-cream-50 rounded-xl p-4">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-accent-green"></span>
            <span className="text-coffee-600">正常可用: <span className="font-bold text-coffee-900">{totalAvailable}</span> 颗</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-accent-orange"></span>
            <span className="text-coffee-600">受潮: <span className="font-bold text-accent-orange">{dampCount}</span> 颗</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-accent-red"></span>
            <span className="text-coffee-600">过期: <span className="font-bold text-accent-red">{expiredCount}</span> 颗</span>
          </div>
        </div>
      </div>

      {showAddForm && onAddBatch && (
        <form onSubmit={handleSubmit} className="bg-cream-50 rounded-xl p-4 space-y-4">
          <h4 className="font-bold text-coffee-800">新增批次</h4>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="label">数量 (颗)</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="input"
              />
            </div>
            <div className="flex-1">
              <label className="label">
                <Calendar className="w-4 h-4 inline mr-1" />
                过期日期
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="input"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-primary">
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>
          </div>
        </form>
      )}

      <div>
        <h4 className="font-bold text-coffee-800 mb-3">批次列表</h4>
        {batches.length === 0 ? (
          <p className="text-coffee-500 text-center py-8">暂无批次记录</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className={`flex items-center justify-between p-4 bg-white rounded-xl border ${
                  batch.status !== 'normal' ? 'border-opacity-50 bg-opacity-50' : 'border-coffee-100'
                } ${batch.status === 'damp' ? 'border-accent-orange/40 bg-orange-50/50' : ''} ${batch.status === 'expired' ? 'border-accent-red/40 bg-red-50/50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className={`font-display text-2xl font-bold ${batch.status === 'normal' ? 'text-coffee-800' : 'text-coffee-400 line-through'}`}>
                      {batch.quantity}
                    </p>
                    <p className="text-xs text-coffee-500">颗</p>
                  </div>
                  <div>
                    <p className="text-sm text-coffee-600">
                      过期: {formatDate(batch.expiryDate)}
                    </p>
                    <p className="text-xs text-coffee-400">
                      入库: {formatDate(batch.createdAt)}
                    </p>
                  </div>
                  <span className={statusBadgeClass[batch.status]}>
                    {statusLabels[batch.status]}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onMarkStatus(batch.id, 'normal')}
                    className={`text-xs py-1 px-2.5 rounded-lg font-medium transition-all ${
                      batch.status === 'normal'
                        ? 'bg-accent-green text-white shadow-sm'
                        : 'bg-coffee-50 text-coffee-600 hover:bg-green-100 hover:text-accent-green'
                    }`}
                  >
                    正常
                  </button>
                  <button
                    onClick={() => onMarkStatus(batch.id, 'damp')}
                    className={`text-xs py-1 px-2.5 rounded-lg font-medium transition-all ${
                      batch.status === 'damp'
                        ? 'bg-accent-orange text-white shadow-sm'
                        : 'bg-coffee-50 text-coffee-600 hover:bg-orange-100 hover:text-accent-orange'
                    }`}
                  >
                    受潮
                  </button>
                  <button
                    onClick={() => onMarkStatus(batch.id, 'expired')}
                    className={`text-xs py-1 px-2.5 rounded-lg font-medium transition-all ${
                      batch.status === 'expired'
                        ? 'bg-accent-red text-white shadow-sm'
                        : 'bg-coffee-50 text-coffee-600 hover:bg-red-100 hover:text-accent-red'
                    }`}
                  >
                    过期
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
