import { useState, useMemo, useEffect } from 'react';
import {
  QrCode,
  Check,
  Clock,
  User,
  Building2,
  RefreshCw,
  LogOut,
  MoveRight,
  CalendarClock,
  CalendarX,
  UserX,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { TIME_SLOTS } from '../types';
import type { Reservation, Seat } from '../types';
import { cn } from '@/lib/utils';
import { formatTime, formatDateTime, getTodayDateString } from '../utils/helpers';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  action: 'checkin' | 'leave' | 'change_seat' | 'early_leave' | null;
}

export default function Checkin() {
  const {
    classrooms,
    seats,
    reservations,
    checkin,
    earlyLeave,
    changeSeat,
    requestLeave,
    batchMarkNoShow,
    getSeatsWithStatus,
    selectedClassroomId,
    selectedTimeSlot,
    setSelectedClassroomId,
    setSelectedTimeSlot,
  } = useStore();

  const [modalState, setModalState] = useState<ActionModalProps>({
    isOpen: false,
    onClose: () => {},
    reservation: null,
    action: null,
  });
  const [selectedNewSeat, setSelectedNewSeat] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBatchModal, setShowBatchModal] = useState(false);

  const todayStr = getTodayDateString();

  const pendingReservations = useMemo(
    () => reservations.filter((r) => r.reservationDate === todayStr && r.status === 'pending'),
    [reservations, todayStr]
  );
  const checkedInReservations = useMemo(
    () => reservations.filter((r) => r.reservationDate === todayStr && r.status === 'checked_in'),
    [reservations, todayStr]
  );

  const filteredPending = useMemo(() => {
    let result = pendingReservations;
    if (selectedClassroomId) {
      result = result.filter((r) => r.classroomId === selectedClassroomId);
    }
    if (selectedTimeSlot) {
      result = result.filter((r) => r.timeSlot === selectedTimeSlot);
    }
    return result;
  }, [pendingReservations, selectedClassroomId, selectedTimeSlot]);

  const filteredCheckedIn = useMemo(() => {
    let result = checkedInReservations;
    if (selectedClassroomId) {
      result = result.filter((r) => r.classroomId === selectedClassroomId);
    }
    if (selectedTimeSlot) {
      result = result.filter((r) => r.timeSlot === selectedTimeSlot);
    }
    return result;
  }, [checkedInReservations, selectedClassroomId, selectedTimeSlot]);

  useEffect(() => {
    const validIds = new Set(filteredPending.map((r) => r.id));
    setSelectedIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [filteredPending]);

  const availableSeats = useMemo(() => {
    if (!modalState.reservation || modalState.action !== 'change_seat') return [];
    const seatsWithStatus = getSeatsWithStatus(
      modalState.reservation.classroomId,
      modalState.reservation.reservationDate,
      modalState.reservation.timeSlot
    );
    return seatsWithStatus.filter(
      (s) => s.status === 'available' || s.id === modalState.reservation?.seatId
    );
  }, [modalState.reservation, modalState.action, getSeatsWithStatus]);

  const openModal = (reservation: Reservation, action: 'checkin' | 'leave' | 'change_seat' | 'early_leave') => {
    setModalState({
      isOpen: true,
      onClose: closeModal,
      reservation,
      action,
    });
    setSelectedNewSeat(null);
    setReason('');
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      onClose: () => {},
      reservation: null,
      action: null,
    });
  };

  const handleAction = () => {
    if (!modalState.reservation) return;

    switch (modalState.action) {
      case 'checkin':
        checkin(modalState.reservation.id);
        break;
      case 'leave':
        if (reason.trim()) {
          requestLeave(modalState.reservation.id, reason);
        }
        break;
      case 'early_leave':
        if (reason.trim()) {
          earlyLeave(modalState.reservation.id, reason);
        }
        break;
      case 'change_seat':
        if (selectedNewSeat && reason.trim()) {
          changeSeat(modalState.reservation.id, selectedNewSeat, reason);
        }
        break;
    }
    closeModal();
  };

  const getClassroomInfo = (classroomId: string) => {
    return classrooms.find((c) => c.id === classroomId);
  };

  const getSeatInfo = (seatId: string) => {
    return seats.find((s) => s.id === seatId);
  };

  const commonColumns = [
    {
      key: 'studentName',
      header: '学生姓名',
      cell: (item: Reservation) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
            {item.studentName.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-slate-800">{item.studentName}</div>
            <div className="text-xs text-slate-500">{item.className}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'classroomId',
      header: '教室',
      cell: (item: Reservation) => {
        const classroom = getClassroomInfo(item.classroomId);
        return `${classroom?.building} ${classroom?.roomNumber}`;
      },
    },
    {
      key: 'seatId',
      header: '座位',
      cell: (item: Reservation) => {
        const seat = getSeatInfo(item.seatId);
        return seat ? `${seat.seatNumber}号` : '-';
      },
    },
    {
      key: 'timeSlot',
      header: '时段',
    },
    {
      key: 'expiresAt',
      header: '超时时间',
      cell: (item: Reservation) => (
        <span className="text-amber-600 font-medium">{formatTime(item.expiresAt)}</span>
      ),
    },
  ];

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPending.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPending.map((r) => r.id));
    }
  };

  const handleBatchNoShow = () => {
    if (selectedIds.length === 0) return;
    batchMarkNoShow(selectedIds);
    setSelectedIds([]);
    setShowBatchModal(false);
  };

  const pendingColumns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={selectedIds.length > 0 && selectedIds.length === filteredPending.length}
          onChange={toggleSelectAll}
          className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
        />
      ),
      cell: (item: Reservation) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(item.id)}
          onChange={() => toggleSelect(item.id)}
          className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
        />
      ),
      className: 'w-12',
    },
    ...commonColumns,
    {
      key: 'status',
      header: '状态',
      cell: (item: Reservation) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: '操作',
      cell: (item: Reservation) => (
        <div className="flex gap-2">
          <button
            onClick={() => openModal(item, 'checkin')}
            className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            签到
          </button>
          <button
            onClick={() => openModal(item, 'leave')}
            className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-1"
          >
            <CalendarX className="w-4 h-4" />
            请假
          </button>
        </div>
      ),
    },
  ];

  const checkedInColumns = [
    ...commonColumns.slice(0, -1),
    {
      key: 'checkinTime',
      header: '签到时间',
      cell: (item: Reservation) => {
        const checkinRecord = useStore
          .getState()
          .checkinRecords.find((c) => c.reservationId === item.id);
        return checkinRecord ? formatTime(checkinRecord.checkinTime) : '-';
      },
    },
    {
      key: 'status',
      header: '状态',
      cell: (item: Reservation) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: '操作',
      cell: (item: Reservation) => (
        <div className="flex gap-2">
          <button
            onClick={() => openModal(item, 'change_seat')}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-1"
          >
            <MoveRight className="w-4 h-4" />
            换座
          </button>
          <button
            onClick={() => openModal(item, 'early_leave')}
            className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            离开
          </button>
        </div>
      ),
    },
  ];

  const getModalTitle = () => {
    switch (modalState.action) {
      case 'checkin':
        return '确认签到';
      case 'leave':
        return '临时请假';
      case 'early_leave':
        return '提前离开';
      case 'change_seat':
        return '更换座位';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 font-display mb-2">
          <QrCode className="inline-block w-8 h-8 mr-3 text-primary-500" />
          签到管理
        </h1>
        <p className="text-slate-500">管理学生签到、换座和提前离开</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <Building2 className="w-4 h-4 text-primary-500" />
              筛选教室
            </label>
            <select
              value={selectedClassroomId || ''}
              onChange={(e) => setSelectedClassroomId(e.target.value || null)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white"
            >
              <option value="">全部教室</option>
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.building} {classroom.roomNumber}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <Clock className="w-4 h-4 text-primary-500" />
              筛选时段
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTimeSlot('')}
                className={cn(
                  'flex-1 px-3 py-3 rounded-xl text-sm font-medium transition-all',
                  !selectedTimeSlot
                    ? 'bg-gradient-accent text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                全部
              </button>
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
          <div className="flex items-end">
            <button
              onClick={() => useStore.getState().releaseExpiredReservations()}
              className="w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              刷新状态
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl">
              <CalendarClock className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 font-display">待签到</h2>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
              {filteredPending.length}人
            </span>
            {selectedIds.length > 0 && (
              <span className="px-2.5 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                已选 {selectedIds.length} 人
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={() => setShowBatchModal(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-1"
              >
                <UserX className="w-4 h-4" />
                批量标记爽约
              </button>
            )}
          </div>
        </div>
        <DataTable
          columns={pendingColumns}
          data={filteredPending}
          emptyMessage="暂无待签到的预约"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-emerald-100 rounded-xl">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 font-display">已签到</h2>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
            {filteredCheckedIn.length}人
          </span>
        </div>
        <DataTable
          columns={checkedInColumns}
          data={filteredCheckedIn}
          emptyMessage="暂无已签到的学生"
        />
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={getModalTitle()}
        size={modalState.action === 'change_seat' ? 'xl' : 'md'}
      >
        {modalState.reservation && (
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  {modalState.reservation.studentName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-lg">
                    {modalState.reservation.studentName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {modalState.reservation.className} |{' '}
                    {getClassroomInfo(modalState.reservation.classroomId)?.building}{' '}
                    {getClassroomInfo(modalState.reservation.classroomId)?.roomNumber} |{' '}
                    {getSeatInfo(modalState.reservation.seatId)?.seatNumber}号座
                  </p>
                  <p className="text-sm text-slate-500">
                    时段：{modalState.reservation.timeSlot}
                  </p>
                </div>
              </div>
            </div>

            {modalState.action === 'checkin' && (
              <div className="text-center py-4">
                <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <QrCode className="w-10 h-10 text-emerald-600" />
                </div>
                <p className="text-slate-600">确认该学生已到场？</p>
                <p className="text-sm text-slate-400 mt-1">
                  签到时间：{formatDateTime(new Date())}
                </p>
              </div>
            )}

            {modalState.action === 'leave' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <CalendarX className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-orange-800">标记为临时请假</p>
                    <p className="text-sm text-orange-600">该预约将被取消，座位释放给其他同学</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    请假原因
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="请输入请假原因"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {modalState.action === 'early_leave' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  离开原因
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="请输入提前离开原因"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none"
                />
              </div>
            )}

            {modalState.action === 'change_seat' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    选择新座位
                  </label>
                  <div className="grid grid-cols-10 gap-2 max-h-64 overflow-y-auto p-4 bg-slate-50 rounded-xl">
                    {availableSeats.map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => setSelectedNewSeat(seat.id)}
                        className={cn(
                          'w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all',
                          seat.id === modalState.reservation?.seatId
                            ? 'bg-amber-100 border-amber-300 text-amber-700'
                            : seat.status === 'available'
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-700 hover:bg-emerald-200 cursor-pointer'
                            : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed',
                          selectedNewSeat === seat.id && 'ring-2 ring-accent-500 ring-offset-2'
                        )}
                        disabled={seat.status !== 'available' && seat.id !== modalState.reservation?.seatId}
                      >
                        {getSeatInfo(seat.id)?.seatNumber}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    <span className="inline-block w-3 h-3 bg-amber-100 rounded mr-1" />
                    当前座位
                    <span className="inline-block w-3 h-3 bg-emerald-100 rounded ml-3 mr-1" />
                    可选择
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    换座原因
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="请输入换座原因"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleAction}
                disabled={
                  (modalState.action === 'leave' && !reason.trim()) ||
                  (modalState.action === 'early_leave' && !reason.trim()) ||
                  (modalState.action === 'change_seat' && (!selectedNewSeat || !reason.trim()))
                }
                className={cn(
                  'px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2',
                  modalState.action === 'checkin'
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : modalState.action === 'leave'
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : modalState.action === 'early_leave'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600',
                  ((modalState.action === 'leave' && !reason.trim()) ||
                    (modalState.action === 'early_leave' && !reason.trim()) ||
                    (modalState.action === 'change_seat' && (!selectedNewSeat || !reason.trim()))) &&
                    'opacity-50 cursor-not-allowed'
                )}
              >
                {modalState.action === 'checkin' && <Check className="w-4 h-4" />}
                {modalState.action === 'leave' && <CalendarX className="w-4 h-4" />}
                {modalState.action === 'early_leave' && <LogOut className="w-4 h-4" />}
                {modalState.action === 'change_seat' && <MoveRight className="w-4 h-4" />}
                {modalState.action === 'checkin' && '确认签到'}
                {modalState.action === 'leave' && '确认请假'}
                {modalState.action === 'early_leave' && '确认离开'}
                {modalState.action === 'change_seat' && '确认换座'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        title="批量标记爽约"
        size="md"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-800">确认批量标记为爽约？</p>
              <p className="text-sm text-red-600">
                将为选中的 <span className="font-bold">{selectedIds.length}</span> 名学生累加爽约次数
              </p>
            </div>
          </div>

          <div className="text-sm text-slate-500">
            <p>⚠️ 此操作不可撤销，学生爽约次数将永久累加。</p>
          </div>

          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={() => setShowBatchModal(false)}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              onClick={handleBatchNoShow}
              className="px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 bg-red-500 text-white hover:bg-red-600"
            >
              <UserX className="w-4 h-4" />
              确认标记爽约
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
