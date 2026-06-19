import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  Droplets,
  CheckCircle,
  Clock,
  Hand,
  MapPin,
  Plus,
} from 'lucide-react';
import { useStore } from '../store/useStore.js';
import ScheduleCard from '../components/ScheduleCard.js';
import WeatherBanner from '../components/WeatherBanner.js';
import { TIME_SLOT_LABELS } from '@shared/types.js';
import {
  formatDate,
  getWeekDateStrings,
  getTimeSlotLabel,
  formatChineseDate,
} from '../utils/dateUtils.js';
import type { Schedule, TimeSlot, GardenBed } from '@shared/types.js';

const SchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    schedules,
    gardenBeds,
    loading,
    weather,
    fetchSchedules,
    fetchGardenBeds,
    fetchWeather,
    claimSchedule,
    unclaimSchedule,
    generateWeeklySchedules,
    simulateWeatherChange,
  } = useStore();

  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return formatDate(new Date(today.setDate(diff)));
  });
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const weekDates = getWeekDateStrings(currentWeekStart);
  const isToday = (date: string) => date === formatDate(new Date());

  useEffect(() => {
    fetchSchedules(selectedDate);
    fetchGardenBeds();
    fetchWeather();
  }, [selectedDate, fetchSchedules, fetchGardenBeds, fetchWeather]);

  const daySchedules = schedules.filter((s) => s.scheduledDate === selectedDate);
  const sortedByBed = daySchedules.sort((a, b) => a.gardenBedId.localeCompare(b.gardenBedId));
  const unclaimedCount = daySchedules.filter((s) => s.status === 'unclaimed').length;
  const completedCount = daySchedules.filter((s) => s.status === 'completed').length;

  const handlePrevWeek = () => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() - 7);
    setCurrentWeekStart(formatDate(date));
  };

  const handleNextWeek = () => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + 7);
    setCurrentWeekStart(formatDate(date));
  };

  const handleClaim = async (scheduleId: string) => {
    if (!currentUser) return;
    await claimSchedule(scheduleId, currentUser.id);
    fetchSchedules(selectedDate);
  };

  const handleUnclaim = async (scheduleId: string) => {
    if (!currentUser) return;
    await unclaimSchedule(scheduleId, currentUser.id);
    fetchSchedules(selectedDate);
  };

  const handleComplete = (schedule: Schedule) => {
    navigate('/check-in', { state: { scheduleId: schedule.id, gardenBedId: schedule.gardenBedId } });
  };

  const handleGenerateSchedules = async () => {
    const result = await generateWeeklySchedules(currentWeekStart);
    if (result.success) {
      setShowGenerateModal(false);
      fetchSchedules(selectedDate);
    }
  };

  const getGardenBedInfo = (gardenBedId: string): GardenBed | undefined => {
    return gardenBeds.find((b) => b.id === gardenBedId);
  };

  const timeSlots: TimeSlot[] = ['morning', 'afternoon', 'evening'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-forest-800">排班管理</h1>
          <p className="text-forest-600 mt-1">
            {formatChineseDate(selectedDate)} · {unclaimedCount} 个缺人时段
          </p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="btn btn-secondary"
        >
          <Plus size={18} />
          生成本周排班
        </button>
      </div>

      <WeatherBanner
        weather={weather}
        onRefresh={simulateWeatherChange}
        loading={loading}
      />

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevWeek}
            className="p-2 hover:bg-cream-200 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-forest-600" />
          </button>
          <h3 className="font-serif text-lg font-semibold">
            {formatChineseDate(currentWeekStart)} -{' '}
            {formatChineseDate(
              formatDate(new Date(new Date(currentWeekStart).getTime() + 6 * 24 * 60 * 60 * 1000))
            )}
          </h3>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-cream-200 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-forest-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date) => {
            const isSelected = date === selectedDate;
            const isTodayDate = isToday(date);
            const dayOfWeek = new Date(date).toLocaleDateString('zh-CN', { weekday: 'short' });
            const dayOfMonth = new Date(date).getDate();

            const dateSchedules = schedules.filter((s) => s.scheduledDate === date);
            const dateUnclaimed = dateSchedules.filter((s) => s.status === 'unclaimed').length;
            const dateCompleted = dateSchedules.filter((s) => s.status === 'completed').length;
            const dateTotal = dateSchedules.length;

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`p-3 rounded-xl transition-all text-center ${
                  isSelected
                    ? 'bg-primary-500 text-white shadow-lg'
                    : isTodayDate
                    ? 'bg-primary-100 text-primary-800 border-2 border-primary-300'
                    : 'bg-cream-100 text-forest-700 hover:bg-cream-200'
                }`}
              >
                <p className={`text-xs mb-1 ${isSelected ? 'text-primary-100' : 'text-forest-500'}`}>
                  {dayOfWeek}
                </p>
                <p className="text-lg font-bold">{dayOfMonth}</p>
                {dateTotal > 0 && (
                  <div className="mt-1 flex justify-center gap-1">
                    {dateCompleted > 0 && (
                      <span
                        className={`text-xs ${isSelected ? 'text-primary-100' : 'text-primary-600'}`}
                      >
                        {dateCompleted}✓
                      </span>
                    )}
                    {dateUnclaimed > 0 && (
                      <span
                        className={`text-xs ${isSelected ? 'text-yellow-200' : 'text-sun-600'}`}
                      >
                        {dateUnclaimed}!
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {timeSlots.map((slot) => {
          const slotSchedules = sortedByBed.filter((s) => s.timeSlot === slot);
          const slotUnclaimed = slotSchedules.filter((s) => s.status === 'unclaimed').length;
          const slotCompleted = slotSchedules.filter((s) => s.status === 'completed').length;
          const progress =
            slotSchedules.length > 0
              ? (slotCompleted / slotSchedules.length) * 100
              : 0;

          return (
            <div key={slot} className="card">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-forest-800 flex items-center gap-1">
                  <Clock size={16} className="text-primary-500" />
                  {TIME_SLOT_LABELS[slot]}
                </h4>
                {slotUnclaimed > 0 && (
                  <span className="badge status-unclaimed text-xs animate-pulse-soft">
                    {slotUnclaimed} 缺人
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-forest-800">
                {slotCompleted}/{slotSchedules.length}
              </p>
              <div className="progress-bar mt-2">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          );
        })}
        <div className="card bg-gradient-to-br from-primary-50 to-cream-100 border-2 border-primary-200">
          <h4 className="font-medium text-forest-800 mb-2 flex items-center gap-1">
            <Users size={16} className="text-primary-600" />
            我的认领
          </h4>
          <p className="text-2xl font-bold text-primary-600">
            {sortedByBed.filter((s) => s.volunteerId === currentUser?.id).length}
          </p>
          <p className="text-sm text-forest-600 mt-2">个时段</p>
        </div>
      </div>

      {timeSlots.map((slot) => {
        const slotSchedules = sortedByBed.filter((s) => s.timeSlot === slot);
        if (slotSchedules.length === 0) return null;

        return (
          <div key={slot} className="card">
            <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock size={20} className="text-primary-600" />
              {TIME_SLOT_LABELS[slot]}
              {slotSchedules.filter((s) => s.status === 'unclaimed').length > 0 && (
                <span className="badge status-unclaimed">
                  {slotSchedules.filter((s) => s.status === 'unclaimed').length} 缺人
                </span>
              )}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {slotSchedules.map((schedule) => {
                const bed = getGardenBedInfo(schedule.gardenBedId);
                const volunteer = currentUser && schedule.volunteerId === currentUser.id ? currentUser : undefined;
                return (
                  <ScheduleCard
                    key={schedule.id}
                    schedule={{
                      ...schedule,
                      gardenBed: bed,
                      volunteer,
                    }}
                    showDate={false}
                    currentUserId={currentUser?.id}
                    onClaim={() => handleClaim(schedule.id)}
                    onUnclaim={() => handleUnclaim(schedule.id)}
                    onComplete={() => handleComplete(schedule)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {sortedByBed.length === 0 && (
        <div className="card text-center py-12">
          <Calendar size={48} className="mx-auto mb-3 text-forest-300" />
          <p className="text-forest-500">该日期暂无排班</p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="btn btn-primary mt-4"
          >
            <Plus size={18} />
            生成排班
          </button>
        </div>
      )}

      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-cream-50 rounded-2xl max-w-md w-full animate-scale-in">
            <div className="p-6 border-b border-cream-200">
              <h2 className="text-xl font-serif font-bold text-forest-800">
                生成本周排班
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-forest-600">
                确定要为以下日期生成本周排班吗？
              </p>
              <div className="bg-white/70 rounded-xl p-4 space-y-2">
                {weekDates.map((date) => (
                  <div key={date} className="flex items-center justify-between">
                    <span className="text-forest-700">{formatChineseDate(date)}</span>
                    <MapPin size={16} className="text-primary-500" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-forest-500">
                系统将为每个菜畦按照浇水频率自动生成早、中、晚三个时段的排班。
              </p>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 btn btn-outline"
                >
                  取消
                </button>
                <button
                  onClick={handleGenerateSchedules}
                  className="flex-1 btn btn-primary"
                >
                  确认生成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
