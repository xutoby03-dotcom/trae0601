import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Package, Save } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { useAppStore } from '../store/useAppStore';
import { getToday } from '../utils';

export default function DeviceNew() {
  const navigate = useNavigate();
  const { addDevice } = useAppStore();

  const [formData, setFormData] = useState({
    deviceNo: '',
    name: '',
    model: '',
    serialNo: '',
    location: '',
    purchaseDate: getToday(),
    description: '',
  });

  const [accessories, setAccessories] = useState<{ name: string; quantity: number; description: string }[]>([
    { name: '电源线', quantity: 1, description: '国标三插电源线' },
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAccessoryChange = (index: number, field: string, value: string | number) => {
    setAccessories((prev) =>
      prev.map((acc, i) => (i === index ? { ...acc, [field]: value } : acc))
    );
  };

  const addAccessory = () => {
    setAccessories((prev) => [...prev, { name: '', quantity: 1, description: '' }]);
  };

  const removeAccessory = (index: number) => {
    setAccessories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formData.deviceNo || !formData.name || !formData.model) {
      alert('请填写必填项');
      return;
    }

    addDevice({
      ...formData,
      status: 'available',
      accessories: accessories.filter((a) => a.name),
    });

    navigate('/devices');
  };

  return (
    <PageContainer title="新增样机" subtitle="录入新的样机设备信息">
      <button
        onClick={() => navigate('/devices')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回样机列表
      </button>

      <div className="max-w-3xl">
        {/* 基本信息 */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-primary-600" />
            </div>
            基本信息
          </h3>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label-base">样机编号 <span className="text-danger-500">*</span></label>
              <input
                type="text"
                value={formData.deviceNo}
                onChange={(e) => handleInputChange('deviceNo', e.target.value)}
                placeholder="例如：YJ-2024-001"
                className="input-base"
              />
            </div>

            <div>
              <label className="label-base">设备名称 <span className="text-danger-500">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="例如：示波器"
                className="input-base"
              />
            </div>

            <div>
              <label className="label-base">型号 <span className="text-danger-500">*</span></label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="例如：DSO-X 3024T"
                className="input-base"
              />
            </div>

            <div>
              <label className="label-base">序列号</label>
              <input
                type="text"
                value={formData.serialNo}
                onChange={(e) => handleInputChange('serialNo', e.target.value)}
                placeholder="机身序列号"
                className="input-base font-mono"
              />
            </div>

            <div>
              <label className="label-base">存放位置</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="例如：A楼3层设备间"
                className="input-base"
              />
            </div>

            <div>
              <label className="label-base">购入日期</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                className="input-base"
              />
            </div>

            <div className="col-span-2">
              <label className="label-base">设备描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="设备详细描述、规格参数等"
                rows={3}
                className="input-base resize-none"
              />
            </div>
          </div>
        </div>

        {/* 配件清单 */}
        <div className="bg-white rounded-xl shadow-card p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-primary-600" />
              </div>
              配件清单
            </h3>
            <button
              onClick={addAccessory}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              添加配件
            </button>
          </div>

          <div className="space-y-3">
            {accessories.map((acc, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">配件名称</label>
                    <input
                      type="text"
                      value={acc.name}
                      onChange={(e) => handleAccessoryChange(index, 'name', e.target.value)}
                      placeholder="配件名称"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">数量</label>
                    <input
                      type="number"
                      min="1"
                      value={acc.quantity}
                      onChange={(e) => handleAccessoryChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">描述</label>
                    <input
                      type="text"
                      value={acc.description}
                      onChange={(e) => handleAccessoryChange(index, 'description', e.target.value)}
                      placeholder="规格、型号等"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeAccessory(index)}
                  className="p-2 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3">
          <button onClick={() => navigate('/devices')} className="btn-secondary">
            取消
          </button>
          <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            保存样机
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
