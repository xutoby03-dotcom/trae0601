import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Minus, Plus, CheckCircle2, AlertTriangle, Package, BadgeCheck, AlertCircle, CircleDot } from 'lucide-react';
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
      if (!confirm(`归还数量(${racketReturned})少于借用数量(${booking.racketBorrowed})，差额将登记为遗失，确定吗？`)) {
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

    if (booking.racketBorrowed > 0 && racketReturned < booking.racketBorrowed) {
      const missingCount = booking.racketBorrowed - racketReturned;
      createDamageRecord({
        tableId: booking.tableId,
        type: 'racket',
        description: `球拍遗失 ${missingCount} 副${note ? `，备注：${note}` : ''}`,
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

            <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left">
              <div className="text-xs text-gray-400 mb-3 font-medium">归还明细</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">球桌</span>
                  <span className="font-medium text-gray-800">{table?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">借用球拍</span>
                  <span className="font-medium text-gray-800">{booking?.racketBorrowed || 0} 副</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">归还球拍</span>
                  <span className="font-bold text-green-600">{racketReturned} 副</span>
                </div>
                {booking && booking.racketBorrowed > 0 && racketReturned < booking.racketBorrowed && (
                  <div className="flex justify-between items-center text-orange-600 bg-orange-50 rounded-lg p-2">
                    <span className="text-sm">球拍遗失</span>
                    <span className="font-medium">{booking.racketBorrowed - racketReturned} 副</span>
                  </div>
                )}
                {hasDamage && (
                  <div className="text-yellow-600 bg-yellow-50 rounded-lg p-3">
                    <div className="font-medium text-sm mb-1">器材损坏</div>
                    <div className="text-sm">{damageDesc}</div>
                  </div>
                )}
                {ballMissing && (
                  <div className="flex justify-between items-center text-red-600 bg-red-50 rounded-lg p-2">
                    <span className="text-sm">乒乓球遗失</span>
                    <span className="font-medium">是</span>
                  </div>
                )}
                {(hasDamage || ballMissing || (booking && booking.racketBorrowed > 0 && racketReturned < booking.racketBorrowed)) && (
                  <div className="text-xs text-blue-600 bg-blue-50 rounded-lg p-2 flex items-center gap-1.5">
                    <AlertCircle size={12} />
                    <span>异常情况已登记，管理员稍后会联系您</span>
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => navigate('/')} className="w-full btn-primary font-bold">
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

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Package size={24} className="text-primary-500" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-gray-800">器材归还确认</h2>
                <p className="text-gray-500 text-sm">请核对以下信息，确认无误后提交</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-table-50 to-primary-50 rounded-xl p-5 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">球桌</span>
                  <div className="font-medium text-gray-800 mt-1">{table?.name}</div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">日期</span>
                  <div className="font-medium text-gray-800 mt-1">{formatDateChinese(booking.date)}</div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">使用时间</span>
                  <div className="font-medium text-gray-800 mt-1">{booking.startTime} - {booking.endTime}</div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">预约码</span>
                  <div className="font-mono font-medium text-primary-600 mt-1">{booking.bookingCode}</div>
                </div>
              </div>
            </div>

            <div className="border-2 border-primary-200 rounded-xl p-5 mb-6 bg-primary-50/50">
              <div className="flex items-center gap-2 mb-4">
                <BadgeCheck size={20} className="text-primary-500" />
                <h3 className="font-bold text-gray-800">借用明细</h3>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-table-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🏸</span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">借用球拍</div>
                    <div className="font-bold text-gray-800">{booking.racketBorrowed} 副</div>
                  </div>
                </div>
                {booking.racketBorrowed > 0 && (
                  <div className="text-xs text-table-600 bg-table-100 px-3 py-1 rounded-full">
                    需全数归还
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <CircleDot size={20} className="text-table-500" />
              <h3 className="font-bold text-gray-800">归还确认</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {booking.racketBorrowed > 0 && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    归还球拍数量
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setRacketReturned(Math.max(0, racketReturned - 1))}
                      className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center hover:border-primary-300 hover:bg-primary-50 transition-all"
                    >
                      <Minus size={20} />
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-4xl font-bold text-gray-800">
                        {racketReturned}
                      </span>
                      <span className="text-gray-400 text-xl mx-2">/</span>
                      <span className="text-2xl font-medium text-gray-400">
                        {booking.racketBorrowed}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">副</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRacketReturned(Math.min(booking.racketBorrowed, racketReturned + 1))}
                      className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center hover:border-primary-300 hover:bg-primary-50 transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  {racketReturned < booking.racketBorrowed && (
                    <div className="mt-3 text-xs text-orange-600 bg-orange-50 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                      <span>归还数量少于借用数量，将登记为遗失</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-yellow-200 transition-colors">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDamage}
                      onChange={(e) => setHasDamage(e.target.checked)}
                      className="w-5 h-5 rounded text-yellow-500 focus:ring-yellow-500"
                    />
                    <div>
                      <span className="font-medium text-gray-700">器材有损坏</span>
                      <p className="text-xs text-gray-400 mt-0.5">如球拍断裂、胶皮脱落等</p>
                    </div>
                  </label>
                  {hasDamage && (
                    <textarea
                      value={damageDesc}
                      onChange={(e) => setDamageDesc(e.target.value)}
                      placeholder="请详细描述损坏情况，例如：第2副球拍胶皮脱落、球拍框有裂痕..."
                      className="input-field mt-4 h-24 resize-none text-sm"
                    />
                  )}
                </div>

                <div className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-red-200 transition-colors">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ballMissing}
                      onChange={(e) => setBallMissing(e.target.checked)}
                      className="w-5 h-5 rounded text-red-500 focus:ring-red-500"
                    />
                    <div>
                      <span className="font-medium text-gray-700">乒乓球遗失</span>
                      <p className="text-xs text-gray-400 mt-0.5">如有遗失需照价赔偿</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">其他说明（可选）</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="其他需要说明的情况..."
                  className="input-field h-20 resize-none text-sm bg-white"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 flex items-center gap-3">
                  <AlertTriangle size={20} />
                  {error}
                </div>
              )}

              <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">提交后将：</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-blue-600">
                    <li>标记本次预约为已完成</li>
                    <li>损坏/遗失记录将提交管理员审核</li>
                  </ul>
                </div>
              </div>

              <button type="submit" className="w-full btn-secondary text-lg py-4 font-bold">
                确认归还
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
