import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, QrCode, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store';
import Header from '../components/layout/Header';
import { useTimer } from '../hooks/useTimer';
import { formatDateChinese, canCheckIn } from '../utils/timeUtils';

export default function CheckIn() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { getBookingById, getTableById, checkInBooking, refreshData } = useAppStore();
  
  const [codeInput, setCodeInput] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const booking = bookingId && bookingId !== 'quick' ? getBookingById(bookingId) : undefined;
  const table = booking ? getTableById(booking.tableId) : undefined;
  const timer = useTimer(booking?.date, booking?.endTime);
  const isCheckedInView = booking?.status === 'checked-in' || checkedIn;

  const handleQuickCheckIn = () => {
    refreshData();
    const allBookings = useAppStore.getState().bookings;
    const found = allBookings.find((b) => b.bookingCode === codeInput && b.status === 'pending');
    
    if (!found) {
      setError('预约码无效或已过期');
      return;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (!canCheckIn(found.startTime, currentTime)) {
      setError('签到时间未到或已超过签到期限');
      return;
    }

    const success = checkInBooking(found.id);
    if (success) {
      navigate(`/checkin/${found.id}`);
    } else {
      setError('签到失败，请重试');
    }
  };

  const handleCheckIn = () => {
    if (!booking) return;
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (!canCheckIn(booking.startTime, currentTime)) {
      setError('签到时间未到或已超过签到期限');
      return;
    }

    const success = checkInBooking(booking.id);
    if (success) {
      setCheckedIn(true);
    }
  };

  if (bookingId === 'quick' || !booking) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-md">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-500 mb-6 transition-colors"
          >
            <ChevronLeft size={20} />
            <span>返回</span>
          </button>

          <div className="card p-8 text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <QrCode size={40} className="text-primary-500" />
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">扫码签到</h2>
            <p className="text-gray-500 mb-6">输入6位预约码进行签到</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 flex items-center gap-3">
                <AlertTriangle size={20} />
                {error}
              </div>
            )}

            <div className="mb-6">
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="请输入预约码"
                className="input-field text-center text-3xl font-mono tracking-widest"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate('/')} className="flex-1 btn-outline">
                返回首页
              </button>
              <button
                onClick={handleQuickCheckIn}
                disabled={codeInput.length !== 6}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                签到
              </button>
            </div>

            <p className="mt-6 text-xs text-gray-400">
              提示：预约开始前15分钟至开始后15分钟内可签到
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!checkedIn && booking.status === 'pending') {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-md">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-500 mb-6 transition-colors"
          >
            <ChevronLeft size={20} />
            <span>返回</span>
          </button>

          <div className="card p-8">
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-6 text-center">确认签到</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 flex items-center gap-3">
                <AlertTriangle size={20} />
                {error}
              </div>
            )}

            <div className="bg-primary-50 rounded-2xl p-6 mb-6 text-center">
              <div className="text-sm text-gray-500 mb-2">预约码</div>
              <div className="font-display text-4xl font-bold text-primary-500 tracking-widest">
                {booking.bookingCode}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">球桌</span>
                <span className="font-medium">{table?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">日期</span>
                <span className="font-medium">{formatDateChinese(booking.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">时间</span>
                <span className="font-medium">{booking.startTime} - {booking.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">人数</span>
                <span className="font-medium">{booking.playerCount} 人</span>
              </div>
            </div>

            <button onClick={handleCheckIn} className="w-full btn-primary text-lg py-4">
              确认签到
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (isCheckedInView) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-md">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-500 mb-6 transition-colors"
          >
            <ChevronLeft size={20} />
            <span>返回</span>
          </button>

          <div className="card p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">签到成功！</h2>
            <p className="text-gray-500 mb-6">祝您打球愉快 🏓</p>

            <div className={`rounded-2xl p-6 mb-6 ${timer.isUrgent ? 'bg-red-50 border-2 border-red-300' : 'bg-table-50'}`}>
              <div className="text-sm text-gray-500 mb-2">剩余时间</div>
              <div className={`font-display text-5xl font-bold tracking-wider ${timer.isUrgent ? 'text-red-500 animate-pulse-soft' : 'text-table-600'}`}>
                {timer.timeString}
              </div>
              {timer.isUrgent && (
                <div className="mt-2 text-sm text-red-500 flex items-center justify-center gap-1">
                  <AlertTriangle size={14} />
                  时间即将结束，请准备归还器材
                </div>
              )}
            </div>

            <div className="space-y-3 text-left mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">球桌</span>
                <span className="font-medium">{table?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">结束时间</span>
                <span className="font-medium">{booking.endTime}</span>
              </div>
              {booking.racketBorrowed > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">借用球拍</span>
                  <span className="font-medium">{booking.racketBorrowed} 副</span>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate(`/return/${booking.id}`)}
              className="w-full btn-secondary text-lg py-4"
            >
              归还器材
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="card p-8 text-center">
          <p className="text-gray-500">该预约状态不支持签到</p>
          <button onClick={() => navigate('/')} className="mt-4 btn-primary">
            返回首页
          </button>
        </div>
      </main>
    </div>
  );
}
