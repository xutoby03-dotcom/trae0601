import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { TrendingUp, Users, Clock, AlertTriangle, Lock, Calendar } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { TIME_SLOTS } from '@/types';
import { formatDisplayDate, getNext7Days } from '@/utils/bookingUtils';

const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function Dashboard() {
  const { rooms, bookings, currentRole } = useAppStore();
  const days = getNext7Days();

  const statistics = useMemo(() => {
    const totalSlotsPerRoomPerWeek = TIME_SLOTS.length * 7;
    
    const roomUtilization = rooms.map(room => {
      const roomBookings = bookings.filter(
        b => b.roomId === room.id && 
             b.status !== 'cancelled' && 
             !b.isWaitlist &&
             days.includes(b.date)
      );
      
      const weeklyData = days.map(date => {
        const dayBookings = roomBookings.filter(b => b.date === date);
        return Math.round((dayBookings.length / TIME_SLOTS.length) * 100);
      });
      
      const totalBooked = roomBookings.length;
      const utilizationRate = Math.round((totalBooked / totalSlotsPerRoomPerWeek) * 100);
      
      return {
        roomId: room.id,
        roomNumber: room.roomNumber,
        utilizationRate: Math.min(utilizationRate, 100),
        weeklyData,
      };
    }).sort((a, b) => b.utilizationRate - a.utilizationRate);

    const noShowStudents = bookings
      .filter(b => b.status === 'no_show')
      .reduce((acc, booking) => {
        const existing = acc.find(s => s.studentName === booking.studentName);
        if (existing) {
          existing.noShowCount++;
        } else {
          acc.push({ studentName: booking.studentName, noShowCount: 1 });
        }
        return acc;
      }, [] as { studentName: string; noShowCount: number }[])
      .sort((a, b) => b.noShowCount - a.noShowCount);

    const peakTimeSlots = [];
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      for (const slot of TIME_SLOTS) {
        const count = bookings.filter(
          b => b.date === days[dayIdx] && 
               b.timeSlot === slot && 
               b.status !== 'cancelled' &&
               !b.isWaitlist
        ).length;
        peakTimeSlots.push({
          timeSlot: slot,
          dayOfWeek: dayIdx,
          dayName: WEEKDAYS[dayIdx],
          bookingCount: count,
        });
      }
    }

    const totalBookings = bookings.filter(b => b.status !== 'cancelled' && !b.isWaitlist && days.includes(b.date)).length;
    const totalWaitlist = bookings.filter(b => b.isWaitlist && b.status === 'waitlist').length;
    const totalNoShows = bookings.filter(b => b.status === 'no_show').length;
    const avgUtilization = Math.round(
      roomUtilization.reduce((sum, r) => sum + r.utilizationRate, 0) / roomUtilization.length
    );

    return {
      roomUtilization,
      noShowStudents,
      peakTimeSlots,
      summary: {
        totalBookings,
        totalWaitlist,
        totalNoShows,
        avgUtilization,
      },
    };
  }, [rooms, bookings, days]);

  const peakSlotData = useMemo(() => {
    return TIME_SLOTS.map(slot => {
      const slotData = statistics.peakTimeSlots.filter(d => d.timeSlot === slot);
      const total = slotData.reduce((sum, d) => sum + d.bookingCount, 0);
      return {
        time: slot.split('-')[0],
        预约数: total,
        avg: Math.round(total / 7),
      };
    });
  }, [statistics.peakTimeSlots]);

  const heatmapData = useMemo(() => {
    return WEEKDAYS.map((day, dayIdx) => {
      const row: Record<string, any> = { day };
      TIME_SLOTS.forEach(slot => {
        const data = statistics.peakTimeSlots.find(
          d => d.dayOfWeek === dayIdx && d.timeSlot === slot
        );
        row[slot] = data?.bookingCount || 0;
      });
      return row;
    });
  }, [statistics.peakTimeSlots]);

  const getHeatmapColor = (value: number) => {
    if (value === 0) return '#F5F1E8';
    if (value <= 1) return '#E8D4B8';
    if (value <= 2) return '#D4B896';
    if (value <= 3) return '#A67C52';
    return '#5D4037';
  };

  if (currentRole === 'student') {
    return (
      <div className="card p-12 text-center">
        <Lock className="w-16 h-16 text-wood-300 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-bold text-wood-900 mb-2">权限不足</h2>
        <p className="text-wood-600 mb-4">请切换到老师或管理员身份以使用此功能</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-wood-900 mb-2">统计看板</h1>
        <p className="text-wood-600">琴房使用数据统计与分析（未来7天）</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-6 bg-gradient-to-br from-wood-50 to-wood-100 opacity-0 animate-fade-in-up animate-stagger-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-wood-700 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-gold-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-4xl font-bold text-wood-900 mb-1">{statistics.summary.totalBookings}</p>
          <p className="text-sm text-wood-600">总预约数</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-gold-50 to-gold-100 opacity-0 animate-fade-in-up animate-stagger-2">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gold-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-wood-900" />
            </div>
            <TrendingUp className="w-5 h-5 text-wood-700" />
          </div>
          <p className="text-4xl font-bold text-wood-900 mb-1">{statistics.summary.avgUtilization}%</p>
          <p className="text-sm text-wood-600">平均利用率</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 opacity-0 animate-fade-in-up animate-stagger-3">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-wood-900" />
            </div>
            <Clock className="w-5 h-5 text-yellow-700" />
          </div>
          <p className="text-4xl font-bold text-wood-900 mb-1">{statistics.summary.totalWaitlist}</p>
          <p className="text-sm text-wood-600">候补人数</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-red-50 to-red-100 opacity-0 animate-fade-in-up animate-stagger-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-4xl font-bold text-wood-900 mb-1">{statistics.summary.totalNoShows}</p>
          <p className="text-sm text-wood-600">爽约次数</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="card p-6 opacity-0 animate-fade-in-up animate-stagger-5">
          <h3 className="font-serif text-lg font-semibold text-wood-900 mb-4">各琴房利用率</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statistics.roomUtilization} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE7D9" />
                <XAxis type="number" domain={[0, 100]} unit="%" stroke="#8B7355" />
                <YAxis type="category" dataKey="roomNumber" width={60} stroke="#8B7355" />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, '利用率']}
                  contentStyle={{ backgroundColor: '#FAF8F5', border: '1px solid #EDE7D9', borderRadius: '8px' }}
                />
                <Bar dataKey="utilizationRate" radius={[0, 4, 4, 0]}>
                  {statistics.roomUtilization.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.utilizationRate >= 70 ? '#5D4037' : entry.utilizationRate >= 50 ? '#8B5A2B' : '#A67C52'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 opacity-0 animate-fade-in-up animate-stagger-6">
          <h3 className="font-serif text-lg font-semibold text-wood-900 mb-4">各时段预约分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={peakSlotData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE7D9" />
                <XAxis dataKey="time" stroke="#8B7355" />
                <YAxis stroke="#8B7355" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FAF8F5', border: '1px solid #EDE7D9', borderRadius: '8px' }}
                />
                <Line
                  type="monotone"
                  dataKey="预约数"
                  stroke="#5D4037"
                  strokeWidth={3}
                  dot={{ fill: '#5D4037', r: 4 }}
                  activeDot={{ fill: '#FBC02D', r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="#A67C52"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-wood-700"></div>
              <span className="text-wood-600">总预约数</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-wood-400 border-dashed"></div>
              <span className="text-wood-600">日均</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card p-6 opacity-0 animate-fade-in-up animate-stagger-7">
          <h3 className="font-serif text-lg font-semibold text-wood-900 mb-4">预约热力分布</h3>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-[60px_repeat(14,1fr)] gap-1 mb-2">
                <div></div>
                {TIME_SLOTS.map(slot => (
                  <div key={slot} className="text-xs text-center text-wood-500 py-1">
                    {slot.split('-')[0]}
                  </div>
                ))}
              </div>
              {heatmapData.map((row, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-[60px_repeat(14,1fr)] gap-1 mb-1">
                  <div className="text-xs text-wood-600 flex items-center">
                    {row.day}
                  </div>
                  {TIME_SLOTS.map(slot => (
                    <div
                      key={slot}
                      className="h-8 rounded transition-all hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: getHeatmapColor(row[slot]) }}
                      title={`${row.day} ${slot}: ${row[slot]} 个预约`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="text-xs text-wood-500">少</span>
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className="w-6 h-6 rounded"
                style={{ backgroundColor: getHeatmapColor(level) }}
              />
            ))}
            <span className="text-xs text-wood-500">多</span>
          </div>
        </div>

        <div className="card p-6 opacity-0 animate-fade-in-up animate-stagger-8">
          <h3 className="font-serif text-lg font-semibold text-wood-900 mb-4">爽约学生记录</h3>
          {statistics.noShowStudents.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-wood-300 mx-auto mb-3" />
              <p className="text-wood-500">暂无爽约记录</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[320px] overflow-y-auto">
              {statistics.noShowStudents.map((student, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-cream-50 rounded-lg hover:bg-cream-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      student.noShowCount >= 3 ? 'bg-red-500 text-white' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {student.noShowCount}
                    </div>
                    <div>
                      <p className="font-medium text-wood-900">{student.studentName}</p>
                      <p className="text-xs text-wood-500">
                        {student.noShowCount >= 3 ? '已暂停预约权限' : `累计 ${student.noShowCount} 次爽约`}
                      </p>
                    </div>
                  </div>
                  {student.noShowCount >= 3 && (
                    <span className="badge bg-red-100 text-red-700">已限制</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6 mt-6 opacity-0 animate-fade-in-up animate-stagger-8">
        <h3 className="font-serif text-lg font-semibold text-wood-900 mb-4">各琴房周利用率趋势</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={days.map((date, idx) => ({
              date: formatDisplayDate(date),
              ...statistics.roomUtilization.reduce((acc, room) => {
                acc[room.roomNumber] = room.weeklyData[idx];
                return acc;
              }, {} as Record<string, number>),
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE7D9" />
              <XAxis dataKey="date" stroke="#8B7355" />
              <YAxis domain={[0, 100]} unit="%" stroke="#8B7355" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FAF8F5', border: '1px solid #EDE7D9', borderRadius: '8px' }}
              />
              {statistics.roomUtilization.map((room, idx) => (
                <Line
                  key={room.roomId}
                  type="monotone"
                  dataKey={room.roomNumber}
                  stroke={['#5D4037', '#8B5A2B', '#A67C52', '#D4B896', '#FBC02D', '#FFD54F', '#FFEE58', '#FFF59D'][idx % 8]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
          {statistics.roomUtilization.map((room, idx) => (
            <div key={room.roomId} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: ['#5D4037', '#8B5A2B', '#A67C52', '#D4B896', '#FBC02D', '#FFD54F', '#FFEE58', '#FFF59D'][idx % 8] }}
              />
              <span className="text-sm text-wood-600">{room.roomNumber} ({room.utilizationRate}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
