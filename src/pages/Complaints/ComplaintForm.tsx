import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  User,
  Building2,
  FileText,
  FileQuestion,
  Receipt,
} from 'lucide-react';
import { useComplaintStore } from '@/store/useComplaintStore';
import { useRoomStore } from '@/store/useRoomStore';
import { useRepairStore } from '@/store/useRepairStore';
import { mockOrders } from '@/utils/mockData';
import { getComplaintTypeLabel } from '@/utils/status';
import { cn } from '@/lib/utils';

const ComplaintForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomIdParam = searchParams.get('roomId');
  const { addComplaint } = useComplaintStore();
  const { rooms, setRoomStatus } = useRoomStore();
  const { addRepair } = useRepairStore();

  const [formData, setFormData] = useState({
    roomId: roomIdParam || '',
    orderId: '',
    orderNumber: '',
    guestName: '',
    complaintDate: new Date().toISOString().split('T')[0],
    complaintType: 'not_hot' as 'not_hot' | 'unstable' | 'tripping' | 'other',
    description: '',
    status: 'pending' as 'pending' | 'processing' | 'resolved' | 'closed',
    handlingNotes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableOrders = formData.roomId
    ? mockOrders.filter((o) => o.roomId === formData.roomId)
    : mockOrders;

  useEffect(() => {
    if (formData.orderId) {
      const order = mockOrders.find((o) => o.id === formData.orderId);
      if (order) {
        setFormData((prev) => ({
          ...prev,
          orderNumber: order.orderNumber,
          guestName: order.guestName,
        }));
      }
    }
  }, [formData.orderId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.roomId) {
      newErrors.roomId = '请选择房间';
    }
    if (!formData.guestName.trim()) {
      newErrors.guestName = '请输入客人姓名';
    }
    if (!formData.description.trim()) {
      newErrors.description = '请输入投诉描述';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newComplaint = addComplaint(formData);

    if (formData.status === 'pending' || formData.status === 'processing') {
      setRoomStatus(formData.roomId, 'maintenance');

      const room = rooms.find((r) => r.id === formData.roomId);
      addRepair({
        roomId: formData.roomId,
        sourceType: 'complaint',
        sourceId: newComplaint.id,
        title: `${room?.roomNumber}房客人投诉维修`,
        description: `${getComplaintTypeLabel(formData.complaintType)}: ${formData.description}`,
        status: 'pending',
        assignee: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        completedDate: null,
        cost: 0,
        notes: `客人: ${formData.guestName}, 订单: ${formData.orderNumber}, 投诉ID: ${newComplaint.id}`,
      });
    }

    navigate('/complaints');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const complaintTypes = [
    { value: 'not_hot', label: '水不热', icon: '🌡️' },
    { value: 'unstable', label: '忽冷忽热', icon: '💧' },
    { value: 'tripping', label: '跳闸', icon: '⚡' },
    { value: 'other', label: '其他问题', icon: '❓' },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/complaints')}
          className="w-10 h-10 rounded-xl bg-dark-800/50 flex items-center justify-center text-dark-400 hover:bg-dark-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">记录投诉</h1>
          <p className="text-dark-400">录入客人反馈的热水器问题</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">基本信息</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                <Building2 className="w-4 h-4 inline mr-1.5" />
                房间 *
              </label>
              <select
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-dark-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-warning-500/20 transition-all ${
                  errors.roomId
                    ? 'border-danger-500/50 focus:border-danger-500'
                    : 'border-dark-700 focus:border-warning-500/50'
                }`}
              >
                <option value="">请选择房间</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.roomNumber} 房 - {room.heaterModel}
                  </option>
                ))}
              </select>
              {errors.roomId && (
                <p className="text-danger-400 text-sm mt-1">{errors.roomId}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                <FileQuestion className="w-4 h-4 inline mr-1.5" />
                投诉日期
              </label>
              <input
                type="date"
                name="complaintDate"
                value={formData.complaintDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              <Receipt className="w-4 h-4 inline mr-1.5" />
              关联订单
            </label>
            <select
              name="orderId"
              value={formData.orderId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20 transition-all"
            >
              <option value="">暂不关联订单</option>
              {availableOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.orderNumber} - {order.guestName} ({order.checkInDate} 入住)
                </option>
              ))}
            </select>
            <p className="text-xs text-dark-500 mt-1">
              选择订单后将自动填充客人信息
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              <User className="w-4 h-4 inline mr-1.5" />
              客人姓名 *
            </label>
            <input
              type="text"
              name="guestName"
              value={formData.guestName}
              onChange={handleChange}
              placeholder="请输入客人姓名"
              className={`w-full px-4 py-2.5 bg-dark-800/50 border rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-warning-500/20 transition-all ${
                errors.guestName
                  ? 'border-danger-500/50 focus:border-danger-500'
                  : 'border-dark-700 focus:border-warning-500/50'
              }`}
            />
            {errors.guestName && (
              <p className="text-danger-400 text-sm mt-1">{errors.guestName}</p>
            )}
          </div>
        </div>

        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">投诉详情</h2>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-3">
              投诉类型
            </label>
            <div className="grid grid-cols-4 gap-3">
              {complaintTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      complaintType: type.value as typeof formData.complaintType,
                    }))
                  }
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all text-center',
                    formData.complaintType === type.value
                      ? 'bg-warning-500/10 border-warning-500/50'
                      : 'bg-dark-800/30 border-dark-700 hover:border-dark-600'
                  )}
                >
                  <span className="text-2xl block mb-2">{type.icon}</span>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      formData.complaintType === type.value
                        ? 'text-warning-400'
                        : 'text-dark-300'
                    )}
                  >
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              <FileText className="w-4 h-4 inline mr-1.5" />
              问题描述 *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="请详细描述客人反映的问题..."
              className={`w-full px-4 py-3 bg-dark-800/50 border rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-warning-500/20 transition-all resize-none ${
                errors.description
                  ? 'border-danger-500/50 focus:border-danger-500'
                  : 'border-dark-700 focus:border-warning-500/50'
              }`}
            />
            {errors.description && (
              <p className="text-danger-400 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              处理状态
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20 transition-all"
            >
              <option value="pending">待处理</option>
              <option value="processing">处理中</option>
              <option value="resolved">已解决</option>
              <option value="closed">已关闭</option>
            </select>
            <p className="text-xs text-dark-500 mt-1">
              选择"待处理"或"处理中"将自动暂停房间上架并生成维修工单
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              处理备注
            </label>
            <textarea
              name="handlingNotes"
              value={formData.handlingNotes}
              onChange={handleChange}
              rows={2}
              placeholder="处理进展、解决方案等..."
              className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20 transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            to="/complaints"
            className="px-5 py-2.5 bg-dark-800 text-white rounded-xl font-medium hover:bg-dark-700 transition-colors"
          >
            取消
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-warning-500 text-white rounded-xl font-medium hover:bg-warning-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            提交投诉
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;
