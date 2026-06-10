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
  X,
  Send,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Wrench,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { DEVICE_TYPE_LABELS, TICKET_STATUS_LABELS, PRIORITY_LABELS } from '@/types';
import type { Room, DeviceType, Ticket, TicketStatus } from '@/types';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/mock';

const detailStatusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  assigned: 'bg-blue-50 text-blue-600 border-blue-200',
  processing: 'bg-purple-50 text-purple-600 border-purple-200',
  completed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

const detailPriorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-blue-100 text-blue-700 border-blue-200',
};

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
  const { rooms, addTicket, tickets, updateTicketStatus, getTicketLogs, currentUser } = useStore();
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [assignee, setAssignee] = useState('');
  
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

  const getRoom = (roomId: string) => {
    return rooms.find((r) => r.id === roomId);
  };

  const getNextAction = (status: TicketStatus) => {
    switch (status) {
      case 'pending':
        return { label: '派单', nextStatus: 'assigned' };
      case 'assigned':
        return { label: '开始处理', nextStatus: 'processing' };
      case 'processing':
        return { label: '标记完成', nextStatus: 'completed' };
      default:
        return null;
    }
  };

  const handleAssign = () => {
    if (!selectedTicket || !assignee) return;
    updateTicketStatus(selectedTicket.id, 'assigned', assignee);
    const updated = tickets.find((t) => t.id === selectedTicket.id);
    if (updated) {
      setSelectedTicket({ ...updated, status: 'assigned', assignee, assignedAt: new Date().toISOString() });
    }
    setAssignee('');
  };

  const handleStartProcessing = () => {
    if (!selectedTicket) return;
    updateTicketStatus(selectedTicket.id, 'processing');
    const updated = tickets.find((t) => t.id === selectedTicket.id);
    if (updated) {
      setSelectedTicket({ ...updated, status: 'processing' });
    }
  };

  const handleComplete = () => {
    if (!selectedTicket) return;
    updateTicketStatus(selectedTicket.id, 'completed');
    const updated = tickets.find((t) => t.id === selectedTicket.id);
    if (updated) {
      setSelectedTicket({ ...updated, status: 'completed', completedAt: new Date().toISOString() });
    }
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
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setAssignee(ticket.assignee || '');
                    }}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:shadow-md hover:border-slate-300 transition-all"
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

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">工单详情</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  #{selectedTicket.id.slice(0, 8)}
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium border',
                    detailStatusColors[selectedTicket.status]
                  )}
                >
                  {TICKET_STATUS_LABELS[selectedTicket.status]}
                </span>
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium border',
                    detailPriorityColors[selectedTicket.priority]
                  )}
                >
                  {PRIORITY_LABELS[selectedTicket.priority]}优先级
                </span>
              </div>

              <div>
                <h3 className="text-base font-semibold text-slate-800 mb-2">
                  {selectedTicket.title}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Building2 className="w-4 h-4" />
                    {getRoomName(selectedTicket.roomId)} · {DEVICE_TYPE_LABELS[selectedTicket.deviceType]}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-4 h-4" />
                    创建于 {formatDate(selectedTicket.createdAt)}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  问题描述
                </h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              {selectedTicket.meetingTime && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="text-sm font-medium text-amber-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    影响会议时间
                  </h4>
                  <p className="text-sm text-amber-600 mt-1">
                    {selectedTicket.meetingTime}
                  </p>
                </div>
              )}

              {(() => {
                const room = getRoom(selectedTicket.roomId);
                return room ? (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-700 mb-2">会议室信息</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-slate-600">
                        <span className="text-slate-400">位置：</span>{room.location}
                      </p>
                      <p className="text-slate-600">
                        <span className="text-slate-400">容量：</span>{room.capacity}人
                      </p>
                      <p className="text-slate-600">
                        <span className="text-slate-400">负责人：</span>{room.manager}
                      </p>
                      {room.managerContact && (
                        <p className="text-slate-600">
                          <span className="text-slate-400">电话：</span>{room.managerContact}
                        </p>
                      )}
                    </div>
                  </div>
                ) : null;
              })()}

              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">报修人信息</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-4 h-4 text-slate-400" />
                    {selectedTicket.reporterName}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {selectedTicket.reporterContact}
                  </div>
                </div>
              </div>

              {selectedTicket.assignee && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">处理人</h4>
                  <p className="text-sm text-slate-600">{selectedTicket.assignee}</p>
                </div>
              )}

              {selectedTicket.status === 'pending' && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">指派维修人员</h4>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      placeholder="输入维修人员姓名"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAssign}
                      disabled={!assignee}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      派单
                    </button>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">操作日志</h4>
                <div className="space-y-3">
                  {getTicketLogs(selectedTicket.id).map((log) => (
                    <div key={log.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-700">
                          <span className="font-medium">{log.operator}</span>{' '}
                          {log.action}
                        </p>
                        {log.note && (
                          <p className="text-xs text-slate-500 mt-0.5">{log.note}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          {formatDate(log.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                关闭
              </button>
              {getNextAction(selectedTicket.status) && (
                <button
                  onClick={() => {
                    if (selectedTicket.status === 'pending') {
                      if (assignee) {
                        handleAssign();
                      }
                    } else if (selectedTicket.status === 'assigned') {
                      handleStartProcessing();
                    } else if (selectedTicket.status === 'processing') {
                      handleComplete();
                    }
                  }}
                  disabled={selectedTicket.status === 'pending' && !assignee}
                  className={cn(
                    'px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors',
                    selectedTicket.status === 'pending' &&
                      !assignee &&
                      'opacity-50 cursor-not-allowed hover:bg-emerald-600'
                  )}
                >
                  {getNextAction(selectedTicket.status)?.label}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
