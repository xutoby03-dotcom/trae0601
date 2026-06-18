import { useState, useMemo } from 'react';
import { Plus, Droplets, Check, Calendar, Clock, ChevronDown, ChevronUp, Shirt } from 'lucide-react';
import { useStore } from '../store/useStore';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { formatDate } from '../utils/helpers';
import { cn } from '../lib/utils';

export function CleaningManagement() {
  const {
    coats,
    cleaningBatches,
    getPendingCleaningCoats,
    addCleaningBatch,
    completeCleaningBatch,
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoatIds, setSelectedCoatIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);

  const pendingCoats = getPendingCleaningCoats();
  const sortedBatches = useMemo(
    () => [...cleaningBatches].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [cleaningBatches]
  );

  const cleaningStats = useMemo(() => {
    const cleaning = cleaningBatches.filter((b) => b.status === 'cleaning').length;
    const completed = cleaningBatches.filter((b) => b.status === 'completed').length;
    const totalCoatsInBatches = cleaningBatches
      .filter((b) => b.status === 'cleaning')
      .reduce((acc, b) => acc + b.coatIds.length, 0);
    return { pending: pendingCoats.length, cleaning, completed, totalCoatsInBatches };
  }, [cleaningBatches, pendingCoats.length]);

  const toggleCoatSelection = (coatId: string) => {
    setSelectedCoatIds((prev) =>
      prev.includes(coatId) ? prev.filter((id) => id !== coatId) : [...prev, coatId]
    );
  };

  const selectAll = () => {
    if (selectedCoatIds.length === pendingCoats.length) {
      setSelectedCoatIds([]);
    } else {
      setSelectedCoatIds(pendingCoats.map((c) => c.id));
    }
  };

  const handleCreateBatch = () => {
    if (selectedCoatIds.length === 0) return;
    addCleaningBatch(selectedCoatIds, notes.trim() || undefined);
    setSelectedCoatIds([]);
    setNotes('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-50">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">待清洗</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{cleaningStats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-50">
              <Droplets className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">清洗中批次</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{cleaningStats.cleaning}</p>
          <p className="text-xs text-gray-400 mt-1">共 {cleaningStats.totalCoatsInBatches} 件实验服</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-50">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-gray-500">已完成批次</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{cleaningStats.completed}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-center justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={pendingCoats.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            创建清洗批次
          </button>
        </div>
      </div>

      {pendingCoats.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-semibold text-amber-800">
                待清洗队列 ({pendingCoats.length} 件)
              </h3>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-medium text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              批量创建批次
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {pendingCoats.map((coat) => (
                <div
                  key={coat.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Shirt className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{coat.code}</span>
                  </div>
                  <p className="text-xs text-gray-500">{coat.size} · {coat.lab}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-900">清洗批次记录</h3>
        {sortedBatches.length > 0 ? (
          sortedBatches.map((batch) => {
            const batchCoats = batch.coatIds
              .map((id) => coats.find((c) => c.id === id))
              .filter(Boolean);
            const isExpanded = expandedBatch === batch.id;

            return (
              <div
                key={batch.id}
                className={cn(
                  'bg-white rounded-xl border shadow-sm overflow-hidden transition-colors',
                  batch.status === 'cleaning' ? 'border-purple-200' : 'border-gray-100'
                )}
              >
                <div
                  className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50/50"
                  onClick={() => setExpandedBatch(isExpanded ? null : batch.id)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        batch.status === 'cleaning' ? 'bg-purple-100' : 'bg-emerald-100'
                      )}
                    >
                      <Droplets
                        className={cn(
                          'w-5 h-5',
                          batch.status === 'cleaning' ? 'text-purple-600' : 'text-emerald-600'
                        )}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-900">{batch.batchNo}</h4>
                        <StatusBadge type="batch" status={batch.status} />
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(batch.createdAt)}
                        </span>
                        <span>{batch.coatIds.length} 件实验服</span>
                        {batch.completedAt && (
                          <span className="flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            完成于 {formatDate(batch.completedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {batch.status === 'cleaning' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('确定标记该批次为已完成吗？')) {
                            completeCleaningBatch(batch.id);
                          }
                        }}
                        className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-500/25"
                      >
                        完成清洗
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-6 pb-5 border-t border-gray-100">
                    {batch.notes && (
                      <div className="pt-4 mb-3">
                        <p className="text-xs text-gray-400 mb-1">备注</p>
                        <p className="text-sm text-gray-700">{batch.notes}</p>
                      </div>
                    )}
                    <div className="pt-2">
                      <p className="text-xs text-gray-400 mb-3">包含实验服</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {batchCoats.map((coat) =>
                          coat ? (
                            <div
                              key={coat.id}
                              className="p-2.5 bg-gray-50 rounded-lg border border-gray-100"
                            >
                              <p className="text-sm font-medium text-gray-900">{coat.code}</p>
                              <p className="text-xs text-gray-400">
                                {coat.size} · {coat.lab}
                              </p>
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
            <Droplets className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">暂无清洗批次记录</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCoatIds([]);
          setNotes('');
        }}
        title="创建清洗批次"
        footer={
          <>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedCoatIds([]);
                setNotes('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleCreateBatch}
              disabled={selectedCoatIds.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              创建批次 ({selectedCoatIds.length})
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {pendingCoats.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  选择待清洗的实验服（{selectedCoatIds.length}/{pendingCoats.length}）
                </p>
                <button
                  onClick={selectAll}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  {selectedCoatIds.length === pendingCoats.length ? '取消全选' : '全选'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {pendingCoats.map((coat) => {
                  const selected = selectedCoatIds.includes(coat.id);
                  return (
                    <button
                      key={coat.id}
                      onClick={() => toggleCoatSelection(coat.id)}
                      className={cn(
                        'p-3 rounded-lg border-2 text-left transition-all duration-150',
                        selected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{coat.code}</span>
                        <div
                          className={cn(
                            'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                            selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          )}
                        >
                          {selected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{coat.size} · {coat.lab}</p>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm">
              暂无可清洗的实验服
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">批次备注</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="例如：常规清洗、消毒液浸泡等..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
