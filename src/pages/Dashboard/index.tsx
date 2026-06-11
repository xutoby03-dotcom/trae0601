import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Truck, CheckCircle, MessageCircle, AlertTriangle, Search, X, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { ShipmentStatus, ShipmentOrder } from '@/store/types';
import { StatusCard } from '@/components/StatusCard';
import { ShipmentCard } from '@/components/ShipmentCard';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { expressCompanyOptions } from '@/utils/express';
import { getTodayStr, isOverdue } from '@/utils/date';

const statusTabs: { status: ShipmentStatus; label: string }[] = [
  { status: 'pending', label: '待寄出' },
  { status: 'shipping', label: '运输中' },
  { status: 'delivered', label: '已签收' },
  { status: 'followup', label: '要回访' },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  
  const {
    samples,
    shipmentOrders,
    getOrdersByStatus,
    getOverdueOrders,
    searchOrders,
    updateShipmentStatus,
    recordFeedback,
    loadFromStorage,
  } = useStore();

  const [activeStatus, setActiveStatus] = useState<ShipmentStatus>('pending');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [shippedModalOpen, setShippedModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  const [shippedForm, setShippedForm] = useState({
    expressCompany: 'sf' as const,
    trackingNumber: '',
    sendDate: getTodayStr(),
    expectedArrivalDate: '',
  });
  
  const [feedbackForm, setFeedbackForm] = useState({
    feedback: '',
    needReissue: false,
    convertedToOrder: false,
  });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    const keyword = searchParams.get('search') || '';
    setSearchInput(keyword);
  }, [searchParams]);

  const displayOrders = useMemo(() => {
    let orders: ShipmentOrder[];

    if (searchInput.trim()) {
      orders = searchOrders(searchInput.trim());
    } else {
      orders = getOrdersByStatus(activeStatus);
    }

    if (showOverdueOnly) {
      orders = orders.filter(order => isOverdue(order.expectedArrivalDate, order.status));
    }

    return orders;
  }, [searchInput, activeStatus, showOverdueOnly, shipmentOrders, searchOrders, getOrdersByStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ search: searchInput.trim() });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const toggleOverdueFilter = () => {
    const next = !showOverdueOnly;
    setShowOverdueOnly(next);
    if (next && activeStatus !== 'shipping') {
      setActiveStatus('shipping');
    }
  };

  const handleStatusClick = (status: ShipmentStatus) => {
    setActiveStatus(status);
    setShowOverdueOnly(false);
    setSearchParams({});
  };

  const handleMarkShipped = (id: string) => {
    setSelectedOrderId(id);
    setShippedForm({
      expressCompany: 'sf',
      trackingNumber: '',
      sendDate: getTodayStr(),
      expectedArrivalDate: '',
    });
    setShippedModalOpen(true);
  };

  const handleConfirmShipped = () => {
    if (!selectedOrderId) return;
    if (!shippedForm.trackingNumber.trim()) {
      showToast('请输入快递单号', 'error');
      return;
    }
    if (!shippedForm.sendDate) {
      showToast('请选择寄出日期', 'error');
      return;
    }
    if (!shippedForm.expectedArrivalDate) {
      showToast('请选择预计到达日期', 'error');
      return;
    }

    updateShipmentStatus(selectedOrderId, 'shipping', {
      expressCompany: shippedForm.expressCompany,
      trackingNumber: shippedForm.trackingNumber,
      sendDate: shippedForm.sendDate,
      expectedArrivalDate: shippedForm.expectedArrivalDate,
    });

    showToast('已标记为寄出', 'success');
    setShippedModalOpen(false);
    setSelectedOrderId(null);
  };

  const handleMarkDelivered = (id: string) => {
    updateShipmentStatus(id, 'delivered', {
      actualArrivalDate: getTodayStr(),
    });
    showToast('已标记为签收', 'success');
  };

  const handleRecordFeedback = (id: string) => {
    const order = shipmentOrders.find(o => o.id === id);
    setSelectedOrderId(id);
    setFeedbackForm({
      feedback: order?.feedback || '',
      needReissue: order?.needReissue || false,
      convertedToOrder: order?.convertedToOrder || false,
    });
    setFeedbackModalOpen(true);
  };

  const handleConfirmFeedback = () => {
    if (!selectedOrderId) return;
    if (!feedbackForm.feedback.trim()) {
      showToast('请输入客户反馈', 'error');
      return;
    }

    recordFeedback(
      selectedOrderId,
      feedbackForm.feedback,
      feedbackForm.needReissue,
      feedbackForm.convertedToOrder
    );

    showToast('反馈记录成功', 'success');
    setFeedbackModalOpen(false);
    setSelectedOrderId(null);
  };

  const pendingCount = getOrdersByStatus('pending').length;
  const shippingCount = getOrdersByStatus('shipping').length;
  const deliveredCount = getOrdersByStatus('delivered').length;
  const followupCount = getOrdersByStatus('followup').length;
  const overdueCount = getOverdueOrders().length;
  const hasActiveFilter = searchInput.trim() || showOverdueOnly;

  let emptyTitle = '暂无寄样单';
  let emptyDesc = '';
  if (searchInput.trim() && showOverdueOnly) {
    emptyTitle = '搜索结果中没有超时未签收的包裹';
    emptyDesc = '试试换个关键词，或清除筛选条件查看全部';
  } else if (searchInput.trim()) {
    emptyTitle = '没有找到匹配的寄样单';
    emptyDesc = '试试换个关键词搜索，或清除筛选条件';
  } else if (showOverdueOnly) {
    emptyTitle = '暂无超时未签收的包裹';
    emptyDesc = '当前运输中的包裹均在预计到达时间内';
  } else {
    emptyDesc = `当前"${statusTabs.find(t => t.status === activeStatus)?.label}"分组暂无数据`;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          status="pending"
          count={pendingCount}
          label="待寄出"
          icon={<Package className="w-6 h-6" />}
          isActive={activeStatus === 'pending' && !hasActiveFilter}
          onClick={() => handleStatusClick('pending')}
        />
        <StatusCard
          status="shipping"
          count={shippingCount}
          label={overdueCount > 0 ? `运输中 (${overdueCount}超时)` : '运输中'}
          icon={<Truck className="w-6 h-6" />}
          isActive={activeStatus === 'shipping' && !hasActiveFilter}
          onClick={() => handleStatusClick('shipping')}
        />
        <StatusCard
          status="delivered"
          count={deliveredCount}
          label="已签收"
          icon={<CheckCircle className="w-6 h-6" />}
          isActive={activeStatus === 'delivered' && !hasActiveFilter}
          onClick={() => handleStatusClick('delivered')}
        />
        <StatusCard
          status="followup"
          count={followupCount}
          label="要回访"
          icon={<MessageCircle className="w-6 h-6" />}
          isActive={activeStatus === 'followup' && !hasActiveFilter}
          onClick={() => handleStatusClick('followup')}
        />
      </div>

      {overdueCount > 0 && activeStatus === 'shipping' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">超时预警</p>
            <p className="text-sm text-red-600">当前有 {overdueCount} 个包裹已超过预计到达日期，请及时跟进</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {!searchInput.trim() && (
                <div className="flex gap-1">
                  {statusTabs.map((tab) => (
                    <button
                      key={tab.status}
                      onClick={() => handleStatusClick(tab.status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeStatus === tab.status && !hasActiveFilter
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {tab.label}
                      <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-600">
                        {getOrdersByStatus(tab.status).length}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {searchInput.trim() && (
                <h2 className="text-lg font-semibold text-gray-800">
                  搜索结果："{searchInput.trim()}"
                </h2>
              )}
            </div>
            <button
              onClick={() => navigate('/create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              新建寄样单
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索客户名、样品名、快递单号..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            <button
              onClick={toggleOverdueFilter}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                showOverdueOnly
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              超时未签收
              {overdueCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  showOverdueOnly ? 'bg-red-200 text-red-800' : 'bg-red-500 text-white'
                }`}>
                  {overdueCount}
                </span>
              )}
            </button>

            {hasActiveFilter && (
              <button
                onClick={() => { clearSearch(); setShowOverdueOnly(false); }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                清除筛选
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {displayOrders.length === 0 ? (
            <div className="text-center py-16">
              {searchInput.trim() && showOverdueOnly ? (
                <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              ) : searchInput.trim() ? (
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              ) : showOverdueOnly ? (
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              ) : (
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              )}
              <p className="text-gray-700 font-medium mb-1">{emptyTitle}</p>
              {emptyDesc && <p className="text-gray-400 text-sm">{emptyDesc}</p>}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {displayOrders.map((order) => (
                <ShipmentCard
                  key={order.id}
                  order={order}
                  onViewDetail={(id) => navigate(`/order/${id}`)}
                  onMarkShipped={handleMarkShipped}
                  onMarkDelivered={handleMarkDelivered}
                  onRecordFeedback={handleRecordFeedback}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={shippedModalOpen}
        onClose={() => setShippedModalOpen(false)}
        title="标记寄出"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              快递公司 <span className="text-red-500">*</span>
            </label>
            <select
              value={shippedForm.expressCompany}
              onChange={(e) => setShippedForm({ ...shippedForm, expressCompany: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {expressCompanyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              快递单号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={shippedForm.trackingNumber}
              onChange={(e) => setShippedForm({ ...shippedForm, trackingNumber: e.target.value })}
              placeholder="请输入快递单号"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                寄出日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={shippedForm.sendDate}
                onChange={(e) => setShippedForm({ ...shippedForm, sendDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                预计到达 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={shippedForm.expectedArrivalDate}
                onChange={(e) => setShippedForm({ ...shippedForm, expectedArrivalDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShippedModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirmShipped}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              确认寄出
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="录入客户反馈"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              客户反馈 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={feedbackForm.feedback}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
              placeholder="请输入客户对样品的反馈意见..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={feedbackForm.convertedToOrder}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, convertedToOrder: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">已转为正式订单</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={feedbackForm.needReissue}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, needReissue: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">需要补寄样品</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setFeedbackModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirmFeedback}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              保存反馈
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
