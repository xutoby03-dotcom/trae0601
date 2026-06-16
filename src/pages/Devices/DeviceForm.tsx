import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Camera } from 'lucide-react';
import { useDeviceStore } from '@/store/deviceStore';
import { DeviceType, Device } from '@/types';

const deviceTypes: DeviceType[] = ['干粉灭火器', '二氧化碳灭火器', '泡沫灭火器', '水基灭火器'];
const buildings = ['A栋', 'B栋', 'C栋', 'D栋'];
const floors = ['1楼', '2楼', '3楼', '4楼', '5楼', '6楼'];

export function DeviceForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getDeviceById, addDevice, updateDevice } = useDeviceStore();
  const isEdit = location.pathname.includes('/edit');

  const [formData, setFormData] = useState({
    code: '',
    building: 'A栋',
    floor: '1楼',
    location: '',
    type: '干粉灭火器' as DeviceType,
    minPressure: 1.0,
    maxPressure: 1.4,
    expireDate: '',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fire%20extinguisher%20realistic%20product%20photo&image_size=square',
    status: 'normal' as Device['status']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      const device = getDeviceById(id);
      if (device) {
        setFormData({
          code: device.code,
          building: device.building,
          floor: device.floor,
          location: device.location,
          type: device.type,
          minPressure: device.minPressure,
          maxPressure: device.maxPressure,
          expireDate: device.expireDate,
          photo: device.photo,
          status: device.status
        });
      }
    }
  }, [isEdit, id, getDeviceById]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.code.trim()) newErrors.code = '请输入设备编号';
    if (!formData.location.trim()) newErrors.location = '请输入位置描述';
    if (!formData.expireDate) newErrors.expireDate = '请选择有效期';
    if (formData.minPressure >= formData.maxPressure) {
      newErrors.minPressure = '最小压力必须小于最大压力';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit && id) {
      updateDevice(id, formData);
    } else {
      addDevice(formData);
    }
    navigate('/devices');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/devices')}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? '编辑设备' : '新增设备'}
          </h2>
          <p className="text-sm text-gray-500">
            {isEdit ? '修改设备档案信息' : '录入新的灭火器设备信息'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-900">设备照片</h3>
            <div className="relative overflow-hidden rounded-xl bg-gray-100">
              <img
                src={formData.photo}
                alt="设备照片"
                className="h-48 w-full object-cover"
              />
              <button
                type="button"
                className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white hover:bg-black/70"
              >
                <Camera className="h-3.5 w-3.5" />
                更换照片
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              支持 JPG、PNG 格式，建议尺寸 400x400
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-6 font-semibold text-gray-900">基本信息</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    设备编号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="如: XHQ-A-01-001"
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                      errors.code
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200 focus:border-red-500 focus:ring-red-500/20'
                    }`}
                  />
                  {errors.code && (
                    <p className="mt-1 text-xs text-red-500">{errors.code}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    设备类型
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    {deviceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    楼栋
                  </label>
                  <select
                    name="building"
                    value={formData.building}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    {buildings.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    楼层
                  </label>
                  <select
                    name="floor"
                    value={formData.floor}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    {floors.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    具体位置 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="如: 大堂左侧"
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                      errors.location
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200 focus:border-red-500 focus:ring-red-500/20'
                    }`}
                  />
                  {errors.location && (
                    <p className="mt-1 text-xs text-red-500">{errors.location}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    最小压力 (MPa)
                  </label>
                  <input
                    type="number"
                    name="minPressure"
                    value={formData.minPressure}
                    onChange={handleChange}
                    step="0.1"
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                      errors.minPressure
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200 focus:border-red-500 focus:ring-red-500/20'
                    }`}
                  />
                  {errors.minPressure && (
                    <p className="mt-1 text-xs text-red-500">{errors.minPressure}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    最大压力 (MPa)
                  </label>
                  <input
                    type="number"
                    name="maxPressure"
                    value={formData.maxPressure}
                    onChange={handleChange}
                    step="0.1"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    有效期至 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="expireDate"
                    value={formData.expireDate}
                    onChange={handleChange}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                      errors.expireDate
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200 focus:border-red-500 focus:ring-red-500/20'
                    }`}
                  />
                  {errors.expireDate && (
                    <p className="mt-1 text-xs text-red-500">{errors.expireDate}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    设备状态
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="normal">正常</option>
                    <option value="warning">预警</option>
                    <option value="danger">异常</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
              <button
                type="button"
                onClick={() => navigate('/devices')}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700"
              >
                <Save className="h-4 w-4" />
                {isEdit ? '保存修改' : '创建设备'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
