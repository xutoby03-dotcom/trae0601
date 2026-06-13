import { useState } from "react";
import { Camera } from "lucide-react";
import type { PetFormData, Species } from "../types";
import { useNavigate, useParams } from "react-router-dom";
import { usePetStore } from "../store/petStore";
import { todayStr } from "../utils/date";

export default function PetForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const existing = usePetStore((s) => (id ? s.getPet(id) : undefined));
  const addPet = usePetStore((s) => s.addPet);
  const updatePet = usePetStore((s) => s.updatePet);

  const [form, setForm] = useState<PetFormData>({
    name: existing?.name ?? "",
    species: existing?.species ?? "cat",
    breed: existing?.breed ?? "",
    weight: existing?.weight ?? 0,
    weightUnit: existing?.weightUnit ?? "kg",
    birthDate: existing?.birthDate ?? todayStr(),
    allergies: existing?.allergies ?? "",
    photoUrl:
      existing?.photoUrl ??
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20pet%20portrait%20soft%20lighting%20pastel%20background%20realistic&image_size=square",
  });
  const [error, setError] = useState("");

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, photoUrl: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("请填写宠物名字");
    if (!form.breed.trim()) return setError("请填写品种");
    if (form.weight <= 0) return setError("请填写有效体重");

    if (existing) {
      updatePet(existing.id, form);
      navigate(`/pet/${existing.id}`);
    } else {
      const newPet = addPet(form);
      navigate(`/pet/${newPet.id}`);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5 animate-fade-in-up">
      <div className="card p-6">
        <h2 className="section-title mb-5">
          {existing ? "编辑宠物档案" : "新建宠物档案"}
        </h2>

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0">
            <label className="block cursor-pointer group">
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-dashed border-ink-200 group-hover:border-warm-400 transition-colors">
                <img
                  src={form.photoUrl}
                  alt="照片预览"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
            <p className="text-xs text-ink-400 mt-2 text-center">点击上传照片</p>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">名字</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例如：橘子"
              />
            </div>
            <div>
              <label className="label">物种</label>
              <div className="flex gap-2">
                {(["cat", "dog"] as Species[]).map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setForm({ ...form, species: s })}
                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      form.species === s
                        ? "bg-warm-500 text-white shadow-warm"
                        : "bg-ink-50 text-ink-500 hover:bg-ink-100"
                    }`}
                  >
                    {s === "cat" ? "🐱 猫咪" : "🐶 狗狗"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">品种</label>
              <input
                className="input"
                value={form.breed}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
                placeholder="例如：中华田园猫"
              />
            </div>
            <div>
              <label className="label">出生日期</label>
              <input
                type="date"
                className="input"
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">体重</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  className="input flex-1"
                  value={form.weight || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      weight: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="例如：4.5"
                />
                <select
                  className="input w-20"
                  value={form.weightUnit}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      weightUnit: e.target.value as "kg" | "lb",
                    })
                  }
                >
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="label">过敏史</label>
              <textarea
                className="input min-h-[80px] resize-none"
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                placeholder="如有食物或药物过敏请在此说明，没有则填“无”"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-alert-50 text-alert-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-ink-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-ghost"
          >
            取消
          </button>
          <button type="submit" className="btn-primary">
            {existing ? "保存修改" : "创建档案"}
          </button>
        </div>
      </div>
    </form>
  );
}
