import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  User,
  MapPin,
  Package,
  X,
  TrendingUp,
} from 'lucide-react';
import { useTastingStore } from '@/store/tastingStore';
import { useProductStore } from '@/store/productStore';
import { formatTime, formatDateTime, getMinutesUntil, formatDuration } from '@/utils/date';
import type { TastingRecord } from '@/types';

function getStatusInfo(status: string, minutesLeft: number) {
  if (status !== 'active') {
    return {
      label: status === 'completed' ? '已完成' : '已过期',
      color: status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
      bgColor: status === 'completed' ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50',
      progressColor: status === 'completed' ? 'bg-emerald-500' : 'bg-rose-500',
    };
  }

  if (minutesLeft <= 0) {
    return {
      label: '已过期',
      color: 'bg-rose-100 text-rose-700',
      bgColor: 'border-rose-300 bg-rose-50',
      progressColor: 'bg-rose-500',
    };
  }
  if (minutesLeft <= 30) {
    return {
      label: '即将过期',
      color: 'bg-amber-100 text-amber-700',
      bgColor: 'border-amber-300 bg-amber-50',
      progressColor: 'bg-amber-500',
    };
  }
  return {
    label: '进行中',
    color: 'bg-emerald-100 text-emerald-700',
    bgColor: 'border-stone-200 bg-white',
    progressColor: 'bg-emerald-500',
  };
}

export default function TastingMonitor() {
  const navigate = useNavigate();
  const records = useTastingStore((state) => state.records);
  const endTasting = useTastingStore((state) => state.endTasting);
  const getProductById = useProductStore((state) => state.getProductById);
  const getBatchById = useProductStore((state) => state.getBatchById);

  const [, setTick] = useState(0);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showEndModal, setShowEndModal] = useState<TastingRecord | null>(null);
  const [remainingPortion, setRemainingPortion] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  const filteredRecords = records.filter((r) => {
    if (filter === 'active') return r.status === 'active';
    if (filter === 'completed') return r.status !== 'active';
    return true;
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const activeCount = records.filter((r) => r.status === 'active').length;
  const completedCount = records.filter((r) => r.status !== 'active').length;

  const handleEndTasting = (record: TastingRecord) => {
    setShowEndModal(record);
    setRemainingPortion(record.remainingPortion);
  };

  const confirmEndTasting = (status: 'completed' | 'expired') => {
    if (!showEndModal) return;
    endTasting(showEndModal.id, remainingPortion, status);
    setShowEndModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">试吃台监控</h1>
          <p className="text-stone-500 mt-1">实时监控所有试吃台状态</p>
        </div>
        <button
          onClick={() => navigate('/tasting/new')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-550 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          新建试吃
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          全部 ({records.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'active'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          进行中 ({activeCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          已结束 ({completedCount})
        </button>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-16 text-center">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-stone-300" />
          </div>
          <p className="text-stone-500 text-lg">暂无试吃记录</p>
          <p className="text-stone-400 text-sm mt-1">点击右上角按钮新建试吃</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((record) => {
            const batch = getBatchById(record.batchId);
            const product = batch ? getProductById(batch.productId) : null;
            const minutesLeft = getMinutesUntil(record.expectedEndTime);
            const statusInfo = getStatusInfo(record.status, minutesLeft);

            const totalMinutes =
              (new Date(record.expectedEndTime).getTime() -
                new Date(record.startTime).getTime()) /
              60000;
            const progress =
              record.status === 'active'
                ? Math.max(0, Math.min(100, (1 - minutesLeft / totalMinutes) * 100))
                : 100;

            const wasteRate = record.portion > 0
              ? Math.round((record.remainingPortion / record.portion) * 100)
              : 0;

            return (
              <div
                key={record.id}
                className={`rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${statusInfo.bgColor}`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-stone-100 rounded-xl overflow-hidden">
                        {product?.photo ? (
                          <img
                            src={product.photo}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-7 h-7 text-stone-400 m-auto" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-800">
                          {product?.name || '未知商品'}
                        </h3>
                        <p className="text-sm text-stone-500">
                          批次: {batch?.batchNumber || '未知'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-stone-400" />
                      <span className="text-stone-600">{record.stationLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-stone-400" />
                      <span className="text-stone-600">领用人: {record.operatorName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-stone-400" />
                      <span className="text-stone-600">
                        {formatTime(record.startTime)} - {formatTime(record.expectedEndTime)}
                      </span>
                    </div>
                  </div>

                  {record.status === 'active' ? (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-stone-500">
                          {minutesLeft <= 0 ? '已过期' : '剩余时间'}
                        </span>
                        <span
                          className={`font-bold ${
                            minutesLeft <= 0
                              ? 'text-rose-600'
                              : minutesLeft <= 30
                              ? 'text-amber-600'
                              : 'text-stone-700'
                          }`}
                        >
                          {minutesLeft <= 0
                            ? formatDuration(minutesLeft)
                            : formatDuration(minutesLeft)}
                        </span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${statusInfo.progressColor}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-stone-50 rounded-xl">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-500">实际结束</span>
                        <span className="text-stone-700">
                          {record.actualEndTime
                            ? formatDateTime(record.actualEndTime)
                            : '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-stone-500">浪费率</span>
                        <span
                          className={`font-medium ${
                            wasteRate > 50 ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {wasteRate}%
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-stone-600">
                        已转化 <strong className="text-stone-800">{record.convertedOrders}</strong> 单
                      </span>
                    </div>
                    <span className="text-sm text-stone-500">
                      {record.portion - record.remainingPortion}/{record.portion}份
                    </span>
                  </div>

                  {record.status === 'active' && (
                    <button
                      onClick={() => handleEndTasting(record)}
                      className="w-full mt-4 py-2.5 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-900 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      确认撤台
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showEndModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-stone-800">确认撤台</h3>
              <button
                onClick={() => setShowEndModal(null)}
                className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const batch = getBatchById(showEndModal.batchId);
              const product = batch ? getProductById(batch.productId) : null;
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                    <div className="w-12 h-12 bg-stone-200 rounded-lg overflow-hidden">
                      {product?.photo ? (
                        <img src={product.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-stone-400 m-auto" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">{product?.name}</p>
                      <p className="text-sm text-stone-500">{showEndModal.stationLocation}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      剩余份量（份）
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max={showEndModal.portion}
                        step="0.1"
                        value={remainingPortion}
                        onChange={(e) => setRemainingPortion(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                      <div className="w-16 text-center">
                        <span className="text-xl font-bold text-stone-800">
                          {remainingPortion.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-stone-500 mt-2">
                      浪费率: {showEndModal.portion > 0
                        ? Math.round((remainingPortion / showEndModal.portion) * 100)
                        : 0}%
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => confirmEndTasting('completed')}
                      className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      正常撤台
                    </button>
                    <button
                      onClick={() => confirmEndTasting('expired')}
                      className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      过期撤台
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
