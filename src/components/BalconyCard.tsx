import { useState } from "react";
import { useBalconyStore } from "@/store/balconyStore";
import { orientations, rainCovers, ventilations } from "@/data/mockData";
import {
  Compass,
  Frame,
  Ruler,
  Umbrella,
  Wind,
  Pencil,
  StickyNote,
  X,
  CheckCircle2,
} from "lucide-react";

export default function BalconyCard() {
  const { profile } = useBalconyStore();
  const [showEdit, setShowEdit] = useState(false);

  const items = [
    { icon: <Compass className="w-5 h-5" />, label: "阳台朝向", value: profile.orientation, color: "#FF9F43" },
    {
      icon: <Frame className="w-5 h-5" />,
      label: "是否封窗",
      value: profile.isSealed ? "已封窗" : "未封窗（开放式）",
      color: profile.isSealed ? "#1DD1A1" : "#4A90D9",
    },
    { icon: <Ruler className="w-5 h-5" />, label: "晾衣杆数量", value: `${profile.poleCount} 根`, color: "#4A90D9" },
    { icon: <Umbrella className="w-5 h-5" />, label: "遮雨情况", value: profile.rainCover, color: "#FECA57" },
    { icon: <Wind className="w-5 h-5" />, label: "通风情况", value: profile.ventilation, color: "#1DD1A1" },
  ];

  return (
    <>
      <div className="card relative overflow-hidden">
        <div className="absolute -right-6 -top-6 text-8xl opacity-10 pointer-events-none">
          🏠
        </div>

        <div className="flex items-start justify-between mb-5 relative z-10">
          <div>
            <h2 className="font-display text-xl text-sky-800">阳台档案</h2>
            <p className="text-xs text-sky-500 mt-1">查看阳台基础信息</p>
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors text-sm font-medium"
          >
            <Pencil className="w-4 h-4" />
            编辑
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ backgroundColor: `${item.color}10` }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${item.color}25`, color: item.color }}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs mb-1" style={{ color: `${item.color}aa` }}>
                    {item.label}
                  </div>
                  <div className="font-semibold text-sky-800">{item.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {profile.notes && (
          <div className="mt-4 p-4 rounded-2xl bg-sky-50/80 border border-sky-100/60 relative z-10">
            <div className="flex items-start gap-2">
              <StickyNote className="w-4 h-4 text-sun-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-sky-500 mb-1">备注</div>
                <p className="text-sm text-sky-700 leading-relaxed">{profile.notes}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showEdit && <EditModal onClose={() => setShowEdit(false)} />}
    </>
  );
}

function EditModal({ onClose }: { onClose: () => void }) {
  const { profile, updateProfile } = useBalconyStore();
  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile(form);
    setSaved(true);
    setTimeout(() => onClose(), 800);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-sky-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {saved ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-warn-green/15 flex items-center justify-center mb-4 animate-check-pop">
              <CheckCircle2 className="w-12 h-12 text-warn-green" />
            </div>
            <h3 className="font-display text-2xl text-sky-800 mb-2">保存成功！</h3>
            <p className="text-sky-600 text-sm">阳台档案已更新</p>
          </div>
        ) : (
          <>
            <div className="p-5 pb-3 bg-gradient-to-br from-sun-400/10 to-sky-50 flex justify-between items-start">
              <div>
                <h3 className="font-display text-2xl text-sky-800">编辑阳台档案</h3>
                <p className="text-sky-500 text-sm mt-1">完善阳台信息以获得更准确的提醒</p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl hover:bg-white/60 flex items-center justify-center text-sky-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="label-text">阳台朝向</label>
                <select
                  className="input-field"
                  value={form.orientation}
                  onChange={(e) => setForm({ ...form, orientation: e.target.value })}
                >
                  {orientations.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-text">是否封窗</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: true, label: "已封窗", desc: "封闭式阳台" },
                    { v: false, label: "未封窗", desc: "开放式阳台" },
                  ].map((opt) => (
                    <button
                      key={String(opt.v)}
                      type="button"
                      onClick={() => setForm({ ...form, isSealed: opt.v })}
                      className={`p-3 rounded-2xl border-2 text-left transition-all ${
                        form.isSealed === opt.v
                          ? "border-sky-400 bg-sky-50 shadow-sm"
                          : "border-sky-100 bg-white/60 hover:border-sky-200"
                      }`}
                    >
                      <div className="font-medium text-sky-800">{opt.label}</div>
                      <div className="text-xs text-sky-500 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-text">晾衣杆数量</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, poleCount: n })}
                      className={`flex-1 h-12 rounded-xl font-semibold transition-all ${
                        form.poleCount === n
                          ? "bg-sky-400 text-white shadow-md"
                          : "bg-sky-50 text-sky-600 hover:bg-sky-100"
                      }`}
                    >
                      {n}根
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-text">遮雨情况</label>
                <select
                  className="input-field"
                  value={form.rainCover}
                  onChange={(e) => setForm({ ...form, rainCover: e.target.value })}
                >
                  {rainCovers.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-text">通风情况</label>
                <select
                  className="input-field"
                  value={form.ventilation}
                  onChange={(e) => setForm({ ...form, ventilation: e.target.value })}
                >
                  {ventilations.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-text">备注</label>
                <textarea
                  rows={3}
                  className="input-field resize-none"
                  placeholder="补充说明阳台的特殊情况..."
                  value={form.notes || ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="p-5 pt-3 flex gap-3 border-t border-sky-100/60">
              <button className="btn-secondary flex-1" onClick={onClose}>
                取消
              </button>
              <button className="btn-primary flex-1" onClick={handleSave}>
                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                保存档案
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
