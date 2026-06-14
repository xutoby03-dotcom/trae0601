import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  LayoutGrid,
  User,
  Phone,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { COLOR_OPTIONS, DEPARTMENTS } from '@/types';
import ColorBadge from '@/components/ColorBadge';
import StatusBadge from '@/components/StatusBadge';
import { cn } from '@/utils';

export default function RoomList() {
  const meetingRooms = useAppStore((state) => state.meetingRooms);
  const supplyItems = useAppStore((state) => state.supplyItems);
  const deleteMeetingRoom = useAppStore((state) => state.deleteMeetingRoom);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const getRoomStatus = (roomId: string) => {
    const pending = supplyItems.filter(
      (s) => s.roomId === roomId && s.status === 'pending'
    );
    const urgent = pending.filter((s) => s.consecutiveShortage >= 2).length;
    if (urgent > 0) return { variant: 'danger' as const, label: '紧急缺货' };
    if (pending.length > 0) return { variant: 'warning' as const, label: '待补货' };
    return { variant: 'success' as const, label: '正常' };
  };

  const handleDelete = (id: string) => {
    deleteMeetingRoom(id);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">会议室档案</h1>
          <p className="mt-1 text-slate-500">
            共 {meetingRooms.length} 个会议室
          </p>
        </div>
        <Link
          to="/rooms/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          新增会议室
        </Link>
      </div>

      {meetingRooms.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg shadow-slate-200/50 border border-slate-100">
          <LayoutGrid className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            暂无会议室档案
          </h3>
          <p className="text-slate-500 mb-6">点击上方按钮添加第一个会议室</p>
          <Link
            to="/rooms/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            新增会议室
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetingRooms.map((room, index) => {
            const status = getRoomStatus(room.id);
            const pendingCount = supplyItems.filter(
              (s) => s.roomId === room.id && s.status === 'pending'
            ).length;

            return (
              <div
                key={room.id}
                className="group bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={room.photo}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3">
                    <StatusBadge
                      status={status.label}
                      label={status.label}
                      variant={status.variant}
                      size="sm"
                    />
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-lg font-bold text-white">
                      {room.name}
                    </h3>
                    <p className="text-sm text-white/80">
                      {DEPARTMENTS.includes(room.department) ? room.department : '未分配部门'}
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>容量 {room.capacity} 人</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <LayoutGrid className="w-4 h-4 text-blue-500" />
                      <span>白板 {room.whiteboardCount} 块</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">
                      配置颜色（最低 {room.minStock} 支）
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {room.defaultColors.map((color) => (
                        <ColorBadge
                          key={color}
                          color={color}
                          showName={false}
                          size="sm"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{room.managerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{room.managerPhone}</span>
                    </div>
                  </div>

                  {pendingCount > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <span className="text-sm text-amber-700">
                        {pendingCount} 项补给待处理
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Link
                      to={`/rooms/${room.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      编辑
                    </Link>
                    {confirmDelete === room.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(room.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(room.id)}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors',
                          'bg-red-50 text-red-600 hover:bg-red-100'
                        )}
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
