import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Camera } from "lucide-react";
import { useStore } from "@/store";
import { Plant } from "@/types";

interface Props {
  plant?: Plant;
  mode: "create" | "edit";
}

export default function PlantForm({ plant, mode }: Props) {
  const navigate = useNavigate();
  const suppliers = useStore((s) => s.suppliers);
  const addPlant = useStore((s) => s.addPlant);
  const updatePlant = useStore((s) => s.updatePlant);

  const [form, setForm] = useState({
    location: plant?.location || "",
    species: plant?.species || "",
    potDiameter: plant?.potDiameter || 25,
    supplierId: plant?.supplierId || suppliers[0]?.id || "",
    maintenanceFrequency: plant?.maintenanceFrequency || "每周一次",
    photoUrl:
      plant?.photoUrl ||
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=green%20pothos%20plant%20in%20white%20ceramic%20pot%20office%20interior%20natural%20light&image_size=square",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "create") {
      addPlant(form);
    } else if (plant) {
      updatePlant(plant.id, form);
    }
    navigate("/plants");
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-forest-200 bg-white text-forest-800 placeholder-forest-300 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 transition-all";
  const labelClass = "block text-sm font-medium text-forest-700 mb-2";

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/plants")}
        className="flex items-center gap-2 text-forest-600 hover:text-forest-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        返回绿植列表
      </button>

      <div className="bg-white rounded-3xl shadow-card border border-forest-50 overflow-hidden">
        <div className="p-8 border-b border-forest-50 bg-gradient-to-r from-cream-50 to-cream-100">
          <h2 className="font-serif text-2xl font-semibold text-forest-800">
            {mode === "create" ? "新增绿植档案" : "编辑绿植档案"}
          </h2>
          <p className="text-forest-500 mt-1">
            请填写绿植的基本信息以便进行养护管理
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className={labelClass}>绿植照片</label>
            <div className="relative w-48 h-48 rounded-2xl overflow-hidden bg-cream-100 border-2 border-dashed border-forest-200">
              <img
                src={form.photoUrl}
                alt="预览"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-forest-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Camera className="w-6 h-6 text-white" />
                <span className="text-white text-sm">更换图片</span>
              </div>
            </div>
            <p className="text-xs text-forest-400 mt-2">
              建议使用清晰的现场照片
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>摆放位置 *</label>
              <input
                type="text"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="如：前台大厅、会议室A"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>绿植品种 *</label>
              <input
                type="text"
                required
                value={form.species}
                onChange={(e) => setForm({ ...form, species: e.target.value })}
                placeholder="如：绿萝、发财树"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>盆径（cm）*</label>
              <input
                type="number"
                required
                min={10}
                max={100}
                value={form.potDiameter}
                onChange={(e) =>
                  setForm({ ...form, potDiameter: Number(e.target.value) })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>养护频率</label>
              <select
                value={form.maintenanceFrequency}
                onChange={(e) =>
                  setForm({ ...form, maintenanceFrequency: e.target.value })
                }
                className={inputClass}
              >
                <option value="每周一次">每周一次</option>
                <option value="每周两次">每周两次</option>
                <option value="每两周一次">每两周一次</option>
                <option value="每月一次">每月一次</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>供应商</label>
            <select
              value={form.supplierId}
              onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
              className={inputClass}
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.contact}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              <Upload className="w-4 h-4" />
              {mode === "create" ? "创建档案" : "保存修改"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/plants")}
              className="btn btn-secondary"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
