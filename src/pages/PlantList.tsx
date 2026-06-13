import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { useStore } from "@/store";
import PlantCard from "@/components/plant/PlantCard";
import { PlantStatus, PLANT_STATUS_LABELS } from "@/types";

export default function PlantList() {
  const navigate = useNavigate();
  const plants = useStore((s) => s.plants);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PlantStatus | "all">("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const locations = [...new Set(plants.map((p) => p.location))];

  const filtered = plants.filter((p) => {
    const matchSearch =
      p.species.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchLocation = locationFilter === "all" || p.location === locationFilter;
    return matchSearch && matchStatus && matchLocation;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-400" />
            <input
              type="text"
              placeholder="搜索绿植品种或位置..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-forest-200 bg-white focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-forest-500" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as PlantStatus | "all")
              }
              className="px-4 py-3 rounded-xl border border-forest-200 bg-white focus:outline-none focus:border-forest-500 text-forest-700"
            >
              <option value="all">全部状态</option>
              {(Object.keys(PLANT_STATUS_LABELS) as PlantStatus[]).map((k) => (
                <option key={k} value={k}>
                  {PLANT_STATUS_LABELS[k]}
                </option>
              ))}
            </select>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-forest-200 bg-white focus:outline-none focus:border-forest-500 text-forest-700"
            >
              <option value="all">全部位置</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => navigate("/plants/new")}
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5" />
          新增绿植
        </button>
      </div>

      <div className="text-sm text-forest-500">
        共 <span className="font-medium text-forest-700">{filtered.length}</span>{" "}
        盆绿植
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card border border-forest-50 p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-forest-400" />
          </div>
          <p className="text-forest-600 font-medium">没有找到匹配的绿植</p>
          <p className="text-sm text-forest-400 mt-1">
            尝试调整搜索条件或筛选器
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {filtered.map((plant, idx) => (
            <div
              key={plant.id}
              className="animate-slide-up"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <PlantCard plant={plant} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
