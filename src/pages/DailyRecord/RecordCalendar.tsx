import { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Dog,
  Cat,
  PawPrint,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Save,
  Droplets,
  Activity,
  UtensilsCrossed,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import type { Pet, Stay, DailyRecord, Cage } from '../../../shared/types';
import {
  DEFECATION_NAMES,
  MENTAL_STATE_NAMES,
  SPECIES_NAMES,
} from '../../../shared/types';

interface StayWithPet extends Stay {
  pet: Pet;
}

type DayStatus = 'recorded' | 'unrecorded' | 'abnormal' | 'future' | 'past';

interface CalendarDay {
  date: Date;
  dateStr: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  status: DayStatus;
  record?: DailyRecord;
}

export default function RecordCalendar() {
  const { user } = useAuthStore();
  const [stays, setStays] = useState<StayWithPet[]>([]);
  const [cages, setCages] = useState<Map<number, Cage>>(new Map());
  const [selectedStayId, setSelectedStayId] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState<Partial<DailyRecord>>({
    feeding: '',
    defecation: 'normal',
    defecationCount: 1,
    mentalState: 'good',
    waterIntake: '',
    exercise: '',
    abnormal: false,
    abnormalDescription: '',
    abnormalPhotos: [],
    handlingMeasures: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedStayId) {
      fetchRecords();
    }
  }, [selectedStayId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staysRes, cagesRes] = await Promise.all([
        apiClient.get<Stay[]>('/stays?status=checked-in&pageSize=100'),
        apiClient.get<Cage[]>('/cages'),
      ]);

      if (staysRes.success && staysRes.data) {
        const staysWithPet: StayWithPet[] = [];
        for (const stay of staysRes.data) {
          const petRes = await apiClient.get<Pet>(`/pets/${stay.petId}`);
          if (petRes.success && petRes.data) {
            staysWithPet.push({ ...stay, pet: petRes.data });
          }
        }
        setStays(staysWithPet);
        if (staysWithPet.length > 0) {
          setSelectedStayId(staysWithPet[0].id);
        }
      }

      if (cagesRes.success && cagesRes.data) {
        const cageMap = new Map<number, Cage>();
        cagesRes.data.forEach((cage) => cageMap.set(cage.id, cage));
        setCages(cageMap);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    if (!selectedStayId) return;
    try {
      const res = await apiClient.get<DailyRecord[]>(
        `/stays/${selectedStayId}/records`
      );
      if (res.success && res.data) {
        setRecords(res.data);
      }
    } catch (error) {
      console.error('获取记录失败:', error);
    }
  };

  const calendarDays = useMemo((): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: CalendarDay[] = [];

    const selectedStay = stays.find((s) => s.id === selectedStayId);
    const checkInDate = selectedStay
      ? new Date(selectedStay.checkInDate)
      : null;

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        dateStr: date.toISOString().split('T')[0],
        day: date.getDate(),
        isCurrentMonth: false,
        isToday: false,
        status: 'past',
      });
    }

    const recordsMap = new Map<string, DailyRecord>();
    records.forEach((record) => {
      const recordDate = new Date(record.recordDate)
        .toISOString()
        .split('T')[0];
      recordsMap.set(recordDate, record);
    });

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const isToday =
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();

      let status: DayStatus = 'unrecorded';
      const record = recordsMap.get(dateStr);

      if (date > today) {
        status = 'future';
      } else if (checkInDate && date < checkInDate) {
        status = 'past';
      } else if (record) {
        status = record.abnormal ? 'abnormal' : 'recorded';
      }

      days.push({
        date,
        dateStr,
        day,
        isCurrentMonth: true,
        isToday,
        status,
        record,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        dateStr: date.toISOString().split('T')[0],
        day: date.getDate(),
        isCurrentMonth: false,
        isToday: false,
        status: 'future',
      });
    }

    return days;
  }, [currentMonth, records, selectedStayId, stays]);

  const selectedStay = stays.find((s) => s.id === selectedStayId);

  const getSpeciesIcon = (species: Pet['species']) => {
    switch (species) {
      case 'dog':
        return Dog;
      case 'cat':
        return Cat;
      default:
        return PawPrint;
    }
  };

  const getCageName = (cageId?: number) => {
    if (!cageId) return '未分配';
    const cage = cages.get(cageId);
    return cage ? cage.name : '未知笼位';
  };

  const getDayStatusConfig = (status: DayStatus) => {
    switch (status) {
      case 'recorded':
        return {
          className: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle,
          label: '已记录',
        };
      case 'abnormal':
        return {
          className: 'bg-red-100 text-red-700 border-red-200',
          icon: AlertCircle,
          label: '异常',
        };
      case 'unrecorded':
        return {
          className: 'bg-amber-50 text-amber-600 border-amber-200',
          icon: Clock,
          label: '未记录',
        };
      case 'future':
        return {
          className: 'bg-gray-50 text-gray-400 border-gray-100',
          icon: null,
          label: '',
        };
      case 'past':
      default:
        return {
          className: 'bg-gray-50 text-gray-300 border-gray-100',
          icon: null,
          label: '',
        };
    }
  };

  const handleDateClick = (day: CalendarDay) => {
    if (day.status === 'future' || day.status === 'past') return;

    setSelectedDate(day.date);
    if (day.record) {
      setFormData(day.record);
    } else {
      setFormData({
        feeding: '',
        defecation: 'normal',
        defecationCount: 1,
        mentalState: 'good',
        waterIntake: '',
        exercise: '',
        abnormal: false,
        abnormalDescription: '',
        abnormalPhotos: [],
        handlingMeasures: '',
      });
    }
    setShowRecordModal(true);
  };

  const handleSaveRecord = async () => {
    if (!selectedStayId || !selectedDate || !user) return;

    if (!formData.feeding?.trim()) {
      alert('请填写喂食情况');
      return;
    }

    try {
      setSaving(true);
      const recordData = {
        ...formData,
        stayId: selectedStayId,
        recordDate: selectedDate.toISOString().split('T')[0],
        recordedBy: user.id,
      };

      const existingRecord = records.find(
        (r) =>
          new Date(r.recordDate).toISOString().split('T')[0] ===
          selectedDate.toISOString().split('T')[0]
      );

      if (existingRecord) {
        await apiClient.put(
          `/daily-records/${existingRecord.id}`,
          recordData
        );
      } else {
        await apiClient.post(`/stays/${selectedStayId}/records`, recordData);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowRecordModal(false);
        fetchRecords();
      }, 1000);
    } catch (error) {
      console.error('保存记录失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const monthNames = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ];

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  const recordedCount = records.filter((r) => !r.abnormal).length;
  const abnormalCount = records.filter((r) => r.abnormal).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-500" />
            记录日历
          </h1>
          <p className="text-gray-500 mt-1">查看和编辑宠物的历史日常记录</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">选择宠物</h2>
              </div>
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                {stays.length === 0 ? (
                  <div className="p-8 text-center">
                    <PawPrint className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">暂无在住宠物</p>
                  </div>
                ) : (
                  stays.map((stay) => {
                    const SpeciesIcon = getSpeciesIcon(stay.pet.species);
                    const isSelected = selectedStayId === stay.id;

                    return (
                      <button
                        key={stay.id}
                        onClick={() => setSelectedStayId(stay.id)}
                        className={cn(
                          'w-full p-4 flex items-center gap-3 border-b border-gray-50 transition-all text-left',
                          isSelected
                            ? 'bg-blue-50 border-l-4 border-l-blue-500'
                            : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                        )}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                            {stay.pet.photoUrl ? (
                              <img
                                src={stay.pet.photoUrl}
                                alt={stay.pet.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <SpeciesIcon className="w-6 h-6 text-blue-300" />
                              </div>
                            )}
                          </div>
                          {stay.highRisk && (
                            <div className="absolute -top-1 -right-1">
                              <AlertTriangle className="w-4 h-4 text-amber-500 fill-amber-500" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 truncate">
                              {stay.pet.name}
                            </span>
                            <SpeciesIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {getCageName(stay.cageId)} ·{' '}
                            {SPECIES_NAMES[stay.pet.species]}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              入住: {stay.checkInDate}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {selectedStay && (
              <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">统计信息</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">入住天数</span>
                    <span className="font-semibold text-gray-900">
                      {records.length} 天
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">正常记录</span>
                    <span className="font-semibold text-green-600">
                      {recordedCount} 天
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">异常记录</span>
                    <span className="font-semibold text-red-600">
                      {abnormalCount} 天
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={prevMonth}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentMonth.getFullYear()}年{' '}
                    {monthNames[currentMonth.getMonth()]}
                  </h2>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goToToday}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    今天
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600">已记录</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-sm text-gray-600">未记录</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-600">异常</span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {weekDays.map((day, index) => (
                    <div
                      key={day}
                      className={cn(
                        'text-center text-sm font-medium py-2',
                        index === 0 || index === 6
                          ? 'text-red-500'
                          : 'text-gray-600'
                      )}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    const statusConfig = getDayStatusConfig(day.status);
                    const StatusIcon = statusConfig.icon;
                    const isClickable =
                      day.status !== 'future' && day.status !== 'past';

                    return (
                      <button
                        key={index}
                        onClick={() => handleDateClick(day)}
                        disabled={!isClickable}
                        className={cn(
                          'aspect-square p-1 rounded-xl border-2 transition-all flex flex-col items-center justify-center',
                          day.isCurrentMonth
                            ? 'bg-white'
                            : 'bg-gray-50 opacity-50',
                          day.isToday && 'ring-2 ring-blue-500 ring-offset-2',
                          statusConfig.className,
                          isClickable &&
                            'hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
                          !isClickable && 'cursor-default'
                        )}
                      >
                        <span
                          className={cn(
                            'text-sm font-semibold',
                            day.isToday && 'text-blue-600'
                          )}
                        >
                          {day.day}
                        </span>
                        {StatusIcon && (
                          <StatusIcon className="w-4 h-4 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRecordModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div
              className={cn(
                'p-4 border-b flex items-center justify-between',
                formData.abnormal
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-100'
              )}
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedDate.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}{' '}
                  记录
                </h3>
                {selectedStay && (
                  <p className="text-sm text-gray-500">
                    {selectedStay.pet.name} · {getCageName(selectedStay.cageId)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {formData.abnormal && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    异常
                  </span>
                )}
                <button
                  onClick={() => setShowRecordModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 max-h-[calc(90vh-180px)] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-gray-400" />
                  喂食情况 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.feeding || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      feeding: e.target.value,
                    }))
                  }
                  placeholder="请描述喂食情况..."
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    排便情况 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    {(['normal', 'soft', 'diarrhea', 'constipation', 'none'] as const).map(
                      (type) => (
                        <button
                          key={type}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              defecation: type,
                            }))
                          }
                          className={cn(
                            'px-2 py-2 rounded-lg text-xs font-medium transition-all',
                            formData.defecation === type
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          {DEFECATION_NAMES[type]}
                        </button>
                      )
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">次数：</span>
                    <button
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          defecationCount: Math.max(
                            0,
                            (prev.defecationCount || 1) - 1
                          ),
                        }))
                      }
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-medium"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-semibold">
                      {formData.defecationCount || 0}
                    </span>
                    <button
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          defecationCount:
                            (prev.defecationCount || 1) + 1,
                        }))
                      }
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-medium"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-500">次</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    精神状态 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['excellent', 'good', 'fair', 'poor'] as const).map(
                      (state) => (
                        <button
                          key={state}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              mentalState: state,
                            }))
                          }
                          className={cn(
                            'px-2 py-2 rounded-lg text-xs font-medium transition-all',
                            formData.mentalState === state
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          {MENTAL_STATE_NAMES[state]}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-gray-400" />
                    饮水量
                  </label>
                  <input
                    type="text"
                    value={formData.waterIntake || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        waterIntake: e.target.value,
                      }))
                    }
                    placeholder="选填"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-400" />
                    运动量
                  </label>
                  <input
                    type="text"
                    value={formData.exercise || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        exercise: e.target.value,
                      }))
                    }
                    placeholder="选填"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle
                      className={cn(
                        'w-5 h-5',
                        formData.abnormal ? 'text-red-500' : 'text-gray-400'
                      )}
                    />
                    <span className="font-medium text-gray-900">是否异常</span>
                  </div>
                  <button
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        abnormal: !prev.abnormal,
                      }))
                    }
                    className={cn(
                      'relative w-12 h-6 rounded-full transition-colors duration-300',
                      formData.abnormal ? 'bg-red-500' : 'bg-gray-300'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300',
                        formData.abnormal
                          ? 'translate-x-6'
                          : 'translate-x-0.5'
                      )}
                    />
                  </button>
                </div>
              </div>

              {formData.abnormal && (
                <div className="space-y-4 p-4 bg-red-50 rounded-xl border border-red-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      异常描述 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.abnormalDescription || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          abnormalDescription: e.target.value,
                        }))
                      }
                      placeholder="请详细描述异常症状..."
                      rows={2}
                      className="w-full px-4 py-2.5 bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      处理措施 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.handlingMeasures || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          handlingMeasures: e.target.value,
                        }))
                      }
                      placeholder="请描述已采取的处理措施..."
                      rows={2}
                      className="w-full px-4 py-2.5 bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowRecordModal(false)}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveRecord}
                disabled={saving}
                className={cn(
                  'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium shadow transition-all',
                  saveSuccess
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700',
                  saving && 'opacity-50 cursor-not-allowed'
                )}
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : saveSuccess ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? '保存中...' : saveSuccess ? '已保存' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
