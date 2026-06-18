import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Plus, Camera } from 'lucide-react';
import { useMedicineStore } from '@/store/medicineStore';
import { MedicineCategory, CATEGORY_LABELS } from '@/types';
import { compressImage, suggestOpenExpiryDays } from '@/utils/medicine';
import type { Medicine } from '@/types';

const categories = Object.values(MedicineCategory);

export default function MedicineForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { addMedicine, updateMedicine, getMedicineById } = useMedicineStore();
  
  const editingMedicine = id ? getMedicineById(id) : undefined;
  const defaultCategory = searchParams.get('category') as MedicineCategory | null;

  const [formData, setFormData] = useState({
    name: '',
    specification: '',
    symptoms: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    openDate: '',
    openExpiryDays: 180,
    location: '',
    quantity: 1,
    photo: '',
    category: defaultCategory || MedicineCategory.OTHER,
    contraindications: [] as string[],
    notes: '',
  });

  const [contraInput, setContraInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingMedicine) {
      setFormData({
        name: editingMedicine.name,
        specification: editingMedicine.specification,
        symptoms: editingMedicine.symptoms,
        purchaseDate: editingMedicine.purchaseDate,
        expiryDate: editingMedicine.expiryDate,
        openDate: editingMedicine.openDate || '',
        openExpiryDays: editingMedicine.openExpiryDays || 180,
        location: editingMedicine.location,
        quantity: editingMedicine.quantity,
        photo: editingMedicine.photo || '',
        category: editingMedicine.category,
        contraindications: editingMedicine.contraindications,
        notes: editingMedicine.notes || '',
      });
    }
  }, [editingMedicine]);

  useEffect(() => {
    if (formData.specification) {
      const suggested = suggestOpenExpiryDays(formData.specification);
      setFormData(prev => ({ ...prev, openExpiryDays: suggested }));
    }
  }, [formData.specification]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setFormData(prev => ({ ...prev, photo: compressed }));
      } catch (err) {
        console.error('Failed to process image:', err);
      }
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: '' }));
  };

  const addContraindication = () => {
    if (contraInput.trim() && !formData.contraindications.includes(contraInput.trim())) {
      setFormData(prev => ({
        ...prev,
        contraindications: [...prev.contraindications, contraInput.trim()]
      }));
      setContraInput('');
    }
  };

  const removeContraindication = (item: string) => {
    setFormData(prev => ({
      ...prev,
      contraindications: prev.contraindications.filter(c => c !== item)
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = '请输入药品名称';
    if (!formData.specification.trim()) newErrors.specification = '请输入规格';
    if (!formData.purchaseDate) newErrors.purchaseDate = '请选择购买日期';
    if (!formData.expiryDate) newErrors.expiryDate = '请选择有效期';
    if (!formData.location.trim()) newErrors.location = '请输入存放位置';
    if (formData.quantity < 1) newErrors.quantity = '数量至少为1';
    
    if (formData.expiryDate && formData.purchaseDate) {
      if (new Date(formData.expiryDate) < new Date(formData.purchaseDate)) {
        newErrors.expiryDate = '有效期不能早于购买日期';
      }
    }
    
    if (formData.openDate && formData.openDate > formData.expiryDate) {
      newErrors.openDate = '开封日期不能晚于有效期';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const medicineData = {
      ...formData,
      openDate: formData.openDate || undefined,
      openExpiryDays: formData.openDate ? formData.openExpiryDays : undefined,
      photo: formData.photo || undefined,
      notes: formData.notes || undefined,
    };

    if (editingMedicine) {
      updateMedicine(editingMedicine.id, medicineData);
    } else {
      addMedicine(medicineData);
    }

    navigate('/medicines');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">
          {editingMedicine ? '编辑药品' : '登记新药品'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary-600" />
            药品照片
          </h2>
          
          <div className="flex items-center gap-4">
            {formData.photo ? (
              <div className="relative">
                <img
                  src={formData.photo}
                  alt="药品照片"
                  className="w-32 h-32 object-cover rounded-xl border-2 border-primary-200"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-danger-500 text-white rounded-full flex items-center justify-center hover:bg-danger-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">点击上传</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
            <p className="text-xs text-gray-500">
              上传药盒照片，方便以后快速识别
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">基本信息</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                药品名称 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-danger-300 focus:ring-danger-200' : 'border-gray-200 focus:ring-primary-200'} focus:outline-none focus:ring-2 transition-colors`}
                placeholder="如：布洛芬缓释胶囊"
              />
              {errors.name && <p className="text-xs text-danger-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                规格 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                value={formData.specification}
                onChange={(e) => setFormData(prev => ({ ...prev, specification: e.target.value }))}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.specification ? 'border-danger-300 focus:ring-danger-200' : 'border-gray-200 focus:ring-primary-200'} focus:outline-none focus:ring-2 transition-colors`}
                placeholder="如：0.3g*20粒"
              />
              {errors.specification && <p className="text-xs text-danger-500 mt-1">{errors.specification}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              适用症状
            </label>
            <textarea
              value={formData.symptoms}
              onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-colors resize-none"
              placeholder="如：用于缓解轻至中度疼痛、感冒或流感引起的发热"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              药品类别 <span className="text-danger-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    formData.category === cat
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">日期信息</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                购买日期 <span className="text-danger-500">*</span>
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.purchaseDate ? 'border-danger-300 focus:ring-danger-200' : 'border-gray-200 focus:ring-primary-200'} focus:outline-none focus:ring-2 transition-colors`}
              />
              {errors.purchaseDate && <p className="text-xs text-danger-500 mt-1">{errors.purchaseDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                有效期至 <span className="text-danger-500">*</span>
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.expiryDate ? 'border-danger-300 focus:ring-danger-200' : 'border-gray-200 focus:ring-primary-200'} focus:outline-none focus:ring-2 transition-colors`}
              />
              {errors.expiryDate && <p className="text-xs text-danger-500 mt-1">{errors.expiryDate}</p>}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-700">已开封？</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.openDate}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({ ...prev, openDate: new Date().toISOString().split('T')[0] }));
                    } else {
                      setFormData(prev => ({ ...prev, openDate: '', openExpiryDays: 180 }));
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            {formData.openDate && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    开封日期 <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.openDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, openDate: e.target.value }))}
                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.openDate ? 'border-danger-300 focus:ring-danger-200' : 'border-gray-200 focus:ring-primary-200'} focus:outline-none focus:ring-2 transition-colors`}
                  />
                  {errors.openDate && <p className="text-xs text-danger-500 mt-1">{errors.openDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    开封后有效期（天）
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.openExpiryDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, openExpiryDays: parseInt(e.target.value) || 180 }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    已根据剂型自动建议，可手动调整
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">存储信息</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                存放位置 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.location ? 'border-danger-300 focus:ring-danger-200' : 'border-gray-200 focus:ring-primary-200'} focus:outline-none focus:ring-2 transition-colors`}
                placeholder="如：客厅药箱第一层"
              />
              {errors.location && <p className="text-xs text-danger-500 mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                剩余数量 <span className="text-danger-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.quantity ? 'border-danger-300 focus:ring-danger-200' : 'border-gray-200 focus:ring-primary-200'} focus:outline-none focus:ring-2 transition-colors`}
              />
              {errors.quantity && <p className="text-xs text-danger-500 mt-1">{errors.quantity}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">安全信息</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              禁忌人群
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={contraInput}
                onChange={(e) => setContraInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addContraindication())}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-colors"
                placeholder="如：孕妇、儿童、肝肾功能不全者"
              />
              <button
                type="button"
                onClick={addContraindication}
                className="px-4 py-2.5 bg-primary-100 text-primary-600 rounded-xl hover:bg-primary-200 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {formData.contraindications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.contraindications.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-danger-100 text-danger-700 rounded-full text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeContraindication(item)}
                      className="hover:text-danger-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-colors resize-none"
              placeholder="其他需要注意的信息"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 transition-all"
          >
            {editingMedicine ? '保存修改' : '登记药品'}
          </button>
        </div>
      </form>
    </div>
  );
}
