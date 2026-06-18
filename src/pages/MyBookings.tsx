import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, Users, BadgeCheck, QrCode, X } from 'lucide-react';
import { useAppStore } from '../store';
import Header from '../components/layout/Header';
import { BookingStatusBadge } from '../components/common/StatusBadge';
import { formatDateChinese } from '../utils/timeUtils';
import type { Booking } from '../types';

export default function MyBookings() {
  const navigate = useNavigate();
  const { currentPhone, getBookingsByPhone, getTableById, cancelBooking, refreshData } = useAppStore();
  const [phone, setPhone] = useState(currentPhone);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showPhoneInput, setShowPhoneInput] = useState(!currentPhone);

  useEffect(() => {
    refreshData();
    if (currentPhone) {
      setBookings(getBookingsByPhone(currentPhone));
    }
  }, []);

  useEffect(() => {
    if (currentPhone) {
      setBookings(getBookingsByPhone(currentPhone));
    }
  }, [currentPhone, getBookingsByPhone]);

  const handleQuery = () => {
    if (!/^1\d{10}$/.test(phone)) {
      alert('请输入正确的手机号');
      return;
    }
    refreshData();
    setBookings(getBookingsByPhone(phone));
    setShowPhoneInput(false);
  };

  const handleCancel = (bookingId: string) => {
    if (confirm('确定要取消这个预约吗？')) {
      cancelBooking(bookingId);
      setBookings(getBookingsByPhone(phone));
    }
  };

  const handleCheckIn = (bookingId: string) => {
    navigate(`/checkin/${bookingId}`);
  };

  const handleReturn = (bookingId: string) => {
    navigate(`/return/${bookingId}`);
  };

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

        <div className="card p-6 mb-6">
          <h2 className="font-display text-2xl font-bold text-gray-800 mb-4">我的预约</h2>
          
          {showPhoneInput ? (
            <div className="flex gap-3">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="请输入手机号查询预约"
                className="input-field flex-1"
              />
              <button onClick={handleQuery} className="btn-primary">
                查询
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-gray-600">
                当前手机号: <span className="font-medium text-gray-800">{phone}</span>
              </div>
              <button
                onClick={() => setShowPhoneInput(true)}
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                切换
              </button>
            </div>
          )}
        </div>

        {!showPhoneInput && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="card p-12 text-center text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                <p>暂无预约记录</p>
                <button
                  onClick={() => navigate('/booking')}
                  className="mt-4 btn-primary"
                >
                  立即预约
                </button>
              </div>
            ) : (
              bookings.map((booking) => {
                const table = getTableById(booking.tableId);
                const canCheckIn = booking.status === 'pending';
                const canReturn = booking.status === 'checked-in';
                const canCancel = booking.status === 'pending';

                return (
                  <div key={booking.id} className="card p-5 animate-fade-in">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-display text-lg font-bold text-gray-800">
                            {table?.name || '未知球桌'}
                          </h3>
                          <BookingStatusBadge status={booking.status} />
                        </div>
                        <div className="text-sm text-gray-500">
                          预约码: <span className="font-mono text-primary-500">{booking.bookingCode}</span>
                        </div>
                      </div>
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} className="text-table-500" />
                        {formatDateChinese(booking.date)}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={16} className="text-primary-500" />
                        {booking.startTime} - {booking.endTime}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={16} className="text-floor-500" />
                        {booking.playerCount} 人
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <BadgeCheck size={16} className="text-purple-500" />
                        球拍 {booking.racketBorrowed} 副
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {canCheckIn && (
                        <button
                          onClick={() => handleCheckIn(booking.id)}
                          className="flex-1 btn-primary flex items-center justify-center gap-2"
                        >
                          <QrCode size={18} />
                          签到
                        </button>
                      )}
                      {canReturn && (
                        <button
                          onClick={() => handleReturn(booking.id)}
                          className="flex-1 btn-secondary flex items-center justify-center gap-2"
                        >
                          归还器材
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
