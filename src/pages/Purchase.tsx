import { useState } from 'react';
import { Plus, ShoppingCart, CheckCircle, Clock, Package, Truck, User, Calendar, DollarSign, FileText, Edit2 } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import Modal from '../components/ui/Modal';
import { PURCHASE_STATUS_LABELS, CONFERENCE_ROOMS, BATTERY_MODELS } from '../data/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Purchase() {
  const { purchaseOrders, remotes, addPurchaseOrder, updatePurchaseOrder, addRemote } = useAppStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  
  const [createForm, setCreateForm] = useState({
    reason: '',
    applicant: '',
  });

  const [processForm, setProcessForm] = useState({
    purchaseChannel: '',
    cost: '',
    approver: '',
    newCode: '',
    newConferenceRoom: CONFERENCE_ROOMS[0],
    newBatteryModel: BATTERY_MODELS[0],
    newStorageLocation: '',
    newPhotoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20black%20projector%20remote%20control%20on%20white%20background%20product%20photo&image_size=square_hd',
  });

  const sortedOrders = [...purchaseOrders].sort(
    (a, b) => new Date(b.applyDate).getTime() - new Date(a.applyDate).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'purchased': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'stocked': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'approved': return CheckCircle;
      case 'purchased': return Truck;
      case 'stocked': return Package;
      default: return FileText;
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'approved': return 1;
      case 'purchased': return 2;
      case 'stocked': return 3;
      default: return 0;
    }
  };

  const steps = ['待审批', '审批通过', '已采购', '已入库'];

  const handleCreate = () => {
    if (!createForm.reason.trim()) {
      alert('请输入补购原因');
      return;
    }
    if (!createForm.applicant.trim()) {
      alert('请输入申请人');
      return;
    }

    addPurchaseOrder({
      reason: createForm.reason,
      applicant: createForm.applicant,
      applyDate: new Date().toISOString(),
      status: 'pending',
    });

    setShowCreateModal(false);
    setCreateForm({ reason: '', applicant: '' });
  };

  const openProcessModal = (orderId: string) => {
    setSelectedOrder(orderId);
    setShowProcessModal(true);
  };

  const handleProcess = () => {
    if (!selectedOrder) return;

    const order = purchaseOrders.find(p => p.id === selectedOrder);
    if (!order) return;

    let nextStatus = order.status;

    if (order.status === 'pending') {
      if (!processForm.approver.trim()) {
        alert('请输入审批人');
        return;
      }
      updatePurchaseOrder(selectedOrder, {
        status: 'approved',
        approver: processForm.approver,
        approveDate: new Date().toISOString(),
      });
      nextStatus = 'approved';
    }

    if (order.status === 'approved' || (order.status === 'pending' && nextStatus === 'approved')) {
      if (!processForm.purchaseChannel.trim()) {
        alert('请输入采购渠道');
        return;
      }
      if (!processForm.cost || parseFloat(processForm.cost) <= 0) {
        alert('请输入有效的采购费用');
        return;
      }
      updatePurchaseOrder(selectedOrder, {
        status: 'purchased',
        purchaseChannel: processForm.purchaseChannel,
        cost: parseFloat(processForm.cost),
        purchaseDate: new Date().toISOString(),
      });
      nextStatus = 'purchased';
    }

    if (order.status === 'purchased' || (order.status === 'approved' && nextStatus === 'purchased')) {
      if (!processForm.newCode.trim()) {
        alert('请输入新遥控器编号');
        return;
      }
      if (!processForm.newStorageLocation.trim()) {
        alert('请输入存放位置');
        return;
      }

      addRemote({
        code: processForm.newCode,
        conferenceRoom: processForm.newConferenceRoom,
        batteryModel: processForm.newBatteryModel,
        storageLocation: processForm.newStorageLocation,
        photoUrl: processForm.newPhotoUrl,
        status: 'available',
        batteryLevel: 100,
        lastBatteryChange: new Date().toISOString(),
      });

      const currentState = useAppStore.getState();
      const newRemote = currentState.remotes.find(r => r.code === processForm.newCode);
      if (!newRemote) return;

      updatePurchaseOrder(selectedOrder, {
        status: 'stocked',
        stockDate: new Date().toISOString(),
        newRemoteId: newRemote.id,
      });
    }

    setShowProcessModal(false);
    setSelectedOrder(null);
    setProcessForm({
      purchaseChannel: '',
      cost: '',
      approver: '',
      newCode: '',
      newConferenceRoom: CONFERENCE_ROOMS[0],
      newBatteryModel: BATTERY_MODELS[0],
      newStorageLocation: '',
      newPhotoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20black%20projector%20remote%20control%20on%20white%20background%20product%20photo&image_size=square_hd',
    });
  };

  const getNextActionText = (status: string) => {
    switch (status) {
      case 'pending': return '审批';
      case 'approved': return '采购';
      case 'purchased': return '入库';
      default: return '已完成';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-display">补购管理</h1>
          <p className="text-gray-500 mt-1">管理遥控器丢失后的补购流程</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增补购申请
        </button>
      </div>

      {sortedOrders.length === 0 ? (
        <div className="card-base p-12 text-center animate-fade-in-up">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">暂无补购申请</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order, index) => {
            const relatedRemote = remotes.find(r => r.id === order.remoteId);
            const newRemote = remotes.find(r => r.id === order.newRemoteId);
            const currentStep = getStatusStep(order.status);
            const StatusIcon = getStatusIcon(order.status);

            return (
              <div
                key={order.id}
                className="card-base p-6 animate-fade-in-up"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-800">
                            补购申请 #{order.id.toUpperCase()}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            <StatusIcon className="w-3 h-3 inline mr-1" />
                            {PURCHASE_STATUS_LABELS[order.status as keyof typeof PURCHASE_STATUS_LABELS]}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-2">{order.reason}</p>
                      </div>
                      {order.status !== 'stocked' && (
                        <button
                          onClick={() => openProcessModal(order.id)}
                          className="btn-primary flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          {getNextActionText(order.status)}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>申请人: {order.applicant}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>申请: {format(new Date(order.applyDate), 'M月d日', { locale: zhCN })}</span>
                      </div>
                      {order.cost && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span>费用: ¥{order.cost}</span>
                        </div>
                      )}
                      {order.purchaseChannel && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <ShoppingCart className="w-4 h-4 text-gray-400" />
                          <span>渠道: {order.purchaseChannel}</span>
                        </div>
                      )}
                    </div>

                    {relatedRemote && (
                      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl mb-4">
                        <img src={relatedRemote.photoUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">丢失遥控器: {relatedRemote.code}</p>
                          <p className="text-xs text-gray-500">{relatedRemote.conferenceRoom}</p>
                        </div>
                      </div>
                    )}

                    {newRemote && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                        <img src={newRemote.photoUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">新遥控器已入库: {newRemote.code}</p>
                          <p className="text-xs text-gray-500">{newRemote.conferenceRoom} · {newRemote.storageLocation}</p>
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        {steps.map((step, i) => (
                          <div key={step} className="flex-1 text-center">
                            <div
                              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium ${
                                i <= currentStep
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-200 text-gray-500'
                              }`}
                            >
                              {i + 1}
                            </div>
                            <p className={`text-xs mt-2 ${i <= currentStep ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full transition-all duration-500"
                          style={{ width: `${(currentStep / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="新增补购申请"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">补购原因 *</label>
            <textarea
              value={createForm.reason}
              onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
              placeholder="请说明补购原因，如：遥控器丢失、新增备用等"
              rows={3}
              className="input-field resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">申请人 *</label>
            <input
              type="text"
              value={createForm.applicant}
              onChange={(e) => setCreateForm({ ...createForm, applicant: e.target.value })}
              placeholder="请输入申请人姓名"
              className="input-field"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
          <button onClick={() => setShowCreateModal(false)} className="btn-secondary">
            取消
          </button>
          <button onClick={handleCreate} className="btn-primary">
            提交申请
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showProcessModal}
        onClose={() => { setShowProcessModal(false); setSelectedOrder(null); }}
        title="处理补购申请"
        size="lg"
      >
        {(() => {
          const order = purchaseOrders.find(p => p.id === selectedOrder);
          if (!order) return null;

          const showApproval = order.status === 'pending';
          const showPurchase = order.status === 'approved' || order.status === 'pending';
          const showStock = order.status === 'purchased' || order.status === 'approved';

          return (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-800">申请原因</p>
                <p className="text-gray-600 mt-1">{order.reason}</p>
                <p className="text-xs text-gray-500 mt-2">申请人: {order.applicant}</p>
              </div>

              {showApproval && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    审批信息
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">审批人 *</label>
                      <input
                        type="text"
                        value={processForm.approver}
                        onChange={(e) => setProcessForm({ ...processForm, approver: e.target.value })}
                        placeholder="请输入审批人姓名"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              )}

              {showPurchase && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-blue-600" />
                    采购信息
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">采购渠道 *</label>
                      <input
                        type="text"
                        value={processForm.purchaseChannel}
                        onChange={(e) => setProcessForm({ ...processForm, purchaseChannel: e.target.value })}
                        placeholder="如：京东、淘宝、线下门店"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">采购费用 (元) *</label>
                      <input
                        type="number"
                        value={processForm.cost}
                        onChange={(e) => setProcessForm({ ...processForm, cost: e.target.value })}
                        placeholder="请输入采购费用"
                        min="0"
                        step="0.01"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              )}

              {showStock && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-600" />
                    新遥控器入库信息
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">遥控器编号 *</label>
                      <input
                        type="text"
                        value={processForm.newCode}
                        onChange={(e) => setProcessForm({ ...processForm, newCode: e.target.value })}
                        placeholder="如: RC-016"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">适配会议室</label>
                      <select
                        value={processForm.newConferenceRoom}
                        onChange={(e) => setProcessForm({ ...processForm, newConferenceRoom: e.target.value })}
                        className="input-field"
                      >
                        {CONFERENCE_ROOMS.map(room => (
                          <option key={room} value={room}>{room}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">电池型号</label>
                      <select
                        value={processForm.newBatteryModel}
                        onChange={(e) => setProcessForm({ ...processForm, newBatteryModel: e.target.value })}
                        className="input-field"
                      >
                        {BATTERY_MODELS.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">存放位置 *</label>
                      <input
                        type="text"
                        value={processForm.newStorageLocation}
                        onChange={(e) => setProcessForm({ ...processForm, newStorageLocation: e.target.value })}
                        placeholder="如: 2楼前台"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
          <button
            onClick={() => { setShowProcessModal(false); setSelectedOrder(null); }}
            className="btn-secondary"
          >
            取消
          </button>
          <button onClick={handleProcess} className="btn-primary">
            {purchaseOrders.find(p => p.id === selectedOrder)?.status === 'pending' ? '审批通过' :
             purchaseOrders.find(p => p.id === selectedOrder)?.status === 'approved' ? '确认采购' :
             '确认入库'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
