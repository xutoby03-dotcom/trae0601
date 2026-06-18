import { useState, useMemo } from "react";
import { useStore } from "@/store";
import { CageCard } from "@/components/CageCard";
import { Modal } from "@/components/Modal";
import { EmptyState } from "@/components/EmptyState";
import {
  SPECIES_LABEL,
  CAGE_STATUS_LABEL,
  type Species,
  type CageStatus,
} from "@/types";
import { Plus, Filter, X } from "lucide-react";

export default function CageList() {
  const cages = useStore((s) => s.cages);
  const groups = useStore((s) => s.researchGroups);
  const addCage = useStore((s) => s.addCage);

  const [search, setSearch] = useState("");
  const [filterSpecies, setFilterSpecies] = useState<Species | "all">("all");
  const [filterStatus, setFilterStatus] = useState<CageStatus | "all">("all");
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    cageNumber: "",
    species: "mouse" as Species,
    animalCount: 5,
    researchGroupId: groups[0]?.id || "",
    responsiblePerson: "",
    housingConditions: "",
    photoUrl: "",
    status: "normal" as CageStatus,
  });

  const filtered = useMemo(() => {
    return cages.filter((c) => {
      if (search && !c.cageNumber.toLowerCase().includes(search.toLowerCase()) && !c.responsiblePerson.includes(search)) return false;
      if (filterSpecies !== "all" && c.species !== filterSpecies) return false;
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      if (filterGroup !== "all" && c.researchGroupId !== filterGroup) return false;
      return true;
    });
  }, [cages, search, filterSpecies, filterStatus, filterGroup]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addCage({
      ...form,
      photoUrl:
        form.photoUrl ||
        `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=laboratory%20${form.species}%20cage&image_size=square`,
    });
    setShowAdd(false);
    setForm({
      cageNumber: "",
      species: "mouse",
      animalCount: 5,
      researchGroupId: groups[0]?.id || "",
      responsiblePerson: "",
      housingConditions: "",
      photoUrl: "",
      status: "normal",
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">动物档案</h1>
          <p className="text-sm text-slate-500 mt-1">
            管理所有笼盒和鱼缸档案，共 {cages.length} 个
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> 新增档案
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索编号、负责人..."
              className="input pl-9"
            />
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <select
            value={filterSpecies}
            onChange={(e) => setFilterSpecies(e.target.value as Species | "all")}
            className="input w-auto"
          >
            <option value="all">全部物种</option>
            {(Object.keys(SPECIES_LABEL) as Species[]).map((s) => (
              <option key={s} value={s}>
                {SPECIES_LABEL[s]}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as CageStatus | "all")}
            className="input w-auto"
          >
            <option value="all">全部状态</option>
            {(Object.keys(CAGE_STATUS_LABEL) as CageStatus[]).map((s) => (
              <option key={s} value={s}>
                {CAGE_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="input w-auto"
          >
            <option value="all">全部课题组</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          {(search || filterSpecies !== "all" || filterStatus !== "all" || filterGroup !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setFilterSpecies("all");
                setFilterStatus("all");
                setFilterGroup("all");
              }}
              className="btn-ghost text-xs"
            >
              <X className="w-3.5 h-3.5" /> 清除筛选
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="没有找到匹配的档案" description="试试调整筛选条件或新增一个档案" />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((cage, i) => (
            <div key={cage.id} style={{ animationDelay: `${i * 30}ms` }} className="animate-fade-in-up">
              <CageCard cage={cage} />
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="新增动物档案"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleSubmit} className="btn-primary">
              确认添加
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">笼盒/鱼缸编号 *</label>
              <input
                required
                value={form.cageNumber}
                onChange={(e) => setForm({ ...form, cageNumber: e.target.value })}
                placeholder="如 M-A1-001"
                className="input font-mono"
              />
            </div>
            <div>
              <label className="label">物种 *</label>
              <select
                value={form.species}
                onChange={(e) => setForm({ ...form, species: e.target.value as Species })}
                className="input"
              >
                {(Object.keys(SPECIES_LABEL) as Species[]).map((s) => (
                  <option key={s} value={s}>
                    {SPECIES_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">动物数量 *</label>
              <input
                type="number"
                min={1}
                required
                value={form.animalCount}
                onChange={(e) => setForm({ ...form, animalCount: parseInt(e.target.value) || 0 })}
                className="input"
              />
            </div>
            <div>
              <label className="label">所属课题组 *</label>
              <select
                value={form.researchGroupId}
                onChange={(e) => setForm({ ...form, researchGroupId: e.target.value })}
                className="input"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">负责人 *</label>
              <input
                required
                value={form.responsiblePerson}
                onChange={(e) => setForm({ ...form, responsiblePerson: e.target.value })}
                placeholder="如 陈饲养员"
                className="input"
              />
            </div>
            <div>
              <label className="label">状态</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as CageStatus })}
                className="input"
              >
                {(Object.keys(CAGE_STATUS_LABEL) as CageStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {CAGE_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">饲养条件</label>
            <textarea
              value={form.housingConditions}
              onChange={(e) => setForm({ ...form, housingConditions: e.target.value })}
              placeholder="如 温度22±1°C，湿度55±5%，12h光暗循环"
              rows={2}
              className="input resize-none"
            />
          </div>
          <div>
            <label className="label">照片 URL（可选，留空自动生成）</label>
            <input
              value={form.photoUrl}
              onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
              placeholder="https://..."
              className="input"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
