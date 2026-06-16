import { useNavigate } from "react-router-dom";
import { useAquariumStore } from "@/store/useAquariumStore";
import AquariumCard from "@/components/aquarium/AquariumCard";
import AquariumForm from "@/components/aquarium/AquariumForm";
import FeedingModal from "@/components/feeding/FeedingModal";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useFeedingStore } from "@/store/useFeedingStore";
import { useWaterStore } from "@/store/useWaterStore";

export default function AquariumList() {
  const navigate = useNavigate();
  const aquariums = useAquariumStore((s) => s.aquariums);
  const getRecordsForDate = useFeedingStore((s) => s.getRecordsForDate);
  const getWaterChanges = useWaterStore((s) => s.getWaterChanges);

  const [search, setSearch] = useState("");
  const [feedModal, setFeedModal] = useState<{
    open: boolean;
    aqId?: string;
    period?: "morning" | "evening";
  }>({ open: false });

  const filtered = aquariums.filter(
    (a) =>
      !search ||
      a.name.includes(search) ||
      a.food_type.includes(search) ||
      a.fish_species.some((f) => f.species_name.includes(search))
  );

  return (
    <div className="space-y-6 animate-fade-slide-up">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-900">
            鱼缸档案 🐠
          </h2>
          <p className="text-sm text-brand-600 mt-1">
            共 {aquariums.length} 个鱼缸，管理鱼种与喂食参数
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索鱼缸/鱼种..."
              className="input-field !pl-10 !py-2.5 w-52"
            />
          </div>
          <button onClick={() => navigate("/aquariums/new")} className="btn-primary">
            <Plus className="w-4 h-4" /> 新增鱼缸
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">🐡</div>
          <h4 className="font-display font-bold text-xl text-brand-900 mb-2">
            {aquariums.length === 0 ? "还没有鱼缸档案" : "没有匹配的结果"}
          </h4>
          <p className="text-sm text-brand-600 mb-6">
            {aquariums.length === 0
              ? "创建第一个鱼缸档案，配置鱼种和喂食参数"
              : "试试换个关键词搜索"}
          </p>
          {aquariums.length === 0 && (
            <button
              onClick={() => navigate("/aquariums/new")}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" /> 新建档案
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((a, i) => (
            <div key={a.id} style={{ animationDelay: `${i * 70}ms` }} className="animate-fade-slide-up">
              <AquariumCard
                aquarium={a}
                onFeed={(aqId, period) =>
                  setFeedModal({ open: true, aqId, period })
                }
                onEdit={(aqId) => navigate(`/aquariums/${aqId}`)}
              />
            </div>
          ))}
        </div>
      )}

      <FeedingModal
        open={feedModal.open}
        onClose={() => setFeedModal({ open: false })}
        defaultAquariumId={feedModal.aqId}
        defaultPeriod={feedModal.period}
      />
    </div>
  );
}

export { AquariumForm };
