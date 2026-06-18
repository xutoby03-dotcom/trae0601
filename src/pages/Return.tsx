import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Minus, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store';
import Header from '../components/layout/Header';
import { formatDateChinese } from '../utils/timeUtils';

export default function Return() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { getBookingById, getTableById, createReturnRecord, createDamageRecord, refreshData } = useAppStore();
  
  const [codeInput, setCodeInput] = useState('');
  const [racketReturned, setRacketReturned] = useState(0);
  const [hasDamage, setHasDamage] = useState(false);
  const [damageDesc, setDamageDesc] = useState('');
  const [ballMissing, setBallMissing] = useState(false);
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const booking = bookingId && bookingId !== 'quick' ? getBookingById(bookingId) : undefined;
  const table = booking ? getTableById(booking.tableId) : undefined;

  useEffect(() => {
    if (booking && racketReturned === 0 && booking.racketBorrowed > 0) {
      setRacketReturned(booking.racketBorrowed);
    }
  }, [booking, racketReturned]);

  const handleQuickReturn = () => {
    const allBookings = useAppStore.getState().bookings;
    const found = allBookings.find(
      (b) => b.bookingCode === codeInput && b.status === 'checked-in'
    );
    
    if (!found) {
      setError('预约码无效或该预约未签到');
      return;
    }

    navigate(`/return/${found.id}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!booking) {
      setError('请先输入预约码');
      return;
    }

    if (booking.racketBorrowed > 0 && racketReturned < booking.racketBorrowed) {
      if (!confirm(`归还数量(${racketReturned})少于借用数量(${booking.racketBorrowed})，确定吗？`)) {
        return;
      }
    }

    createReturnRecord({
      bookingId: booking.id,
      racketReturned,
      hasDamage,
      damageDesc,
      ballMissing,
      note,
    });

    if (hasDamage && damageDesc) {
      createDamageRecord({
        tableId: booking.tableId,
        type: 'racket',
        description: damageDesc,
      });
    }

    if (ballMissing) {
      createDamageRecord({
        tableId: booking.tableId,
        type: 'ball',
        description: '乒乓球遗失',
      });
    }

    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-md">
          <div className="card p-8 text-center animate-scale-pop">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">归还成功！</h2>
            <p className="text-gray-500 mb-6">感谢您的使用，欢迎下次再来 🏓</p>

            <div className="space-y-3 text-left mb-6 text-sm bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between">
                <span className="text-gray-500">球桌</span>
                <span className="font-medium">{table?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">归还球拍</span>
                <span className="font-medium">{racketReturned} 副</span>
              </div>
              {hasDamage && (
                <div className="flex justify-between text-yellow-600">
                  <span>器材损坏</span>
                  <span>{damageDesc}</span>
                </div>
              )}
              {ballMissing && (
                <div className="flex justify-between text-red-600">
                  <span>球遗失</span>
                  <span>是</span>
                </div>
              )}
            </div>

            <button onClick={() => navigate('/')} className="w-full btn-primary">
              返回首页
            </button>
          </div>
        </main>
      </div>
    );
  }

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
            <div className="w-20 h-20 bg-table-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🏸</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">器材归还</h2>
            <p className="text-gray-500 mb-6">输入预约码进行归还确认</p>

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
                onClick={handleQuickReturn}
                disabled={codeInput.length !== 6}
                className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                查询
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-500 mb-6 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>返回</span>
        </button>

        <div className="card p-6">
          <h2 className="font-display text-2xl font-bold text-gray-800 mb-6">器材归还确认</h2>

          <div className="bg-table-50 rounded-xl p-4 mb-6">
            <div className="space-y-2 text-sm">
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
                <span className="text-gray-500">借用球拍</span>
                <span className="font-medium">{booking.racketBorrowed} 副</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {booking.racketBorrowed > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  归还球拍数量
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setRacketReturned(Math.max(0, racketReturned - 1))}
                    className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-16 text-center text-2xl font-bold text-gray-800">
                    {racketReturned}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRacketReturned(Math.min(booking.racketBorrowed, racketReturned + 1))}
                    className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                  <span className="text-sm text-gray-500">
                    / {booking.racketBorrowed} 副
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDamage}
                  onChange={(e) => setHasDamage(e.target.checked)}
                  className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                />
                <span className="font-medium text-gray-700">球拍有损坏</span>
              </label>
              {hasDamage && (
                <textarea
                  value={damageDesc}
                  onChange={(e) => setDamageDesc(e.target.value)}
                  placeholder="请描述损坏情况..."
                  className="input-field mt-3 h-24 resize-none"
                />
              )}
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ballMissing}
                  onChange={(e) => setBallMissing(e.target.checked)}
                  className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                />
                <span className="font-medium text-gray-700">乒乓球遗失</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">备注</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="其他需要说明的情况..."
                className="input-field h-20 resize-none"
              />
            </div>

            <button type="submit" className="w-full btn-secondary text-lg py-4">
              确认归还
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
