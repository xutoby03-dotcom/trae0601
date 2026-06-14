import { useState, useMemo } from 'react';
import { Bell, Phone, DoorOpen, MessageSquare, Mail, Clock, User, Calendar, Search, Plus, ChevronDown } from 'lucide-react';
import { useInspectionStore } from '@/store/inspectionStore';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { NOTIFICATION_METHODS } from '@/constants';
import { formatDate, getDeadlineStatus, addDaysFromNow } from '@/utils/date';
import { NotificationMethod, Notification } from '@/types';
import { cn } from '@/utils/helpers';

const methodIcons: Record<NotificationMethod, typeof Phone> = {
  '上门': DoorOpen,
  '电话': Phone,
  '告示': Bell,
  '微信': MessageSquare,
  '其他': Mail,
};

export default function Notifications() {
  const { notifications, inspections, addNotification, addFeedback } = useInspectionStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const [formData, setFormData] = useState({
    inspectionId: '',
    method: '上门' as NotificationMethod,
    deadline: '',
    contactPerson: '',
    contactPhone: '',
  });

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (statusFilter !== 'all' && n.status !== statusFilter) return false;
      if (methodFilter !== 'all' && n.method !== methodFilter) return false;
      if (searchQuery) {
        const inspection = inspections.find((i) => i.id === n.inspectionId);
        const searchLower = searchQuery.toLowerCase();
        return (
          n.contactPerson.toLowerCase().includes(searchLower) ||
          n.contactPhone.includes(searchQuery) ||
          inspection?.building.toLowerCase().includes(searchLower) ||
          inspection?.location.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [notifications, statusFilter, methodFilter, searchQuery, inspections]);

  const pendingInspections = useMemo(() => {
    return inspections.filter((i) => i.status === 'pending' || i.status === 'recheck');
  }, [inspections]);

  const getInspection = (inspectionId: string) => {
    return inspections.find((i) => i.id === inspectionId);
  };

  const handleAddNotification = () => {
    if (!formData.inspectionId || !formData.contactPerson || !formData.contactPhone) {
      alert('请填写完整信息');
      return;
    }
    addNotification(formData.inspectionId, {
      method: formData.method,
      deadline: formData.deadline || undefined,
      contactPerson: formData.contactPerson,
      contactPhone: formData.contactPhone,
    });
    setShowAddModal(false);
    setFormData({
      inspectionId: '',
      method: '上门',
      deadline: '',
      contactPerson: '',
      contactPhone: '',
    });
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim() || !selectedNotification) return;
    addFeedback(selectedNotification.id, feedbackText);
    setShowFeedbackModal(false);
    setFeedbackText('');
    setSelectedNotification(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">通知管理</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                共 {filteredNotifications.length} 条通知
              </p>
            </div>
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
              发起通知
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索联系人、电话..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">全部状态</option>
              <option value="sent">已发送</option>
              <option value="feedback_received">已反馈</option>
              <option value="overdue">已超期</option>
              <option value="completed">已完成</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">全部方式</option>
              {NOTIFICATION_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">位置</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">通知方式</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">联系人</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">期限</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">反馈</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p>暂无通知记录</p>
                    </td>
                  </tr>
                ) : (
                  filteredNotifications.map((notification) => {
                    const inspection = getInspection(notification.inspectionId);
                    const deadlineStatus = getDeadlineStatus(notification.deadline);
                    const MethodIcon = methodIcons[notification.method];

                    return (
                      <tr
                        key={notification.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">
                              {inspection?.building} {inspection?.floor}
                            </p>
                            <p className="text-xs text-gray-500">{inspection?.location}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <MethodIcon className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm text-gray-700">{notification.method}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{notification.contactPerson}</p>
                            <p className="text-xs text-gray-500">{notification.contactPhone}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm text-gray-800">
                              {formatDate(notification.deadline)}
                            </p>
                            <p
                              className={cn(
                                'text-xs font-medium',
                                deadlineStatus.status === 'overdue' && 'text-red-600',
                                deadlineStatus.status === 'urgent' && 'text-red-500',
                                deadlineStatus.status === 'warning' && 'text-amber-500',
                                deadlineStatus.status === 'normal' && 'text-green-600'
                              )}
                            >
                              {deadlineStatus.label}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge type="notification" status={notification.status} size="sm" />
                        </td>
                        <td className="py-4 px-4 max-w-[200px]">
                          {notification.feedback ? (
                            <div className="text-sm text-gray-600 truncate" title={notification.feedback}>
                              {notification.feedback}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">暂无反馈</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {notification.status !== 'feedback_received' && notification.status !== 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                              onClick={() => {
                                setSelectedNotification(notification);
                                setShowFeedbackModal(true);
                              }}
                            >
                              记录反馈
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="发起清理通知"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>取消</Button>
            <Button onClick={handleAddNotification}>发送通知</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">选择巡查记录</label>
            <select
              value={formData.inspectionId}
              onChange={(e) => {
                const inspection = pendingInspections.find((i) => i.id === e.target.value);
                setFormData({
                  ...formData,
                  inspectionId: e.target.value,
                  contactPerson: inspection?.suspectedResident || '',
                });
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择...</option>
              {pendingInspections.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.building} {i.floor} {i.location} - {i.itemType}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">通知方式</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value as NotificationMethod })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {NOTIFICATION_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">清理期限</label>
              <input
                type="date"
                value={formData.deadline ? formData.deadline.slice(0, 10) : ''}
                onChange={(e) => setFormData({ ...formData, deadline: new Date(e.target.value).toISOString() })}
                min={new Date().toISOString().slice(0, 10)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">联系人</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="住户姓名"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">联系电话</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="手机号码"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="记录住户反馈"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowFeedbackModal(false)}>取消</Button>
            <Button onClick={handleSubmitFeedback}>保存</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">通知对象</p>
            <p className="font-medium text-gray-800">{selectedNotification?.contactPerson}</p>
            <p className="text-sm text-gray-500 mt-2">
              联系方式：{selectedNotification?.method} · {selectedNotification?.contactPhone}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">反馈内容</label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="请输入住户反馈内容..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
