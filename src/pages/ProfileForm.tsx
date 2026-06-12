import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, X, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import type { ElderProfile } from "@/types";

const profileSchema = z.object({
  name: z.string().min(1, "请输入姓名"),
  age: z.number().min(1, "请输入有效年龄").max(150, "请输入有效年龄"),
  avatar: z.string().min(1, "请选择头像"),
  medications: z.array(z.string()).default([]),
  targetRange: z.object({
    systolicMin: z.number().min(50).max(200),
    systolicMax: z.number().min(50).max(200),
    diastolicMin: z.number().min(30).max(150),
    diastolicMax: z.number().min(30).max(150),
  }),
  emergencyContact: z.object({
    name: z.string().min(1, "请输入联系人姓名"),
    phone: z.string().min(1, "请输入联系电话"),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const AVATAR_OPTIONS = [
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elderly%20chinese%20grandfather%20portrait%20warm%20smile%20kind%20face&image_size=square",
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elderly%20chinese%20grandmother%20portrait%20gentle%20smile%20silver%20hair&image_size=square",
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elderly%20man%20portrait%20friendly%20asian%20grandpa&image_size=square",
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elderly%20woman%20portrait%20kind%20asian%20grandma&image_size=square",
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=senior%20asian%20man%20portrait%20smiling%20glasses&image_size=square",
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=senior%20asian%20woman%20portrait%20gentle%20smile&image_size=square",
];

export default function ProfileForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { profiles, addProfile, updateProfile } = useAppStore();
  const isEditing = !!id;

  const editingProfile = id ? profiles.find((p) => p.id === id) : null;

  const [medicationInput, setMedicationInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: editingProfile
      ? {
          name: editingProfile.name,
          age: editingProfile.age,
          avatar: editingProfile.avatar,
          medications: editingProfile.medications,
          targetRange: editingProfile.targetRange,
          emergencyContact: editingProfile.emergencyContact,
        }
      : {
          name: "",
          age: 70,
          avatar: AVATAR_OPTIONS[0],
          medications: [],
          targetRange: {
            systolicMin: 90,
            systolicMax: 140,
            diastolicMin: 60,
            diastolicMax: 90,
          },
          emergencyContact: {
            name: "",
            phone: "",
          },
        },
  });

  const medications = watch("medications");
  const selectedAvatar = watch("avatar");

  useEffect(() => {
    if (editingProfile) {
      setValue("medications", editingProfile.medications);
    }
  }, [editingProfile, setValue]);

  const addMedication = () => {
    if (medicationInput.trim() && !medications.includes(medicationInput.trim())) {
      setValue("medications", [...medications, medicationInput.trim()]);
      setMedicationInput("");
    }
  };

  const removeMedication = (med: string) => {
    setValue(
      "medications",
      medications.filter((m) => m !== med)
    );
  };

  const onSubmit = (data: ProfileFormData) => {
    const profileData = data as unknown as Omit<ElderProfile, "id" | "createdAt" | "updatedAt">;
    if (isEditing && id) {
      updateProfile(id, profileData);
    } else {
      addProfile(profileData);
    }
    navigate("/profiles");
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/profiles")}
          className="p-2.5 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="page-title">{isEditing ? "编辑档案" : "新增老人档案"}</h1>
          <p className="text-gray-500 mt-1">填写老人的基本健康信息</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            基本信息
          </h2>

          <div className="mb-6">
            <label className="label-text">选择头像</label>
            <div className="grid grid-cols-6 gap-3">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setValue("avatar", avatar)}
                  className={cn(
                    "relative rounded-2xl overflow-hidden aspect-square border-2 transition-all",
                    selectedAvatar === avatar
                      ? "border-primary-600 ring-4 ring-primary-100"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <img src={avatar} alt="头像" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label-text">姓名</label>
              <input
                {...register("name")}
                type="text"
                className="input-field"
                placeholder="请输入姓名"
              />
              {errors.name && <p className="text-danger-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label-text">年龄</label>
              <input
                {...register("age", { valueAsNumber: true })}
                type="number"
                className="input-field"
                placeholder="请输入年龄"
              />
              {errors.age && <p className="text-danger-500 text-sm mt-1">{errors.age.message}</p>}
            </div>
          </div>

          <div>
            <label className="label-text">常用药</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={medicationInput}
                onChange={(e) => setMedicationInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMedication())}
                className="input-field flex-1"
                placeholder="输入药品名称，按回车添加"
              />
              <button type="button" onClick={addMedication} className="btn-secondary">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {medications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {medications.map((med) => (
                  <span key={med} className="tag bg-primary-50 text-primary-700 gap-1.5">
                    {med}
                    <button type="button" onClick={() => removeMedication(med)} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title mb-4">目标血压范围 (mmHg)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label-text">高压下限</label>
              <input
                {...register("targetRange.systolicMin", { valueAsNumber: true })}
                type="number"
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">高压上限</label>
              <input
                {...register("targetRange.systolicMax", { valueAsNumber: true })}
                type="number"
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">低压下限</label>
              <input
                {...register("targetRange.diastolicMin", { valueAsNumber: true })}
                type="number"
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">低压上限</label>
              <input
                {...register("targetRange.diastolicMax", { valueAsNumber: true })}
                type="number"
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title mb-4">紧急联系人</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-text">联系人姓名</label>
              <input
                {...register("emergencyContact.name")}
                type="text"
                className="input-field"
                placeholder="如：张三（儿子）"
              />
              {errors.emergencyContact?.name && (
                <p className="text-danger-500 text-sm mt-1">{errors.emergencyContact.name.message}</p>
              )}
            </div>
            <div>
              <label className="label-text">联系电话</label>
              <input
                {...register("emergencyContact.phone")}
                type="tel"
                className="input-field"
                placeholder="请输入联系电话"
              />
              {errors.emergencyContact?.phone && (
                <p className="text-danger-500 text-sm mt-1">{errors.emergencyContact.phone.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate("/profiles")} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary">
            {isEditing ? "保存修改" : "创建档案"}
          </button>
        </div>
      </form>
    </div>
  );
}
