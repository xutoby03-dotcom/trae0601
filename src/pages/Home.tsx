import { useAppStore } from '@/store/useAppStore';
import { getWeekDates, formatDate, formatDateDisplay, formatDateShort, isToday } from '@/utils/dateUtils';
import type { TimeSlot } from '@/types';
import SlotCard from '../components/Packing/SlotCard';
import { ChevronLeft, ChevronRight, Package, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Outlet } from 'react-router-dom';

const TIME_SLOTS: TimeSlot[] = ['morning', 'noon', 'evening', 'bedtime'];

export default function Home() {
  const { currentWeekDate, navigateWeek, packingSlots, packingItems, medicationRecords, medicines, schedules } = useAppStore();
  const weekDates = getWeekDates(currentWeekDate);
  const weekStart = formatDate(weekDates[0]);
  const weekEnd = formatDate(weekDates[6]);

  const totalSlots = weekDates.length * 4;
  const packedSlots = packingSlots.filter(
    (s) => s.date >= weekStart && s.date <= weekEnd && s.status !== 'pending'
  ).length;
  const takenSlots = medicationRecords.filter(
    (r) => r.status === 'taken' && packingSlots.find((s) => s.id === r.slotId)?.date >= weekStart
  ).length;
  const missedSlots = medicationRecords.filter(
    (r) => r.status === 'missed' && packingSlots.find((s) => s.id === r.slotId)?.date >= weekStart
  ).length;
  const lowStockCount = medicines.filter((m) => m.remainingPills < 10).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-1" style={{ fontFamily: '"Noto Serif SC", serif' }}>
          📅 一周分装计划
        </h1>
        <p className="text-gray-600">选择日期和时段，点击卡片进入分装操作</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-4 border border-emerald-100/60 flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{packedSlots}/{totalSlots}</div>
            <div className="text-xs text-gray-500">本周已分装</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 border border-emerald-100/60 flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-700">{takenSlots}</div>
            <div className="text-xs text-gray-500">已按时服药</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 border border-emerald-100/60 flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <Clock className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-700">{missedSlots}</div>
            <div className="text-xs text-gray-500">漏服次数</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 border border-emerald-100/60 flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-700">{lowStockCount}</div>
            <div className="text-xs text-gray-500">库存不足</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-md border border-emerald-100/60 p-4 sm:p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 rounded-xl hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">
              {formatDateShort(weekStart)} - {formatDate(weekDates[6]).slice(5).replace('-', '月')}日
            </div>
            <div className="text-xs text-gray-500">点击日期切换查看</div>
          </div>
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 rounded-xl hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {weekDates.map((d) => {
            const dateStr = formatDate(d);
            const today = isToday(dateStr);
            const packed = packingSlots.filter(
              (s) => s.date === dateStr && s.status !== 'pending'
            ).length;
            return (
              <div
                key={dateStr}
                className={`text-center p-2 sm:p-3 rounded-2xl transition-all cursor-pointer ${
                  today
                    ? 'bg-gradient-to-br from-amber-100 to-emerald-100 ring-2 ring-amber-400'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${today ? 'text-amber-700' : 'text-gray-500'}`}>
                  {['一', '二', '三', '四', '五', '六', '日'][d.getDay() === 0 ? 6 : d.getDay() - 1]}
                </div>
                <div className={`text-lg font-bold ${today ? 'text-amber-800' : 'text-gray-800'}`}>
                  {d.getDate()}
                </div>
                <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${(packed / 4) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-8">
        {weekDates.map((d) => {
          const dateStr = formatDate(d);
          const today = isToday(dateStr);
          return (
            <div
              key={dateStr}
              className={`transition-all ${
                today ? 'scale-[1.01]' : ''
              }`}
              style={{ animation: 'fadeInUp 0.5s ease-out both' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className={`text-xl font-bold flex items-center gap-2 ${
                  today ? 'text-amber-700' : 'text-gray-800'
                }`} style={{ fontFamily: '"Noto Serif SC", serif' }}>
                  {formatDateDisplay(dateStr)}
                  {today && (
                    <span className="text-xs px-3 py-1 rounded-full bg-amber-400 text-amber-900 font-bold">
                      今天
                    </span>
                  )}
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {TIME_SLOTS.map((slot) => {
                  const slotData = packingSlots.find(
                    (s) => s.date === dateStr && s.timeSlot === slot
                  );
                  if (!slotData) return null;
                  return (
                    <SlotCard key={slotData.id} slot={slotData} />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
}
