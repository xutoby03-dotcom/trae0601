import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Plus,
  User,
  Clock,
  X,
  Upload,
  Play,
  CheckCircle2,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { StatusBadge, Empty } from '@/components';
import type { RepairStatus, Repair as RepairType } from '@/types';
import { cn } from '@/lib/utils';

type FilterType = 'all' | RepairStatus;

const filterTabs: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'processing', label: '维修中' },
  { key: 'completed', label: '已完成' },
];

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RepairList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRepair, setNewRepair] = useState({
    bookingId: '',
    equipmentName: '',
    description: '',
  });

  const repairs = useStore((s) => s.repairs);
  const users = useStore((s) => s.users);
  const rooms = useStore((s) => s.rooms);
  const bookings = useStore((s) => s.bookings);
  const currentUser = useStore((s) => s.currentUser);
  const createRepair = useStore((s) => s.createRepair);
  const updateRepairStatus = useStore((s) => s.updateRepairStatus);

  useEffect(() => {
    const bookingIdParam = searchParams.get('bookingId');
    const roomIdParam = searchParams.get('roomId');
    if (bookingIdParam || roomIdParam) {
      setNewRepair((prev) => ({
        ...prev,
        bookingId: bookingIdParam || '',
      }));
      setShowCreateModal(true);
    }
  }, [searchParams]);

  const handleOpenCreateModal = () => {
    clearUrlParams();
    setNewRepair({
      bookingId: '',
      equipmentName: '',
      description: '',
    });
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewRepair({
      bookingId: '',
      equipmentName: '',
      description: '',
    });
    clearUrlParams();
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  const filteredRepairs = useMemo(() => {
    let result = [...repairs];

    if (activeFilter !== 'all') {
      result = result.filter((r) => r.status === activeFilter);
    }

    return result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [repairs, activeFilter]);

  const recentBookings = useMemo(() => {
    return bookings
      .filter(
        (b) =>
          b.status === 'checked_in' ||
          b.status === 'completed' ||
          b.status === 'waiting_checkin',
      )
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      )
      .slice(0, 10);
  }, [bookings]);

  const clearUrlParams = () => {
    navigate('/repairs', { replace: true });
  };

  const handleCreateRepair = () => {
    if (!newRepair.equipmentName.trim() || !newRepair.description.trim()) {
      return;
    }
    if (!currentUser) return;

    let roomId = '';
    if (newRepair.bookingId) {
      const booking = bookings.find((b) => b.id === newRepair.bookingId);
      if (booking) {
        roomId = booking.roomId;
      }
    } else if (rooms.length > 0) {
      roomId = rooms[0].id;
    }

    createRepair({
      roomId,
      bookingId: newRepair.bookingId || undefined,
      reporterId: currentUser.id,
      equipmentName: newRepair.equipmentName.trim(),
      description: newRepair.description.trim(),
      photos: [],
    });

    setNewRepair({
      bookingId: '',
      equipmentName: '',
      description: '',
    });
    setShowCreateModal(false);
    clearUrlParams();
  };

  const handleUpdateStatus = (id: string, status: RepairStatus) => {
    updateRepairStatus(id, status);
  };

  const getRoomAndBookingInfo = (repair: RepairType) => {
    const room = rooms.find((r) => r.id === repair.roomId);
    const booking = repair.bookingId
      ? bookings.find((b) => b.id === repair.bookingId)
      : undefined;
    return { room, booking };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-primary">
            报修中心
          </h1>
          <p className="mt-1 text-text-secondary">
            管理练习室设备的维修请求
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl',
            'bg-accent-copper text-white font-medium',
            'hover:bg-accent-copper-dark transition-colors duration-200',
            'active:scale-95 transition-transform shadow-glow',
          )}
        >
          <Plus className="w-5 h-5" />
          新建报修
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-bg-secondary rounded-xl border border-border-subtle w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              activeFilter === tab.key
                ? 'bg-accent-copper text-white shadow-glow'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredRepairs.length === 0 ? (
        <Empty
          icon={Wrench}
          title="暂无报修记录"
          description="当前筛选条件下没有报修记录"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRepairs.map((repair) => {
            const reporter = users.find((u) => u.id === repair.reporterId);
            const { room, booking } = getRoomAndBookingInfo(repair);

            return (
              <div
                key={repair.id}
                className={cn(
                  'bg-bg-secondary rounded-xl p-5 border border-border-subtle',
                  'hover:shadow-card-hover transition-all duration-300',
                  'animate-slide-up',
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-state-danger/20 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-state-danger-light" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">
                        {repair.equipmentName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5 text-sm text-text-secondary">
                        <Building2 className="w-3.5 h-3.5 text-text-muted" />
                        <span>{room?.name || '未知房间'}</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={repair.status} />
                </div>

                <div className="space-y-3 mb-4">
                  <p className="text-sm text-text-secondary line-clamp-2 bg-bg-tertiary p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-state-warning-light inline mr-1.5 align-middle" />
                    {repair.description}
                  </p>

                  <div className="flex flex-wrap gap-3 text-xs text-text-muted">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>报修人：{reporter?.name || '未知'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDateTime(repair.createdAt)}</span>
                    </div>
                    {repair.completedAt && (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-state-success-light" />
                        <span>完成：{formatDateTime(repair.completedAt)}</span>
                      </div>
                    )}
                  </div>

                  {booking && (
                    <div className="text-xs text-text-muted bg-bg-tertiary px-3 py-2 rounded-lg">
                      关联预约：{room?.name} · {formatDateTime(booking.startTime)}
                    </div>
                  )}
                </div>

                {isAdmin &&
                  (repair.status === 'pending' ||
                    repair.status === 'processing') && (
                    <div className="pt-4 border-t border-border-subtle">
                      {repair.status === 'pending' && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(repair.id, 'processing')
                          }
                          className={cn(
                            'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
                            'bg-state-info text-white font-medium text-sm',
                            'hover:bg-state-info-light transition-colors duration-200',
                            'active:scale-95 transition-transform',
                          )}
                        >
                          <Play className="w-4 h-4" />
                          开始维修
                        </button>
                      )}
                      {repair.status === 'processing' && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(repair.id, 'completed')
                          }
                          className={cn(
                            'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
                            'bg-state-success text-white font-medium text-sm',
                            'hover:bg-state-success-light transition-colors duration-200',
                            'active:scale-95 transition-transform',
                          )}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          完成维修
                        </button>
                      )}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={handleCloseCreateModal}
        >
          <div
            className="bg-bg-secondary rounded-2xl p-6 w-full max-w-md border border-border-subtle shadow-card-hover animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary">
                新建报修
              </h2>
              <button
                onClick={handleCloseCreateModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  关联预约（可选）
                </label>
                <select
                  value={newRepair.bookingId}
                  onChange={(e) =>
                    setNewRepair({ ...newRepair, bookingId: e.target.value })
                  }
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border-subtle',
                    'text-text-primary text-sm',
                    'focus:outline-none focus:border-accent-copper focus:ring-1 focus:ring-accent-copper/30',
                    'transition-colors',
                  )}
                >
                  <option value="">不关联预约</option>
                  {recentBookings.map((booking) => {
                    const room = rooms.find((r) => r.id === booking.roomId);
                    return (
                      <option key={booking.id} value={booking.id}>
                        {room?.name} · {formatDateTime(booking.startTime)}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  设备名称 <span className="text-state-danger-light">*</span>
                </label>
                <input
                  type="text"
                  value={newRepair.equipmentName}
                  onChange={(e) =>
                    setNewRepair({
                      ...newRepair,
                      equipmentName: e.target.value,
                    })
                  }
                  placeholder="例如：钢琴琴键、空调系统"
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border-subtle',
                    'text-text-primary text-sm placeholder:text-text-muted',
                    'focus:outline-none focus:border-accent-copper focus:ring-1 focus:ring-accent-copper/30',
                    'transition-colors',
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  问题描述 <span className="text-state-danger-light">*</span>
                </label>
                <textarea
                  value={newRepair.description}
                  onChange={(e) =>
                    setNewRepair({
                      ...newRepair,
                      description: e.target.value,
                    })
                  }
                  placeholder="请详细描述设备故障情况..."
                  rows={4}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border-subtle',
                    'text-text-primary text-sm placeholder:text-text-muted',
                    'focus:outline-none focus:border-accent-copper focus:ring-1 focus:ring-accent-copper/30',
                    'transition-colors resize-none',
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  上传照片（可选）
                </label>
                <button
                  type="button"
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-4 py-6 rounded-xl',
                    'bg-bg-tertiary border-2 border-dashed border-border-subtle',
                    'text-text-muted hover:text-text-secondary hover:border-border-strong hover:bg-bg-elevated',
                    'transition-all duration-200',
                  )}
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-sm">点击上传照片</span>
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseCreateModal}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-xl',
                  'bg-bg-tertiary text-text-secondary font-medium text-sm',
                  'hover:bg-bg-elevated hover:text-text-primary transition-colors duration-200',
                  'active:scale-95 transition-transform',
                )}
              >
                取消
              </button>
              <button
                onClick={handleCreateRepair}
                disabled={
                  !newRepair.equipmentName.trim() ||
                  !newRepair.description.trim()
                }
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl',
                  'bg-accent-copper text-white font-medium text-sm',
                  'hover:bg-accent-copper-dark transition-colors duration-200',
                  'active:scale-95 transition-transform shadow-glow',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent-copper',
                )}
              >
                <Plus className="w-4 h-4" />
                提交报修
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
