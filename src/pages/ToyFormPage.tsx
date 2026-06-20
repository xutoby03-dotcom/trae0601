import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, Calendar, Package, Plus, Edit } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  MATERIAL_OPTIONS,
  CLEAN_METHOD_OPTIONS,
  AGE_RANGE_OPTIONS,
  STORAGE_SUGGESTIONS,
  todayISO,
  formatDate,
} from '@/utils/constants';
import type { MaterialType, CleanMethodType } from '@/types';
import { cn } from '@/lib/utils';

interface FormData {
  name: string;
  material: MaterialType | '';
  ageRange: string;
  cleanMethod: CleanMethodType | '';
  lastCleanDate: string;
  purchaseDate: string;
  storageLocation: string;
  photo: string | null;
}

const initialFormData: FormData = {
  name: '',
  material: '',
  ageRange: '',
  cleanMethod: '',
  lastCleanDate: '',
  purchaseDate: formatDate(todayISO()),
  storageLocation: '',
  photo: null,
};

export default function ToyFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const addToy = useAppStore((s) => s.addToy);
  const updateToy = useAppStore((s) => s.updateToy);
  const getToyById = useAppStore((s) => s.getToyById);
  const addCleaningRecord = useAppStore((s) => s.addCleaningRecord);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit && id) {
      const toy = getToyById(id);
      if (toy) {
        setFormData({
          name: toy.name,
          material: toy.material,
          ageRange: toy.ageRange,
          cleanMethod: toy.cleanMethod,
          lastCleanDate: '',
          purchaseDate: formatDate(toy.purchaseDate),
          storageLocation: toy.storageLocation,
          photo: toy.photo,
        });
      }
    }
  }, [isEdit, id, getToyById]);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入玩具名称';
    if (!formData.material) newErrors.material = '请选择材质';
    if (!formData.ageRange) newErrors.ageRange = '请选择适用年龄';
    if (!formData.cleanMethod) newErrors.cleanMethod = '请选择清洁方式';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      updateField('photo', event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      updateField('photo', event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const baseData = {
      name: formData.name.trim(),
      material: formData.material as MaterialType,
      ageRange: formData.ageRange,
      cleanMethod: formData.cleanMethod as CleanMethodType,
      purchaseDate: new Date(formData.purchaseDate).toISOString(),
      storageLocation: formData.storageLocation.trim() || '未指定位置',
      photo: formData.photo,
    };

    if (isEdit && id) {
      updateToy(id, baseData);
      if (formData.lastCleanDate) {
        const existing = useAppStore.getState().getRecordsByToyId(id);
        const hasSameDate = existing.some((r) => r.date.startsWith(formData.lastCleanDate));
        if (!hasSameDate) {
          addCleaningRecord({
            toyId: id,
            date: new Date(formData.lastCleanDate).toISOString(),
            methods: [],
            hasDamage: false,
            hasOdor: false,
          });
        }
      }
    } else {
      addToy(baseData);
    }

    navigate('/toys');
  };

  const handleCancel = () => {
    navigate('/toys');
  };

  const toy = id ? getToyById(id) : undefined;

  return (
    <div className="space-y-6">
      <div className="card-base p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/toys"
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint-300 to-clean-300 flex items-center justify-center">
              {isEdit ? (
                <Edit className="w-6 h-6 text-white" />
              ) : (
                <Plus className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {isEdit ? '编辑玩具信息' : '新增玩具档案'}
              </h1>
              <p className="text-sm text-gray-500">
                {isEdit
                  ? `编辑玩具信息${toy?.name ? `：${toy.name}` : ''}`
                  : '录入玩具基础信息，帮助建立完整的清洁档案'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-base p-5 md:p-6 !shadow-none !border !border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-baby-300 to-baby-400" />
              基本信息
            </h2>
            <div className="space-y-5">
              <div>
                <label className="label-base">
                  玩具名称 <span className="text-alert-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="例如：硅胶咬咬乐牙胶"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={cn('input-base', errors.name && 'border-alert-300 focus:border-alert-300 focus:ring-alert-100')}
                />
                {errors.name && <p className="mt-1 text-sm text-alert-400">{errors.name}</p>}
              </div>

              <div>
                <label className="label-base">
                  材质 <span className="text-alert-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {MATERIAL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateField('material', opt.value)}
                      className={cn('chip-select text-sm', formData.material === opt.value && 'active')}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
                {errors.material && <p className="mt-2 text-sm text-alert-400">{errors.material}</p>}
              </div>

              <div>
                <label className="label-base">
                  适用年龄 <span className="text-alert-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {AGE_RANGE_OPTIONS.map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => updateField('ageRange', age)}
                      className={cn('chip-select text-sm', formData.ageRange === age && 'active')}
                    >
                      👶 {age}
                    </button>
                  ))}
                </div>
                {errors.ageRange && <p className="mt-2 text-sm text-alert-400">{errors.ageRange}</p>}
              </div>
            </div>
          </div>

          <div className="card-base p-5 md:p-6 !shadow-none !border !border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-mint-300 to-mint-400" />
              清洁信息
            </h2>
            <div className="space-y-5">
              <div>
                <label className="label-base">
                  清洁方式 <span className="text-alert-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CLEAN_METHOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateField('cleanMethod', opt.value)}
                      className={cn(
                        'chip-select flex-col items-start text-left h-auto py-3 px-4',
                        formData.cleanMethod === opt.value && 'active',
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{opt.icon}</span>
                        <span className="font-semibold">{opt.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed pl-7">{opt.desc}</p>
                    </button>
                  ))}
                </div>
                {errors.cleanMethod && <p className="mt-2 text-sm text-alert-400">{errors.cleanMethod}</p>}
              </div>

              {isEdit && (
                <div>
                  <label className="label-base">上次清洁日期（可选）</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.lastCleanDate}
                      onChange={(e) => updateField('lastCleanDate', e.target.value)}
                      className="input-base pl-12"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">填写后会自动补充一条清洁记录（不会覆盖已有记录）</p>
                </div>
              )}
            </div>
          </div>

          <div className="card-base p-5 md:p-6 !shadow-none !border !border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-clean-300 to-clean-400" />
              档案信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label-base">购买日期</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => updateField('purchaseDate', e.target.value)}
                    className="input-base pl-12"
                  />
                </div>
              </div>

              <div>
                <label className="label-base">收纳位置</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="例如：客厅收纳箱A"
                    value={formData.storageLocation}
                    onChange={(e) => updateField('storageLocation', e.target.value)}
                    className="input-base pl-12"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <span className="text-xs text-gray-400 self-center mr-1">快速填充：</span>
                  {STORAGE_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => updateField('storageLocation', sug)}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                        formData.storageLocation === sug
                          ? 'bg-baby-200 text-baby-500'
                          : 'bg-gray-100 text-gray-500 hover:bg-baby-100 hover:text-baby-400',
                      )}
                    >
                      📦 {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card-base p-5 md:p-6 !shadow-none !border !border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-woody-300 to-woody-400" />
              玩具照片
            </h2>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer',
                formData.photo
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-gray-300 bg-gray-50/50 hover:border-baby-300 hover:bg-baby-50/50',
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              {formData.photo ? (
                <div className="relative">
                  <img
                    src={formData.photo}
                    alt="预览"
                    className="max-h-64 mx-auto rounded-xl shadow-soft object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateField('photo', null);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-alert-100 text-alert-400 hover:bg-alert-200 transition-colors shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="mt-3 text-center text-sm text-gray-500">点击可更换图片</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-baby-100 flex items-center justify-center">
                    <Upload className="w-7 h-7 text-baby-400" />
                  </div>
                  <p className="font-medium text-gray-700 mb-1">拖拽图片到此处，或点击选择</p>
                  <p className="text-sm text-gray-400">支持 JPG、PNG 格式，大小不超过 2MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button onClick={handleCancel} className="btn-ghost w-full sm:w-auto order-2 sm:order-1">
              取消
            </button>
            <button onClick={handleSubmit} className="btn-primary w-full sm:w-auto order-1 sm:order-2">
              💾 {isEdit ? '保存修改' : '创建档案'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
