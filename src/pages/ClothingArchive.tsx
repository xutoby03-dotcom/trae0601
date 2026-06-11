import { useState, useMemo } from "react";
import { Plus, Search, Filter, Pencil, Trash2, Shirt } from "lucide-react";
import { useStore } from "@/store/useStore";
import ClothingCard from "@/components/ClothingCard";
import ClothingFormModal from "@/components/ClothingFormModal";
import type { Clothing } from "@/types";
import { MATERIAL_LABELS, COLOR_CATEGORY_LABELS } from "@/types";

export default function ClothingArchive() {
  const clothings = useStore((s) => s.clothings);
  const members = useStore((s) => s.members);
  const deleteClothing = useStore((s) => s.deleteClothing);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClothing, setEditingClothing] = useState<Clothing | null>(null);
  const [search, setSearch] = useState("");
  const [filterMember, setFilterMember] = useState("all");
  const [filterColor, setFilterColor] = useState("all");
  const [filterMaterial, setFilterMaterial] = useState("all");

  const filteredClothes = useMemo(() => {
    return clothings.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (filterMember !== "all" && c.memberId !== filterMember) return false;
      if (filterColor !== "all" && c.colorCategory !== filterColor) return false;
      if (filterMaterial !== "all" && c.material !== filterMaterial) return false;
      return true;
    });
  }, [clothings, search, filterMember, filterColor, filterMaterial]);

  const handleEdit = (c: Clothing) => {
    setEditingClothing(c);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingClothing(null);
    setIsModalOpen(true);
  };

  return (
    <div className="container py-6">
      <div className="mb-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-neutral-800">
              🧺 衣物档案
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              录入并管理家中所有衣物，让洗衣更安心
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-elevated transition-all hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <Plus className="h-4 w-4" />
            添加新衣物
          </button>
        </div>
      </div>

      <div className="mb-5 rounded-2xl bg-white/70 p-4 shadow-soft backdrop-blur animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索衣物名称..."
              className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-all focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-400" />
            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
            >
              <option value="all">全部成员</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.avatar} {m.name}
                </option>
              ))}
            </select>
            <select
              value={filterColor}
              onChange={(e) => setFilterColor(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
            >
              <option value="all">全部颜色</option>
              {(Object.keys(COLOR_CATEGORY_LABELS) as Array<keyof typeof COLOR_CATEGORY_LABELS>).map(
                (k) => (
                  <option key={k} value={k}>
                    {COLOR_CATEGORY_LABELS[k]}
                  </option>
                )
              )}
            </select>
            <select
              value={filterMaterial}
              onChange={(e) => setFilterMaterial(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
            >
              <option value="all">全部材质</option>
              {(Object.keys(MATERIAL_LABELS) as Array<keyof typeof MATERIAL_LABELS>).map(
                (k) => (
                  <option key={k} value={k}>
                    {MATERIAL_LABELS[k]}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>

      {filteredClothes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white/60 py-20 shadow-soft animate-fade-in">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50">
            <Shirt className="h-10 w-10 text-primary-400" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-neutral-700">
            {clothings.length === 0 ? "还没有衣物档案" : "没有符合条件的衣物"}
          </h3>
          <p className="mb-5 text-sm text-neutral-500">
            {clothings.length === 0
              ? "点击右上角按钮，开始录入您的第一件衣物"
              : "试试调整搜索和筛选条件"}
          </p>
          {clothings.length === 0 && (
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-medium text-white shadow-card transition-all hover:bg-primary-600"
            >
              <Plus className="h-4 w-4" />
              添加第一件衣物
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredClothes.map((c, idx) => (
            <div
              key={c.id}
              className="group animate-fade-in"
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <ClothingCard clothing={c} selectable onClick={() => handleEdit(c)} />
              <div className="mt-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => handleEdit(c)}
                  className="flex-1 rounded-lg bg-primary-50 px-2 py-1 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-100"
                >
                  <Pencil className="mr-1 inline h-3 w-3" />
                  编辑
                </button>
                <button
                  onClick={() => {
                    if (confirm(`确定删除"${c.name}"？`)) deleteClothing(c.id);
                  }}
                  className="flex-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                >
                  <Trash2 className="mr-1 inline h-3 w-3" />
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ClothingFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClothing(null);
        }}
        editingClothing={editingClothing}
      />
    </div>
  );
}
