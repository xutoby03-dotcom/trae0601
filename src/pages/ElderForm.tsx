import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Camera,
  MapPin,
  Heart,
  Scissors,
  Phone,
  FileText,
  Save,
} from "lucide-react";
import { useElderStore } from "../store/useElderStore";
import type { Elder, MobilityType } from "../types/elder";
import { mobilityLabels } from "../types/elder";

interface ElderFormProps {
  mode: "create" | "edit";
}

export function ElderForm({ mode }: ElderFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getElder, addElder, updateElder, loadElders } = useElderStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Elder>>({
    name: "",
    gender: "male",
    age: 70,
    address: "",
    mobility: "normal",
    allergies: "",
    usualHairstyle: "",
    contactName: "",
    contactPhone: "",
    photo: "",
    notes: "",
  });

  useEffect(() => {
    loadElders();
  }, [loadElders]);

  useEffect(() => {
    if (mode === "edit" && id) {
      const elder = getElder(id);
      if (elder) {
        setFormData(elder);
      }
    }
  }, [mode, id, getElder]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "number") {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.contactName || !formData.contactPhone) {
      alert("请填写必填项");
      return;
    }

    if (mode === "create") {
      addElder(formData as Omit<Elder, "id" | "createdAt" | "updatedAt">);
      navigate("/elders");
    } else if (mode === "edit" && id) {
      updateElder(id, formData);
      navigate(`/elders/${id}`);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(mode === "edit" && id ? `/elders/${id}` : "/elders")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          返回
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {mode === "create" ? "新建老人档案" : "编辑老人档案"}
        </h1>
        <p className="text-gray-500 mb-8">
          请填写老人的基本信息，带 * 为必填项
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex items-center gap-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-28 rounded-2xl bg-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden group"
            >
              {formData.photo ? (
                <img
                  src={formData.photo}
                  alt="老人照片"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <Camera size={28} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">上传照片</span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <div>
              <p className="text-gray-800 font-medium">老人照片</p>
              <p className="text-sm text-gray-500 mt-1">
                建议上传清晰的正面照片
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-2"
              >
                点击上传
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="inline mr-2" />
                姓名 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="请输入姓名"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                性别
              </label>
              <div className="flex gap-4">
                {["male", "female"].map((g) => (
                  <label
                    key={g}
                    className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                      formData.gender === g
                        ? "border-primary-400 bg-primary-50 text-primary-600"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={formData.gender === g}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {g === "male" ? "男" : "女"}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                年龄
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="50"
                max="120"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Heart size={16} className="inline mr-2" />
                行动情况
              </label>
              <select
                name="mobility"
                value={formData.mobility}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all bg-white"
              >
                {(Object.keys(mobilityLabels) as MobilityType[]).map((key) => (
                  <option key={key} value={key}>
                    {mobilityLabels[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} className="inline mr-2" />
              地址 <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="请输入详细地址"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Heart size={16} className="inline mr-2" />
                过敏史
              </label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="如：青霉素过敏、花粉过敏"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Scissors size={16} className="inline mr-2" />
                常用发型
              </label>
              <input
                type="text"
                name="usualHairstyle"
                value={formData.usualHairstyle}
                onChange={handleChange}
                placeholder="如：短发齐耳、平头"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
              />
            </div>
          </div>

          <div className="bg-primary-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              紧急联系人
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  联系人姓名 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="请输入联系人姓名及关系"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  联系电话 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="请输入联系电话"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="inline mr-2" />
              备注
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="其他需要注意的事项"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
            <Link
              to={mode === "edit" && id ? `/elders/${id}` : "/elders"}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
            >
              取消
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
            >
              <Save size={20} />
              {mode === "create" ? "创建档案" : "保存修改"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
