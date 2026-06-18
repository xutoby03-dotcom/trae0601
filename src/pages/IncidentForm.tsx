import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Camera,
  MapPin,
  User,
  FileText,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { IncidentType } from "@/types";
import { INCIDENT_TYPE_LABELS, type Incident } from "@/types";
import { cn } from "@/utils/helpers";

export default function IncidentForm() {
  const navigate = useNavigate();
  const { devices, addIncident } = useAppStore();

  const [formData, setFormData] = useState({
    deviceId: devices[0]?.id || "",
    type: "fall" as IncidentType,
    location: "",
    photo: "",
    description: "",
    reporter: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const incidentTypes: { type: IncidentType; emoji: string; desc: string }[] = [
    { type: "fall", emoji: "😰", desc: "外出摔倒" },
    { type: "brake_failure", emoji: "🛑", desc: "刹不住车" },
    { type: "noise", emoji: "🔊", desc: "异常响声" },
    { type: "uneven", emoji: "↪️", desc: "推行偏斜" },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.deviceId) {
      newErrors.deviceId = "请选择设备";
    }
    if (!formData.location.trim()) {
      newErrors.location = "请输入发生地点";
    }
    if (!formData.description.trim()) {
      newErrors.description = "请输入详细描述";
    }
    if (!formData.reporter.trim()) {
      newErrors.reporter = "请输入上报人姓名";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const incidentData: Omit<Incident, "id"> = {
      deviceId: formData.deviceId,
      type: formData.type,
      location: formData.location.trim(),
      photo: formData.photo || getDefaultPhoto(formData.type),
      incidentDate: new Date().toISOString(),
      description: formData.description.trim(),
      reporter: formData.reporter.trim(),
    };

    const { repairTask } = addIncident(incidentData);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      navigate("/repairs");
    }, 2500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getDefaultPhoto = (type: IncidentType): string => {
    const prompts: Record<IncidentType, string> = {
      fall: "elderly person walker fall incident in park path realistic",
      brake_failure: "elderly walker brake failure problem close up",
      noise: "old walker making squeaky noise indoors",
      uneven: "walker wheel alignment problem uneven walking",
    };
    const encodedPrompt = encodeURIComponent(prompts[type]);
    return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodedPrompt}&image_size=square`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/incidents")}
          className="p-2 rounded-xl hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🚨 上报异常</h1>
          <p className="text-gray-500 text-sm">
            记录设备异常情况，自动生成维修任务
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-warning-500 to-orange-500 rounded-3xl p-6 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg">安全提示</h3>
            <p className="text-white/80 text-sm">
              如遇紧急情况，请先确保人员安全，再记录异常信息
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 card-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">异常类型</h2>
          <div className="grid grid-cols-2 gap-3">
            {incidentTypes.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    type: item.type,
                    photo: getDefaultPhoto(item.type),
                  })
                }
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all text-center",
                  formData.type === item.type
                    ? "border-warning-500 bg-warning-50"
                    : "border-gray-200 hover:border-warning-200"
                )}
              >
                <div className="text-4xl mb-2">{item.emoji}</div>
                <p className="font-semibold text-gray-800">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 card-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">选择设备</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {devices.map((device) => (
              <button
                key={device.id}
                type="button"
                onClick={() => setFormData({ ...formData, deviceId: device.id })}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left",
                  formData.deviceId === device.id
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-primary-200"
                )}
              >
                <img
                  src={device.photo}
                  alt={device.userName}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {device.userName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {device.serialNumber}
                  </p>
                </div>
                {formData.deviceId === device.id && (
                  <CheckCircle2 className="w-5 h-5 text-primary-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
          {errors.deviceId && (
            <p className="text-warning-500 text-sm mt-2">{errors.deviceId}</p>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 card-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">现场照片</h2>
          <div className="flex items-center gap-6">
            <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              {formData.photo ? (
                <img
                  src={formData.photo}
                  alt="现场照片"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div className="flex flex-col gap-3">
              <label className="btn-secondary cursor-pointer flex items-center justify-center gap-2">
                <Camera className="w-5 h-5" />
                上传照片
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, photo: getDefaultPhoto(formData.type) })
                }
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                🎨 生成示例照片
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 card-shadow space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">详细信息</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1 text-warning-500" />
              发生地点 <span className="text-warning-500">*</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="如：小区花园小径、社区医院门口"
              className={cn("input-field", errors.location && "border-warning-400")}
            />
            {errors.location && (
              <p className="text-warning-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1 text-primary-500" />
              详细描述 <span className="text-warning-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="请详细描述异常发生的经过、设备状况等..."
              rows={4}
              className={cn("input-field resize-none", errors.description && "border-warning-400")}
            />
            {errors.description && (
              <p className="text-warning-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1 text-medical-500" />
              上报人 <span className="text-warning-500">*</span>
            </label>
            <input
              type="text"
              value={formData.reporter}
              onChange={(e) =>
                setFormData({ ...formData, reporter: e.target.value })
              }
              placeholder="请输入上报人姓名"
              className={cn("input-field", errors.reporter && "border-warning-400")}
            />
            {errors.reporter && (
              <p className="text-warning-500 text-sm mt-1">{errors.reporter}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate("/incidents")}
            className="btn-secondary"
          >
            取消
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-5 h-5" />
            提交并生成维修任务
          </button>
        </div>
      </form>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm mx-4 animate-bounce-in">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">提交成功！</h3>
            <p className="text-gray-600 mb-4">
              异常记录已保存，维修任务已自动生成
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="btn-primary flex items-center justify-center gap-2 mx-auto"
            >
              查看维修任务
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
