import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Camera } from 'lucide-react';
import { useFilterStore } from '../store';
import { formatDate } from '../utils/dateUtils';

export default function DeviceForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { getDeviceById, addDevice, updateDevice, addInventory } = useFilterStore();
  const existingDevice = id ? getDeviceById(id) : undefined;

  const [formData, setFormData] = useState({
    brand: '',
    location: '',
    filterModel: '',
    suggestCycleDays: 180,
    purchaseChannel: '',
    photoUrl: '',
    notes: '',
    initialInventory: 0,
    unitPrice: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingDevice) {
      setFormData({
        brand: existingDevice.brand,
        location: existingDevice.location,
        filterModel: existingDevice.filterModel,
        suggestCycleDays: existingDevice.suggestCycleDays,
        purchaseChannel: existingDevice.purchaseChannel,
        photoUrl: existingDevice.photoUrl,
        notes: existingDevice.notes || '',
        initialInventory: 0,
        unitPrice: 0,
      });
    }
  }, [existingDevice]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.brand.trim()) newErrors.brand = '请输入品牌';
    if (!formData.location.trim()) newErrors.location = '请输入安装位置';
    if (!formData.filterModel.trim()) newErrors.filterModel = '请输入滤芯型号';
    if (formData.suggestCycleDays <= 0) newErrors.suggestCycleDays = '建议周期必须大于0';
    if (!formData.purchaseChannel.trim()) newErrors.purchaseChannel = '请输入购买渠道';
    if (!formData.photoUrl.trim()) newErrors.photoUrl = '请输入设备照片URL';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const deviceData = {
      brand: formData.brand.trim(),
      location: formData.location.trim(),
      filterModel: formData.filterModel.trim(),
      suggestCycleDays: formData.suggestCycleDays,
      purchaseChannel: formData.purchaseChannel.trim(),
      photoUrl: formData.photoUrl.trim(),
      notes: formData.notes.trim() || undefined,
    };

    if (isEdit && id) {
      updateDevice(id, deviceData);
    } else {
      addDevice(deviceData);
      if (formData.initialInventory > 0 && formData.unitPrice > 0) {
        addInventory({
          filterModel: formData.filterModel.trim(),
          quantity: formData.initialInventory,
          unitPrice: formData.unitPrice,
        });
      }
    }

    navigate('/devices');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const generatePhotoUrl = () => {
    const prompt = encodeURIComponent(`${formData.brand} water purifier ${formData.filterModel} modern kitchen appliance`);
    const url = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=square`;
    setFormData((prev) => ({ ...prev, photoUrl: url }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/devices" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-800">
            {isEdit ? '编辑设备' : '添加新设备'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEdit ? '修改设备档案信息' : '录入净水器设备的详细信息'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">品牌 *</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="如：小米、3M、史密斯"
              className={`input-field ${errors.brand ? 'border-danger-400' : ''}`}
            />
            {errors.brand && <p className="text-sm text-danger-500 mt-1">{errors.brand}</p>}
          </div>

          <div>
            <label className="label">安装位置 *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="如：厨房主净水器、客厅饮水机"
              className={`input-field ${errors.location ? 'border-danger-400' : ''}`}
            />
            {errors.location && <p className="text-sm text-danger-500 mt-1">{errors.location}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">滤芯型号 *</label>
            <input
              type="text"
              name="filterModel"
              value={formData.filterModel}
              onChange={handleChange}
              placeholder="如：MR424-Z"
              className={`input-field ${errors.filterModel ? 'border-danger-400' : ''}`}
            />
            {errors.filterModel && <p className="text-sm text-danger-500 mt-1">{errors.filterModel}</p>}
          </div>

          <div>
            <label className="label">建议更换周期（天）*</label>
            <input
              type="number"
              name="suggestCycleDays"
              value={formData.suggestCycleDays}
              onChange={handleChange}
              min="1"
              className={`input-field ${errors.suggestCycleDays ? 'border-danger-400' : ''}`}
            />
            {errors.suggestCycleDays && <p className="text-sm text-danger-500 mt-1">{errors.suggestCycleDays}</p>}
          </div>
        </div>

        <div>
          <label className="label">购买渠道 *</label>
          <input
            type="text"
            name="purchaseChannel"
            value={formData.purchaseChannel}
            onChange={handleChange}
            placeholder="如：京东小米官方旗舰店、线下门店"
            className={`input-field ${errors.purchaseChannel ? 'border-danger-400' : ''}`}
          />
          {errors.purchaseChannel && <p className="text-sm text-danger-500 mt-1">{errors.purchaseChannel}</p>}
        </div>

        <div>
          <label className="label">设备照片URL *</label>
          <div className="flex gap-3">
            <input
              type="url"
              name="photoUrl"
              value={formData.photoUrl}
              onChange={handleChange}
              placeholder="https://..."
              className={`input-field flex-1 ${errors.photoUrl ? 'border-danger-400' : ''}`}
            />
            <button
              type="button"
              onClick={generatePhotoUrl}
              className="btn-secondary whitespace-nowrap inline-flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              生成图片
            </button>
          </div>
          {errors.photoUrl && <p className="text-sm text-danger-500 mt-1">{errors.photoUrl}</p>}
          {formData.photoUrl && (
            <div className="mt-3 aspect-video max-w-sm rounded-xl overflow-hidden border-2 border-gray-200">
              <img
                src={formData.photoUrl}
                alt="设备预览"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {!isEdit && (
          <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
            <p className="text-sm font-medium text-primary-700 mb-4">初始库存设置（可选）</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">初始库存数量</label>
                <input
                  type="number"
                  name="initialInventory"
                  value={formData.initialInventory}
                  onChange={handleChange}
                  min="0"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">单价（元）</label>
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="label">备注</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="可选：记录设备的其他信息..."
            className="input-field resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link to="/devices" className="btn-ghost">
            取消
          </Link>
          <button type="submit" className="btn-primary inline-flex items-center gap-2">
            <Save className="w-5 h-5" />
            {isEdit ? '保存修改' : '创建设备'}
          </button>
        </div>
      </form>
    </div>
  );
}
