import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaintStore } from '@/store/useComplaintStore';
import { BUILDINGS, NOISE_TYPE_LABELS, NoiseType, Attachment } from '@/types';
import { generateId } from '@/utils/dateUtils';
import { ArrowLeft, Upload, X, Image, Mic, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormData {
  building: string;
  unit: string;
  timePeriod: string;
  noiseType: NoiseType | '';
  complainant: string;
  phone: string;
  description: string;
}

const initialFormData: FormData = {
  building: '',
  unit: '',
  timePeriod: '',
  noiseType: '',
  complainant: '',
  phone: '',
  description: '',
};

const timePeriods = [
  '早上06:00-08:00',
  '上午08:00-12:00',
  '中午12:00-14:00',
  '下午14:00-18:00',
  '晚上18:00-22:00',
  '夜间22:00-00:00',
  '凌晨00:00-06:00',
  '全天',
];

export default function ComplaintNew() {
  const navigate = useNavigate();
  const addComplaint = useComplaintStore((state) => state.addComplaint);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const isImage = file.type.startsWith('image/');
        const isAudio = file.type.startsWith('audio/');
        if (!isImage && !isAudio) return;

        const newAttachment: Attachment = {
          id: generateId(),
          type: isImage ? 'image' : 'audio',
          name: file.name,
          url: event.target?.result as string,
          size: file.size,
          createdAt: new Date().toISOString(),
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.building) newErrors.building = '请选择楼栋';
    if (!formData.unit.trim()) newErrors.unit = '请输入房号';
    if (!formData.timePeriod) newErrors.timePeriod = '请选择时间段';
    if (!formData.noiseType) newErrors.noiseType = '请选择噪音类型';
    if (!formData.complainant.trim()) newErrors.complainant = '请输入投诉人姓名';
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入联系电话';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入正确的手机号码';
    }
    if (!formData.description.trim()) newErrors.description = '请输入投诉描述';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    addComplaint(
      {
        building: formData.building,
        unit: formData.unit,
        timePeriod: formData.timePeriod,
        noiseType: formData.noiseType as NoiseType,
        complainant: formData.complainant,
        phone: formData.phone,
        description: formData.description,
      },
      attachments
    );

    setIsSubmitting(false);
    navigate('/complaints');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        返回
      </button>

      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            新建投诉
          </h1>
          <p className="text-slate-400 text-sm mt-1">请填写以下信息登记噪音投诉</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                楼栋 <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.building}
                onChange={(e) => handleInputChange('building', e.target.value)}
                className={cn(
                  'w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors',
                  errors.building ? 'border-red-500' : 'border-slate-600'
                )}
              >
                <option value="">请选择楼栋</option>
                {BUILDINGS.map((building) => (
                  <option key={building} value={building}>{building}</option>
                ))}
              </select>
              {errors.building && <p className="mt-1 text-sm text-red-400">{errors.building}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                房号 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="如：1203"
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                className={cn(
                  'w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors',
                  errors.unit ? 'border-red-500' : 'border-slate-600'
                )}
              />
              {errors.unit && <p className="mt-1 text-sm text-red-400">{errors.unit}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                时间段 <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.timePeriod}
                onChange={(e) => handleInputChange('timePeriod', e.target.value)}
                className={cn(
                  'w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors',
                  errors.timePeriod ? 'border-red-500' : 'border-slate-600'
                )}
              >
                <option value="">请选择时间段</option>
                {timePeriods.map((period) => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
              {errors.timePeriod && <p className="mt-1 text-sm text-red-400">{errors.timePeriod}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                噪音类型 <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.noiseType}
                onChange={(e) => handleInputChange('noiseType', e.target.value)}
                className={cn(
                  'w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors',
                  errors.noiseType ? 'border-red-500' : 'border-slate-600'
                )}
              >
                <option value="">请选择噪音类型</option>
                {Object.entries(NOISE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {errors.noiseType && <p className="mt-1 text-sm text-red-400">{errors.noiseType}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                投诉人 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="请输入投诉人姓名"
                value={formData.complainant}
                onChange={(e) => handleInputChange('complainant', e.target.value)}
                className={cn(
                  'w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors',
                  errors.complainant ? 'border-red-500' : 'border-slate-600'
                )}
              />
              {errors.complainant && <p className="mt-1 text-sm text-red-400">{errors.complainant}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                联系电话 <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                placeholder="请输入手机号码"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={cn(
                  'w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors',
                  errors.phone ? 'border-red-500' : 'border-slate-600'
                )}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              投诉描述 <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="请详细描述噪音情况..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={cn(
                'w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none',
                errors.description ? 'border-red-500' : 'border-slate-600'
              )}
            />
            {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              附件上传
              <span className="text-slate-500 font-normal ml-2">（可选，支持图片和音频）</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer transition-colors group"
            >
              <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3 group-hover:text-blue-400 transition-colors" />
              <p className="text-slate-400 mb-1">点击或拖拽文件到此处上传</p>
              <p className="text-slate-500 text-sm">支持 JPG、PNG、MP3、WAV 等格式</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,audio/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl"
                  >
                    {attachment.type === 'image' ? (
                      <Image className="w-8 h-8 text-blue-400" />
                    ) : (
                      <Mic className="w-8 h-8 text-purple-400" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{attachment.name}</p>
                      <p className="text-xs text-slate-500">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    {attachment.type === 'image' && (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      className="p-1 hover:bg-slate-600 rounded transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium text-white transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  提交投诉
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
