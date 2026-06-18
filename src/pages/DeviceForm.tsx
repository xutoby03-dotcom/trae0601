import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Camera } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { DeviceType } from "@/types";
import { DEVICE_TYPE_LABELS } from "@/types";
import { cn } from "@/utils/helpers";

export default function DeviceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addDevice, updateDevice, getDeviceById } = useAppStore();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    type: "rollator" as DeviceType,
    serialNumber: "",
    userName: "",
    heightAdapt: "",
    purchaseDate: "",
    foldType: "",
    photo: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      const device = getDeviceById(id);
      if (device) {
        setFormData({
          type: device.type,
          serialNumber: device.serialNumber,
          userName: device.userName,
          heightAdapt: device.heightAdapt,
          purchaseDate: device.purchaseDate,
          foldType: device.foldType,
          photo: device.photo,
        });
      }
    }
  }, [isEdit, id, getDeviceById]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = "请输入设备编号";
    }
    if (!formData.userName.trim()) {
      newErrors.userName = "请输入使用人姓名";
    }
    if (!formData.heightAdapt.trim()) {
      newErrors.heightAdapt = "请输入身高适配范围";
    }
    if (!formData.purchaseDate) {
      newErrors.purchaseDate = "请选择购买日期";
    }
    if (!formData.foldType.trim()) {
      newErrors.foldType = "请输入折叠方式";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEdit && id) {
      updateDevice(id, formData);
    } else {
      addDevice(formData);
    }
    navigate("/devices");
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

  const generateDefaultPhoto = () => {
    const prompts = [
      "elderly rollator walker silver color with seat and basket product photography",
      "lightweight folding aluminum walker for elderly blue color product photography",
      "standard medical walker frame stainless steel for senior citizens product photo",
    ];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    const encodedPrompt = encodeURIComponent(randomPrompt);
    const photoUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodedPrompt}&image_size=square`;
    setFormData({ ...formData, photo: photoUrl });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/devices")}
          className="p-2 rounded-xl hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEdit ? "✏️ 编辑设备档案" : "➕ 新增设备档案"}
          </h1>
          <p className="text-gray-500 text-sm">
            {isEdit ? "修改设备的基本信息" : "录入助行器的基本信息"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 card-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">设备照片</h2>
          <div className="flex items-center gap-6">
            <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              {formData.photo ? (
                <img
                  src={formData.photo}
                  alt="设备照片"
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
                onClick={generateDefaultPhoto}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                🎨 生成示例照片
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 card-shadow space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                设备类型 <span className="text-warning-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as DeviceType })
                }
                className="input-field"
              >
                {Object.entries(DEVICE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                设备编号 <span className="text-warning-500">*</span>
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) =>
                  setFormData({ ...formData, serialNumber: e.target.value })
                }
                placeholder="如：ZX-2024-001"
                className={cn("input-field", errors.serialNumber && "border-warning-400")}
              />
              {errors.serialNumber && (
                <p className="text-warning-500 text-sm mt-1">{errors.serialNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                使用人 <span className="text-warning-500">*</span>
              </label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) =>
                  setFormData({ ...formData, userName: e.target.value })
                }
                placeholder="如：王奶奶"
                className={cn("input-field", errors.userName && "border-warning-400")}
              />
              {errors.userName && (
                <p className="text-warning-500 text-sm mt-1">{errors.userName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                身高适配 <span className="text-warning-500">*</span>
              </label>
              <input
                type="text"
                value={formData.heightAdapt}
                onChange={(e) =>
                  setFormData({ ...formData, heightAdapt: e.target.value })
                }
                placeholder="如：155-165cm"
                className={cn("input-field", errors.heightAdapt && "border-warning-400")}
              />
              {errors.heightAdapt && (
                <p className="text-warning-500 text-sm mt-1">{errors.heightAdapt}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                购买日期 <span className="text-warning-500">*</span>
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) =>
                  setFormData({ ...formData, purchaseDate: e.target.value })
                }
                className={cn("input-field", errors.purchaseDate && "border-warning-400")}
              />
              {errors.purchaseDate && (
                <p className="text-warning-500 text-sm mt-1">{errors.purchaseDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                折叠方式 <span className="text-warning-500">*</span>
              </label>
              <input
                type="text"
                value={formData.foldType}
                onChange={(e) =>
                  setFormData({ ...formData, foldType: e.target.value })
                }
                placeholder="如：一键折叠、两侧折叠、不可折叠"
                className={cn("input-field", errors.foldType && "border-warning-400")}
              />
              {errors.foldType && (
                <p className="text-warning-500 text-sm mt-1">{errors.foldType}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate("/devices")}
            className="btn-secondary"
          >
            取消
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-5 h-5" />
            {isEdit ? "保存修改" : "保存档案"}
          </button>
        </div>
      </form>
    </div>
  );
}
