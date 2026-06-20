import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  User,
  Clock,
  Wrench,
} from 'lucide-react';
import { useAppStore } from '@/store/useStore';
import type { RepairMaterial } from '@/types';

export default function RepairForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { classrooms, addRepair } = useAppStore();

  const preselectedClassroomId =
    (location.state as { classroomId?: string })?.classroomId || '';

  const [classroomId, setClassroomId] = useState(preselectedClassroomId);
  const [description, setDescription] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [materials, setMaterials] = useState<RepairMaterial[]>([
    { name: '', quantity: 1, unit: '个' },
  ]);
  const [closeStartTime, setCloseStartTime] = useState('');
  const [closeEndTime, setCloseEndTime] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!classroomId) newErrors.classroomId = '请选择教室';
    if (!description.trim()) newErrors.description = '请输入维修描述';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const cleanedMaterials = materials.filter((m) => m.name.trim() !== '');

    addRepair({
      classroomId,
      classroomName: classrooms.find((c) => c.id === classroomId)?.name,
      workerName,
      materials: cleanedMaterials,
      closeStartTime: closeStartTime
        ? new Date(closeStartTime).toISOString()
        : undefined,
      closeEndTime: closeEndTime
        ? new Date(closeEndTime).toISOString()
        : undefined,
      description,
    });

    navigate('/repairs');
  };

  const addMaterial = () => {
    setMaterials([...materials, { name: '', quantity: 1, unit: '个' }]);
  };

  const removeMaterial = (index: number) => {
    const newMaterials = materials.filter((_, i) => i !== index);
    setMaterials(
      newMaterials.length > 0
        ? newMaterials
        : [{ name: '', quantity: 1, unit: '个' }]
    );
  };

  const updateMaterial = (
    index: number,
    field: keyof RepairMaterial,
    value: string | number
  ) => {
    const newMaterials = [...materials];
    newMaterials[index] = { ...newMaterials[index], [field]: value };
    setMaterials(newMaterials);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">返回</span>
      </button>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 rounded-xl">
              <Wrench className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">创建维修工单</h1>
              <p className="text-sm text-slate-500 mt-1">
                填写维修信息并提交工单
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
              基本信息
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                维修教室 <span className="text-rose-500">*</span>
              </label>
              <select
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${
                  errors.classroomId
                    ? 'border-rose-300 focus:border-rose-500'
                    : 'border-slate-200 focus:border-teal-500'
                }`}
              >
                <option value="">请选择教室</option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name} ({classroom.floor}楼)
                  </option>
                ))}
              </select>
              {errors.classroomId && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.classroomId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                维修描述 <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请简述维修内容和原因..."
                rows={3}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all resize-none ${
                  errors.description
                    ? 'border-rose-300 focus:border-rose-500'
                    : 'border-slate-200 focus:border-teal-500'
                }`}
              />
              {errors.description && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Worker info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
              施工信息
            </h3>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-50 rounded-xl flex-shrink-0">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  施工人
                </label>
                <input
                  type="text"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  placeholder="请输入施工人姓名（选填）"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Materials */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
              材料清单
            </h3>

            <div className="space-y-2">
              {materials.map((material, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={material.name}
                    onChange={(e) =>
                      updateMaterial(index, 'name', e.target.value)
                    }
                    placeholder="材料名称"
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                  <input
                    type="number"
                    min="1"
                    value={material.quantity}
                    onChange={(e) =>
                      updateMaterial(index, 'quantity', Number(e.target.value))
                    }
                    className="w-20 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                  <input
                    type="text"
                    value={material.unit}
                    onChange={(e) =>
                      updateMaterial(index, 'unit', e.target.value)
                    }
                    placeholder="单位"
                    className="w-20 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                  {materials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMaterial(index)}
                      className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addMaterial}
                className="text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                添加材料
              </button>
            </div>
          </div>

          {/* Close time */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
              封闭时间
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  封闭开始时间
                </label>
                <input
                  type="datetime-local"
                  value={closeStartTime}
                  onChange={(e) => setCloseStartTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  预计完成时间
                </label>
                <input
                  type="datetime-local"
                  value={closeEndTime}
                  onChange={(e) => setCloseEndTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              创建工单
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
