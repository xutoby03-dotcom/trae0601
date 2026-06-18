import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Edit, Trash2, Box } from "lucide-react";
import { useStore } from "@/store";
import { CATEGORIES, getCategory, getStatus } from "@/data/constants";
import EquipmentPhoto from "@/components/EquipmentPhoto";
import type { EquipmentCategory } from "@/types";

export default function EquipmentList() {
  const { equipment, deleteEquipment } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | "all">("all");

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [equipment, searchTerm, selectedCategory]);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`确定要删除装备「${name}」吗？此操作不可恢复。`)) {
      deleteEquipment(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-forest-900">装备档案</h1>
          <p className="text-forest-600 mt-1">共 {equipment.length} 件装备</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
            <input
              type="text"
              placeholder="搜索装备名称、编号、品牌..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <Link to="/equipment/new" className="btn btn-primary">
            <Plus className="w-4 h-4" />
            新增装备
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`tag ${
            selectedCategory === "all"
              ? "bg-forest-700 text-white shadow-soft"
              : "bg-white text-forest-700 border border-forest-200 hover:bg-forest-50"
          }`}
        >
          全部
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`tag ${
              selectedCategory === cat.id
                ? `${cat.bgColor} ${cat.color} ring-2 ring-offset-1 ring-current shadow-soft`
                : "bg-white text-forest-700 border border-forest-200 hover:bg-forest-50"
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {filteredEquipment.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🎒</div>
          <h3 className="text-lg font-semibold text-forest-800 mb-2">暂无装备</h3>
          <p className="text-forest-600 mb-6">
            {searchTerm || selectedCategory !== "all"
              ? "没有找到匹配的装备，试试其他搜索条件"
              : "开始添加你的第一件露营装备吧"}
          </p>
          {!searchTerm && selectedCategory === "all" && (
            <Link to="/equipment/new" className="btn btn-primary">
              <Plus className="w-4 h-4" />
              新增装备
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEquipment.map((item) => {
            const cat = getCategory(item.category);
            const status = getStatus(item.status);
            return (
              <div key={item.id} className="card card-hover flex flex-col">
                <EquipmentPhoto
                  photo={item.photo}
                  category={item.category}
                  className="h-[160px] w-full"
                />
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-forest-900 text-lg line-clamp-1">
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-sm text-forest-500 font-mono mb-1">{item.code}</p>
                    {item.brand && (
                      <p className="text-sm text-forest-600 mb-3 line-clamp-1">
                        {item.brand}
                      </p>
                    )}
                    {!item.brand && <div className="mb-3" />}
                  </div>
                  <div className="space-y-3 pt-3 border-t border-forest-100">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-forest-50 text-forest-700 text-xs">
                        <Box className="w-3 h-3" />
                        {item.storageBox}
                      </span>
                      <span className={`badge ${status.bgColor} ${status.color}`}>
                        {status.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/equipment/${item.id}/edit`}
                        className="btn btn-ghost flex-1 !py-2 text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="btn btn-ghost flex-1 !py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
