import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Droplets,
  Scale,
  Clock,
  PackageOpen,
  Star,
  Coffee,
  Trash2,
  Package,
  Camera,
} from 'lucide-react';
import { useBatchStore } from '../store/useBatchStore';
import { getBatchStatus, getStatusInfo, getWeightProgress } from '../utils/statusUtils';
import { formatDate, formatDateShort, relativeDate, daysSince } from '../utils/dateUtils';
import StatusBadge from '../components/StatusBadge';
import FlavorTags from '../components/FlavorTags';
import BrewingModal from '../components/BrewingModal';

const methodLabels: Record<string, string> = {
  pour_over: '手冲',
  espresso: '意式',
  cold_brew: '冷萃',
};

const methodIcons: Record<string, string> = {
  pour_over: '☕',
  espresso: '🕳️',
  cold_brew: '🧊',
};

export default function BatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBatchById, getRecordsByBatchId, openBatch, addRecord, deleteBatch } = useBatchStore();

  const [brewingModalOpen, setBrewingModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const batch = getBatchById(id || '');
  const records = getRecordsByBatchId(id || '');

  if (!batch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-coffee-500 mb-4">批次不存在</p>
          <button onClick={() => navigate('/')} className="btn-secondary">
            返回看板
          </button>
        </div>
      </div>
    );
  }

  const status = getBatchStatus(batch);
  const statusInfo = getStatusInfo(status);
  const weightProgress = getWeightProgress(batch);

  const handleBrewSubmit = (data: any) => {
    addRecord({
      batchId: batch.id,
      date: new Date().toISOString().split('T')[0],
      ...data,
    });
  };

  const handleDelete = () => {
    deleteBatch(batch.id);
    navigate('/');
  };

  const avgRating = records.filter(r => r.rating).length > 0
    ? records.reduce((sum, r) => sum + (r.rating || 0), 0) / records.filter(r => r.rating).length
    : null;

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-coffee-600 hover:text-coffee-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>返回看板</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card overflow-hidden">
              <div className="relative h-56 bg-gradient-to-br from-cream-100 to-cream-200 overflow-hidden">
                {batch.photo ? (
                  <img
                    src={batch.photo}
                    alt={batch.origin}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-coffee-300">
                    <Package className="w-20 h-20 mb-2" />
                    <span className="text-sm font-medium">暂无袋身照片</span>
                  </div>
                )}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: statusInfo.color }}
                />
                <div className="absolute top-3 right-3">
                  <StatusBadge status={status} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent" />
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h1 className="text-2xl font-bold text-coffee-900 font-serif">
                    {batch.origin}
                  </h1>
                  <p className="text-coffee-500 mt-1">{batch.processMethod}</p>
                </div>

                <div className="mb-6">
                  <FlavorTags tags={batch.flavorTags} />
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-3 bg-cream-50 rounded-xl">
                    <div className="flex items-center gap-2 text-coffee-600">
                      <Scale size={18} />
                      <span>剩余克数</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-coffee-900 font-serif">
                        {batch.currentWeight}g
                      </span>
                      <span className="text-coffee-400 text-sm ml-1">
                        / {batch.initialWeight}g
                      </span>
                    </div>
                  </div>

                  <div className="h-3 bg-cream-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${weightProgress}%`,
                        backgroundColor:
                          weightProgress > 50
                            ? '#81C784'
                            : weightProgress > 20
                            ? '#FFB74D'
                            : '#E57373',
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-coffee-50">
                    <div className="flex items-center gap-2 text-coffee-500">
                      <Calendar size={16} />
                      <span>烘焙日期</span>
                    </div>
                    <span className="text-coffee-700 font-medium">
                      {formatDate(batch.roastDate)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-coffee-50">
                    <div className="flex items-center gap-2 text-coffee-500">
                      <PackageOpen size={16} />
                      <span>开封日期</span>
                    </div>
                    <span className="text-coffee-700 font-medium">
                      {batch.openDate ? formatDate(batch.openDate) : '未开封'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-coffee-50">
                    <div className="flex items-center gap-2 text-coffee-500">
                      <Clock size={16} />
                      <span>建议养豆</span>
                    </div>
                    <span className="text-coffee-700 font-medium">
                      {batch.suggestedDays} 天
                    </span>
                  </div>

                  {batch.openDate && (
                    <div className="flex items-center justify-between py-2 border-b border-coffee-50">
                      <div className="flex items-center gap-2 text-coffee-500">
                        <Coffee size={16} />
                        <span>已开封</span>
                      </div>
                      <span className="text-coffee-700 font-medium">
                        {daysSince(batch.openDate)} 天
                      </span>
                    </div>
                  )}

                  {avgRating !== null && (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2 text-coffee-500">
                        <Star size={16} />
                        <span>平均评分</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-coffee-700 font-bold">
                          {avgRating.toFixed(1)}
                        </span>
                        <span className="text-amber-400">★</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mt-6 pt-6 border-t border-coffee-50">
                  {!batch.openDate && (
                    <button
                      onClick={() => openBatch(batch.id)}
                      className="btn-accent w-full flex items-center justify-center gap-2"
                    >
                      <PackageOpen size={18} />
                      今天开封
                    </button>
                  )}

                  {batch.openDate && batch.currentWeight > 0 && (
                    <button
                      onClick={() => setBrewingModalOpen(true)}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <Droplets size={18} />
                      记录出豆
                    </button>
                  )}

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full px-6 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    删除批次
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="text-xl font-bold text-coffee-900 font-serif mb-6 flex items-center gap-2">
                <Droplets size={22} />
                出豆历史
                <span className="text-sm font-normal text-coffee-400 ml-2">
                  ({records.length} 条记录)
                </span>
              </h2>

              {records.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-cream-100 flex items-center justify-center">
                    <Coffee className="w-8 h-8 text-coffee-300" />
                  </div>
                  <p className="text-coffee-500">暂无出豆记录</p>
                  {batch.openDate && (
                    <button
                      onClick={() => setBrewingModalOpen(true)}
                      className="mt-4 text-sunset-500 hover:text-sunset-600 font-medium"
                    >
                      记录第一次出豆 →
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-coffee-100" />

                  <div className="space-y-4">
                    {records.map((record, index) => (
                      <div
                        key={record.id}
                        className="relative pl-10 animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div
                          className="absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: statusInfo.color }}
                        />

                        <div className="bg-cream-50 rounded-2xl p-4 hover:bg-cream-100 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{methodIcons[record.method]}</span>
                              <div>
                                <p className="font-semibold text-coffee-900">
                                  {methodLabels[record.method]}
                                </p>
                                <p className="text-sm text-coffee-500">
                                  {relativeDate(record.date)} · {record.grams}g
                                </p>
                              </div>
                            </div>
                            {record.rating && (
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={`${
                                      i < (record.rating || 0)
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-coffee-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-coffee-600 mb-2">
                            {record.grindSize !== null && (
                              <span>研磨: {record.grindSize}</span>
                            )}
                            {record.waterTemp !== null && (
                              <span>水温: {record.waterTemp}°C</span>
                            )}
                            {record.ratio && <span>粉水比: {record.ratio}</span>}
                          </div>

                          {record.feedback && (
                            <p className="text-sm text-coffee-700 bg-white rounded-xl p-3 mt-2">
                              {record.feedback}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {batch.notes && (
              <div className="card p-6 mt-6">
                <h3 className="font-semibold text-coffee-900 mb-2">备注</h3>
                <p className="text-coffee-600">{batch.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BrewingModal
        isOpen={brewingModalOpen}
        onClose={() => setBrewingModalOpen(false)}
        onSubmit={handleBrewSubmit}
        batchName={batch.origin}
        currentWeight={batch.currentWeight}
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-coffee-900/40 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-coffee-900 mb-2">
              确认删除？
            </h3>
            <p className="text-coffee-600 mb-6">
              删除后将无法恢复，该批次的所有出豆记录也会被清除。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
