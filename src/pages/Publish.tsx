import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PawPrint, 
  MapPin, 
  Clock, 
  Phone, 
  FileText, 
  AlertCircle,
  ChevronLeft,
  Send
} from 'lucide-react';
import { usePetStore } from '@/store/usePetStore';
import { PhotoUpload } from '@/components/PhotoUpload';
import { SafetyAlert } from '@/components/SafetyAlert';
import { MapView } from '@/components/MapView';
import type { PetSpecies, PetSize } from '@/types';
import { cn } from '@/lib/utils';

export function Publish() {
  const navigate = useNavigate();
  const addPetMissing = usePetStore((state) => state.addPetMissing);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    petName: '',
    species: 'dog' as PetSpecies,
    breed: '',
    color: '',
    size: 'medium' as PetSize,
    lostTime: new Date().toISOString().slice(0, 16),
    lastLocation: '',
    lat: 39.9042,
    lng: 116.4074,
    photos: [] as string[],
    contact: '',
    description: '',
    urgent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.petName.trim()) newErrors.petName = '请输入宠物名字';
    if (!formData.breed.trim()) newErrors.breed = '请输入宠物品种';
    if (!formData.color.trim()) newErrors.color = '请输入宠物颜色';
    if (!formData.lastLocation.trim()) newErrors.lastLocation = '请输入最后出现位置';
    if (!formData.contact.trim()) newErrors.contact = '请输入联系方式';
    if (formData.photos.length === 0) newErrors.photos = '请至少上传一张宠物照片';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addPetMissing({
      ...formData,
      lostTime: new Date(formData.lostTime).toISOString(),
    });
    
    setSubmitting(false);
    navigate('/');
  };

  const InputField = ({ 
    label, 
    icon: Icon, 
    name, 
    type = 'text', 
    placeholder, 
    required 
  }: { 
    label: string; 
    icon: any; 
    name: string; 
    type?: string; 
    placeholder: string; 
    required?: boolean 
  }) => (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <Icon className="w-4 h-4 text-orange-500" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={(formData as any)[name]}
        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
        placeholder={placeholder}
        className={cn(
          "w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none",
          errors[name]
            ? "border-red-300 focus:border-red-500 bg-red-50"
            : "border-gray-200 focus:border-orange-400 bg-white"
        )}
      />
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">发布协寻</h1>
          <p className="text-sm text-gray-500">填写宠物信息，帮助它早日回家</p>
        </div>
      </div>

      <SafetyAlert />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-orange-500" />
            宠物信息
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField 
                label="宠物名字" 
                icon={PawPrint} 
                name="petName" 
                placeholder="如：豆豆" 
                required 
              />
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <PawPrint className="w-4 h-4 text-orange-500" />
                  宠物种类
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {[
                    { value: 'dog', label: '🐕 狗' },
                    { value: 'cat', label: '🐱 猫' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, species: option.value as PetSpecies })}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all",
                        formData.species === option.value
                          ? "border-orange-400 bg-orange-50 text-orange-600"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField 
                label="品种" 
                icon={PawPrint} 
                name="breed" 
                placeholder="如：金毛、英短" 
                required 
              />
              <InputField 
                label="颜色" 
                icon={PawPrint} 
                name="color" 
                placeholder="如：金黄色、蓝灰色" 
                required 
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <PawPrint className="w-4 h-4 text-orange-500" />
                体型
                <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'small', label: '小型' },
                  { value: 'medium', label: '中型' },
                  { value: 'large', label: '大型' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, size: option.value as PetSize })}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all",
                      formData.size === option.value
                        ? "border-orange-400 bg-orange-50 text-orange-600"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <PawPrint className="w-4 h-4 text-orange-500" />
                宠物照片
                <span className="text-red-500">*</span>
              </label>
              <PhotoUpload
                photos={formData.photos}
                onChange={(photos) => setFormData({ ...formData, photos })}
              />
              {errors.photos && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.photos}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            走失信息
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  走失时间
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.lostTime}
                  onChange={(e) => setFormData({ ...formData, lostTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-all bg-white"
                />
              </div>
              <InputField 
                label="联系方式" 
                icon={Phone} 
                name="contact" 
                type="tel"
                placeholder="手机号或微信号" 
                required 
              />
            </div>

            <InputField 
              label="最后出现位置" 
              icon={MapPin} 
              name="lastLocation" 
              placeholder="如：朝阳区建国路88号附近" 
              required 
            />

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                在地图上标记位置
              </label>
              <p className="text-xs text-gray-500 mb-3">
                点击地图选择走失位置
              </p>
              <MapView
                interactive
                center={[formData.lat, formData.lng]}
                selectedLat={formData.lat}
                selectedLng={formData.lng}
                onLocationSelect={(lat, lng) => {
                  setFormData({ ...formData, lat, lng });
                }}
                markerColor="#FF7A45"
                height="h-[280px]"
              />
              <p className="text-xs text-gray-400 mt-2">
                📍 坐标：{formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 text-orange-500" />
                补充描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="描述宠物特征、走失时的情况、是否有项圈等信息..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-all bg-white resize-none"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
              <input
                type="checkbox"
                id="urgent"
                checked={formData.urgent}
                onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
              />
              <label htmlFor="urgent" className="text-sm text-gray-700">
                <span className="font-medium text-red-600">标记为紧急协寻</span>
                <span className="text-gray-500 ml-1">（走失超过24小时或特殊情况）</span>
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "w-full py-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-2",
            submitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-lg shadow-orange-200 hover:shadow-xl"
          )}
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              发布中...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              发布协寻
            </>
          )}
        </button>
      </form>
    </div>
  );
}
