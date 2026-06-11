import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Package, User, MapPin, Truck, FileText, Calendar,
  CheckCircle, Clock, MessageCircle, RefreshCw, ShoppingCart
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/Toast';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';
import { formatDate, formatDateTime, getTodayStr } from '@/utils/date';
import { getExpressCompanyName } from '@/utils/express';
import { expressCompanyOptions } from '@/utils/express';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { shipmentOrders, updateShipmentStatus, recordFeedback, markAsFollowup, loadFromStorage } = useStore();

  const [shippedModalOpen, setShippedModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [deliveredModalOpen, setDeliveredModalOpen] = useState(false);

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

  const order = shipmentOrders.find(o => o.id === id);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    const state = location.state as { openFeedback?: boolean; openShipped?: boolean };
    if (state?.openFeedback) {
      setFeedbackModalOpen(true);
    }
    if (state?.openShipped) {
      setShippedModalOpen(true);
    }
  }, [location.state]);

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">寄样单不存在</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          返回首页
        </button>
      </div>
    );
  }

  const handleConfirmShipped = () => {
    if (!shippedForm.trackingNumber.trim()) {
      showToast('请输入快递单号', 'error');
      return;
    }
    if (!shippedForm.expectedArrivalDate) {
      showToast('请选择预计到达日期', 'error');
      return;
    }

    updateShipmentStatus(order.id, 'shipping', {
      expressCompany: shippedForm.expressCompany,
      trackingNumber: shippedForm.trackingNumber,
      sendDate: shippedForm.sendDate,
      expectedArrivalDate: shippedForm.expectedArrivalDate,
    });

    showToast('已标记为寄出', 'success');
    setShippedModalOpen(false);
  };

  const handleConfirmDelivered = () => {
    updateShipmentStatus(order.id, 'delivered', {
      actualArrivalDate: getTodayStr(),
    });
    showToast('已标记为签收', 'success');
    setDeliveredModalOpen(false);
  };

  const handleConfirmFeedback = () => {
    if (!feedbackForm.feedback.trim()) {
      showToast('请输入客户反馈', 'error');
      return;
    }

    recordFeedback(
      order.id,
      feedbackForm.feedback,
      feedbackForm.needReissue,
      feedbackForm.convertedToOrder
    );

    showToast('反馈记录成功', 'success');
    setFeedbackModalOpen(false);
  };

  const handleMarkFollowup = () => {
    markAsFollowup(order.id);
    showToast('已标记为待回访', 'success');
  };

  const handleCreateReissue = () => {
    navigate('/create', {
      state: {
        customerName: order.customerName,
        contactPerson: order.contactPerson,
        contactPhone: order.contactPhone,
        customerAddress: order.customerAddress,
        sampleId: order.sampleId,
        sampleName: order.sampleName,
        batch: order.batch,
        isReissue: true,
        originalOrderId: order.id,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">寄样单详情</h1>
              <p className="text-blue-100 text-sm mt-1">单号：{order.id}</p>
            </div>
            <StatusBadge status={order.status} className="bg-white/20 text-white" />
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">客户信息</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 w-20 flex-shrink-0">客户名称</span>
                  <span className="text-gray-800 font-medium">{order.customerName}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 w-20 flex-shrink-0">联系人</span>
                  <span className="text-gray-800">{order.contactPerson}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 w-20 flex-shrink-0">联系电话</span>
                  <span className="text-gray-800">{order.contactPhone}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-800">{order.customerAddress}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Package className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">样品信息</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 w-20 flex-shrink-0">样品名称</span>
                  <span className="text-gray-800 font-medium">{order.sampleName}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 w-20 flex-shrink-0">数量</span>
                  <span className="text-gray-800">{order.quantity}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 w-20 flex-shrink-0">批次号</span>
                  <span className="text-gray-800 font-mono">{order.batch}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 w-20 flex-shrink-0">寄送人</span>
                  <span className="text-gray-800">{order.sender}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Truck className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">物流信息</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 w-24 flex-shrink-0">快递公司</span>
                  <span className="text-gray-800">{getExpressCompanyName(order.expressCompany)}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 w-24 flex-shrink-0">快递单号</span>
                  <span className="text-gray-800 font-mono">{order.trackingNumber || '-'}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-500 w-20">寄出日期</span>
                  <span className="text-gray-800">{formatDate(order.sendDate)}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-500 w-20">预计到达</span>
                  <span className="text-gray-800">{formatDate(order.expectedArrivalDate)}</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-500 w-20">签收日期</span>
                  <span className="text-gray-800">{formatDate(order.actualArrivalDate)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">其他信息</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 w-24 flex-shrink-0">创建时间</span>
                  <span className="text-gray-800">{formatDateTime(order.createdAt)}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 w-24 flex-shrink-0">更新时间</span>
                  <span className="text-gray-800">{formatDateTime(order.updatedAt)}</span>
                </div>
                {order.remarks && (
                  <div className="flex items-start gap-3">
                    <span className="text-gray-500 w-24 flex-shrink-0">备注</span>
                    <span className="text-gray-800">{order.remarks}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {(order.status === 'delivered' || order.status === 'followup') && order.feedback && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">客户反馈</h2>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{order.feedback}</p>
                <div className="flex gap-2 mt-3">
                  {order.convertedToOrder && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">
                      <ShoppingCart className="w-3 h-3" />
                      已转正式订单
                    </span>
                  )}
                  {order.needReissue && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
                      <RefreshCw className="w-3 h-3" />
                      需要补寄
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            {order.status === 'pending' && (
              <button
                onClick={() => setShippedModalOpen(true)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                标记寄出
              </button>
            )}
            {order.status === 'shipping' && (
              <>
                <button
                  onClick={() => setDeliveredModalOpen(true)}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  标记签收
                </button>
                <button
                  onClick={handleMarkFollowup}
                  className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  标记待回访
                </button>
              </>
            )}
            {(order.status === 'delivered' || order.status === 'followup') && !order.feedback && (
              <button
                onClick={() => setFeedbackModalOpen(true)}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                录入客户反馈
              </button>
            )}
            {order.needReissue && !order.reissueOrderId && (
              <button
                onClick={handleCreateReissue}
                className="px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                创建补寄单
              </button>
            )}
          </div>
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
        isOpen={deliveredModalOpen}
        onClose={() => setDeliveredModalOpen(false)}
        title="确认签收"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">确认该样品已被客户签收？</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-800">{order.customerName}</p>
            <p className="text-sm text-gray-600">{order.sampleName} × {order.quantity}</p>
            <p className="text-sm text-gray-500 mt-1">
              签收日期：{formatDate(getTodayStr())}
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setDeliveredModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirmDelivered}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              确认签收
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
