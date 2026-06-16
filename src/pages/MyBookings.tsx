import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, QrCode, X, CheckCircle, AlertTriangle, Sofa } from 'lucide-react';
import { bookingApi } from '../lib/api';
import { useToast } from '../components/Toast';
import { useAuthStore } from '../store/auth';
import { Booking } from '../../shared/types';
import {
  formatDate,
  formatTimeRange,
  getStatusText,
  getStatusColor,
} from '../utils/time';

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { refreshUser } = useAuthStore();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const result = await bookingApi.getMy();
      if (result.success && result.data) {
        setBookings(result.data);
      }
    } catch {
      showToast('error', '加载预约记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: number) => {
    if (!confirm('确定要取消这个预约吗？')) return;
    
    try {
      const result = await bookingApi.cancel(bookingId);
      if (result.success) {
        showToast('success', '预约已取消');
        loadBookings();
      } else {
        showToast('error', result.message || '取消失败');
      }
    } catch {
      showToast('error', '取消失败，请稍后重试');
    }
  };

  const handleCheckin = (bookingId: number) => {
    navigate(`/checkin/${bookingId}`);
  };

  const handleEndUsage = async (bookingId: number) => {
    if (!confirm('确定要结束使用吗？结束后需要完成清洁确认。')) return;
    
    try {
      const result = await bookingApi.endUsage(bookingId);
      if (result.success) {
        showToast('success', '使用已结束，请完成清洁确认');
        navigate(`/cleanup/${bookingId}`);
      } else {
        showToast('error', result.message || '操作失败');
      }
    } catch {
      showToast('error', '操作失败，请稍后重试');
    }
  };

  const handleCleanup = (bookingId: number) => {
    navigate(`/cleanup/${bookingId}`);
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'upcoming') {
      return booking.status === 'pending' || booking.status === 'checked_in';
    }
    if (filter === 'completed') {
      return booking.status === 'completed' || booking.status === 'no_show' || booking.status === 'cancelled';
    }
    return true;
  });

  const pendingCleanup = bookings.filter(
    (b) => b.status === 'completed' && !b.cleanupConfirmed
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">我的预约</h1>
          <p className="text-gray-500">查看和管理您的躺椅预约记录</p>
        </div>

        {pendingCleanup.length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-amber-700 font-medium">有待完成的清洁确认</p>
                <p className="text-amber-600 text-sm mt-1">
                  您有 {pendingCleanup.length} 个预约需要完成清洁确认，请及时处理，否则影响后续预约。
                </p>
              </div>
              <button
                onClick={() => handleCleanup(pendingCleanup[0].id)}
                className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                去处理
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-1 mb-6 inline-flex">
          {[
            { key: 'all', label: '全部' },
            { key: 'upcoming', label: '待使用' },
            { key: 'completed', label: '已结束' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === tab.key
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p>加载中...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Sofa className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">暂无预约记录</p>
            <button
              onClick={() => navigate('/')}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl transition-colors"
            >
              去预约
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                        <span className="text-lg font-bold text-teal-700">
                          {booking.chairNumber.slice(-3)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {booking.chairNumber}
                        </h3>
                        <p className="text-sm text-gray-500">{booking.location}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(booking.date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {formatTimeRange(booking.startTime, booking.endTime)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {booking.location}
                    </div>
                  </div>

                  {booking.status === 'no_show' && (
                    <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        爽约扣除信用分 10 分
                      </div>
                    </div>
                  )}

                  {booking.status === 'completed' && !booking.cleanupConfirmed && (
                    <div className="bg-amber-50 text-amber-700 text-sm p-3 rounded-lg mb-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        等待清洁确认
                      </div>
                    </div>
                  )}

                  {booking.status === 'completed' && booking.cleanupConfirmed && (
                    <div className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-lg mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        清洁已确认
                        {booking.damageReported && <span className="ml-2">（有损坏报告）</span>}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleCheckin(booking.id)}
                          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <QrCode className="w-4 h-4" />
                          签到
                        </button>
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {booking.status === 'checked_in' && (
                      <>
                        <button
                          onClick={() => navigate(`/using/${booking.id}`)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition-colors"
                        >
                          查看使用状态
                        </button>
                        <button
                          onClick={() => handleEndUsage(booking.id)}
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
                        >
                          结束使用
                        </button>
                      </>
                    )}

                    {booking.status === 'completed' && !booking.cleanupConfirmed && (
                      <button
                        onClick={() => handleCleanup(booking.id)}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl font-medium transition-colors"
                      >
                        完成清洁确认
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
