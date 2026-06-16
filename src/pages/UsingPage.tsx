import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Clock, MapPin, QrCode, AlertCircle } from 'lucide-react';
import { bookingApi } from '../lib/api';
import { useToast } from '../components/Toast';
import { Booking } from '../../shared/types';
import { formatDate, formatTimeRange } from '../utils/time';

export default function UsingPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState('');
  const [elapsedTime, setElapsedTime] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadBooking();
    }
  }, [id]);

  useEffect(() => {
    if (!booking || booking.status !== 'checked_in') return;

    const timer = setInterval(() => {
      const now = dayjs();
      const endTime = dayjs(`${booking.date} ${booking.endTime}`);
      const startTime = dayjs(booking.checkedInAt!);

      const remaining = endTime.diff(now, 'minute');
      const elapsed = now.diff(startTime, 'minute');

      if (remaining > 0) {
        const hours = Math.floor(remaining / 60);
        const minutes = remaining % 60;
        setRemainingTime(`${hours > 0 ? `${hours}小时` : ''}${minutes}分钟`);
      } else {
        setRemainingTime('已超时');
      }

      const elapsedHours = Math.floor(elapsed / 60);
      const elapsedMinutes = elapsed % 60;
      setElapsedTime(`${elapsedHours > 0 ? `${elapsedHours}小时` : ''}${elapsedMinutes}分钟`);
    }, 1000);

    return () => clearInterval(timer);
  }, [booking]);

  const loadBooking = async () => {
    setLoading(true);
    try {
      const result = await bookingApi.getById(parseInt(id!));
      if (result.success && result.data) {
        setBooking(result.data);
      } else {
        showToast('error', result.message || '加载失败');
        navigate('/my-bookings');
      }
    } catch {
      showToast('error', '加载失败，请稍后重试');
      navigate('/my-bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleEndUsage = async () => {
    if (!booking) return;
    if (!confirm('确定要结束使用吗？结束后需要完成清洁确认。')) return;
    
    try {
      const result = await bookingApi.endUsage(booking.id);
      if (result.success) {
        showToast('success', '使用已结束，请完成清洁确认');
        navigate(`/cleanup/${booking.id}`);
      } else {
        showToast('error', result.message || '操作失败');
      }
    } catch {
      showToast('error', '操作失败，请稍后重试');
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

  if (!booking) return null;

  const isTimeUp = remainingTime === '已超时';

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-teal-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-teal-600/30">
              <div className="text-center text-white">
                <QrCode className="w-12 h-12 mx-auto mb-1" />
                <span className="text-lg font-bold">使用中</span>
              </div>
            </div>
            <div className="absolute inset-0 bg-teal-400 rounded-full animate-ping opacity-30" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-6">
            {booking.chairNumber}
          </h1>
          <p className="text-gray-500 mt-1">{booking.location}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-teal-600" />
                <span className="text-gray-600">预约日期</span>
              </div>
              <span className="font-medium text-gray-900">{formatDate(booking.date)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-teal-600" />
                <span className="text-gray-600">预约时段</span>
              </div>
              <span className="font-medium text-gray-900">
                {formatTimeRange(booking.startTime, booking.endTime)}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-teal-600" />
                <span className="text-gray-600">位置</span>
              </div>
              <span className="font-medium text-gray-900">{booking.location}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-teal-600" />
                <span className="text-gray-600">签到时间</span>
              </div>
              <span className="font-medium text-gray-900">
                {booking.checkedInAt ? dayjs(booking.checkedInAt).format('HH:mm:ss') : '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
            <p className="text-sm text-gray-500 mb-2">已使用</p>
            <p className="text-2xl font-bold text-teal-600">{elapsedTime || '-'}</p>
          </div>
          <div className={`bg-white rounded-2xl shadow-lg p-5 text-center ${isTimeUp ? 'ring-2 ring-red-500' : ''}`}>
            <p className="text-sm text-gray-500 mb-2">剩余时间</p>
            <p className={`text-2xl font-bold ${isTimeUp ? 'text-red-600' : 'text-amber-600'}`}>
              {remainingTime || '-'}
            </p>
          </div>
        </div>

        {isTimeUp && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium">使用时间已到</p>
                <p className="text-red-600 text-sm">请及时结束使用并完成清洁确认，以免影响下一位同事使用。</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-amber-50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700">
              <p className="font-medium">温馨提示</p>
              <ul className="mt-2 space-y-1 list-disc list-inside opacity-90">
                <li>使用完毕请点击下方"结束使用"按钮</li>
                <li>必须完成所有清洁项确认</li>
                <li>如有损坏请如实报告</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={handleEndUsage}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 text-lg"
        >
          结束使用
        </button>
      </div>
    </div>
  );
}
