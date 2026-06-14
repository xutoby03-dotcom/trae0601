import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Users,
  LayoutGrid,
  User,
  Phone,
  Image,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { COLOR_OPTIONS, DEPARTMENTS } from '@/types';
import NumberInput from '@/components/NumberInput';
import { cn, formatDate } from '@/utils';

export default function RoomForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const meetingRooms = useAppStore((state) => state.meetingRooms);
  const addMeetingRoom = useAppStore((state) => state.addMeetingRoom);
  const updateMeetingRoom = useAppStore((state) => state.updateMeetingRoom);

  const existingRoom = id ? meetingRooms.find((r) => r.id === id) : undefined;

  const [formData, setFormData] = useState({
    name: '',
    capacity: 10,
    whiteboardCount: 1,
    defaultColors: ['black', 'blue', 'red', 'green'],
    minStock: 2,
    managerName: '',
    managerPhone: '',
    photo: '',
    department: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (existingRoom) {
      setFormData({
        name: existingRoom.name,
        capacity: existingRoom.capacity,
        whiteboardCount: existingRoom.whiteboardCount,
        defaultColors: existingRoom.defaultColors,
        minStock: existingRoom.minStock,
        managerName: existingRoom.managerName,
        managerPhone: existingRoom.managerPhone,
        photo: existingRoom.photo,
        department: existingRoom.department,
      });
    }
  }, [existingRoom]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入会议室名称';
    }
    if (formData.capacity <= 0) {
      newErrors.capacity = '容量必须大于0';
    }
    if (formData.whiteboardCount <= 0) {
      newErrors.whiteboardCount = '白板数量必须大于0';
    }
    if (formData.defaultColors.length === 0) {
      newErrors.defaultColors = '请至少选择一种颜色';
    }
    if (formData.minStock <= 0) {
      newErrors.minStock = '最低库存必须大于0';
    }
    if (!formData.managerName.trim()) {
      newErrors.managerName = '请输入负责人姓名';
    }
    if (!formData.managerPhone.trim()) {
      newErrors.managerPhone = '请输入负责人电话';
    }
    if (!formData.photo.trim()) {
      newErrors.photo = '请输入照片URL';
    }
    if (!formData.department) {
      newErrors.department = '请选择所属部门';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (isEdit && id) {
      updateMeetingRoom(id, formData);
    } else {
      addMeetingRoom(formData);
    }

    setShowSuccess(true);
    setTimeout(() => {
      navigate('/rooms');
    }, 1000);
  };

  const toggleColor = (color: string) => {
    setFormData((prev) => {
      if (prev.defaultColors.includes(color)) {
        return {
          ...prev,
          defaultColors: prev.defaultColors.filter((c) => c !== color),
        };
      } else {
        return {
          ...prev,
          defaultColors: [...prev.defaultColors, color],
        };
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/rooms')}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEdit ? '编辑会议室' : '新增会议室'}
          </h1>
          <p className="mt-1 text-slate-500">
            {isEdit ? '修改会议室档案信息' : '添加新的会议室档案'}
          </p>
        </div>
      </div>

      {showSuccess && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">保存成功！正在返回列表...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              会议室名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="例如：创新会议室"
              className={cn(
                'w-full px-4 py-3 rounded-xl border-2 transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-200',
                errors.name
                  ? 'border-red-300 bg-red-50 focus:border-red-400'
                  : 'border-slate-200 focus:border-blue-400'
              )}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Users className="w-4 h-4 inline mr-1 text-blue-500" />
                容纳人数 <span className="text-red-500">*</span>
              </label>
              <NumberInput
                value={formData.capacity}
                onChange={(v) => setFormData((prev) => ({ ...prev, capacity: v }))}
                min={1}
                max={100}
                warning={!!errors.capacity}
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <LayoutGrid className="w-4 h-4 inline mr-1 text-blue-500" />
                白板数量 <span className="text-red-500">*</span>
              </label>
              <NumberInput
                value={formData.whiteboardCount}
                onChange={(v) => setFormData((prev) => ({ ...prev, whiteboardCount: v }))}
                min={1}
                max={10}
                warning={!!errors.whiteboardCount}
              />
              {errors.whiteboardCount && (
                <p className="mt-1 text-sm text-red-600">{errors.whiteboardCount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                最低库存 <span className="text-red-500">*</span>
              </label>
              <NumberInput
                value={formData.minStock}
                onChange={(v) => setFormData((prev) => ({ ...prev, minStock: v }))}
                min={1}
                max={10}
                warning={!!errors.minStock}
              />
              <p className="mt-1 text-xs text-slate-500">每种颜色笔的最低库存</p>
              {errors.minStock && (
                <p className="mt-1 text-sm text-red-600">{errors.minStock}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              默认配色 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {COLOR_OPTIONS.map((option) => {
                const isSelected = formData.defaultColors.includes(option.color);
                return (
                  <button
                    key={option.color}
                    type="button"
                    onClick={() => toggleColor(option.color)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-200',
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: option.hex }}
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {option.colorName}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
            {errors.defaultColors && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.defaultColors}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              所属部门 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
              className={cn(
                'w-full px-4 py-3 rounded-xl border-2 transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-200',
                errors.department
                  ? 'border-red-300 bg-red-50 focus:border-red-400'
                  : 'border-slate-200 focus:border-blue-400'
              )}
            >
              <option value="">请选择部门</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
              <option value="管理层">管理层</option>
            </select>
            {errors.department && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.department}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <User className="w-4 h-4 inline mr-1 text-slate-400" />
                负责人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.managerName}
                onChange={(e) => setFormData((prev) => ({ ...prev, managerName: e.target.value }))}
                placeholder="负责人姓名"
                className={cn(
                  'w-full px-4 py-3 rounded-xl border-2 transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-200',
                  errors.managerName
                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                    : 'border-slate-200 focus:border-blue-400'
                )}
              />
              {errors.managerName && (
                <p className="mt-1 text-sm text-red-600">{errors.managerName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1 text-slate-400" />
                联系电话 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.managerPhone}
                onChange={(e) => setFormData((prev) => ({ ...prev, managerPhone: e.target.value }))}
                placeholder="联系电话"
                className={cn(
                  'w-full px-4 py-3 rounded-xl border-2 transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-200',
                  errors.managerPhone
                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                    : 'border-slate-200 focus:border-blue-400'
                )}
              />
              {errors.managerPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.managerPhone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Image className="w-4 h-4 inline mr-1 text-slate-400" />
              照片URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.photo}
              onChange={(e) => setFormData((prev) => ({ ...prev, photo: e.target.value }))}
              placeholder="https://example.com/photo.jpg"
              className={cn(
                'w-full px-4 py-3 rounded-xl border-2 transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-200',
                errors.photo
                  ? 'border-red-300 bg-red-50 focus:border-red-400'
                  : 'border-slate-200 focus:border-blue-400'
              )}
            />
            {errors.photo && (
              <p className="mt-1 text-sm text-red-600">{errors.photo}</p>
            )}
            {formData.photo && (
              <div className="mt-3">
                <img
                  src={formData.photo}
                  alt="预览"
                  className="w-full h-48 object-cover rounded-xl border-2 border-slate-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/rooms')}
            className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            保存
          </button>
        </div>
      </form>
    </div>
  );
}
