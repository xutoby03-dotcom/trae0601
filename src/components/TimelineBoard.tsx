import { useMemo, useState } from 'react';
import { Clock, Users, Coffee, X } from 'lucide-react';
import type { TableData, ReservationData } from '@shared/types';
import ReservationModal from './ReservationModal';

interface TimelineBoardProps {
  tables: TableData[];
  reservations: ReservationData[];
  selectedDate: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-primary-100', text: 'text-primary-700', border: 'border-primary-300' },
  checked_in: { bg: 'bg-success-200', text: 'text-success-700', border: 'border-success-400' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300' },
  no_show: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-300' },
  cancelled: { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-200' },
};

const STATUS_LABELS: Record<string, string> = {
  pending: '待签到',
  checked_in: '已签到',
  completed: '已完成',
  no_show: '爽约',
  cancelled: '已取消',
};

export default function TimelineBoard({ tables, reservations, selectedDate }: TimelineBoardProps) {
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [hoveredReservation, setHoveredReservation] = useState<ReservationData | null>(null);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 8; h <= 22; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  const getReservationPosition = (reservation: ReservationData) => {
    const startDate = new Date(reservation.startTime);
    const endDate = new Date(reservation.endTime);
    
    const startHour = startDate.getHours() + startDate.getMinutes() / 60;
    const endHour = endDate.getHours() + endDate.getMinutes() / 60;
    
    const left = ((startHour - 8) / 14) * 100;
    const width = ((endHour - startHour) / 14) * 100;
    
    return { left: `${Math.max(0, left)}%`, width: `${Math.min(100 - left, width)}%` };
  };

  const reservationsByTable = useMemo(() => {
    const map: Record<number, ReservationData[]> = {};
    reservations.forEach(r => {
      if (!map[r.tableId]) map[r.tableId] = [];
      map[r.tableId].push(r);
    });
    return map;
  }, [reservations]);

  const handleSlotClick = (table: TableData, time: string) => {
    setSelectedTable(table);
    setSelectedTime(time);
    setShowModal(true);
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="flex border-b border-gray-100">
            <div className="w-40 flex-shrink-0 p-4 bg-warm-50 border-r border-gray-100">
              <span className="font-semibold text-gray-700">桌位</span>
            </div>
            <div className="flex-1 flex">
              {timeSlots.map(time => (
                <div
                  key={time}
                  className="flex-1 min-w-[60px] p-3 text-center text-sm text-gray-500 font-medium border-r border-gray-50 last:border-r-0"
                >
                  {time}
                </div>
              ))}
            </div>
          </div>

          {tables.map(table => (
            <div
              key={table.id}
              className="flex border-b border-gray-50 last:border-b-0 hover:bg-warm-50/30 transition-colors"
            >
              <div className="w-40 flex-shrink-0 p-4 bg-warm-50/50 border-r border-gray-100">
                <div className="font-bold text-lg text-gray-800">{table.tableNumber}</div>
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                  <Users size={14} />
                  <span>{table.capacity}人</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {table.isWindow && (
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">靠窗</span>
                  )}
                  {table.isMahjong && (
                    <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">麻将桌</span>
                  )}
                </div>
              </div>

              <div className="flex-1 relative h-20">
                {timeSlots.map((time, idx) => (
                  <div
                    key={time}
                    className="absolute top-0 bottom-0 border-l border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    style={{ left: `${(idx / 14) * 100}%`, width: `${(1 / 14) * 100}%` }}
                    onClick={() => handleSlotClick(table, time)}
                  />
                ))}

                {reservationsByTable[table.id]?.map(reservation => {
                  const position = getReservationPosition(reservation);
                  const colors = STATUS_COLORS[reservation.status];
                  const isActive = reservation.status === 'pending' || reservation.status === 'checked_in';
                  
                  return (
                    <div
                      key={reservation.id}
                      className={`absolute top-2 bottom-2 rounded-lg ${colors.bg} ${colors.border} border ${isActive ? 'cursor-pointer hover:shadow-md' : ''} transition-all overflow-hidden`}
                      style={{ left: position.left, width: position.width }}
                      onMouseEnter={() => setHoveredReservation(reservation)}
                      onMouseLeave={() => setHoveredReservation(null)}
                    >
                      <div className="p-2 h-full flex flex-col justify-center">
                        <div className={`text-sm font-semibold ${colors.text} truncate`}>
                          {reservation.gameType}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {reservation.contactName}
                        </div>
                      </div>

                      {hoveredReservation?.id === reservation.id && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10">
                          <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl whitespace-nowrap">
                            <div className="font-semibold mb-1">{reservation.gameType} - {STATUS_LABELS[reservation.status]}</div>
                            <div className="text-gray-300 space-y-0.5">
                              <div>{formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}</div>
                              <div>{reservation.contactName} ({reservation.peopleCount}人)</div>
                              {reservation.teaRequirement && (
                                <div className="flex items-center gap-1">
                                  <Coffee size={12} />
                                  {reservation.teaRequirement}
                                </div>
                              )}
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {tables.length === 0 && (
        <div className="py-16 text-center text-gray-400">
          <Clock size={48} className="mx-auto mb-3 opacity-30" />
          <p>暂无桌位数据</p>
        </div>
      )}

      {showModal && selectedTable && (
        <ReservationModal
          table={selectedTable}
          selectedDate={selectedDate}
          defaultStartTime={selectedTime}
          onClose={() => {
            setShowModal(false);
            setSelectedTable(null);
          }}
        />
      )}
    </div>
  );
}
