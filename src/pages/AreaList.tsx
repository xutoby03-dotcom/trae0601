import { useEffect, useState } from "react";
import { useStore } from "@/store";
import Button from "@/components/Button";
import Drawer from "@/components/Drawer";
import { Input, Select } from "@/components/FormFields";
import type { Area } from "@/types";
import { Pencil, Trash2, Plus, MapPin, User, Zap, Camera } from "lucide-react";

const emptyForm: Omit<Area, "id" | "createdAt"> = {
  name: "",
  capacity: 0,
  chargingCapacity: 0,
  hasCharging: false,
  manager: "",
  photoUrl: "",
};

export default function AreaList() {
  const { areas, fetchAreas, createArea, updateArea, deleteArea } = useStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Area | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const openEdit = (area: Area) => {
    setEditing(area);
    setForm({
      name: area.name,
      capacity: area.capacity,
      chargingCapacity: area.chargingCapacity,
      hasCharging: area.hasCharging,
      manager: area.manager,
      photoUrl: area.photoUrl,
    });
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateArea(editing.id, form);
      } else {
        await createArea(form);
      }
      setDrawerOpen(false);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此区域吗？关联的车辆数据不会被删除。")) return;
    await deleteArea(id);
  };

  const filtered = areas.filter(
    (a) =>
      a.name.includes(keyword) ||
      a.manager.includes(keyword),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">区域管理</h2>
          <p className="mt-1 text-sm text-slate-500">管理车棚区域档案 · 共 {areas.length} 个区域</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> 新增区域
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <div className="relative w-72">
            <input
              type="text"
              placeholder="搜索区域名或管理员..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
            />
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left text-slate-600">
                <th className="px-5 py-3 font-medium">现场照片</th>
                <th className="px-5 py-3 font-medium">区域名称</th>
                <th className="px-5 py-3 font-medium">总容量</th>
                <th className="px-5 py-3 font-medium">充电位</th>
                <th className="px-5 py-3 font-medium">管理员</th>
                <th className="px-5 py-3 font-medium">创建时间</th>
                <th className="px-5 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((area) => (
                <tr key={area.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="w-16 h-12 rounded-md bg-slate-100 overflow-hidden">
                      {area.photoUrl ? (
                        <img src={area.photoUrl} alt={area.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Camera size={18} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 text-slate-800 font-medium">
                      <MapPin size={14} className="text-primary-500" />
                      {area.name}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{area.capacity} 个</td>
                  <td className="px-5 py-3">
                    {area.hasCharging ? (
                      <span className="inline-flex items-center gap-1 text-primary-600">
                        <Zap size={14} /> {area.chargingCapacity} 个
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <User size={13} className="text-slate-400" />
                      {area.manager || "未指派"}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(area.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(area)}
                        className="p-1.5 rounded-md text-slate-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        title="编辑"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(area.id)}
                        className="p-1.5 rounded-md text-slate-500 hover:bg-danger-50 hover:text-danger-600 transition-colors"
                        title="删除"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-slate-400">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "编辑车棚区域" : "新增车棚区域"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="区域名称"
            required
            placeholder="如：1号楼东侧车棚"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="总容量（个）"
              required
              type="number"
              min={0}
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
            />
            <Input
              label="充电位数（个）"
              type="number"
              min={0}
              value={form.chargingCapacity}
              onChange={(e) => setForm({ ...form, chargingCapacity: Number(e.target.value) })}
            />
          </div>
          <Select
            label="是否带充电"
            value={form.hasCharging ? "yes" : "no"}
            onChange={(e) => setForm({ ...form, hasCharging: e.target.value === "yes" })}
            options={[
              { value: "no", label: "不带充电" },
              { value: "yes", label: "带充电" },
            ]}
          />
          <Input
            label="管理员"
            placeholder="管理员姓名"
            value={form.manager}
            onChange={(e) => setForm({ ...form, manager: e.target.value })}
          />
          <Input
            label="现场照片 URL"
            placeholder="图片链接地址"
            value={form.photoUrl}
            onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
          />
          {form.photoUrl && (
            <div className="rounded-md border border-slate-200 overflow-hidden">
              <img src={form.photoUrl} alt="预览" className="w-full h-40 object-cover" />
            </div>
          )}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={() => setDrawerOpen(false)} className="flex-1">
              取消
            </Button>
            <Button type="submit" className="flex-1">
              {editing ? "保存修改" : "创建区域"}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
