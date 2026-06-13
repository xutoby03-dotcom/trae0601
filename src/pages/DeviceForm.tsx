import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import { useAppStore } from '../store';
import { DeviceStatus } from '../types';

const interfaceOptions = [
  'Type-C',
  'USB-A',
  'Micro USB',
  'Lightning',
  'Type-C + USB-A',
  'Type-C + USB-A + Lightning',
  'USB-A + Micro USB',
];

const accessoryOptions = ['充电线', '充电头', '收纳袋', '说明书'];

const cabinetOptions = ['A柜-01', 'A柜-02', 'A柜-03', 'B柜-01', 'B柜-02', 'B柜-03', 'C柜-01'];

export const DeviceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id !== 'new';

  const devices = useAppStore((state) => state.devices);
  const addDevice = useAppStore((state) => state.addDevice);
  const updateDevice = useAppStore((state) => state.updateDevice);

  const existingDevice = isEdit ? devices.find((d) => d.id === id) : null;

  const [formData, setFormData] = useState({
    deviceNumber: '',
    capacity: 10000,
    interfaceType: '',
    currentBattery: 100,
    accessories: [] as string[],
    storageCabinet: '',
    photoUrl: '',
    status: 'available' as DeviceStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newAccessory, setNewAccessory] = useState('');

  useEffect(() => {
    if (existingDevice) {
      setFormData({
        deviceNumber: existingDevice.deviceNumber,
        capacity: existingDevice.capacity,
        interfaceType: existingDevice.interfaceType,
        currentBattery: existingDevice.currentBattery,
        accessories: [...existingDevice.accessories],
        storageCabinet: existingDevice.storageCabinet,
        photoUrl: existingDevice.photoUrl,
        status: existingDevice.status,
      });
    }
  }, [existingDevice]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.deviceNumber.trim()) {
      newErrors.deviceNumber = '请输入设备编号';
    }

    if (!formData.interfaceType) {
      newErrors.interfaceType = '请选择接口类型';
    }

    if (!formData.storageCabinet) {
      newErrors.storageCabinet = '请选择存放柜';
    }

    if (formData.accessories.length === 0) {
      newErrors.accessories = '请至少添加一个配件';
    }

    if (!formData.photoUrl.trim()) {
      newErrors.photoUrl = '请上传设备照片';
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

  const handleAccessoryToggle = (accessory: string) => {
    setFormData((prev) => ({
      ...prev,
      accessories: prev.accessories.includes(accessory)
        ? prev.accessories.filter((a) => a !== accessory)
        : [...prev.accessories, accessory],
    }));
  };

  const handleAddCustomAccessory = () => {
    if (newAccessory.trim() && !formData.accessories.includes(newAccessory.trim())) {
      setFormData((prev) => ({
        ...prev,
        accessories: [...prev.accessories, newAccessory.trim()],
      }));
      setNewAccessory('');
    }
  };

  const handleRemoveAccessory = (accessory: string) => {
    setFormData((prev) => ({
      ...prev,
      accessories: prev.accessories.filter((a) => a !== accessory),
    }));
  };

  const generatePhotoUrl = () => {
    const prompts = [
      'white portable power bank product photo on white background',
      'slim black power bank product photo minimalist',
      'high capacity power bank with digital display product photo',
      'compact portable charger power bank blue color product photo',
      'minimalist white power bank slim design product photo',
    ];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    const encodedPrompt = encodeURIComponent(randomPrompt);
    const url = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodedPrompt}&image_size=square`;
    setFormData((prev) => ({ ...prev, photoUrl: url }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/devices"
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {isEdit ? '编辑设备' : '新增设备'}
          </h1>
          <p className="text-gray-500">
            {isEdit ? '修改充电宝设备信息' : '录入新的充电宝设备档案'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">基本信息</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                设备编号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.deviceNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, deviceNumber: e.target.value }))}
                placeholder="如：PB-001"
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                  errors.deviceNumber ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.deviceNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.deviceNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                容量 (mAh) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.capacity}
                onChange={(e) => setFormData((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white"
              >
                <option value={5000}>5000 mAh</option>
                <option value={10000}>10000 mAh</option>
                <option value={20000}>20000 mAh</option>
                <option value={30000}>30000 mAh</option>
                <option value={40000}>40000 mAh</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                接口类型 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.interfaceType}
                onChange={(e) => setFormData((prev) => ({ ...prev, interfaceType: e.target.value }))}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white ${
                  errors.interfaceType ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">请选择接口类型</option>
                {interfaceOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.interfaceType && (
                <p className="mt-1 text-sm text-red-500">{errors.interfaceType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                当前电量 (%) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.currentBattery}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currentBattery: Number(e.target.value) }))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="w-16 text-center font-medium text-gray-900">
                  {formData.currentBattery}%
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                存放柜 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.storageCabinet}
                onChange={(e) => setFormData((prev) => ({ ...prev, storageCabinet: e.target.value }))}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white ${
                  errors.storageCabinet ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">请选择存放柜</option>
                {cabinetOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.storageCabinet && (
                <p className="mt-1 text-sm text-red-500">{errors.storageCabinet}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                设备状态
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as DeviceStatus }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white"
              >
                <option value="available">可借</option>
                <option value="lent">借出中</option>
                <option value="maintenance">维护中</option>
                <option value="low_battery">低电量待充</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">配件清单</h3>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {accessoryOptions.map((acc) => (
                <button
                  key={acc}
                  type="button"
                  onClick={() => handleAccessoryToggle(acc)}
                  className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 ${
                    formData.accessories.includes(acc)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {acc}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={newAccessory}
                onChange={(e) => setNewAccessory(e.target.value)}
                placeholder="输入自定义配件名称"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomAccessory())}
              />
              <button
                type="button"
                onClick={handleAddCustomAccessory}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">已选配件：</p>
              <div className="flex flex-wrap gap-2">
                {formData.accessories.length === 0 ? (
                  <p className="text-gray-400 text-sm">请选择配件</p>
                ) : (
                  formData.accessories.map((acc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm"
                    >
                      {acc}
                      <button
                        type="button"
                        onClick={() => handleRemoveAccessory(acc)}
                        className="p-0.5 hover:bg-blue-100 rounded transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
              {errors.accessories && (
                <p className="mt-2 text-sm text-red-500">{errors.accessories}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">设备照片</h3>

          <div className="flex gap-6">
            <div className="w-48 h-48 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
              {formData.photoUrl ? (
                <img
                  src={formData.photoUrl}
                  alt="设备照片"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <Upload className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">暂无照片</p>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  照片链接
                </label>
                <input
                  type="text"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, photoUrl: e.target.value }))}
                  placeholder="输入照片URL"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                    errors.photoUrl ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.photoUrl && (
                  <p className="mt-1 text-sm text-red-500">{errors.photoUrl}</p>
                )}
              </div>

              <button
                type="button"
                onClick={generatePhotoUrl}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors duration-200"
              >
                <Upload className="w-4 h-4" />
                自动生成照片
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <Link
            to="/devices"
            className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 font-medium"
          >
            取消
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-200 font-medium shadow-lg shadow-blue-600/20"
          >
            {isEdit ? '保存修改' : '创建设备'}
          </button>
        </div>
      </form>
    </div>
  );
};
