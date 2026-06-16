import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QrCode, Clock, MapPin, AlertCircle } from 'lucide-react';
import { bookingApi } from '../lib/api';
import { useToast } from '../components/Toast';
import { useAuthStore } from '../store/auth';
import { Booking } from '../../shared/types';
import { formatDate, formatTimeRange } from '../utils/time';

export default function CheckinPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { refreshUser } = useAuthStore();

  useEffect(() => {
    if (id) {
      loadBooking();
    }
  }, [id]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

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

  const handleCheckin = async () => {
    if (!booking) return;

    setCheckingIn(true);
    try {
      const result = await bookingApi.checkin(booking.id);
      if (result.success) {
        showToast('success', '签到成功！祝您午休愉快');
        await refreshUser();
        setCountdown(2);
        setTimeout(() => {
          navigate(`/using/${booking.id}`);
        }, 2000);
      } else {
        showToast('error', result.message || '签到失败');
      }
    } catch {
      showToast('error', '签到失败，请稍后重试');
    } finally {
      setCheckingIn(false);
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

  if (countdown !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center animate-[fadeIn_0.3s_ease-out]">
          <div className="w-24 h-24 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-teal-600/30">
            <span className="text-4xl font-bold text-white">{countdown}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">签到成功！</h2>
          <p className="text-gray-500">正在进入使用页面...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">扫码签到</h1>
          <p className="text-gray-500">请扫描躺椅上的二维码完成签到</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <div className="bg-gray-100 rounded-2xl p-8 mb-6 flex items-center justify-center">
            <div className="relative">
              <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center border-4 border-teal-600">
                <QrCode className="w-32 h-32 text-gray-800" />
              </div>
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-teal-600 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-teal-600 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-teal-600 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-teal-600 rounded-br-lg" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{booking.chairNumber}</h2>
            <p className="text-gray-500">{booking.location}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-4 h-4" />
                日期
              </div>
              <span className="font-medium text-gray-900">{formatDate(booking.date)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-4 h-4" />
                时段
              </div>
              <span className="font-medium text-gray-900">
                {formatTimeRange(booking.startTime, booking.endTime)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-4 h-4" />
                位置
              </div>
              <span className="font-medium text-gray-900">{booking.location}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">签到说明</p>
              <ul className="mt-1 space-y-1 list-disc list-inside opacity-90">
                <li>请在预约开始前10分钟内签到</li>
                <li>扫描躺椅上的二维码完成签到</li>
                <li>超时15分钟未签到将被视为爽约</li>
                <li>爽约扣除信用分10分</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={handleCheckin}
          disabled={checkingIn || booking.status !== 'pending'}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-teal-600/30 hover:shadow-xl hover:shadow-teal-600/40 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {checkingIn ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              签到中...
            </>
          ) : (
            <>
              <QrCode className="w-5 h-5" />
              模拟扫码签到
            </>
          )}
        </button>

        {booking.status !== 'pending' && (
          <p className="text-center text-sm text-amber-600 mt-3">
            当前预约状态不支持签到
          </p>
        )}
      </div>
    </div>
  );
}
