import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Calendar, Clock, Sofa, AlertCircle, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { chairApi, bookingApi } from '../lib/api';
import { useToast } from '../components/Toast';
import { Chair } from '../../shared/types';
import {
  generateDateOptions,
  generateTimeSlots,
  calculateDuration,
  formatDate,
  formatTimeRange,
  getChairStatusText,
  getChairStatusColor,
} from '../utils/time';

export default function BookingPage() {
  const { user, refreshUser } = useAuthStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const dateOptions = useMemo(() => generateDateOptions(7), []);
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const [selectedDate, setSelectedDate] = useState(dateOptions[0].date);
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');
  const [selectedChair, setSelectedChair] = useState<Chair | null>(null);
  const [availableChairs, setAvailableChairs] = useState<Chair[]>([]);
  const [allChairs, setAllChairs] = useState<Chair[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadChairs();
  }, []);

  useEffect(() => {
    if (selectedStartTime && selectedEndTime && selectedDate) {
      loadAvailableChairs();
    } else {
      setAvailableChairs([]);
      setSelectedChair(null);
    }
  }, [selectedDate, selectedStartTime, selectedEndTime]);

  const loadChairs = async () => {
    setLoading(true);
    try {
      const result = await chairApi.getAll();
      if (result.success && result.data) {
        setAllChairs(result.data);
      }
    } catch {
      showToast('error', '加载躺椅列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableChairs = async () => {
    try {
      const result = await chairApi.getAvailable(selectedDate, selectedStartTime, selectedEndTime);
      if (result.success && result.data) {
        setAvailableChairs(result.data);
      }
    } catch {
      showToast('error', '加载可用躺椅失败');
    }
  };

  const handleStartTimeSelect = (time: string) => {
    setSelectedStartTime(time);
    const startIndex = timeSlots.indexOf(time);
    if (startIndex < timeSlots.length - 1) {
      setSelectedEndTime(timeSlots[startIndex + 1]);
    } else {
      setSelectedEndTime('');
    }
    setSelectedChair(null);
  };

  const handleEndTimeSelect = (time: string) => {
    if (selectedStartTime && time > selectedStartTime) {
      setSelectedEndTime(time);
      setSelectedChair(null);
    }
  };

  const getAvailableEndTimes = () => {
    if (!selectedStartTime) return [];
    const startIndex = timeSlots.indexOf(selectedStartTime);
    return timeSlots.slice(startIndex + 1);
  };

  const duration = selectedStartTime && selectedEndTime
    ? calculateDuration(selectedStartTime, selectedEndTime)
    : 0;

  const isDurationValid = duration > 0 && duration <= 120;
  const canSubmit = selectedDate && selectedStartTime && selectedEndTime && selectedChair && isDurationValid;

  const handleSubmit = async () => {
    if (!canSubmit || !selectedChair) return;
    if (!user) return;

    if (user.creditScore < 60) {
      showToast('error', `信用分不足（当前${user.creditScore}分），需要60分以上才能预约`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await bookingApi.create({
        chairId: selectedChair.id,
        date: selectedDate,
        startTime: selectedStartTime,
        endTime: selectedEndTime,
      });

      if (result.success) {
        showToast('success', '预约成功！请按时签到使用');
        await refreshUser();
        navigate('/my-bookings');
      } else {
        showToast('error', result.message || '预约失败');
      }
    } catch {
      showToast('error', '预约失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDateInfo = dateOptions.find(d => d.date === selectedDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">预约躺椅</h1>
          <p className="text-gray-500">选择日期、时段和躺椅，按座位先到先得</p>
        </div>

        {user && user.creditScore < 60 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-medium">信用分不足</p>
              <p className="text-red-600 text-sm">当前信用分 {user.creditScore} 分，需要 60 分以上才能预约。请减少爽约行为以恢复信用。</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">选择日期</h2>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => {
                    const idx = dateOptions.findIndex(d => d.date === selectedDate);
                    if (idx > 0) setSelectedDate(dateOptions[idx - 1].date);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  disabled={dateOptions.findIndex(d => d.date === selectedDate) === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {dateOptions.map((option) => (
                  <button
                    key={option.date}
                    onClick={() => {
                      setSelectedDate(option.date);
                      setSelectedStartTime('');
                      setSelectedEndTime('');
                      setSelectedChair(null);
                    }}
                    className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl transition-all min-w-[72px] ${
                      selectedDate === option.date
                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20 scale-105'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xs opacity-80">{option.weekday}</span>
                    <span className="text-lg font-bold">{option.label}</span>
                  </button>
                ))}
                <button
                  onClick={() => {
                    const idx = dateOptions.findIndex(d => d.date === selectedDate);
                    if (idx < dateOptions.length - 1) setSelectedDate(dateOptions[idx + 1].date);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  disabled={dateOptions.findIndex(d => d.date === selectedDate) === dateOptions.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                已选：{formatDate(selectedDate)}（{selectedDateInfo?.weekday}）
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">选择时段</h2>
                <span className="text-sm text-gray-400">（30分钟/段，最长连续2小时）</span>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">开始时间</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {timeSlots.map((time) => {
                    const isPast = selectedDate === dayjs().format('YYYY-MM-DD') &&
                      time < dayjs().format('HH:mm');
                    return (
                      <button
                        key={time}
                        onClick={() => !isPast && handleStartTimeSelect(time)}
                        disabled={isPast}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          selectedStartTime === time
                            ? 'bg-teal-600 text-white shadow-md'
                            : isPast
                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">结束时间</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {getAvailableEndTimes().map((time) => (
                    <button
                      key={time}
                      onClick={() => handleEndTimeSelect(time)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        selectedEndTime === time
                          ? 'bg-teal-600 text-white shadow-md'
                          : calculateDuration(selectedStartTime, time) > 120
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                      disabled={calculateDuration(selectedStartTime, time) > 120}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {selectedStartTime && selectedEndTime && (
                <div className={`mt-4 p-3 rounded-lg ${
                  isDurationValid ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-700'
                }`}>
                  <p className="font-medium">
                    时长：{formatTimeRange(selectedStartTime, selectedEndTime)}
                    （{duration}分钟）
                  </p>
                  {!isDurationValid && (
                    <p className="text-sm mt-1">连续使用时间不能超过2小时</p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sofa className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">选择躺椅</h2>
                {availableChairs.length > 0 && (
                  <span className="text-sm text-gray-500">（{availableChairs.length} 个可用）</span>
                )}
              </div>

              {!selectedStartTime || !selectedEndTime ? (
                <div className="text-center py-12 text-gray-400">
                  <Sofa className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>请先选择时段查看可用躺椅</p>
                </div>
              ) : loading ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="animate-spin w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-3" />
                  <p>加载中...</p>
                </div>
              ) : availableChairs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>该时段暂无可用躺椅</p>
                  <p className="text-sm mt-1">请选择其他时段或日期</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {availableChairs.map((chair) => (
                    <button
                      key={chair.id}
                      onClick={() => setSelectedChair(chair)}
                      onDoubleClick={() => {
                        setSelectedChair(chair);
                        navigate(`/chair/${chair.id}`);
                      }}
                      className={`relative p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                        selectedChair?.id === chair.id
                          ? 'border-teal-600 bg-teal-50 shadow-lg shadow-teal-600/10 scale-105'
                          : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <div className="text-lg font-bold text-gray-900">{chair.chairNumber}</div>
                      <div className="text-xs text-gray-500 mt-1 truncate">{chair.location}</div>
                      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${getChairStatusColor(chair.status)}`}>
                        {getChairStatusText(chair.status)}
                      </span>
                      {selectedChair?.id === chair.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {selectedChair && (
                <div className="mt-4 p-4 bg-teal-50 rounded-xl border border-teal-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-teal-900">
                        已选择 {selectedChair.chairNumber} · {selectedChair.location}
                      </p>
                      <p className="text-sm text-teal-700 mt-1">
                        配套物品：{selectedChair.items.join('、')}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/chair/${selectedChair.id}`)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      查看详情 →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">预约确认</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">日期</span>
                  <span className="font-medium text-gray-900">{selectedDate || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">时段</span>
                  <span className="font-medium text-gray-900">
                    {selectedStartTime && selectedEndTime
                      ? formatTimeRange(selectedStartTime, selectedEndTime)
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">躺椅</span>
                  <span className="font-medium text-gray-900">{selectedChair?.chairNumber || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">位置</span>
                  <span className="font-medium text-gray-900">{selectedChair?.location || '-'}</span>
                </div>
                {duration > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">时长</span>
                    <span className="font-medium text-gray-900">{duration} 分钟</span>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 rounded-xl p-3 mb-4">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-700">
                    <p className="font-medium">预约规则</p>
                    <ul className="mt-1 space-y-0.5 list-disc list-inside opacity-90">
                      <li>开始前10分钟可签到</li>
                      <li>超时15分钟未签到算爽约，扣10分</li>
                      <li>使用后必须完成5项清洁确认</li>
                      <li>信用分低于60分无法预约</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting || (user?.creditScore ?? 0) < 60}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30"
              >
                {submitting ? '提交中...' : '确认预约'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
