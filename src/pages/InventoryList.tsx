import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { Plus, Shirt, Package, Footprints, Ribbon, Sparkles, Edit2, Trash2, Hash, X, Filter, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { ClothingCategory, ClothingStatus, ClothingItem } from "@/types";
import { formatDateTime } from "@/utils/formatters";

const CATEGORIES: ClothingCategory[] = ["上衣", "裙裤", "鞋子", "领结", "发饰"];

const CATEGORY_ICONS: Record<ClothingCategory, typeof Shirt> = {
  "上衣": Shirt,
  "裙裤": Package,
  "鞋子": Footprints,
  "领结": Ribbon,
  "发饰": Sparkles,
};

const STATUS_COLORS: Record<ClothingStatus, string> = {
  "完好": "bg-green-100 text-green-700",
  "待修": "bg-amber-100 text-amber-700",
  "改衣中": "bg-blue-100 text-blue-700",
  "遗失": "bg-red-100 text-red-700",
  "清洗中": "bg-purple-100 text-purple-700",
};

export default function InventoryList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { category: paramCategory } = useParams();

  const searchParams = new URLSearchParams(location.search);
  const sizeParam = searchParams.get("size");

  const initialCategory = (paramCategory && CATEGORIES.includes(paramCategory as ClothingCategory))
    ? (paramCategory as ClothingCategory)
    : null;

  const [activeCategory, setActiveCategory] = useState<ClothingCategory | "全部">(initialCategory || "全部");
  const [sizeFilter, setSizeFilter] = useState<string | null>(sizeParam);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);

  const { clothingItems, addClothingItem, updateClothingItem, deleteClothingItem } = useAppStore();

  useEffect(() => {
    setSizeFilter(sizeParam);
  }, [sizeParam]);

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  const clearSizeFilter = () => {
    if (activeCategory === "全部") {
      navigate("/inventory", { replace: true });
    } else {
      navigate(`/inventory/${encodeURIComponent(activeCategory)}`, { replace: true });
    }
    setSizeFilter(null);
  };

  const handleCategoryChange = (cat: ClothingCategory | "全部") => {
    setActiveCategory(cat);
    if (sizeFilter) {
      if (cat === "全部") {
        navigate(`/inventory?size=${encodeURIComponent(sizeFilter)}`, { replace: true });
      } else {
        navigate(`/inventory/${encodeURIComponent(cat)}?size=${encodeURIComponent(sizeFilter)}`, { replace: true });
      }
    }
  };

  let filtered = activeCategory === "全部"
    ? clothingItems
    : clothingItems.filter((i) => i.category === activeCategory);

  if (sizeFilter) {
    filtered = filtered.filter((i) => i.size === sizeFilter);
  }

  const groupedByCategory = CATEGORIES.map((cat) => ({
    category: cat,
    count: clothingItems.filter((i) => i.category === cat).reduce((sum, i) => sum + i.quantity, 0),
  }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      category: formData.get("category") as ClothingCategory,
      size: formData.get("size") as string,
      quantity: Number(formData.get("quantity")),
      status: formData.get("status") as ClothingStatus,
      setNumber: formData.get("setNumber") as string,
    };

    if (editingItem) {
      updateClothingItem(editingItem.id, data);
    } else {
      addClothingItem(data);
    }
    setShowModal(false);
    setEditingItem(null);
  };

  const openAddModal = (category?: ClothingCategory) => {
    setEditingItem(null);
    setShowModal(true);
    setTimeout(() => {
      const form = document.getElementById("inventory-form") as HTMLFormElement;
      if (form && category) {
        const select = form.elements.namedItem("category") as HTMLSelectElement;
        if (select) select.value = category;
      }
    }, 50);
  };

  const openEditModal = (item: ClothingItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-slide-up">
      {sizeFilter && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-red-50 border border-amber-200 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              尺码缺口筛选：
              {activeCategory !== "全部" && <span className="ml-1">{activeCategory} · </span>}
              <span className="font-bold">{sizeFilter}码</span>
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              当前显示匹配此尺码的库存，共 {filtered.length} 条记录
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="px-3 py-1.5 rounded-lg bg-white text-primary-700 text-xs font-medium hover:bg-primary-50 transition-colors border border-primary-200"
            >
              返回看板
            </Link>
            <button
              onClick={clearSizeFilter}
              className="p-2 rounded-lg bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors border border-slate-200"
              title="清除筛选"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => handleCategoryChange("全部")}
          className={`p-4 rounded-2xl text-left transition-all ${
            activeCategory === "全部"
              ? "bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/20"
              : "bg-white border border-slate-200 hover:border-primary-300 hover:bg-primary-50"
          }`}
        >
          <Package className={`w-6 h-6 mb-2 ${activeCategory === "全部" ? "text-white" : "text-slate-400"}`} />
          <p className={`font-semibold ${activeCategory === "全部" ? "" : "text-slate-900"}`}>全部</p>
          <p className={`text-xs ${activeCategory === "全部" ? "text-white/80" : "text-slate-500"}`}>
            {clothingItems.reduce((s, i) => s + i.quantity, 0)} 件
          </p>
        </button>

        {groupedByCategory.map(({ category, count }) => {
          const Icon = CATEGORY_ICONS[category];
          return (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`p-4 rounded-2xl text-left transition-all ${
                activeCategory === category
                  ? "bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/20"
                  : "bg-white border border-slate-200 hover:border-primary-300 hover:bg-primary-50"
              }`}
            >
              <Icon className={`w-6 h-6 mb-2 ${activeCategory === category ? "text-white" : "text-slate-400"}`} />
              <p className={`font-semibold ${activeCategory === category ? "" : "text-slate-900"}`}>{category}</p>
              <p className={`text-xs ${activeCategory === category ? "text-white/80" : "text-slate-500"}`}>{count} 件</p>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-slate-900">
          {activeCategory === "全部" ? "全部库存" : `${activeCategory}库存`}
          {sizeFilter && (
            <span className="ml-2 text-sm font-normal text-primary-600">
              <Filter className="w-3.5 h-3.5 inline mr-1" />
              筛选：{sizeFilter}码
            </span>
          )}
        </h2>
        <button onClick={() => openAddModal(activeCategory !== "全部" ? activeCategory : undefined)} className="btn-primary">
          <Plus className="w-5 h-5" />
          新增库存
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => {
          const Icon = CATEGORY_ICONS[item.category];
          return (
            <div key={item.id} className="card p-5 animate-fade-slide-up">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-primary-600" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`确定删除此库存记录吗？`)) {
                        deleteClothingItem(item.id);
                      }
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{item.category}</span>
                  <span className={`badge ${STATUS_COLORS[item.status]}`}>{item.status}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-display font-bold text-slate-900">{item.size}</span>
                  <span className={`text-lg font-semibold ${
                    sizeFilter && item.size === sizeFilter ? "text-amber-600" : "text-primary-600"
                  }`}>
                    ×{item.quantity}
                  </span>
                </div>
                {item.setNumber && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Hash className="w-4 h-4" />
                    套装编号：{item.setNumber}
                  </div>
                )}
                <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                  更新于 {formatDateTime(item.updatedAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card-static p-16 text-center">
          <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">
            {sizeFilter ? `当前筛选条件下暂无匹配的库存记录` : "暂无库存记录"}
          </p>
          {sizeFilter && (
            <button onClick={clearSizeFilter} className="btn-secondary mt-4">
              清除筛选
            </button>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="card-static w-full max-w-lg p-6 animate-slide-up">
            <h3 className="font-display text-xl font-bold text-slate-900 mb-6">
              {editingItem ? "编辑库存" : "新增库存"}
            </h3>
            <form id="inventory-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">分类</label>
                  <select name="category" defaultValue={editingItem?.category || "上衣"} className="input-field" required>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">尺码</label>
                  <input name="size" type="text" defaultValue={editingItem?.size || sizeFilter || ""} className="input-field" placeholder="如 M / 38 / 均码" required />
                </div>
                <div>
                  <label className="label">数量</label>
                  <input name="quantity" type="number" min="0" defaultValue={editingItem?.quantity || 1} className="input-field" required />
                </div>
                <div>
                  <label className="label">状态</label>
                  <select name="status" defaultValue={editingItem?.status || "完好"} className="input-field" required>
                    <option value="完好">完好</option>
                    <option value="待修">待修</option>
                    <option value="改衣中">改衣中</option>
                    <option value="遗失">遗失</option>
                    <option value="清洗中">清洗中</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">套装编号（可选）</label>
                <input name="setNumber" type="text" defaultValue={editingItem?.setNumber || ""} className="input-field" placeholder="如 A-001" />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => { setShowModal(false); setEditingItem(null); }} className="btn-secondary flex-1">
                  取消
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingItem ? "保存" : "添加"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
