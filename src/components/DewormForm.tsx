import { useState, useMemo } from "react";
import { Pill, Syringe } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { usePetStore } from "../store/petStore";
import type { DewormFormData, DewormType } from "../types";
import { todayStr, formatDateDisplay } from "../utils/date";
import {
  getNextDewormDate,
  getSpeciesEmoji,
  getAgeDisplay,
} from "../utils/deworm";

export default function DewormForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const pet = usePetStore((s) => (id ? s.getPet(id) : undefined));
  const addRecord = usePetStore((s) => s.addDewormRecord);
  const records = usePetStore((s) => s.records);

  const [form, setForm] = useState<DewormFormData>({
    medicineName: "",
    type: "internal",
    dosage: 0,
    dosageUnit: "片",
    dateUsed: todayStr(),
    nextDate: getNextDewormDate(todayStr(), "internal"),
    operator: "",
    hasAdverseReaction: false,
    reactionNote: "",
  });
  const [error, setError] = useState("");

  const prevRecords = useMemo(
    () =>
      records
        .filter((r) => r.petId === id)
        .sort(
          (a, b) =>
            new Date(b.dateUsed).getTime() - new Date(a.dateUsed).getTime()
        ),
    [records, id]
  );

  const sameTypePrev = prevRecords.find((r) => r.type === form.type);

  const updateType = (type: DewormType) => {
    setForm((f) => ({
      ...f,
      type,
      dosageUnit: type === "external" ? "ml" : "片",
      nextDate: getNextDewormDate(f.dateUsed, type),
    }));
  };

  const updateDateUsed = (dateUsed: string) => {
    setForm((f) => ({
      ...f,
      dateUsed,
      nextDate: getNextDewormDate(dateUsed, f.type),
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pet) return;
    if (!form.medicineName.trim()) return setError("请填写药品名称");
    if (form.dosage <= 0) return setError("请填写有效剂量");
    if (!form.operator.trim()) return setError("请填写操作人");

    addRecord(pet.id, form);
    navigate(`/pet/${pet.id}`);
  };

  if (!pet) {
    return <div className="text-center text-ink-500 py-12">宠物不存在</div>;
  }

  return (
    <form onSubmit={submit} className="space-y-5 animate-fade-in-up">
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-ink-100">
          <img
            src={pet.photoUrl}
            alt={pet.name}
            className="w-14 h-14 rounded-xl object-cover"
          />
          <div>
            <h2 className="font-display text-xl font-bold text-ink-800 flex items-center gap-2">
              {getSpeciesEmoji(pet.species)} {pet.name}
            </h2>
            <p className="text-sm text-ink-400">
              {pet.breed} · {getAgeDisplay(pet.birthDate)} · {pet.weight}
              {pet.weightUnit}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="label">驱虫类型</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => updateType("internal")}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all ${
                  form.type === "internal"
                    ? "bg-warm-500 text-white shadow-warm"
                    : "bg-ink-50 text-ink-500 hover:bg-ink-100"
                }`}
              >
                <Pill className="w-4 h-4" />
                体内驱虫
              </button>
              <button
                type="button"
                onClick={() => updateType("external")}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all ${
                  form.type === "external"
                    ? "bg-mint-500 text-white shadow-soft"
                    : "bg-ink-50 text-ink-500 hover:bg-ink-100"
                }`}
              >
                <Syringe className="w-4 h-4" />
                体外驱虫
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">药品名称</label>
              <input
                className="input"
                value={form.medicineName}
                onChange={(e) =>
                  setForm({ ...form, medicineName: e.target.value })
                }
                placeholder={
                  sameTypePrev ? `上次使用: ${sameTypePrev.medicineName}` : "例如：拜宠清"
                }
                list="medicine-suggestions"
              />
              <datalist id="medicine-suggestions">
                {Array.from(new Set(prevRecords.map((r) => r.medicineName))).map(
                  (m) => (
                    <option key={m} value={m} />
                  )
                )}
              </datalist>
            </div>

            <div>
              <label className="label">
                剂量
                {sameTypePrev && (
                  <span className="text-ink-300 font-normal ml-2 text-xs">
                    上次: {sameTypePrev.dosage}
                    {sameTypePrev.dosageUnit}
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  className="input flex-1"
                  value={form.dosage || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dosage: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="剂量数值"
                />
                <select
                  className="input w-24"
                  value={form.dosageUnit}
                  onChange={(e) =>
                    setForm({ ...form, dosageUnit: e.target.value })
                  }
                >
                  <option value="片">片</option>
                  <option value="ml">ml</option>
                  <option value="mg">mg</option>
                  <option value="滴">滴</option>
                  <option value="g">g</option>
                </select>
              </div>
              <p className="text-xs text-ink-400 mt-1.5">
                💡 当前体重 {pet.weight}
                {pet.weightUnit}，请根据药品说明书确认剂量
              </p>
            </div>

            <div>
              <label className="label">使用日期</label>
              <input
                type="date"
                className="input"
                value={form.dateUsed}
                onChange={(e) => updateDateUsed(e.target.value)}
              />
            </div>

            <div>
              <label className="label">
                下次驱虫日期
                <span className="text-ink-300 font-normal ml-2 text-xs">
                  自动推算
                </span>
              </label>
              <input
                type="date"
                className="input"
                value={form.nextDate}
                onChange={(e) => setForm({ ...form, nextDate: e.target.value })}
              />
              <p className="text-xs text-ink-400 mt-1.5">
                默认{form.type === "internal" ? "90天" : "30天"}后：
                {formatDateDisplay(getNextDewormDate(form.dateUsed, form.type))}
              </p>
            </div>

            <div>
              <label className="label">操作人</label>
              <input
                className="input"
                value={form.operator}
                onChange={(e) => setForm({ ...form, operator: e.target.value })}
                placeholder="例如：妈妈"
              />
            </div>
          </div>

          <div className="card p-4 bg-ink-50/50">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasAdverseReaction}
                onChange={(e) =>
                  setForm({ ...form, hasAdverseReaction: e.target.checked })
                }
                className="w-4 h-4 rounded accent-warm-500"
              />
              <span className="font-semibold text-ink-600 text-sm">
                用药后出现不良反应
              </span>
            </label>
            {form.hasAdverseReaction && (
              <textarea
                className="input mt-3 min-h-[72px] resize-none"
                value={form.reactionNote}
                onChange={(e) =>
                  setForm({ ...form, reactionNote: e.target.value })
                }
                placeholder="请描述症状，如呕吐、腹泻、皮肤红肿等，以及持续时间"
              />
            )}
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
            保存记录
          </button>
        </div>
      </div>
    </form>
  );
}
