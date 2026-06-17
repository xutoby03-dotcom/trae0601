import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Check, MapPin, Calendar, Package, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, TextArea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ColorPicker } from '@/components/ColorPicker';
import { PhotoUploader } from '@/components/PhotoUploader';
import { createPlaceholderUmbrellaSVG, createHandlePlaceholderSVG } from '@/utils/imageUtils';
import { umbrellaService } from '@/services/umbrellaService';
import { BUILDING_OPTIONS, FEATURE_OPTIONS, UMBRELLA_BRANDS, STORAGE_PERIOD_DAYS } from '@/utils/constants';
import { getDateInputValue } from '@/utils/dateUtils';
import type { CreateUmbrellaData } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/context/authStore';
import { Modal } from '@/components/ui/Modal';

export const UmbrellaRegister: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    color: '',
    colorHex: '',
    brand: '',
    features: [] as string[],
    description: '',
    canopyPhoto: '',
    handlePhoto: '',
    building: '',
    area: '',
    foundTime: getDateInputValue(),
    storageCell: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableAreas = BUILDING_OPTIONS.find(b => b.name === formData.building)?.areas || [];

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.color) newErrors.color = '请选择颜色';
    if (!formData.brand) newErrors.brand = '请输入品牌';
    if (!formData.canopyPhoto) newErrors.canopyPhoto = '请上传伞面照片';
    if (!formData.handlePhoto) newErrors.handlePhoto = '请上传伞柄照片';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.building) newErrors.building = '请选择拾到楼栋';
    if (!formData.area) newErrors.area = '请选择具体区域';
    if (!formData.foundTime) newErrors.foundTime = '请选择拾到时间';
    if (!formData.storageCell) newErrors.storageCell = '请输入存放格编号';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsSubmitting(true);
    try {
      const umbrellaData: CreateUmbrellaData = {
        color: formData.color,
        colorHex: formData.colorHex,
        brand: formData.brand,
        features: formData.features,
        description: formData.description,
        canopyPhoto: formData.canopyPhoto || createPlaceholderUmbrellaSVG(formData.colorHex),
        handlePhoto: formData.handlePhoto || createHandlePlaceholderSVG(),
        foundLocation: {
          building: formData.building,
          area: formData.area,
        },
        foundTime: new Date(formData.foundTime).toISOString(),
        storageCell: formData.storageCell,
      };

      umbrellaService.create(umbrellaData);
      setShowSuccess(true);
    } catch (error) {
      console.error('登记失败:', error);
      alert('登记失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">需要管理员权限</h2>
          <p className="text-gray-500 mb-6">请先登录管理员账号后再进行雨伞登记</p>
          <Button onClick={() => navigate('/admin/login')}>去登录</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'ZCOOL XiaoWei, serif' }}>
          登记拾到的雨伞
        </h1>
        <p className="text-gray-500">填写雨伞信息，帮助失主快速找回</p>
      </div>

      <div className="flex items-center justify-center mb-8">
        {[1, 2].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300
                ${step >= s
                  ? 'bg-[#4A90D9] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-400'
                }
              `}
            >
              {step > s ? <Check className="w-5 h-5" /> : s}
            </div>
            {s < 2 && (
              <div
                className={`w-24 h-1 mx-2 rounded-full transition-all duration-300 ${
                  step > s ? 'bg-[#4A90D9]' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#4A90D9]" />
              雨伞基本信息
            </div>

            <ColorPicker
              label="雨伞颜色"
              value={formData.color}
              onChange={(color, hex) => setFormData(prev => ({ ...prev, color, colorHex: hex }))}
            />
            {errors.color && <p className="text-red-500 text-sm">{errors.color}</p>}

            <div className="grid md:grid-cols-2 gap-4">
              <Select
                label="雨伞品牌"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                error={errors.brand}
                options={UMBRELLA_BRANDS.map(b => ({ value: b, label: b }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Tag className="w-4 h-4" />
                伞面特征
              </label>
              <div className="flex flex-wrap gap-2">
                {FEATURE_OPTIONS.map((feature) => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => handleFeatureToggle(feature)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-all
                      ${formData.features.includes(feature)
                        ? 'bg-[#4A90D9] text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {feature}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {formData.features.map(f => (
                  <Badge key={f} variant="info" size="sm">{f}</Badge>
                ))}
              </div>
            </div>

            <TextArea
              label="补充描述"
              placeholder="描述雨伞的其他特征，如磨损位置、特殊标记等"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <PhotoUploader
                label="伞面照片"
                value={formData.canopyPhoto}
                onChange={(photo) => setFormData(prev => ({ ...prev, canopyPhoto: photo }))}
                placeholderIcon={<Camera className="w-12 h-12" />}
              />
              {errors.canopyPhoto && <p className="text-red-500 text-sm">{errors.canopyPhoto}</p>}
              <PhotoUploader
                label="伞柄照片"
                value={formData.handlePhoto}
                onChange={(photo) => setFormData(prev => ({ ...prev, handlePhoto: photo }))}
                placeholderIcon={<Upload className="w-12 h-12" />}
              />
              {errors.handlePhoto && <p className="text-red-500 text-sm">{errors.handlePhoto}</p>}
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleNext}>
                下一步
                <Check className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#4A90D9]" />
              拾获信息
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Select
                label="拾到楼栋"
                value={formData.building}
                onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value, area: '' }))}
                error={errors.building}
                options={BUILDING_OPTIONS.map(b => ({ value: b.name, label: b.name }))}
              />
              <Select
                label="具体区域"
                value={formData.area}
                onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                error={errors.area}
                disabled={!formData.building}
                options={availableAreas.map(a => ({ value: a, label: a }))}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  拾到时间
                </label>
                <input
                  type="datetime-local"
                  value={formData.foundTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, foundTime: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/50 focus:border-[#4A90D9] transition-all"
                />
                {errors.foundTime && <p className="text-red-500 text-sm mt-1">{errors.foundTime}</p>}
              </div>
              <Input
                label="存放格编号"
                icon={<Package className="w-5 h-5" />}
                placeholder="如：A-01、B-03"
                value={formData.storageCell}
                onChange={(e) => setFormData(prev => ({ ...prev, storageCell: e.target.value }))}
                error={errors.storageCell}
              />
            </div>

            <div className="p-4 bg-[#4A90D9]/5 rounded-xl">
              <h4 className="font-medium text-[#4A90D9] mb-3">已填写信息预览</h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">颜色</span>
                  <span className="font-medium flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: formData.colorHex }} />
                    {formData.color}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">品牌</span>
                  <span className="font-medium">{formData.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">特征</span>
                  <span className="font-medium">{formData.features.join('、') || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">保管期</span>
                  <span className="font-medium">{STORAGE_PERIOD_DAYS}天</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="secondary" onClick={() => setStep(1)}>
                上一步
              </Button>
              <Button onClick={handleSubmit} isLoading={isSubmitting}>
                确认登记
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate('/');
        }}
        title="登记成功"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600 mb-6">
            雨伞信息已成功登记！
            <br />
            等待失主认领中...
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate('/')}>
              查看列表
            </Button>
            <Button onClick={() => {
              setShowSuccess(false);
              setStep(1);
              setFormData({
                color: '',
                colorHex: '',
                brand: '',
                features: [],
                description: '',
                canopyPhoto: '',
                handlePhoto: '',
                building: '',
                area: '',
                foundTime: getDateInputValue(),
                storageCell: '',
              });
            }}>
              继续登记
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
