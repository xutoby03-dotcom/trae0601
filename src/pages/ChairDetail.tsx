import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Package,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ArrowLeft,
  Camera,
  ChevronLeft,
  ChevronRight,
  Wrench,
} from 'lucide-react';
import { chairApi } from '../lib/api';
import { useToast } from '../components/Toast';
import { Chair, DamageRecord } from '../../shared/types';
import {
  getChairStatusText,
  getChairStatusColor,
  formatDate,
} from '../utils/time';

export default function ChairDetail() {
  const { id } = useParams<{ id: string }>();
  const [chair, setChair] = useState<Chair | null>(null);
  const [damageRecords, setDamageRecords] = useState<DamageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadChairDetail();
    }
  }, [id]);

  const loadChairDetail = async () => {
    setLoading(true);
    try {
      const result = await chairApi.getById(parseInt(id!));
      if (result.success && result.data) {
        setChair(result.data.chair);
        setDamageRecords(result.data.damageRecords);
      } else {
        showToast('error', result.message || '加载失败');
        navigate('/');
      }
    } catch {
      showToast('error', '加载失败，请稍后重试');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const nextPhoto = () => {
    if (chair && currentPhoto < chair.photoUrls.length - 1) {
      setCurrentPhoto(currentPhoto + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhoto > 0) {
      setCurrentPhoto(currentPhoto - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="animate-spin w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (!chair) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={chair.photoUrls[currentPhoto]}
                  alt={chair.chairNumber}
                  className="w-full h-full object-cover"
                />
                {chair.photoUrls.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      disabled={currentPhoto === 0}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      disabled={currentPhoto === chair.photoUrls.length - 1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {chair.photoUrls.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPhoto(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            currentPhoto === index
                              ? 'bg-white w-6'
                              : 'bg-white/50 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h1 className="text-2xl font-bold text-gray-900">{chair.chairNumber}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getChairStatusColor(chair.status)}`}>
                    {getChairStatusText(chair.status)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{chair.location}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-600" />
                配套物品
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {chair.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                清洁状态
              </h2>
              {chair.lastCleanedAt ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">已清洁</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>最后清洁：{formatDate(chair.lastCleanedAt)} {chair.lastCleanedAt.slice(11, 16)}</span>
                    </div>
                    {chair.lastCleanedByName && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>清洁人：{chair.lastCleanedByName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">暂无清洁记录</span>
                </div>
              )}
            </div>

            {damageRecords.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-600" />
                  损坏记录
                  <span className="text-sm font-normal text-gray-500">
                    （{damageRecords.length}条）
                  </span>
                </h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {damageRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-3 bg-gray-50 rounded-xl border-l-4 border-amber-400"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{record.partName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          record.status === 'repaired'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {record.status === 'repaired' ? '已修复' : '待处理'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                      <div className="text-xs text-gray-400 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {record.reporterName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(record.reportedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => navigate('/')}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-lg shadow-teal-600/20"
            >
              去预约
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
