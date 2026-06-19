import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Building2,
  Receipt,
  FileText,
  MessageSquareWarning,
  Calendar,
  Edit,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import { useComplaintStore } from '@/store/useComplaintStore';
import { useRoomStore } from '@/store/useRoomStore';
import {
  getComplaintTypeLabel,
  getComplaintStatusLabel,
} from '@/utils/status';
import { mockOrders } from '@/utils/mockData';
import { Thermometer } from 'lucide-react';
import { Droplets } from 'lucide-react';
import { Zap } from 'lucide-react';
import { Flame } from 'lucide-react';

const ComplaintDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getComplaint, updateComplaint } = useComplaintStore();
  const { getRoom } = useRoomStore();

  const complaint = getComplaint(id || '');
  const room = complaint ? getRoom(complaint.roomId) : null;
  const order = complaint
    ? mockOrders.find((o) => o.id === complaint.orderId)
    : null;

  if (!complaint) {
    return (
      <div className="text-center py-16">
        <MessageSquareWarning className="w-16 h-16 text-dark-600 mx-auto mb-4" />
        <p className="text-dark-400 mb-4">投诉记录不存在</p>
        <button
          onClick={() => navigate('/complaints')}
          className="text-warning-400 hover:text-warning-300"
        >
          返回投诉列表
        </button>
      </div>
    );
  }

  const complaintIconMap = {
    not_hot: Thermometer,
    unstable: Droplets,
    tripping: Zap,
    other: Flame,
  };

  const Icon = complaintIconMap[complaint.complaintType];

  const handleStatusChange = (newStatus: typeof complaint.status) => {
    updateComplaint(complaint.id, { status: newStatus });
  };

  const statuses = [
    { value: 'pending', label: '待处理', variant: 'danger' as const },
    { value: 'processing', label: '处理中', variant: 'warning' as const },
    { value: 'resolved', label: '已解决', variant: 'success' as const },
    { value: 'closed', label: '已关闭', variant: 'muted' as const },
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/complaints')}
          className="w-10 h-10 rounded-xl bg-dark-800/50 flex items-center justify-center text-dark-400 hover:bg-dark-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">投诉详情</h1>
          <p className="text-dark-400">{complaint.complaintDate}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-danger-500/20 rounded-2xl flex items-center justify-center">
                <Icon className="w-7 h-7 text-danger-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {getComplaintTypeLabel(complaint.complaintType)}
                </h2>
                <p className="text-dark-400 text-sm">
                  投诉编号: {complaint.id}
                </p>
              </div>
            </div>
            <StatusBadge
              label={getComplaintStatusLabel(complaint.status)}
              variant={
                complaint.status === 'pending'
                  ? 'danger'
                  : complaint.status === 'processing'
                  ? 'warning'
                  : complaint.status === 'resolved'
                  ? 'success'
                  : 'muted'
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-dark-800/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-dark-400" />
                <span className="text-sm text-dark-400">房间</span>
              </div>
              {room && (
                <Link
                  to={`/rooms/${room.id}`}
                  className="text-white font-medium hover:text-warning-400 transition-colors"
                >
                  {room.roomNumber} 房 - {room.heaterModel}
                </Link>
              )}
            </div>
            <div className="bg-dark-800/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-dark-400" />
                <span className="text-sm text-dark-400">客人</span>
              </div>
              <p className="text-white font-medium">{complaint.guestName}</p>
            </div>
            <div className="bg-dark-800/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="w-4 h-4 text-dark-400" />
                <span className="text-sm text-dark-400">订单号</span>
              </div>
              <p className="text-white font-mono">{complaint.orderNumber || '未关联'}</p>
            </div>
            <div className="bg-dark-800/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-dark-400" />
                <span className="text-sm text-dark-400">投诉日期</span>
              </div>
              <p className="text-white font-medium">{complaint.complaintDate}</p>
            </div>
          </div>

          {order && (
            <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
              <h3 className="text-sm font-medium text-primary-400 mb-3">
                <Receipt className="w-4 h-4 inline mr-1.5" />
                关联订单信息
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-dark-400">订单号: </span>
                  <span className="text-white">{order.orderNumber}</span>
                </div>
                <div>
                  <span className="text-dark-400">入住: </span>
                  <span className="text-white">{order.checkInDate}</span>
                </div>
                <div>
                  <span className="text-dark-400">离店: </span>
                  <span className="text-white">{order.checkOutDate}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-dark-400" />
            问题描述
          </h3>
          <p className="text-dark-200 leading-relaxed bg-dark-800/30 p-4 rounded-xl">
            {complaint.description}
          </p>
        </div>

        {complaint.handlingNotes && (
          <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Edit className="w-5 h-5 text-dark-400" />
              处理备注
            </h3>
            <p className="text-dark-200 leading-relaxed bg-dark-800/30 p-4 rounded-xl">
              {complaint.handlingNotes}
            </p>
          </div>
        )}

        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">更新状态</h3>
          <div className="grid grid-cols-4 gap-3">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value as typeof complaint.status)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  complaint.status === status.value
                    ? 'bg-warning-500/10 border-warning-500/50'
                    : 'bg-dark-800/30 border-dark-700 hover:border-dark-600'
                }`}
              >
                <StatusBadge
                  label={status.label}
                  variant={status.variant}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">关联维修</h3>
          <p className="text-dark-400 mb-4">
            此投诉已自动生成维修工单，点击查看详情
          </p>
          <Link
            to="/repairs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-warning-500/20 text-warning-400 rounded-xl hover:bg-warning-500/30 transition-colors"
          >
            查看维修工单 →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
