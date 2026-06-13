import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useFilterStore } from '../store';
import { formatDate, calculateExpectedExpireDate } from '../utils/dateUtils';

export default function RecordForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedDeviceId = (location.state as { deviceId?: string })?.deviceId;

  const { devices, addRecord, getInventoryByModel } = useFilterStore();

  const [formData, setFormData] = useState({
    deviceId: preselectedDeviceId || '',
    batchNumber: '',
    installDate: formatDate(new Date(), 'yyyy-MM-dd'),
    installer: '',
    cost: 0,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedDevice = devices.find((d) => d.id === formData.deviceId);
  const inventory = selectedDevice ? getInventoryByModel(selectedDevice.filterModel) : null;
  const expectedExpireDate = selectedDevice && formData.installDate
    ? calculateExpectedExpireDate(formData.installDate, selectedDevice.suggestCycleDays)
    : null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.deviceId) newErrors.deviceId = '请选择设备';
    if (!formData.batchNumber.trim()) newErrors.batchNumber = '请输入批次号';
    if (!formData.installDate) newErrors.installDate = '请选择安装日期';
    if (!formData.installer.trim()) newErrors.installer = '请输入安装人';
    if (formData.cost < 0) newErrors.cost = '费用不能为负数';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!validate()) return;

    const result = addRecord({
      deviceId: formData.deviceId,
      batchNumber: formData.batchNumber.trim(),
      installDate: formData.installDate,
      installer: formData.installer.trim(),
      cost: formData.cost,
      notes: formData.notes.trim() || undefined,
    });

    if (result.success) {
      navigate('/records');
    } else {
      setSubmitError(result.message || '创建记录失败');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
    setSubmitError(null);
  };

  const canCreateRecord = () => {
    if (!selectedDevice) return false;
    const inv = getInventoryByModel(selectedDevice.filterModel);
    return inv && inv.quantity > 0;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/records" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-800">记录滤芯更换</h1>
          <p className="text-gray-500 mt-1">录入滤芯更换的详细信息</p>
        </div>
      </div>

      {submitError && (
        <div className="mb-6 p-4 rounded-xl bg-danger-50 border border-danger-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-danger-500 flex-shrink-0" />
          <p className="text-danger-700">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="label">选择设备 *</label>
          <select
            name="deviceId"
            value={formData.deviceId}
            onChange={handleChange}
            className={`input-field ${errors.deviceId ? 'border-danger-400' : ''}`}
          >
            <option value="">请选择要更换滤芯的设备</option>
            {devices.map((device) => {
              const inv = getInventoryByModel(device.filterModel);
              const hasStock = inv && inv.quantity > 0;
              return (
                <option key={device.id} value={device.id} disabled={!hasStock}>
                  {device.location} - {device.brand} {device.filterModel}
                  {!hasStock && ' (库存不足)'}
                </option>
              );
            })}
          </select>
          {errors.deviceId && <p className="text-sm text-danger-500 mt-1">{errors.deviceId}</p>}
          
          {selectedDevice && (
            <div className="mt-3 p-4 rounded-xl bg-primary-50 border border-primary-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">滤芯型号</p>
                  <p className="font-medium text-gray-800">{selectedDevice.filterModel}</p>
                </div>
                <div>
                  <p className="text-gray-500">建议周期</p>
                  <p className="font-medium text-gray-800">{selectedDevice.suggestCycleDays} 天</p>
                </div>
                <div>
                  <p className="text-gray-500">当前库存</p>
                  <p className={`font-medium ${inventory && inventory.quantity > 0 ? 'text-success-600' : 'text-danger-500'}`}>
                    {inventory?.quantity ?? 0} 件
                  </p>
                </div>
                {expectedExpireDate && (
                  <div>
                    <p className="text-gray-500">预计到期日</p>
                    <p className="font-medium text-primary-600">{formatDate(expectedExpireDate, 'yyyy-MM-dd')}</p>
                  </div>
                )}
              </div>
              {inventory && inventory.quantity === 0 && (
                <div className="mt-3 p-3 rounded-lg bg-danger-50 border border-danger-200">
                  <p className="text-sm text-danger-700">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    该型号滤芯库存不足，请先补充库存后再记录更换。
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">滤芯批次号 *</label>
            <input
              type="text"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleChange}
              placeholder="如：B202512001"
              className={`input-field ${errors.batchNumber ? 'border-danger-400' : ''}`}
            />
            {errors.batchNumber && <p className="text-sm text-danger-500 mt-1">{errors.batchNumber}</p>}
          </div>

          <div>
            <label className="label">安装日期 *</label>
            <input
              type="date"
              name="installDate"
              value={formData.installDate}
              onChange={handleChange}
              className={`input-field ${errors.installDate ? 'border-danger-400' : ''}`}
            />
            {errors.installDate && <p className="text-sm text-danger-500 mt-1">{errors.installDate}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">安装人 *</label>
            <input
              type="text"
              name="installer"
              value={formData.installer}
              onChange={handleChange}
              placeholder="如：张先生"
              className={`input-field ${errors.installer ? 'border-danger-400' : ''}`}
            />
            {errors.installer && <p className="text-sm text-danger-500 mt-1">{errors.installer}</p>}
          </div>

          <div>
            <label className="label">费用（元）</label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`input-field ${errors.cost ? 'border-danger-400' : ''}`}
            />
            {errors.cost && <p className="text-sm text-danger-500 mt-1">{errors.cost}</p>}
          </div>
        </div>

        <div>
          <label className="label">备注</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="可选：记录更换时的其他信息..."
            className="input-field resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link to="/records" className="btn-ghost">
            取消
          </Link>
          <button 
            type="submit" 
            className="btn-primary inline-flex items-center gap-2"
            disabled={!canCreateRecord()}
          >
            <Save className="w-5 h-5" />
            保存记录
          </button>
        </div>
      </form>
    </div>
  );
}
