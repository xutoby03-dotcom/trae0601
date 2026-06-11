import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, User, FileText, Calendar, Phone, Tag, Building } from 'lucide-react';
import { useVendorStore } from '@/stores/useVendorStore';
import type { StallType } from '@/types';
import { stallTypeLabels } from '@/types';

const VendorForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getVendor, addVendor, updateVendor, initData, isLoaded } = useVendorStore();

  const isEdit = !!id;
  const vendor = isEdit && id ? getVendor(id) : undefined;

  const [formData, setFormData] = useState({
    name: '',
    stallType: 'food' as StallType,
    licenseNumber: '',
    validUntil: '',
    businessCategory: '',
    phone: '',
    licensePhoto: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    initData();
  }, [initData]);

  useEffect(() => {
    if (isEdit && vendor && isLoaded) {
      setFormData({
        name: vendor.name,
        stallType: vendor.stallType,
        licenseNumber: vendor.licenseNumber,
        validUntil: vendor.validUntil,
        businessCategory: vendor.businessCategory,
        phone: vendor.phone,
        licensePhoto: vendor.licensePhoto,
      });
    }
  }, [isEdit, vendor, isLoaded]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = '请输入证照编号';
    }
    if (!formData.validUntil) {
      newErrors.validUntil = '请选择有效期';
    }
    if (!formData.businessCategory.trim()) {
      newErrors.businessCategory = '请输入经营品类';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入联系电话';
    } else if (!/^1\d{10}$/.test(formData.phone)) {
      newErrors.phone = '请输入正确的手机号码';
    }
    if (!formData.licensePhoto.trim()) {
      newErrors.licensePhoto = '请上传证照照片';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (isEdit && id) {
      updateVendor(id, formData);
    } else {
      addVendor(formData);
    }

    navigate('/vendors');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('licensePhoto', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPhoto = () => {
    handleChange('licensePhoto', '');
  };

  if (isEdit && !vendor && isLoaded) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">摊主不存在</p>
        <button onClick={() => navigate('/vendors')} className="text-blue-600 hover:text-blue-700">
          返回列表
        </button>
      </div>
    );
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
      errors[field] ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200'
    }`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isEdit ? '编辑摊主' : '新增摊主'}
          </h1>
          <p className="text-slate-500 mt-0.5">
            {isEdit ? '修改摊主档案信息' : '录入新的摊主档案信息'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">基本信息</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <User className="w-4 h-4 text-slate-400" />
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="请输入摊主姓名"
                className={inputClass('name')}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Building className="w-4 h-4 text-slate-400" />
                摊位类型 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.stallType}
                onChange={e => handleChange('stallType', e.target.value)}
                className={inputClass('stallType')}
              >
                {Object.entries(stallTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Phone className="w-4 h-4 text-slate-400" />
                联系电话 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="请输入手机号码"
                className={inputClass('phone')}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Tag className="w-4 h-4 text-slate-400" />
                经营品类 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.businessCategory}
                onChange={e => handleChange('businessCategory', e.target.value)}
                placeholder="如：传统小吃、手工编织"
                className={inputClass('businessCategory')}
              />
              {errors.businessCategory && (
                <p className="text-red-500 text-xs mt-1">{errors.businessCategory}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">证照信息</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 text-slate-400" />
                证照编号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={e => handleChange('licenseNumber', e.target.value)}
                placeholder="请输入证照编号"
                className={`${inputClass('licenseNumber')} font-mono`}
              />
              {errors.licenseNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.licenseNumber}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                有效期至 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={e => handleChange('validUntil', e.target.value)}
                className={inputClass('validUntil')}
              />
              {errors.validUntil && (
                <p className="text-red-500 text-xs mt-1">{errors.validUntil}</p>
              )}
            </div>
          </div>

          <div className="mt-5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Upload className="w-4 h-4 text-slate-400" />
              证照照片 <span className="text-red-500">*</span>
            </label>

            {formData.licensePhoto ? (
              <div className="relative inline-block">
                <img
                  src={formData.licensePhoto}
                  alt="证照照片"
                  className="max-w-sm rounded-xl border border-slate-200"
                />
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full max-w-sm h-48 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                <Upload className="w-10 h-10 text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-600">点击上传证照照片</p>
                <p className="text-xs text-slate-400 mt-1">支持 JPG、PNG 格式</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
            {errors.licensePhoto && (
              <p className="text-red-500 text-xs mt-2">{errors.licensePhoto}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Save className="w-5 h-5" />
            {isEdit ? '保存修改' : '保存档案'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorForm;
