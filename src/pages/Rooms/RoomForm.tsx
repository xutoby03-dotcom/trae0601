import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
import type { Room } from '@/types';

const RoomForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRoom, addRoom, updateRoom } = useRoomStore();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: 1,
    heaterModel: '',
    capacityLiters: 60,
    heaterType: 'electric' as 'gas' | 'electric',
    installDate: new Date().toISOString().split('T')[0],
    lastMaintenanceDate: new Date().toISOString().split('T')[0],
    photoUrl: '',
    status: 'active' as Room['status'],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && id) {
      const room = getRoom(id);
      if (room) {
        setFormData({
          roomNumber: room.roomNumber,
          floor: room.floor,
          heaterModel: room.heaterModel,
          capacityLiters: room.capacityLiters,
          heaterType: room.heaterType,
          installDate: room.installDate,
          lastMaintenanceDate: room.lastMaintenanceDate,
          photoUrl: room.photoUrl,
          status: room.status,
        });
      }
    }
  }, [isEditing, id, getRoom]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = '请输入房间号';
    }
    if (!formData.heaterModel.trim()) {
      newErrors.heaterModel = '请输入热水器型号';
    }
    if (formData.capacityLiters <= 0) {
      newErrors.capacityLiters = '容量必须大于0';
    }
    if (!formData.installDate) {
      newErrors.installDate = '请选择安装日期';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && id) {
      updateRoom(id, formData);
    } else {
      addRoom(formData);
    }
    navigate('/rooms');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/rooms')}
          className="w-10 h-10 rounded-xl bg-dark-800/50 flex items-center justify-center text-dark-400 hover:bg-dark-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? '编辑房间档案' : '新增房间档案'}
          </h1>
          <p className="text-dark-400">
            {isEditing ? '更新热水器设备信息' : '添加新的热水器设备档案'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">基本信息</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                房间号 *
              </label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                placeholder="如 101"
                className={`w-full px-4 py-2.5 bg-dark-800/50 border rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-warning-500/20 transition-all ${
                  errors.roomNumber
                    ? 'border-danger-500/50 focus:border-danger-500'
                    : 'border-dark-700 focus:border-warning-500/50'
                }`}
              />
              {errors.roomNumber && (
                <p className="text-danger-400 text-sm mt-1">{errors.roomNumber}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                楼层
              </label>
              <input
                type="number"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                热水器型号 *
              </label>
              <input
                type="text"
                name="heaterModel"
                value={formData.heaterModel}
                onChange={handleChange}
                placeholder="如 美的 F60-21WB1"
                className={`w-full px-4 py-2.5 bg-dark-800/50 border rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-warning-500/20 transition-all ${
                  errors.heaterModel
                    ? 'border-danger-500/50 focus:border-danger-500'
                    : 'border-dark-700 focus:border-warning-500/50'
                }`}
              />
              {errors.heaterModel && (
                <p className="text-danger-400 text-sm mt-1">{errors.heaterModel}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                容量 (升)
              </label>
              <input
                type="number"
                name="capacityLiters"
                value={formData.capacityLiters}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              热水器类型
            </label>
            <div className="flex gap-4">
              {[
                { value: 'electric', label: '电热水器' },
                { value: 'gas', label: '燃气热水器' },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="heaterType"
                    value={option.value}
                    checked={formData.heaterType === option.value}
                    onChange={handleChange}
                    className="w-4 h-4 text-warning-500 bg-dark-700 border-dark-600 focus:ring-warning-500"
                  />
                  <span className="text-dark-200">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                安装日期 *
              </label>
              <input
                type="date"
                name="installDate"
                value={formData.installDate}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-dark-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-warning-500/20 transition-all ${
                  errors.installDate
                    ? 'border-danger-500/50 focus:border-danger-500'
                    : 'border-dark-700 focus:border-warning-500/50'
                }`}
              />
              {errors.installDate && (
                <p className="text-danger-400 text-sm mt-1">{errors.installDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                最近保养日期
              </label>
              <input
                type="date"
                name="lastMaintenanceDate"
                value={formData.lastMaintenanceDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20 transition-all"
              />
            </div>
          </div>

          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                房间状态
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20 transition-all"
              >
                <option value="active">正常营业</option>
                <option value="maintenance">维修中</option>
                <option value="disabled">已停用</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              设备照片 URL
            </label>
            <input
              type="text"
              name="photoUrl"
              value={formData.photoUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20 transition-all"
            />
            <p className="text-dark-500 text-xs mt-1">
              输入图片链接用于展示设备照片
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            to="/rooms"
            className="px-5 py-2.5 bg-dark-800 text-white rounded-xl font-medium hover:bg-dark-700 transition-colors"
          >
            取消
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-warning-500 text-white rounded-xl font-medium hover:bg-warning-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isEditing ? '保存修改' : '创建档案'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomForm;
