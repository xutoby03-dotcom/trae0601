import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Save, X, Dog, Cat, PawPrint, Camera, User, Phone, Calendar, Scale, Heart, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Pet } from '../../../shared/types';
import { SPECIES_NAMES } from '../../../shared/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface FormData {
  name: string;
  species: Pet['species'];
  breed: string;
  age: string;
  weight: string;
  personality: string;
  sterilized: boolean;
  ownerName: string;
  ownerPhone: string;
  photoUrl: string;
  medicalHistory: string;
  allergies: string;
  specialRequirements: string;
}

const initialFormData: FormData = {
  name: '',
  species: 'dog',
  breed: '',
  age: '',
  weight: '',
  personality: '',
  sterilized: false,
  ownerName: '',
  ownerPhone: '',
  photoUrl: '',
  medicalHistory: '',
  allergies: '',
  specialRequirements: '',
};

export default function PetForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id !== 'new';
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      fetchPetData(parseInt(id));
    }
  }, [isEdit, id]);

  const fetchPetData = async (petId: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/pets/${petId}`);
      const data: ApiResponse<Pet> = await res.json();
      if (data.success && data.data) {
        const pet = data.data;
        setFormData({
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: pet.age.toString(),
          weight: pet.weight.toString(),
          personality: pet.personality || '',
          sterilized: pet.sterilized,
          ownerName: pet.ownerName,
          ownerPhone: pet.ownerPhone,
          photoUrl: pet.photoUrl || '',
          medicalHistory: pet.medicalHistory || '',
          allergies: pet.allergies || '',
          specialRequirements: pet.specialRequirements || '',
        });
        if (pet.photoUrl) {
          setPreviewImage(pet.photoUrl);
        }
      }
    } catch (error) {
      console.error('获取宠物信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入宠物名称';
    }
    if (!formData.breed.trim()) {
      newErrors.breed = '请输入品种';
    }
    if (!formData.age || parseFloat(formData.age) < 0) {
      newErrors.age = '请输入有效的年龄';
    }
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      newErrors.weight = '请输入有效的体重';
    }
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = '请输入主人姓名';
    }
    if (!formData.ownerPhone.trim()) {
      newErrors.ownerPhone = '请输入主人电话';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const petData = {
        ...formData,
        age: parseInt(formData.age) || 0,
        weight: parseFloat(formData.weight) || 0,
      };

      const url = isEdit ? `/api/pets/${id}` : '/api/pets';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(petData),
      });

      const data: ApiResponse<Pet> = await res.json();
      if (data.success) {
        navigate(`/pets/${data.data.id}`);
      } else {
        alert(data.message || '保存失败');
      }
    } catch (error) {
      console.error('保存宠物信息失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        handleInputChange('photoUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getSpeciesIcon = (species: Pet['species']) => {
    switch (species) {
      case 'dog': return Dog;
      case 'cat': return Cat;
      default: return PawPrint;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/pets"
            className="p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? '编辑宠物档案' : '新建宠物档案'}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEdit ? '修改宠物的基本信息' : '填写宠物的基本信息建立档案'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              宠物照片
            </h2>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="relative group">
                <div className="w-48 h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="预览"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">点击上传照片</p>
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all rounded-2xl">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-white" />
                    <span className="text-sm text-white font-medium">更换照片</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {previewImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      handleInputChange('photoUrl', '');
                    }}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  建议上传清晰的宠物正面照片，方便识别。
                </p>
                <p className="text-xs text-gray-400">
                  支持 JPG、PNG 格式，文件大小不超过 5MB
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-blue-600" />
              基本信息
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  宠物名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="请输入宠物名称"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border transition-all",
                    errors.name
                      ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500"
                      : "border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  )}
                />
                {errors.name && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  物种 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['dog', 'cat', 'other'] as const).map((species) => {
                    const Icon = getSpeciesIcon(species);
                    return (
                      <button
                        key={species}
                        type="button"
                        onClick={() => handleInputChange('species', species)}
                        className={cn(
                          "flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all",
                          formData.species === species
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                        )}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{SPECIES_NAMES[species]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  品种 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => handleInputChange('breed', e.target.value)}
                  placeholder="如：金毛、布偶、泰迪等"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border transition-all",
                    errors.breed
                      ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500"
                      : "border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  )}
                />
                {errors.breed && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.breed}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  是否绝育
                </label>
                <div className="flex items-center h-[50px]">
                  <button
                    type="button"
                    onClick={() => handleInputChange('sterilized', !formData.sterilized)}
                    className={cn(
                      "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
                      formData.sterilized ? "bg-blue-600" : "bg-gray-300"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                        formData.sterilized ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.sterilized ? '已绝育' : '未绝育'}
                  </span>
                  {formData.sterilized && (
                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500 ml-2" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1.5" />
                  年龄（岁） <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="请输入年龄"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border transition-all",
                    errors.age
                      ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500"
                      : "border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  )}
                />
                {errors.age && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.age}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Scale className="w-4 h-4 inline mr-1.5" />
                  体重（kg） <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="请输入体重"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border transition-all",
                    errors.weight
                      ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500"
                      : "border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  )}
                />
                {errors.weight && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.weight}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  性格特点
                </label>
                <textarea
                  value={formData.personality}
                  onChange={(e) => handleInputChange('personality', e.target.value)}
                  placeholder="描述宠物的性格特点，如：活泼好动、温顺亲人、胆小怕生等"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              主人信息
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  主人姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  placeholder="请输入主人姓名"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border transition-all",
                    errors.ownerName
                      ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500"
                      : "border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  )}
                />
                {errors.ownerName && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.ownerName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1.5" />
                  联系电话 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                  placeholder="请输入联系电话"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border transition-all",
                    errors.ownerPhone
                      ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500"
                      : "border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  )}
                />
                {errors.ownerPhone && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.ownerPhone}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5 text-blue-600" />
              健康信息
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  既往病史
                </label>
                <textarea
                  value={formData.medicalHistory}
                  onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                  placeholder="记录宠物曾患过的重大疾病、手术史等"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  过敏史
                </label>
                <textarea
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  placeholder="记录宠物对食物、药物或其他物质的过敏情况"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  特殊需求
                </label>
                <textarea
                  value={formData.specialRequirements}
                  onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                  placeholder="记录宠物的特殊喂养需求、护理注意事项等"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              to="/pets"
              className="px-8 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save className="w-5 h-5" />
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
