import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Droplets, User, Tag, AlertCircle, Calendar, Package, Info } from 'lucide-react';
import useAppStore from '@/store/useAppStore';
import PhotoUpload from '@/components/PhotoUpload';
import ProcessIcon from '@/components/ProcessIcon';
import {
  ClothingCategory,
  ProblemType,
  ProcessType,
  Priority,
  CATEGORY_LABELS,
  PROBLEM_LABELS,
  PROCESS_LABELS,
  PRIORITY_LABELS,
  PROBLEM_TO_PROCESS,
} from '@/types';
import { addDays } from 'date-fns';

const ClothingRegister = () => {
  const navigate = useNavigate();
  const { addClothing, materials } = useAppStore();

  const [formData, setFormData] = useState({
    owner: '',
    category: 'pants' as ClothingCategory,
    problemType: 'button' as ProblemType,
    processType: 'sew_button' as ProcessType,
    priority: 'normal' as Priority,
    washBefore: false,
    deadline: addDays(new Date(), 7).toISOString().split('T')[0],
    materialsNeeded: [] as string[],
    notes: '',
  });

  const [photoBefore, setPhotoBefore] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const suggestedProcess = PROBLEM_TO_PROCESS[formData.problemType];
    if (suggestedProcess) {
      setFormData((prev) => ({ ...prev, processType: suggestedProcess }));
    }
  }, [formData.problemType]);

  useEffect(() => {
    const suggestedMaterials = materials.filter((m) => {
      if (formData.processType === 'sew_button') {
        return m.type === 'thread' || m.type === 'button';
      }
      if (formData.processType === 'patch_hole') {
        return m.type === 'thread' || m.type === 'fabric';
      }
      if (formData.processType === 'alter_length') {
        return m.type === 'thread';
      }
      if (formData.processType === 'replace_zipper') {
        return m.type === 'zipper' || m.type === 'thread';
      }
      return false;
    });
    setFormData((prev) => ({
      ...prev,
      materialsNeeded: suggestedMaterials.slice(0, 2).map((m) => m.id),
    }));
  }, [formData.processType, materials]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.owner.trim()) {
      newErrors.owner = '请填写衣物所有人';
    }
    if (!formData.deadline) {
      newErrors.deadline = '请选择截止日期';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addClothing({
      ...formData,
      photoBefore,
    });

    navigate('/queue');
  };

  const handleMaterialToggle = (materialId: string) => {
    setFormData((prev) => ({
      ...prev,
      materialsNeeded: prev.materialsNeeded.includes(materialId)
        ? prev.materialsNeeded.filter((id) => id !== materialId)
        : [...prev.materialsNeeded, materialId],
    }));
  };

  const categories = Object.entries(CATEGORY_LABELS) as [ClothingCategory, string][];
  const problemTypes = Object.entries(PROBLEM_LABELS) as [ProblemType, string][];
  const processTypes = Object.entries(PROCESS_LABELS) as [ProcessType, string][];
  const priorities = Object.entries(PRIORITY_LABELS) as [Priority, string][];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6 stagger-item">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-brown-100 flex items-center justify-center hover:bg-brown-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-brown-700" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-brown-900">
            📝 登记新衣物
          </h1>
          <p className="text-brown-500 text-sm">填写衣物信息，加入缝补队列</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-no-hover p-6 stagger-item animate-delay-100">
          <h2 className="font-display font-semibold text-lg text-brown-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-500" />
            基本信息
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label flex items-center gap-1">
                所有人 <span className="text-warning-500">*</span>
              </label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="如：小明、妈妈、爸爸"
                className={`input-field ${errors.owner ? 'border-warning-400' : ''}`}
              />
              {errors.owner && (
                <p className="mt-1 text-sm text-warning-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.owner}
                </p>
              )}
            </div>

            <div>
              <label className="form-label">衣物类别</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as ClothingCategory })
                }
                className="input-field"
              >
                {categories.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="form-label">问题类型</label>
              <select
                value={formData.problemType}
                onChange={(e) =>
                  setFormData({ ...formData, problemType: e.target.value as ProblemType })
                }
                className="input-field"
              >
                {problemTypes.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">工序类型</label>
              <select
                value={formData.processType}
                onChange={(e) =>
                  setFormData({ ...formData, processType: e.target.value as ProcessType })
                }
                className="input-field"
              >
                {processTypes.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card-no-hover p-6 stagger-item animate-delay-200">
          <h2 className="font-display font-semibold text-lg text-brown-900 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary-500" />
            优先级与时间
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">优先级</label>
              <div className="grid grid-cols-3 gap-2">
                {priorities.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: value })}
                    className={`py-3 px-4 rounded-xl font-medium transition-all ${
                      formData.priority === value
                        ? value === 'urgent'
                          ? 'bg-warning-500 text-white'
                          : value === 'normal'
                          ? 'bg-primary-500 text-white'
                          : 'bg-brown-500 text-white'
                        : 'bg-brown-100 text-brown-600 hover:bg-brown-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label flex items-center gap-1">
                截止日期 <span className="text-warning-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-400" />
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className={`input-field pl-10 ${errors.deadline ? 'border-warning-400' : ''}`}
                />
              </div>
              {errors.deadline && (
                <p className="mt-1 text-sm text-warning-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.deadline}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center justify-between p-4 rounded-xl bg-brown-50 cursor-pointer hover:bg-brown-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-brown-800">洗后再改</p>
                  <p className="text-sm text-brown-500">需要先清洗再进行缝补</p>
                </div>
              </div>
              <div
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  formData.washBefore ? 'bg-primary-500' : 'bg-brown-300'
                }`}
                onClick={() => setFormData({ ...formData, washBefore: !formData.washBefore })}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    formData.washBefore ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </div>
            </label>
          </div>
        </div>

        <div className="card-no-hover p-6 stagger-item animate-delay-300">
          <h2 className="font-display font-semibold text-lg text-brown-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-500" />
            所需材料
          </h2>

          <p className="text-sm text-brown-500 mb-4 flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            根据工序自动推荐，可手动调整。开始处理时会自动扣减库存。
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {materials.map((material) => {
              const isSelected = formData.materialsNeeded.includes(material.id);
              const isLowStock = material.quantity < material.threshold;
              return (
                <button
                  key={material.id}
                  type="button"
                  onClick={() => handleMaterialToggle(material.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-brown-200 hover:border-brown-300'
                  }`}
                >
                  <p className="font-medium text-brown-800 text-sm">{material.name}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isLowStock ? 'text-warning-600' : 'text-brown-500'
                    }`}
                  >
                    库存 {material.quantity} {material.unit}
                    {isLowStock && ' ⚠️'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card-no-hover p-6 stagger-item animate-delay-400">
          <h2 className="font-display font-semibold text-lg text-brown-900 mb-4">
            📷 衣物照片
          </h2>
          <PhotoUpload value={photoBefore} onChange={setPhotoBefore} />
        </div>

        <div className="card-no-hover p-6 stagger-item animate-delay-500">
          <h2 className="font-display font-semibold text-lg text-brown-900 mb-4">
            📝 备注
          </h2>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="填写详细说明，如：裤脚需要改短3厘米、换同款纽扣等"
            rows={4}
            className="input-field resize-none"
          />
        </div>

        <div className="sticky bottom-20 md:bottom-0 bg-cream/80 backdrop-blur-md py-4 -mx-4 px-4 stagger-item animate-delay-500">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary flex-1"
            >
              取消
            </button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              保存登记
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ClothingRegister;
