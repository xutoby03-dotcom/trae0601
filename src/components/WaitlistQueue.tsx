import { Clock, User, Phone, ChevronUp } from 'lucide-react';
import { Booking } from '@/types';

interface WaitlistQueueProps {
  bookings: Booking[];
  roomNumber: string;
  date: string;
  timeSlot: string;
}

export default function WaitlistQueue({ bookings, roomNumber, date, timeSlot }: WaitlistQueueProps) {
  if (bookings.length === 0) {
    return (
      <div className="card p-6 text-center">
        <Clock className="w-12 h-12 text-wood-300 mx-auto mb-3" />
        <p className="text-wood-500">该时段暂无候补</p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif font-semibold text-wood-900">
            {roomNumber} · {timeSlot}
          </h3>
          <p className="text-sm text-wood-500">{date}</p>
        </div>
        <span className="badge badge-waitlist">
          {bookings.length} 人候补
        </span>
      </div>

      <div className="space-y-2">
        {bookings.map((booking, index) => (
          <div
            key={booking.id}
            className="flex items-center gap-3 p-3 bg-cream-50 rounded-lg group hover:bg-cream-100 transition-all"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              index === 0 
                ? 'bg-gold-500 text-wood-900' 
                : 'bg-wood-200 text-wood-600'
            }`}>
              {booking.waitlistPosition}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-wood-900 truncate">
                  {booking.studentName}
                </p>
                {index === 0 && (
                  <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">
                    下一位
                  </span>
                )}
              </div>
              <p className="text-xs text-wood-500 truncate">
                {booking.major}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-wood-500">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {booking.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
              </span>
            </div>

            {index === 0 && (
              <div className="flex items-center text-green-600 text-xs animate-pulse">
                <ChevronUp className="w-4 h-4" />
                <span>即将顶上</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-cream-200">
        <p className="text-xs text-wood-500">
          <span className="font-medium">候补规则：</span>
          当前面的预约取消时，候补人员将按顺序自动顶上。候补成功后请按时使用。
        </p>
      </div>
    </div>
  );
}
