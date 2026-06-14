import { useState, useMemo } from 'react';
import { CalendarClock, Building2, Clock, Zap, User, ChevronDown, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { SeatGrid } from '../components/SeatGrid';
import { Modal } from '../components/Modal';
import { CLASS_LIST, TIME_SLOTS } from '../types';
import type { SeatWithStatus } from '../types';
import { cn } from '@/lib/utils';
import { getTodayDateString } from '../utils/helpers';

interface ReservationFormData {
  className: string;
  studentName: string;
  needsPowerOutlet: boolean;
}

const initialFormData: ReservationFormData = {
  className: '',
  studentName: '',
  needsPowerOutlet: false,
};

export default function Reservation() {
  const {
    classrooms,
    selectedClassroomId,
    selectedDate,
    selectedTimeSlot,
    setSelectedClassroomId,
    setSelectedDate,
    setSelectedTimeSlot,
    getSeatsWithStatus,
    createReservation,
    students,
  } = useStore();

  const [selectedSeat, setSelectedSeat] = useState<SeatWithStatus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ReservationFormData>(initialFormData);
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  const selectedClassroom = useMemo(
    () => classrooms.find((c) => c.id === selectedClassroomId),
    [classrooms, selectedClassroomId]
  );

  const seatsWithStatus = useMemo(() => {
    if (!selectedClassroomId) return [];
    return getSeatsWithStatus(selectedClassroomId, selectedDate, selectedTimeSlot);
  }, [selectedClassroomId, selectedDate, selectedTimeSlot, getSeatsWithStatus]);

  const availableCount = seatsWithStatus.filter((s) => s.status === 'available').length;
  const reservedCount = seatsWithStatus.filter((s) => s.status === 'reserved').length;
  const checkedInCount = seatsWithStatus.filter((s) => s.status === 'checked_in').length;

  const handleSeatClick = (seat: SeatWithStatus) => {
    if (seat.status === 'available') {
      setSelectedSeat(seat);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSeat(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeat || !selectedClassroomId) return;

    createReservation({
      classroomId: selectedClassroomId,
      seatId: selectedSeat.id,
      studentId: '',
      className: formData.className,
      studentName: formData.studentName,
      reservationDate: selectedDate,
      timeSlot: selectedTimeSlot,
      needsPowerOutlet: formData.needsPowerOutlet,
    });

    handleCloseModal();
  };

  const existingStudents = useMemo(() => {
    if (!formData.className) return [];
    return students.filter((s) => s.className === formData.className);
  }, [students, formData.className]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 font-display mb-2">
          <CalendarClock className="inline-block w-8 h-8 mr-3 text-primary-500" />
          座位预约
        </h1>
        <p className="text-slate-500">选择教室、日期和时段，预约您的座位</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <Building2 className="w-4 h-4 text-primary-500" />
              选择教室
            </label>
            <select
              value={selectedClassroomId || ''}
              onChange={(e) => setSelectedClassroomId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white"
            >
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.building} {classroom.roomNumber} ({classroom.seatCount}座)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <Clock className="w-4 h-4 text-primary-500" />
              选择时段
            </label>
            <div className="flex gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={cn(
                    'flex-1 px-3 py-3 rounded-xl text-sm font-medium transition-all',
                    selectedTimeSlot === slot
                      ? 'bg-gradient-accent text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <CalendarClock className="w-4 h-4 text-primary-500" />
              选择日期
            </label>
            <input
              type="date"
              value={selectedDate}
              min={getTodayDateString()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
            />
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1 text-center p-4 bg-emerald-50 rounded-xl">
              <p className="text-2xl font-bold text-emerald-600 font-display">{availableCount}</p>
              <p className="text-xs text-emerald-600">可预约</p>
            </div>
            <div className="flex-1 text-center p-4 bg-amber-50 rounded-xl">
              <p className="text-2xl font-bold text-amber-600 font-display">{reservedCount}</p>
              <p className="text-xs text-amber-600">已预约</p>
            </div>
            <div className="flex-1 text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600 font-display">{checkedInCount}</p>
              <p className="text-xs text-blue-600">已签到</p>
            </div>
          </div>
        </div>
      </div>

      {selectedClassroom && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-display">
                {selectedClassroom.building} {selectedClassroom.roomNumber} 座位图
              </h2>
              <p className="text-sm text-slate-500">
                值班老师：{selectedClassroom.teacherInCharge} | 开放时间：{selectedClassroom.openTime} - {selectedClassroom.closeTime}
              </p>
            </div>
          </div>
          <SeatGrid
            seats={seatsWithStatus}
            selectedSeatId={selectedSeat?.id}
            onSeatClick={handleSeatClick}
          />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="预约座位"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-primary-50 rounded-xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-accent rounded-xl flex items-center justify-center text-white font-bold text-xl">
              {selectedSeat?.seatNumber}
            </div>
            <div>
              <p className="font-medium text-slate-800">
                {selectedClassroom?.building} {selectedClassroom?.roomNumber} 室
              </p>
              <p className="text-sm text-slate-500">
                {selectedDate} {selectedTimeSlot}
              </p>
              {selectedSeat?.hasPowerOutlet && (
                <p className="text-sm text-amber-600 flex items-center gap-1 mt-1">
                  <Zap className="w-3.5 h-3.5" />
                  带电源插座
                </p>
              )}
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <User className="inline-block w-4 h-4 mr-1" />
              选择班级
            </label>
            <button
              type="button"
              onClick={() => setShowClassDropdown(!showClassDropdown)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-left flex items-center justify-between bg-white"
            >
              <span className={formData.className ? 'text-slate-800' : 'text-slate-400'}>
                {formData.className || '请选择班级'}
              </span>
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </button>
            {showClassDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-scale-in">
                {CLASS_LIST.map((className) => (
                  <button
                    key={className}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, className, studentName: '' });
                      setShowClassDropdown(false);
                    }}
                    className={cn(
                      'w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between',
                      formData.className === className && 'bg-primary-50 text-primary-700'
                    )}
                  >
                    {className}
                    {formData.className === className && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {formData.className && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                学生姓名
              </label>
              {existingStudents.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-2">快速选择：</p>
                  <div className="flex flex-wrap gap-2">
                    {existingStudents.slice(0, 8).map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, studentName: student.name })}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm transition-all',
                          formData.studentName === student.name
                            ? 'bg-primary-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                      >
                        {student.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                placeholder="请输入姓名"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                required
              />
            </div>
          )}

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.needsPowerOutlet}
                onChange={(e) => setFormData({ ...formData, needsPowerOutlet: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-700 flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-500" />
                需要使用电源插座
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!formData.className || !formData.studentName}
              className="px-6 py-3 bg-gradient-accent text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认预约
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
