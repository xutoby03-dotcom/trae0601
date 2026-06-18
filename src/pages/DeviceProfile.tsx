import { useState, useRef } from 'react';
import { Camera, Calendar, Battery, Ruler, Package, Wrench, Save, Edit2 } from 'lucide-react';
import { useAppStore } from '../store';
import type { CuffSize, Device } from '../types';
import { cuffSizeLabels } from '../types';
import { cn } from '../lib/utils';
import AlertBanner from '../components/AlertBanner';

export default function DeviceProfile() {
  const { device, updateDevice, settings } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Device>>(device || {});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof Device, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (formData) {
      updateDevice(formData);
      setIsEditing(false);
    }
  };

  const calibrationDate = device?.calibrationDate ? new Date(device.calibrationDate) : null;
  const nextCalibrationDate = calibrationDate 
    ? new Date(calibrationDate.getTime() + settings.calibrationIntervalDays * 24 * 60 * 60 * 1000)
    : null;
  const daysUntilCalibration = nextCalibrationDate
    ? Math.ceil((nextCalibrationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const getBatteryColor = (level: number) => {
    if (level < 20) return 'text-red-500';
    if (level < 50) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getCalibrationStatus = () => {
    if (!daysUntilCalibration) return { text: '未设置', color: 'text-gray-500' };
    if (daysUntilCalibration < 0) return { text: `已超期 ${Math.abs(daysUntilCalibration)} 天`, color: 'text-red-500' };
    if (daysUntilCalibration <= 30) return { text: `${daysUntilCalibration} 天后需校准`, color: 'text-amber-500' };
    return { text: `剩余 ${daysUntilCalibration} 天`, color: 'text-emerald-500' };
  };

  const calibrationStatus = getCalibrationStatus();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">设备档案</h1>
        <p className="text-gray-500">管理您的血压计和袖带信息，确保测量准确</p>
      </div>

      <AlertBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt="设备照片"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-24 h-24 text-gray-300" />
                )}
              </div>
              {isEditing && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <Camera className="w-8 h-8 mr-2" />
                    <span>更换照片</span>
                  </button>
                </>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {formData.brand || '品牌'} {formData.model || '型号'}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <Battery className={cn('w-5 h-5', getBatteryColor(formData.batteryLevel || 0))} />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">电量</span>
                    <span className="font-medium">{formData.batteryLevel || 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        formData.batteryLevel && formData.batteryLevel < 20
                          ? 'bg-red-500'
                          : formData.batteryLevel && formData.batteryLevel < 50
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      )}
                      style={{ width: `${formData.batteryLevel || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Wrench className={cn('w-5 h-5', calibrationStatus.color)} />
                <div>
                  <p className="text-sm text-gray-500">校准状态</p>
                  <p className={cn('font-medium', calibrationStatus.color)}>
                    {calibrationStatus.text}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Ruler className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">袖带尺寸</p>
                  <p className="font-medium text-gray-900">
                    {formData.cuffSize ? cuffSizeLabels[formData.cuffSize] : '未设置'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">设备信息</h3>
              <button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200',
                  isEditing
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    保存
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    编辑
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">品牌</label>
                <input
                  type="text"
                  value={formData.brand || ''}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  disabled={!isEditing}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl border transition-colors',
                    isEditing
                      ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      : 'border-gray-100 bg-gray-50'
                  )}
                  placeholder="如：欧姆龙"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">型号</label>
                <input
                  type="text"
                  value={formData.model || ''}
                  onChange={(e) => handleChange('model', e.target.value)}
                  disabled={!isEditing}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl border transition-colors',
                    isEditing
                      ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      : 'border-gray-100 bg-gray-50'
                  )}
                  placeholder="如：HEM-7136"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">袖带尺寸</label>
                <select
                  value={formData.cuffSize || ''}
                  onChange={(e) => handleChange('cuffSize', e.target.value as CuffSize)}
                  disabled={!isEditing}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl border transition-colors',
                    isEditing
                      ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      : 'border-gray-100 bg-gray-50'
                  )}
                >
                  <option value="">请选择袖带尺寸</option>
                  <option value="small">小号（22-26cm）</option>
                  <option value="medium">中号（27-31cm）</option>
                  <option value="large">大号（32-36cm）</option>
                  <option value="extra-large">特大号（37-42cm）</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">上臂周长（cm）</label>
                <input
                  type="number"
                  value={formData.armCircumference || ''}
                  onChange={(e) => handleChange('armCircumference', Number(e.target.value))}
                  disabled={!isEditing}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl border transition-colors',
                    isEditing
                      ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      : 'border-gray-100 bg-gray-50'
                  )}
                  placeholder="如：29"
                />
                <p className="text-xs text-gray-500 mt-1">用于自动判断袖带尺寸是否合适</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">电池类型</label>
                <input
                  type="text"
                  value={formData.batteryType || ''}
                  onChange={(e) => handleChange('batteryType', e.target.value)}
                  disabled={!isEditing}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl border transition-colors',
                    isEditing
                      ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      : 'border-gray-100 bg-gray-50'
                  )}
                  placeholder="如：7号电池 x 4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">当前电量（%）</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.batteryLevel || ''}
                  onChange={(e) => handleChange('batteryLevel', Number(e.target.value))}
                  disabled={!isEditing}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl border transition-colors',
                    isEditing
                      ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      : 'border-gray-100 bg-gray-50'
                  )}
                  placeholder="0-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  购买日期
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate || ''}
                  onChange={(e) => handleChange('purchaseDate', e.target.value)}
                  disabled={!isEditing}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl border transition-colors',
                    isEditing
                      ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      : 'border-gray-100 bg-gray-50'
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Wrench className="w-4 h-4 inline mr-1" />
                  上次校准日期
                </label>
                <input
                  type="date"
                  value={formData.calibrationDate || ''}
                  onChange={(e) => handleChange('calibrationDate', e.target.value)}
                  disabled={!isEditing}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl border transition-colors',
                    isEditing
                      ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      : 'border-gray-100 bg-gray-50'
                  )}
                />
                <p className="text-xs text-gray-500 mt-1">
                  校准周期：{settings.calibrationIntervalDays} 天
                  {nextCalibrationDate && `，下次校准日期：${nextCalibrationDate.toISOString().split('T')[0]}`}
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-xl">
              <h4 className="font-semibold text-blue-800 mb-2">💡 维护小贴士</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 血压计一般每 6 个月需要校准一次</li>
                <li>• 更换电池后请更新电量状态</li>
                <li>• 袖带老化或失去弹性时请及时更换</li>
                <li>• 保持设备干燥，避免受潮或摔落</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
