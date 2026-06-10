import { useState } from 'react';
import {
  Wrench,
  Clock,
  User,
  Phone,
  MessageSquare,
  ChevronRight,
  X,
  CheckCircle2,
  PlayCircle,
  Send,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  TICKET_STATUS_LABELS,
  DEVICE_TYPE_LABELS,
  PRIORITY_LABELS,
} from '@/types';
import type { Ticket, TicketStatus } from '@/types';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/mock';

interface StatusColumn {
  status: TicketStatus;
  label: string;
  icon: typeof Clock;
  color: string;
  bgColor: string;
  borderColor: string;
}

const statusColumns: StatusColumn[] = [
  {
    status: 'pending',
    label: '待派单',
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    status: 'assigned',
    label: '已派单',
    icon: Send,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    status: 'processing',
    label: '处理中',
    icon: PlayCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    status: 'completed',
    label: '已修好',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
];

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function Tickets() {
  const { tickets, rooms, updateTicketStatus, getTicketLogs, currentUser } =
    useStore();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [assignee, setAssignee] = useState('');

  const getTicketsByStatus = (status: TicketStatus) =>
    tickets
      .filter((t) => t.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getRoomName = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room?.name || '未知';
  };

  const handleAssign = () => {
    if (!selectedTicket || !assignee) return;
    updateTicketStatus(selectedTicket.id, 'assigned', assignee);
    setSelectedTicket({ ...selectedTicket, status: 'assigned', assignee, assignedAt: new Date().toISOString() });
    setAssignee('');
  };

  const handleStartProcessing = () => {
    if (!selectedTicket) return;
    updateTicketStatus(selectedTicket.id, 'processing');
    setSelectedTicket({ ...selectedTicket, status: 'processing' });
  };

  const handleComplete = () => {
    if (!selectedTicket) return;
    updateTicketStatus(selectedTicket.id, 'completed');
    setSelectedTicket({ ...selectedTicket, status: 'completed', completedAt: new Date().toISOString() });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">维修工单</h1>
          <p className="text-slate-500 mt-1">跟踪和管理所有设备维修工单</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Wrench className="w-4 h-4" />
          共 {tickets.length} 个工单
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {statusColumns.map((column) => {
          const Icon = column.icon;
          const columnTickets = getTicketsByStatus(column.status);

          return (
            <div
              key={column.status}
              className={cn(
                'rounded-xl border bg-white overflow-hidden flex flex-col',
                column.borderColor
              )}
            >
              <div className={cn('p-4 border-b', column.bgColor, column.borderColor)}>
                <div className="flex items-center gap-2">
                  <Icon className={cn('w-5 h-5', column.color)} />
                  <h3 className={cn('font-semibold', column.color)}>{column.label}</h3>
                  <span
                    className={cn(
                      'ml-auto px-2 py-0.5 rounded-full text-xs font-medium',
                      column.bgColor,
                      column.color
                    )}
                  >
                    {columnTickets.length}
                  </span>
                </div>
              </div>

              <div className="flex-1 p-3 space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto">
                {columnTickets.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-slate-400">暂无工单</p>
                  </div>
                ) : (
                  columnTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-4 rounded-lg bg-white border border-slate-200 cursor-pointer hover:shadow-md hover:border-slate-300 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-slate-800 text-sm line-clamp-2">
                          {ticket.title}
                        </h4>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 mt-0.5" />
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <Building2 className="w-3.5 h-3.5" />
                        {getRoomName(ticket.roomId)}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full border',
                            priorityColors[ticket.priority]
                          )}
                        >
                          {PRIORITY_LABELS[ticket.priority]}
                        </span>
                        <span className="text-xs text-slate-400">
                          {DEVICE_TYPE_LABELS[ticket.deviceType]}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {ticket.reporterName}
                        </span>
                        <span>{formatDate(ticket.createdAt).split(' ')[0]}</span>
                      </div>

                      {ticket.assignee && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1 text-xs text-slate-500">
                          <Wrench className="w-3 h-3" />
                          处理人：{ticket.assignee}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
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
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    statusColumns.find((c) => c.status === selectedTicket.status)?.bgColor,
                    statusColumns.find((c) => c.status === selectedTicket.status)?.color
                  )}
                >
                  {TICKET_STATUS_LABELS[selectedTicket.status]}
                </span>
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium border',
                    priorityColors[selectedTicket.priority]
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
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
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
