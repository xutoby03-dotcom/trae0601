import type { Booking, Table } from '../../types';
import { BookingStatusBadge } from '../common/StatusBadge';

interface TimelineViewProps {
  tables: Table[];
  bookings: Booking[];
  date: string;
}

export default function TimelineView({ tables, bookings, date }: TimelineViewProps) {
  const hours = Array.from({ length: 15 }, (_, i) => String(i + 8).padStart(2, '0'));
  
  const getBookingsForTable = (tableId: string) =>
    bookings.filter((b) => b.tableId === tableId && b.date === date && b.status !== 'cancelled' && b.status !== 'no-show');

  const getTimePosition = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return ((h - 8) * 60 + m) / (14 * 60) * 100;
  };

  const getDurationWidth = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startMins = (sh - 8) * 60 + sm;
    const endMins = (eh - 8) * 60 + em;
    return ((endMins - startMins) / (14 * 60)) * 100;
  };

  const colors = [
    'bg-primary-500',
    'bg-table-500',
    'bg-floor-500',
    'bg-purple-500',
    'bg-pink-500',
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="font-display text-lg font-bold mb-4 text-gray-800">今日排期</h3>
      
      <div className="relative">
        <div className="flex h-10 border-b-2 border-gray-200 mb-2">
          <div className="w-24 shrink-0" />
          {hours.map((h) => (
            <div
              key={h}
              className="flex-1 text-center text-xs text-gray-400 font-medium border-l border-gray-100"
            >
              {h}:00
            </div>
          ))}
        </div>

        {tables.map((table, tableIdx) => (
          <div key={table.id} className="flex items-stretch min-h-16 py-2 border-b border-gray-100">
            <div className="w-24 shrink-0 flex items-center pr-3">
              <span className="font-medium text-sm text-gray-700">{table.name}</span>
            </div>
            <div className="flex-1 relative h-12">
              {getBookingsForTable(table.id).map((booking, idx) => {
                const left = getTimePosition(booking.startTime);
                const width = getDurationWidth(booking.startTime, booking.endTime);
                const color = colors[(tableIdx + idx) % colors.length];
                
                return (
                  <div
                    key={booking.id}
                    className={`absolute top-0 h-full ${color} rounded-lg px-2 py-1 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  >
                    <div className="text-white text-xs truncate">
                      <div className="font-medium">
                        {booking.startTime} - {booking.endTime}
                      </div>
                      <div className="opacity-80 text-[10px] flex items-center gap-1">
                        <BookingStatusBadge status={booking.status} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
