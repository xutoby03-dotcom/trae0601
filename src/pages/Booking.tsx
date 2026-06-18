import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Minus, Plus, CheckCircle2, XCircle } from 'lucide-react';
import { useAppStore } from '../store';
import Header from '../components/layout/Header';
import TimeSlotPicker from '../components/booking/TimeSlotPicker';
import { formatDateChinese, getTodayString } from '../utils/timeUtils';
import { addDays, format } from 'date-fns';
import type { Table } from '../types';

export default function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableIdFromUrl = searchParams.get('table');
  
  const { tables, bookings, currentPhone, setCurrentPhone, createBooking, refreshData } = useAppStore();
  
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [playerCount, setPlayerCount] = useState(2);
  const [racketBorrowed, setRacketBorrowed] = useState(0);
  const [phone, setPhone] = useState(currentPhone);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [bookingCode, setBookingCode] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (tableIdFromUrl) {
      const table = tables.find((t) => t.id === tableIdFromUrl);
      if (table) setSelectedTable(table);
    } else if (tables.length > 0 && !selectedTable) {
      setSelectedTable(tables[0]);
    }
  }, [tableIdFromUrl, tables, selectedTable]);

  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: formatDateChinese(date),
      isToday: i === 0,
    };
  });

  const existingBookings = bookings.filter(
    (b) => b.tableId === selectedTable?.id && b.date === selectedDate
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedTable) {
      setError('请选择球桌');
      return;
    }
    if (!startTime || !endTime) {
      setError('请选择预约时段');
      return;
    }
    if (!/^1\d{10}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }
    if (racketBorrowed > selectedTable.racketCount) {
      setError(`该球桌只有 ${selectedTable.racketCount} 副球拍可用`);
      return;
    }

    setCurrentPhone(phone);

    const result = createBooking({
      tableId: selectedTable.id,
      date: selectedDate,
      startTime,
      endTime,
      playerCount,
      racketBorrowed,
      phone,
    });

    if (result.success && result.booking) {
      setBookingCode(result.booking.bookingCode);
      setShowSuccess(true);
    } else {
      setError(result.message || '预约失败，请重试');
    }
  };

  const handleTimeChange = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-lg">
          <div className="card p-8 text-center animate-scale-pop">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">预约成功！</h2>
            <p className="text-gray-500 mb-6">请按时到场，凭预约码签到</p>
            
            <div className="bg-primary-50 rounded-2xl p-6 mb-6">
              <div className="text-sm text-gray-500 mb-2">您的预约码</div>
              <div className="font-display text-4xl font-bold text-primary-500 tracking-widest">
                {bookingCode}
              </div>
            </div>

            <div className="space-y-3 text-left mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">球桌</span>
                <span className="font-medium">{selectedTable?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">日期</span>
                <span className="font-medium">{formatDateChinese(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">时间</span>
                <span className="font-medium">{startTime} - {endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">人数</span>
                <span className="font-medium">{playerCount} 人</span>
              </div>
              {racketBorrowed > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">借球拍</span>
                  <span className="font-medium">{racketBorrowed} 副</span>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex-1 btn-outline"
              >
                返回首页
              </button>
              <button
                onClick={() => navigate('/my-bookings')}
                className="flex-1 btn-primary"
              >
                查看预约
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
          <h2 className="font-display text-2xl font-bold text-gray-800 mb-6">预约球桌</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 flex items-center gap-3">
              <XCircle size={20} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">选择球桌</label>
              <div className="grid grid-cols-2 gap-4">
                {tables.map((table) => (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => {
                      setSelectedTable(table);
                      setStartTime('');
                      setEndTime('');
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedTable?.id === table.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={table.status !== 'available'}
                  >
                    <div className="font-medium">{table.name}</div>
                    <div className="text-xs text-gray-500">{table.location}</div>
                    <div className="text-xs text-floor-500 mt-1">
                      球拍: {table.racketCount} 副
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">选择日期</label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {availableDates.map((date) => (
                  <button
                    key={date.value}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date.value);
                      setStartTime('');
                      setEndTime('');
                    }}
                    className={`px-4 py-3 rounded-xl whitespace-nowrap text-sm font-medium transition-all shrink-0 ${
                      selectedDate === date.value
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {date.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedTable && (
              <TimeSlotPicker
                table={selectedTable}
                selectedDate={selectedDate}
                startTime={startTime}
                endTime={endTime}
                onTimeChange={handleTimeChange}
                existingBookings={existingBookings}
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                打球人数 <span className="text-gray-400">(1-4人)</span>
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setPlayerCount(Math.max(1, playerCount - 1))}
                  className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Minus size={20} />
                </button>
                <span className="w-16 text-center text-2xl font-bold text-gray-800">
                  {playerCount}
                </span>
                <button
                  type="button"
                  onClick={() => setPlayerCount(Math.min(4, playerCount + 1))}
                  className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                借球拍 <span className="text-gray-400">(0-4副)</span>
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setRacketBorrowed(Math.max(0, racketBorrowed - 1))}
                  className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Minus size={20} />
                </button>
                <span className="w-16 text-center text-2xl font-bold text-gray-800">
                  {racketBorrowed}
                </span>
                <button
                  type="button"
                  onClick={() => setRacketBorrowed(Math.min(4, racketBorrowed + 1))}
                  className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Plus size={20} />
                </button>
                <span className="text-sm text-gray-500">
                  (可用: {selectedTable?.racketCount || 0} 副)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">手机号</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="请输入11位手机号"
                className="input-field"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
              <p className="font-medium mb-1">📋 预约规则</p>
              <ul className="list-disc list-inside space-y-1 text-blue-600">
                <li>单次预约最多2小时，同一天最多预约3小时</li>
                <li>预约开始后15分钟未签到将自动取消并记为爽约</li>
                <li>请爱护器材，如有损坏需照价赔偿</li>
              </ul>
            </div>

            <button type="submit" className="w-full btn-primary text-lg py-4">
              确认预约
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
