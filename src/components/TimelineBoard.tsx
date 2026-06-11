import { useMemo, useState } from 'react';
import { Clock, Users, Coffee, X, CheckCircle, Calendar, Phone } from 'lucide-react';
import type { TableData, ReservationData } from '@shared/types';
import { useStore } from '@/store/useStore';
import ReservationModal from './ReservationModal';

const TablePhoto = ({ photo, tableNumber }: { photo?: string; tableNumber: string }) => {
  const [imgError, setImgError] = useState(false);
  if (photo && !imgError) {
    return (
      <img
        src={photo}
        alt={tableNumber}
        className="w-12 h-12 rounded-xl object-cover bg-gray-100 mx-auto mb-2"
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warm-200 to-warm-300 flex items-center justify-center text-warm-600 font-bold text-lg mx-auto mb-2">
      {tableNumber.charAt(0)}
    </div>
  );
};

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
  const { fetchReservations, fetchStats, checkInReservation } = useStore();
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [hoveredReservation, setHoveredReservation] = useState<ReservationData | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<ReservationData | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);

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

  const handleReservationClick = (reservation: ReservationData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedReservation(reservation);
  };

  const handleCheckIn = async () => {
    if (!selectedReservation || checkingIn) return;
    setCheckingIn(true);
    try {
      await checkInReservation(selectedReservation.id);
      await fetchReservations();
      await fetchStats();
      setSelectedReservation(null);
    } finally {
      setCheckingIn(false);
    }
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const getTableByReservation = (tableId: number) => {
    return tables.find(t => t.id === tableId);
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
              <div className="w-40 flex-shrink-0 p-4 bg-warm-50/50 border-r border-gray-100 flex flex-col items-start">
                <TablePhoto photo={table.photo} tableNumber={table.tableNumber} />
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
                  const isPending = reservation.status === 'pending';
                  
                  return (
                    <div
                      key={reservation.id}
                      className={`absolute top-2 bottom-2 rounded-lg ${colors.bg} ${colors.border} border ${isActive ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''} transition-all overflow-hidden`}
                      style={{ left: position.left, width: position.width }}
                      onMouseEnter={() => setHoveredReservation(reservation)}
                      onMouseLeave={() => setHoveredReservation(null)}
                      onClick={(e) => handleReservationClick(reservation, e)}
                    >
                      <div className="p-2 h-full flex flex-col justify-center">
                        <div className={`text-sm font-semibold ${colors.text} truncate`}>
                          {reservation.gameType}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {reservation.contactName}
                        </div>
                        {isPending && (
                          <div className="text-xs text-primary-500 flex items-center gap-1 mt-0.5 animate-pulse-soft">
                            <Clock size={10} />
                            <span>待签到</span>
                          </div>
                        )}
                      </div>

                      {hoveredReservation?.id === reservation.id && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 pointer-events-none">
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
                            {isPending && (
                              <div className="mt-2 pt-2 border-t border-gray-700 text-primary-300 text-center">
                                点击查看详情 / 签到
                              </div>
                            )}
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

      {selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full animate-slide-up overflow-hidden">
            <div className={`p-6 ${STATUS_COLORS[selectedReservation.status].bg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">
                    {getTableByReservation(selectedReservation.tableId)?.tableNumber} 号桌
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {selectedReservation.gameType}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              <div className="mt-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                  selectedReservation.status === 'pending' ? 'bg-primary-500 text-white' :
                  selectedReservation.status === 'checked_in' ? 'bg-success-600 text-white' :
                  selectedReservation.status === 'no_show' ? 'bg-red-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {STATUS_LABELS[selectedReservation.status]}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warm-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="text-warm-600" size={20} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">时间</div>
                  <div className="font-semibold text-gray-800">
                    {formatTime(selectedReservation.startTime)} - {formatTime(selectedReservation.endTime)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="text-blue-600" size={20} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">人数</div>
                  <div className="font-semibold text-gray-800">{selectedReservation.peopleCount} 人</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="text-success-600" size={20} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">联系人</div>
                  <div className="font-semibold text-gray-800">
                    {selectedReservation.contactName}
                  </div>
                  <div className="text-sm text-gray-500">{selectedReservation.contactPhone}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Coffee className="text-amber-600" size={20} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">茶水需求</div>
                  <div className="font-semibold text-gray-800">
                    {selectedReservation.teaRequirement || '无'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 space-y-3">
              {selectedReservation.status === 'pending' && (
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="w-full py-4 bg-success-500 hover:bg-success-600 disabled:bg-success-300 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  {checkingIn ? '签到中...' : '确认签到'}
                </button>
              )}

              {selectedReservation.status === 'pending' && (
                <p className="text-xs text-gray-400 text-center">
                  温馨提示：超过开始时间 15 分钟未签到将自动释放桌位
                </p>
              )}

              <button
                onClick={() => setSelectedReservation(null)}
                className="w-full py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
