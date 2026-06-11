import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, Truck, FileText, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/Toast';
import { expressCompanyOptions } from '@/utils/express';
import { getTodayStr } from '@/utils/date';
import type { ExpressCompany } from '@/store/types';
import { cn } from '@/lib/utils';

export const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { samples, createShipmentOrder } = useStore();

  const [formData, setFormData] = useState({
    customerName: '',
    contactPerson: '',
    contactPhone: '',
    customerAddress: '',
    sampleId: '',
    quantity: 1,
    batch: '',
    expressCompany: 'sf' as ExpressCompany,
    trackingNumber: '',
    sender: '',
    sendDate: getTodayStr(),
    expectedArrivalDate: '',
    remarks: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const selectedSample = samples.find(s => s.id === formData.sampleId);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customerName.trim()) newErrors.customerName = '请输入客户名称';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = '请输入联系人';
    if (!formData.contactPhone.trim()) newErrors.contactPhone = '请输入联系电话';
    else if (!/^1[3-9]\d{9}$/.test(formData.contactPhone)) newErrors.contactPhone = '请输入正确的手机号';
    if (!formData.customerAddress.trim()) newErrors.customerAddress = '请输入客户地址';
    if (!formData.sampleId) newErrors.sampleId = '请选择样品';
    if (formData.quantity <= 0) newErrors.quantity = '数量必须大于0';
    else if (selectedSample && formData.quantity > selectedSample.stockQuantity) {
      newErrors.quantity = `库存不足，当前可用：${selectedSample.stockQuantity}`;
    }
    if (!formData.batch.trim()) newErrors.batch = '请输入批次';
    if (!formData.sender.trim()) newErrors.sender = '请选择/输入寄送人';
    if (!formData.sendDate) newErrors.sendDate = '请选择寄出日期';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('请检查表单填写', 'error');
      return;
    }

    setSubmitting(true);

    const orderId = createShipmentOrder({
      ...formData,
      sampleName: selectedSample?.name || '',
      actualArrivalDate: null,
      feedback: '',
      needReissue: false,
      convertedToOrder: false,
      reissueOrderId: null,
    });

    setTimeout(() => {
      setSubmitting(false);
      if (orderId) {
        showToast('寄样单创建成功，库存已扣减', 'success');
        navigate('/');
      } else {
        showToast('库存不足，创建失败', 'error');
      }
    }, 500);
  };

  const handleSampleChange = (sampleId: string) => {
    const sample = samples.find(s => s.id === sampleId);
    setFormData({
      ...formData,
      sampleId,
      batch: sample?.batch || '',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5">
          <h1 className="text-xl font-semibold text-white">创建寄样单</h1>
          <p className="text-blue-100 text-sm mt-1">填写寄样信息，系统将自动扣减库存</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">客户信息</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  客户名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="请输入客户公司名称"
                  className={cn(
                    'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all',
                    errors.customerName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  )}
                />
                {errors.customerName && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.customerName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  联系人 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="请输入联系人姓名"
                  className={cn(
                    'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all',
                    errors.contactPerson ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  )}
                />
                {errors.contactPerson && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.contactPerson}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  联系电话 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="请输入联系电话"
                  className={cn(
                    'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all',
                    errors.contactPhone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  )}
                />
                {errors.contactPhone && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.contactPhone}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  收件地址 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <MapPin className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                    placeholder="请输入详细收件地址"
                    className={cn(
                      'flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all',
                      errors.customerAddress ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    )}
                  />
                </div>
                {errors.customerAddress && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1 ml-7">
                    <AlertCircle className="w-3 h-3" />
                    {errors.customerAddress}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Package className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">样品信息</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  样品名称 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.sampleId}
                  onChange={(e) => handleSampleChange(e.target.value)}
                  className={cn(
                    'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all',
                    errors.sampleId ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  )}
                >
                  <option value="">请选择样品</option>
                  {samples.map((sample) => (
                    <option key={sample.id} value={sample.id}>
                      {sample.name} (库存: {sample.stockQuantity}{sample.unit})
                      {sample.stockQuantity <= sample.warningThreshold && ' ⚠️'}
                    </option>
                  ))}
                </select>
                {errors.sampleId && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.sampleId}
                  </p>
                )}
                {selectedSample && selectedSample.stockQuantity <= selectedSample.warningThreshold && (
                  <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    该样品库存已低于预警线 ({selectedSample.warningThreshold})
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  寄送数量 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className={cn(
                      'flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all',
                      errors.quantity ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    )}
                  />
                  <span className="text-gray-500">{selectedSample?.unit || ''}</span>
                </div>
                {errors.quantity && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.quantity}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  批次号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  placeholder="请输入批次号"
                  className={cn(
                    'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all',
                    errors.batch ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  )}
                />
                {errors.batch && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.batch}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Truck className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">物流信息</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  快递公司 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.expressCompany}
                  onChange={(e) => setFormData({ ...formData, expressCompany: e.target.value as ExpressCompany })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {expressCompanyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">快递单号</label>
                <input
                  type="text"
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                  placeholder="如未寄出可稍后填写"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  寄出日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.sendDate}
                  onChange={(e) => setFormData({ ...formData, sendDate: e.target.value })}
                  className={cn(
                    'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all',
                    errors.sendDate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  )}
                />
                {errors.sendDate && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.sendDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">预计到达日期</label>
                <input
                  type="date"
                  value={formData.expectedArrivalDate}
                  onChange={(e) => setFormData({ ...formData, expectedArrivalDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  寄送人 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sender}
                  onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                  placeholder="请输入寄送人姓名"
                  list="senders"
                  className={cn(
                    'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all',
                    errors.sender ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  )}
                />
                <datalist id="senders">
                  <option value="张三" />
                  <option value="李四" />
                  <option value="王五" />
                  <option value="赵六" />
                  <option value="钱七" />
                </datalist>
                {errors.sender && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.sender}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">备注信息</h2>
            </div>
            <div>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="可选：填写其他需要备注的信息..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  创建中...
                </>
              ) : (
                <>创建寄样单</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
