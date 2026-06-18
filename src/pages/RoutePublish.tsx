import { useState } from 'react';
import { MapPin, Clock, Users, Baby, Luggage, Car, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCarpoolStore } from '@/store/useCarpoolStore';
import type { RouteFormData, LuggageSpace } from '@/types';
import { getTodayDateString } from '@/utils/helpers';

export const RoutePublish = () => {
  const navigate = useNavigate();
  const addRoute = useCarpoolStore((state) => state.addRoute);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState<RouteFormData>({
    departure: '阳光花园小区',
    destination: '',
    departureTime: '',
    totalSeats: 3,
    hasChildSeat: false,
    luggageSpace: 'medium',
    plateNumber: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RouteFormData, string>>>({});

  const validateStep1 = () => {
    const newErrors: Partial<Record<keyof RouteFormData, string>> = {};
    if (!formData.departure.trim()) newErrors.departure = '请输入出发地';
    if (!formData.destination.trim()) newErrors.destination = '请输入目的地';
    if (!formData.departureTime) newErrors.departureTime = '请选择出发时间';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Partial<Record<keyof RouteFormData, string>> = {};
    if (formData.totalSeats < 1) newErrors.totalSeats = '座位数至少为1';
    if (formData.totalSeats > 7) newErrors.totalSeats = '座位数最多为7';
    if (!formData.plateNumber.trim()) newErrors.plateNumber = '请输入车牌尾号';
    if (formData.plateNumber.length < 4) newErrors.plateNumber = '请输入完整车牌尾号';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePrev = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const departureDateTime = formData.departureTime.includes('T')
        ? formData.departureTime
        : `${getTodayDateString()}T${formData.departureTime}`;

      addRoute({
        ...formData,
        departureTime: new Date(departureDateTime).toISOString()
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('发布失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof RouteFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">发布成功！</h2>
          <p className="text-gray-500">您的路线已成功发布，即将返回首页...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">发布路线</h1>
          <p className="text-sm text-gray-500 mt-1">填写路线信息，方便邻居搭乘</p>
        </div>
      </div>

      <div className="flex items-center justify-center mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              step >= s
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-400'
            }`}>
              {s}
            </div>
            {s < 2 && (
              <div className={`w-16 h-1 mx-2 rounded transition-all ${
                step > s ? 'bg-orange-500' : 'bg-gray-100'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 text-teal-500" />
                出发地
              </label>
              <input
                type="text"
                value={formData.departure}
                onChange={(e) => updateFormData('departure', e.target.value)}
                placeholder="请输入出发地"
                className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.departure ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              />
              {errors.departure && (
                <p className="text-red-500 text-sm mt-1">{errors.departure}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                目的地
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => updateFormData('destination', e.target.value)}
                placeholder="请输入目的地，如：市第一人民医院"
                className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.destination ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              />
              {errors.destination && (
                <p className="text-red-500 text-sm mt-1">{errors.destination}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {['市第一人民医院', '实验小学', '地铁站A口', '高铁站', '购物中心'].map((dest) => (
                  <button
                    key={dest}
                    onClick={() => updateFormData('destination', dest)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                      formData.destination === dest
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 text-blue-500" />
                出发时间
              </label>
              <input
                type="datetime-local"
                value={formData.departureTime}
                onChange={(e) => updateFormData('departureTime', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.departureTime ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              />
              {errors.departureTime && (
                <p className="text-red-500 text-sm mt-1">{errors.departureTime}</p>
              )}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md shadow-orange-200"
            >
              下一步
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 text-blue-500" />
                空座数量
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => updateFormData('totalSeats', Math.max(1, formData.totalSeats - 1))}
                  className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 font-bold text-xl hover:bg-gray-200 transition-colors"
                >
                  -
                </button>
                <span className="text-3xl font-bold text-gray-900 w-16 text-center">
                  {formData.totalSeats}
                </span>
                <button
                  onClick={() => updateFormData('totalSeats', Math.min(7, formData.totalSeats + 1))}
                  className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 font-bold text-xl hover:bg-gray-200 transition-colors"
                >
                  +
                </button>
              </div>
              {errors.totalSeats && (
                <p className="text-red-500 text-sm mt-1">{errors.totalSeats}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Baby className="w-4 h-4 text-teal-500" />
                是否配备儿童座椅
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => updateFormData('hasChildSeat', true)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    formData.hasChildSeat
                      ? 'bg-teal-500 text-white shadow-md shadow-teal-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  是
                </button>
                <button
                  onClick={() => updateFormData('hasChildSeat', false)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    !formData.hasChildSeat
                      ? 'bg-gray-500 text-white shadow-md shadow-gray-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  否
                </button>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Luggage className="w-4 h-4 text-orange-500" />
                行李空间
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'small', label: '小件', desc: '背包/手提袋' },
                  { value: 'medium', label: '中等', desc: '登机箱' },
                  { value: 'large', label: '大件', desc: '行李箱' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateFormData('luggageSpace', option.value as LuggageSpace)}
                    className={`py-3 px-4 rounded-xl transition-all ${
                      formData.luggageSpace === option.value
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs opacity-80">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Car className="w-4 h-4 text-blue-500" />
                车牌尾号
              </label>
              <input
                type="text"
                value={formData.plateNumber}
                onChange={(e) => updateFormData('plateNumber', e.target.value.toUpperCase())}
                placeholder="请输入车牌尾号，如：京A·88888"
                maxLength={8}
                className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.plateNumber ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              />
              {errors.plateNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.plateNumber}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handlePrev}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                上一步
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '发布中...' : '确认发布'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
