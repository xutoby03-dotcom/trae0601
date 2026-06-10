import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Wrench,
  PackageX,
  Clock,
  MapPin,
  Users,
  ClipboardCheck,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ROOM_STATUS_LABELS } from '@/types';
import type { RoomStatus } from '@/types';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/mock';

const statusConfig: {
  status: RoomStatus;
  label: string;
  icon: typeof CheckCircle2;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  dotColor: string;
}[] = [
  {
    status: 'normal',
    label: '正常',
    icon: CheckCircle2,
    bgGradient: 'from-emerald-50 to-teal-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
  },
  {
    status: 'repairing',
    label: '待维修',
    icon: Wrench,
    bgGradient: 'from-red-50 to-rose-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    dotColor: 'bg-red-500',
  },
  {
    status: 'missing_parts',
    label: '缺配件',
    icon: PackageX,
    bgGradient: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    dotColor: 'bg-amber-500',
  },
  {
    status: 'not_inspected',
    label: '今日未巡检',
    icon: Clock,
    bgGradient: 'from-slate-50 to-gray-100',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-600',
    dotColor: 'bg-slate-400',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { rooms, getRoomsByStatus } = useStore();

  const getStatusRooms = (status: RoomStatus | 'not_inspected') => {
    if (status === 'not_inspected') {
      return rooms.filter((r) => {
        if (!r.lastInspectedAt) return true;
        const lastDate = new Date(r.lastInspectedAt);
        const today = new Date();
        return !(
          lastDate.getFullYear() === today.getFullYear() &&
          lastDate.getMonth() === today.getMonth() &&
          lastDate.getDate() === today.getDate()
        );
      });
    }
    return getRoomsByStatus(status as RoomStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">会议室状态总览</h1>
          <p className="text-slate-500 mt-1">实时查看所有会议室设备状态</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/inspection')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
          >
            <ClipboardCheck className="w-4 h-4" />
            开始巡检
          </button>
          <button
            onClick={() => navigate('/report')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            快速报修
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {statusConfig.map((config) => {
          const Icon = config.icon;
          const statusRooms = getStatusRooms(config.status);
          return (
            <div
              key={config.status}
              className={cn(
                'rounded-xl border bg-gradient-to-br p-5 transition-all hover:shadow-lg cursor-pointer',
                config.bgGradient,
                config.borderColor
              )}
              onClick={() => navigate('/rooms')}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={cn('text-sm font-medium', config.textColor)}>
                    {config.label}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {statusRooms.length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">间会议室</p>
                </div>
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    'bg-white/80 shadow-sm'
                  )}
                >
                  <Icon className={cn('w-6 h-6', config.textColor)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-5">
        {statusConfig.map((config) => {
          const Icon = config.icon;
          const statusRooms = getStatusRooms(config.status);
          return (
            <div
              key={config.status}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className={cn('w-2.5 h-2.5 rounded-full', config.dotColor)} />
                  <h3 className="font-semibold text-slate-800">
                    {config.label}
                  </h3>
                  <span className="ml-auto text-sm text-slate-500">
                    {statusRooms.length} 间
                  </span>
                </div>
              </div>
              <div className="p-3 max-h-80 overflow-y-auto space-y-2">
                {statusRooms.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-8">
                    暂无数据
                  </p>
                ) : (
                  statusRooms.map((room) => (
                    <div
                      key={room.id}
                      className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/inspection?roomId=${room.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-800 text-sm">
                          {room.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {room.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {room.capacity}人
                        </span>
                      </div>
                      {room.lastInspectedAt && (
                        <p className="text-xs text-slate-400 mt-2">
                          上次巡检：{formatDate(room.lastInspectedAt)}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">快捷操作</h3>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/rooms')}
              className="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-center group"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors">
                <Plus className="w-6 h-6 text-slate-400 group-hover:text-emerald-600" />
              </div>
              <p className="font-medium text-slate-700 group-hover:text-emerald-700">
                登记会议室
              </p>
              <p className="text-xs text-slate-400 mt-1">添加新会议室</p>
            </button>
            <button
              onClick={() => navigate('/inspection')}
              className="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-center group"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
                <ClipboardCheck className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
              </div>
              <p className="font-medium text-slate-700 group-hover:text-blue-700">
                设备巡检
              </p>
              <p className="text-xs text-slate-400 mt-1">按清单检查设备</p>
            </button>
            <button
              onClick={() => navigate('/report')}
              className="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all text-center group"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center mb-3 transition-colors">
                <AlertTriangle className="w-6 h-6 text-slate-400 group-hover:text-amber-600" />
              </div>
              <p className="font-medium text-slate-700 group-hover:text-amber-700">
                故障报修
              </p>
              <p className="text-xs text-slate-400 mt-1">报告设备问题</p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">今日统计</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-sm">已巡检</span>
              <span className="font-semibold text-emerald-600">
                {rooms.filter((r) => {
                  if (!r.lastInspectedAt) return false;
                  const d = new Date(r.lastInspectedAt);
                  const t = new Date();
                  return (
                    d.getFullYear() === t.getFullYear() &&
                    d.getMonth() === t.getMonth() &&
                    d.getDate() === t.getDate()
                  );
                }).length}{' '}
                / {rooms.length}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{
                  width: `${rooms.length > 0
                    ? (rooms.filter((r) => {
                        if (!r.lastInspectedAt) return false;
                        const d = new Date(r.lastInspectedAt);
                        const t = new Date();
                        return (
                          d.getFullYear() === t.getFullYear() &&
                          d.getMonth() === t.getMonth() &&
                          d.getDate() === t.getDate()
                        );
                      }).length /
                        rooms.length) *
                      100
                    : 0}%`,
                }}
              />
            </div>
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">待处理工单</span>
                <span className="font-medium text-red-600">
                  {useStore.getState().tickets.filter((t) => t.status !== 'completed').length} 个
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">本月已修复</span>
                <span className="font-medium text-emerald-600">
                  {useStore.getState().tickets.filter((t) => t.status === 'completed').length} 个
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
