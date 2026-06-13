import { useState, useEffect, useMemo } from "react";
import { X, Image as ImageIcon, Save, Sparkles } from "lucide-react";
import { useInstrumentStore } from "@/store/instrumentStore";
import { useUserStore } from "@/store/userStore";
import { INSTRUMENT_TYPES, CLASSROOMS } from "@/types";
import type { Instrument } from "@/types";

interface InstrumentFormModalProps {
  editingInstrument: Instrument | null;
  onClose: () => void;
}

const generateInstrumentId = () => {
  const random = Math.floor(100000 + Math.random() * 900000).toString().slice(-4);
  return `INS-${random}`;
};

export default function InstrumentFormModal({
  editingInstrument,
  onClose,
}: InstrumentFormModalProps) {
  const addInstrument = useInstrumentStore((s) => s.addInstrument);
  const updateInstrument = useInstrumentStore((s) => s.updateInstrument);
  const users = useUserStore((s) => s.users);
  const getUsersByRole = useUserStore((s) => s.getUsersByRole);
  const teachers = useMemo(
    () => getUsersByRole("teacher"),
    [users, getUsersByRole]
  );

  const [formData, setFormData] = useState({
    id: "",
    type: INSTRUMENT_TYPES[0],
    brand: "",
    classroom: CLASSROOMS[0],
    teacherId: teachers[0]?.id || "",
    photo: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreviewError, setPhotoPreviewError] = useState(false);

  useEffect(() => {
    if (editingInstrument) {
      setFormData({
        id: editingInstrument.id,
        type: editingInstrument.type,
        brand: editingInstrument.brand,
        classroom: editingInstrument.classroom,
        teacherId: editingInstrument.teacherId,
        photo: editingInstrument.photo,
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        id: generateInstrumentId(),
      }));
    }
  }, [editingInstrument, teachers]);

  const updateField = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (key === "photo") {
      setPhotoPreviewError(false);
    }
  };

  const regenerateId = () => {
    updateField("id", generateInstrumentId());
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!formData.id.trim()) next.id = "请输入乐器编号";
    if (!formData.type.trim()) next.type = "请选择乐器类型";
    if (!formData.brand.trim()) next.brand = "请输入品牌";
    if (!formData.classroom.trim()) next.classroom = "请选择存放教室";
    if (!formData.teacherId) next.teacherId = "请选择责任老师";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      type: formData.type.trim(),
      brand: formData.brand.trim(),
      classroom: formData.classroom,
      teacherId: formData.teacherId,
      photo: formData.photo.trim(),
    };

    setTimeout(() => {
      if (editingInstrument) {
        updateInstrument(editingInstrument.id, {
          ...payload,
          id: formData.id.trim(),
        });
      } else {
        addInstrument(payload);
      }
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  const isEdit = !!editingInstrument;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-walnut-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-walnut-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-walnut-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-walnut-800">
                {isEdit ? "编辑乐器" : "新增乐器"}
              </h2>
              <p className="text-xs text-walnut-400 mt-0.5">
                {isEdit ? "修改乐器档案信息" : "录入新乐器档案"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-walnut-500 hover:bg-walnut-100 hover:text-walnut-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-1">
              <label className="label">乐器编号</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => updateField("id", e.target.value)}
                  className={`input font-mono pr-12 ${
                    errors.id ? "border-brick-400 focus:ring-brick-400/40" : ""
                  }`}
                  placeholder="INS-XXXX"
                />
                {!isEdit && (
                  <button
                    type="button"
                    onClick={regenerateId}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-walnut-400 hover:text-walnut-600 hover:bg-walnut-100 transition-colors"
                    title="重新生成"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>
              {errors.id && (
                <p className="mt-1.5 text-xs text-brick-600">{errors.id}</p>
              )}
            </div>

            <div>
              <label className="label">乐器类型</label>
              <select
                value={formData.type}
                onChange={(e) => updateField("type", e.target.value)}
                className={`input ${
                  errors.type ? "border-brick-400 focus:ring-brick-400/40" : ""
                }`}
              >
                {INSTRUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1.5 text-xs text-brick-600">{errors.type}</p>
              )}
            </div>

            <div>
              <label className="label">品牌</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => updateField("brand", e.target.value)}
                placeholder="例如：雅马哈、斯特拉迪瓦里"
                className={`input ${
                  errors.brand ? "border-brick-400 focus:ring-brick-400/40" : ""
                }`}
              />
              {errors.brand && (
                <p className="mt-1.5 text-xs text-brick-600">{errors.brand}</p>
              )}
            </div>

            <div>
              <label className="label">存放教室</label>
              <select
                value={formData.classroom}
                onChange={(e) => updateField("classroom", e.target.value)}
                className={`input ${
                  errors.classroom
                    ? "border-brick-400 focus:ring-brick-400/40"
                    : ""
                }`}
              >
                {CLASSROOMS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.classroom && (
                <p className="mt-1.5 text-xs text-brick-600">
                  {errors.classroom}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="label">责任老师</label>
              <select
                value={formData.teacherId}
                onChange={(e) => updateField("teacherId", e.target.value)}
                className={`input ${
                  errors.teacherId
                    ? "border-brick-400 focus:ring-brick-400/40"
                    : ""
                }`}
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}（{t.id}）
                  </option>
                ))}
              </select>
              {errors.teacherId && (
                <p className="mt-1.5 text-xs text-brick-600">
                  {errors.teacherId}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="label">照片</label>
              <div className="flex gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={formData.photo}
                    onChange={(e) => updateField("photo", e.target.value)}
                    placeholder="输入图片URL地址"
                    className="input"
                  />
                  <p className="text-xs text-walnut-400">
                    支持 https:// 图片链接，建议使用 1:1 比例的正方形图片
                  </p>
                </div>
                <div className="w-28 h-28 flex-shrink-0 rounded-xl border-2 border-dashed border-walnut-200 bg-walnut-50/50 overflow-hidden flex items-center justify-center">
                  {formData.photo && !photoPreviewError ? (
                    <img
                      src={formData.photo}
                      alt="预览"
                      className="w-full h-full object-cover"
                      onError={() => setPhotoPreviewError(true)}
                    />
                  ) : (
                    <div className="text-center p-3">
                      <ImageIcon className="w-7 h-7 text-walnut-300 mx-auto mb-1" />
                      <p className="text-[10px] text-walnut-400 leading-tight">
                        {formData.photo ? "图片加载失败" : "预览图"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-walnut-50/60 border-t border-walnut-100">
          <button type="button" onClick={onClose} className="btn-ghost">
            取消
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? "保存修改" : "确认新增"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
