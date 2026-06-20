import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { useAppStore } from '@/store/useStore';
import { getTodayString } from '@/utils/dateUtils';

export default function ClassroomForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getClassroomById, addClassroom, updateClassroom } = useAppStore();
  
  const isEdit = !!id;
  const existingClassroom = isEdit ? getClassroomById(id) : null;

  const [formData, setFormData] = useState({
    name: '',
    floor: 1,
    area: 100,
    floorBrand: '',
    installDate: getTodayString(),
    clubs: [''] as string[],
    photos: [''] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingClassroom) {
      setFormData({
        name: existingClassroom.name,
        floor: existingClassroom.floor,
        area: existingClassroom.area,
        floorBrand: existingClassroom.floorBrand,
        installDate: existingClassroom.installDate,
        clubs: existingClassroom.clubs.length > 0 ? existingClassroom.clubs : [''],
        photos: existingClassroom.photos.length > 0 ? existingClassroom.photos : [''],
      });
    }
  }, [existingClassroom]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入教室名称';
    if (formData.floor < 1) newErrors.floor = '请输入有效楼层';
    if (formData.area < 1) newErrors.area = '请输入有效面积';
    if (!formData.floorBrand.trim()) newErrors.floorBrand = '请输入地胶品牌';
    if (!formData.installDate) newErrors.installDate = '请选择安装日期';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const cleanedData = {
      ...formData,
      clubs: formData.clubs.filter((c) => c.trim() !== ''),
      photos: formData.photos.filter((p) => p.trim() !== ''),
    };

    if (isEdit && existingClassroom) {
      updateClassroom(id, cleanedData);
    } else {
      addClassroom(cleanedData);
    }
    navigate('/classrooms');
  };

  const addClub = () => {
    setFormData({ ...formData, clubs: [...formData.clubs, ''] });
  };

  const removeClub = (index: number) => {
    const newClubs = formData.clubs.filter((_, i) => i !== index);
    setFormData({ ...formData, clubs: newClubs.length > 0 ? newClubs : [''] });
  };

  const updateClub = (index: number, value: string) => {
    const newClubs = [...formData.clubs];
    newClubs[index] = value;
    setFormData({ ...formData, clubs: newClubs });
  };

  const addPhoto = () => {
    setFormData({ ...formData, photos: [...formData.photos, ''] });
  };

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: newPhotos.length > 0 ? newPhotos : [''] });
  };

  const updatePhoto = (index: number, value: string) => {
    const newPhotos = [...formData.photos];
    newPhotos[index] = value;
    setFormData({ ...formData, photos: newPhotos });
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
          <h1 className="text-xl font-bold text-slate-800">
            {isEdit ? '编辑教室档案' : '新增教室档案'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            填写教室基本信息和地胶档案
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
              基本信息
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  教室名称 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：舞蹈教室 101"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${
                    errors.name
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 focus:border-teal-500'
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-rose-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  楼层 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${
                    errors.floor
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 focus:border-teal-500'
                  }`}
                />
                {errors.floor && (
                  <p className="text-xs text-rose-500 mt-1">{errors.floor}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  面积 (㎡) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${
                    errors.area
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 focus:border-teal-500'
                  }`}
                />
                {errors.area && (
                  <p className="text-xs text-rose-500 mt-1">{errors.area}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  安装日期 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.installDate}
                  onChange={(e) => setFormData({ ...formData, installDate: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${
                    errors.installDate
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 focus:border-teal-500'
                  }`}
                />
                {errors.installDate && (
                  <p className="text-xs text-rose-500 mt-1">{errors.installDate}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                地胶品牌 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.floorBrand}
                onChange={(e) => setFormData({ ...formData, floorBrand: e.target.value })}
                placeholder="例如：Harlequin 专业舞台地胶"
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${
                  errors.floorBrand
                    ? 'border-rose-300 focus:border-rose-500'
                    : 'border-slate-200 focus:border-teal-500'
                }`}
              />
              {errors.floorBrand && (
                <p className="text-xs text-rose-500 mt-1">{errors.floorBrand}</p>
              )}
            </div>
          </div>

          {/* Clubs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
              使用社团
            </h3>
            <div className="space-y-2">
              {formData.clubs.map((club, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={club}
                    onChange={(e) => updateClub(index, e.target.value)}
                    placeholder="社团名称"
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                  {formData.clubs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeClub(index)}
                      className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addClub}
                className="text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1"
              >
                + 添加社团
              </button>
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
              教室照片
            </h3>
            <div className="space-y-2">
              {formData.photos.map((photo, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={photo}
                    onChange={(e) => updatePhoto(index, e.target.value)}
                    placeholder="照片URL"
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                  {formData.photos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPhoto}
                className="text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1"
              >
                <Upload className="w-4 h-4" />
                添加照片
              </button>
            </div>
          </div>

          {/* Actions */}
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
              {isEdit ? '保存修改' : '创建档案'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
