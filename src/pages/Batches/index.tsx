import { useState } from 'react';
import { Plus, Clock, Droplets, Leaf, AlertTriangle, Eye } from 'lucide-react';
import { useTeaStore } from '@/store/useTeaStore';
import BatchModal from './BatchModal';
import BatchDetail from './BatchDetail';
import type { TeaBatch } from '@/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function BatchesPage() {
  const { batches, teapots, checkBatchAbnormal, getInspectionsByBatch } = useTeaStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<TeaBatch | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'discarded' | 'sold_out'>('all');

  const statusLabels: Record<string, { label: string; className: string }> = {
    active: { label: '售卖中', className: 'bg-matcha-100 text-matcha-700' },
    discarded: { label: '已报废', className: 'bg-danger-100 text-danger-600' },
    sold_out: { label: '已售罄', className: 'bg-gray-100 text-gray-600' },
  };

  const filteredBatches = batches.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const getTeapot = (teapotId: string) => teapots.find((t) => t.id === teapotId);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-tea-800">批次记录</h2>
          <p className="text-sm text-tea-600 mt-1">管理所有茶汤批次信息</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-tea-500 hover:bg-tea-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all hover:shadow-tea-lg hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          新增批次
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'all', label: '全部' },
          { key: 'active', label: '售卖中' },
          { key: 'discarded', label: '已报废' },
          { key: 'sold_out', label: '已售罄' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key as typeof filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === item.key
                ? 'bg-tea-500 text-white shadow-tea'
                : 'bg-white text-tea-600 hover:bg-tea-50 border border-tea-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {selectedBatch ? (
        <BatchDetail batch={selectedBatch} onBack={() => setSelectedBatch(null)} />
      ) : (
        <div className="space-y-4">
          {filteredBatches.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-tea">
              <div className="w-20 h-20 bg-tea-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-10 h-10 text-tea-400" />
              </div>
              <p className="text-tea-600 mb-4">暂无批次记录</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-tea-500 hover:text-tea-600 font-medium"
              >
                + 添加第一个批次
              </button>
            </div>
          ) : (
            filteredBatches.map((batch) => {
              const teapot = getTeapot(batch.teapotId);
              const abnormal = checkBatchAbnormal(batch.id);
              const inspections = getInspectionsByBatch(batch.id);
              const latestTemp = inspections.length > 0 ? inspections[0].temperature : null;
              const latestRemaining = inspections.length > 0 ? inspections[0].remainingAmount : batch.outputAmount;

              return (
                <div
                  key={batch.id}
                  className={`bg-white rounded-2xl shadow-tea overflow-hidden transition-all hover:shadow-tea-lg ${
                    abnormal.isAbnormal && batch.status === 'active'
                      ? 'ring-2 ring-danger-400 ring-offset-2'
                      : ''
                  }`}
                >
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={teapot?.photo}
                            alt={teapot?.teaType}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-tea-500">{teapot?.code}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusLabels[batch.status].className}`}>
                              {statusLabels[batch.status].label}
                            </span>
                            {abnormal.isAbnormal && batch.status === 'active' && (
                              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-600 animate-pulse">
                                <AlertTriangle className="w-3 h-3" />
                                异常
                              </span>
                            )}
                          </div>
                          <h3 className="font-display font-bold text-lg text-tea-800">
                            {teapot?.teaType}
                          </h3>
                          <p className="text-sm text-tea-500 mt-0.5">
                            煮制时间: {format(new Date(batch.brewTime), 'M月d日 HH:mm', { locale: zhCN })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-tea-700">
                            {latestTemp !== null ? (
                              <>
                                {latestTemp}
                                <span className="text-sm font-normal text-tea-500">°C</span>
                              </>
                            ) : (
                              <span className="text-base font-normal text-tea-400">--</span>
                            )}
                          </div>
                          <p className="text-xs text-tea-500 mt-1">当前温度</p>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-tea-700">
                            {latestRemaining}
                            <span className="text-sm font-normal text-tea-500">ml</span>
                          </div>
                          <p className="text-xs text-tea-500 mt-1">剩余量</p>
                        </div>
                        <button
                          onClick={() => setSelectedBatch(batch)}
                          className="flex items-center gap-1 px-4 py-2 bg-tea-50 text-tea-600 rounded-xl hover:bg-tea-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          详情
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-tea-50">
                      <div className="flex items-center gap-2 text-sm text-tea-600">
                        <Leaf className="w-4 h-4 text-matcha-500" />
                        投茶量: {batch.teaAmount}g
                      </div>
                      <div className="flex items-center gap-2 text-sm text-tea-600">
                        <Droplets className="w-4 h-4 text-tea-500" />
                        出汤量: {batch.outputAmount}ml
                      </div>
                      <div className="flex items-center gap-2 text-sm text-tea-600">
                        <Clock className="w-4 h-4 text-amber-500" />
                        售卖时段: {batch.targetTimeSlot}
                      </div>
                      {abnormal.isAbnormal && (
                        <div className="flex items-center gap-2 text-sm text-danger-600 font-medium">
                          <AlertTriangle className="w-4 h-4" />
                          {abnormal.reason}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {isModalOpen && (
        <BatchModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
