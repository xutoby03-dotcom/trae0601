import { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  FileText,
  Clock,
  User,
  Phone,
  ChevronDown,
  Check,
  MessageSquare,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { DEVICE_TYPE_LABELS, TICKET_STATUS_LABELS, PRIORITY_LABELS } from '@/types';
import type { Room, DeviceType, Ticket } from '@/types';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/mock';

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  assigned: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

export default function Report() {
  const { rooms, addTicket, tickets } = useStore();
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reporterName: '',
    reporterContact: '',
    meetingTime: '',
    deviceType: 'projector' as DeviceType,
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const sortedTickets = [...tickets].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setShowRoomDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    addTicket({
      roomId: selectedRoom.id,
      title: formData.title,
      description: formData.description,
      reporterName: formData.reporterName,
      reporterContact: formData.reporterContact,
      meetingTime: formData.meetingTime,
      deviceType: formData.deviceType,
      priority: formData.priority,
    });

    setSubmitted(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      reporterName: '',
      reporterContact: '',
      meetingTime: '',
      deviceType: 'projector',
      priority: 'medium',
    });
    setSelectedRoom(null);
    setSubmitted(false);
  };

  const getRoomName = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room?.name || '未知会议室';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">故障报修</h1>
        <p className="text-slate-500 mt-1">发现设备问题？快速提交报修，我们会尽快处理</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            {!submitted ? (
              <>
                <h3 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  提交报修
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <Building2 className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                      选择会议室 *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowRoomDropdown(!showRoomDropdown)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-left flex items-center justify-between hover:border-emerald-300 transition-colors"
                      >
                        {selectedRoom ? (
                          <span className="text-slate-800">{selectedRoom.name}</span>
                        ) : (
                          <span className="text-slate-400">请选择出现问题的会议室</span>
                        )}
                        <ChevronDown
                          className={cn(
                            'w-5 h-5 text-slate-400 transition-transform',
                            showRoomDropdown && 'rotate-180'
                          )}
                        />
                      </button>
                      {showRoomDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                          {rooms.map((room) => (
                            <button
                              key={room.id}
                              type="button"
                              onClick={() => handleSelectRoom(room)}
                              className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0"
                            >
                              <p className="font-medium text-slate-800">{room.name}</p>
                              <p className="text-xs text-slate-500">{room.location}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <FileText className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                      问题标题 *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="简要描述问题，如：投影仪无法开机"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        设备类型 *
                      </label>
                      <select
                        value={formData.deviceType}
                        onChange={(e) =>
                          setFormData({ ...formData, deviceType: e.target.value as DeviceType })
                        }
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                      >
                        {Object.entries(DEVICE_TYPE_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        紧急程度
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priority: e.target.value as 'low' | 'medium' | 'high',
                          })
                        }
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                      >
                        <option value="low">低 - 不影响使用</option>
                        <option value="medium">中 - 部分功能受影响</option>
                        <option value="high">高 - 无法正常使用</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <MessageSquare className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                      问题描述 *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                      placeholder="请详细描述问题现象，方便维修人员排查..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <Clock className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                      影响的会议时间
                    </label>
                    <input
                      type="text"
                      value={formData.meetingTime}
                      onChange={(e) =>
                        setFormData({ ...formData, meetingTime: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="如：今天下午 2 点有重要会议"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        <User className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                        您的姓名 *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.reporterName}
                        onChange={(e) =>
                          setFormData({ ...formData, reporterName: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="请输入您的姓名"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        <Phone className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                        联系电话 *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.reporterContact}
                        onChange={(e) =>
                          setFormData({ ...formData, reporterContact: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="方便维修人员联系您"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      提交报修
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="py-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">报修提交成功</h3>
                <p className="text-slate-500 mb-6">
                  我们已收到您的报修，维修人员会尽快处理。
                </p>
                <button
                  onClick={resetForm}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  继续报修
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">报修记录</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {sortedTickets.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">暂无报修记录</p>
              ) : (
                sortedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-800 text-sm line-clamp-1">
                        {ticket.title}
                      </p>
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap',
                          statusColors[ticket.status]
                        )}
                      >
                        {TICKET_STATUS_LABELS[ticket.status]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {getRoomName(ticket.roomId)} · {DEVICE_TYPE_LABELS[ticket.deviceType]}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {formatDate(ticket.createdAt)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full',
                          priorityColors[ticket.priority]
                        )}
                      >
                        {PRIORITY_LABELS[ticket.priority]}优先级
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
