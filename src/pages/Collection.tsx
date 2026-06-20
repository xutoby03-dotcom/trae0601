import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Plus, Lock, Unlock, AlertTriangle, RotateCcw, X, Filter } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Collection() {
  const { distributions, collections, exams, addCollection, unlockCollection } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selectedDistId, setSelectedDistId] = useState("");
  const [onlyAnomaly, setOnlyAnomaly] = useState(false);
  const [form, setForm] = useState({
    distributionId: "",
    examId: "",
    usedCount: 0,
    blankCount: 0,
    missingCount: 0,
    abnormalNote: "",
  });

  useEffect(() => {
    if (searchParams.get("filter") === "anomaly") {
      setOnlyAnomaly(true);
    }
  }, [searchParams]);

  function clearFilter() {
    setOnlyAnomaly(false);
    const next = new URLSearchParams(searchParams);
    next.delete("filter");
    setSearchParams(next, { replace: true });
    navigate({ search: "" });
  }

  const collectedDistIds = new Set(collections.map((c) => c.distributionId));
  const pendingDistributions = distributions.filter((d) => !collectedDistIds.has(d.id));

  const filteredCollections = onlyAnomaly
    ? collections.filter((c) => c.missingCount > 0 || c.abnormalNote.trim() !== "")
    : collections;

  function handleSelectDist(distId: string) {
    const dist = distributions.find((d) => d.id === distId);
    setSelectedDistId(distId);
    setForm({
      distributionId: distId,
      examId: dist?.examId || "",
      usedCount: 0,
      blankCount: 0,
      missingCount: 0,
      abnormalNote: "",
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addCollection(form);
    setForm({ distributionId: "", examId: "", usedCount: 0, blankCount: 0, missingCount: 0, abnormalNote: "" });
    setSelectedDistId("");
    setShowForm(false);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1e3a5f]">回收录入</h2>
          <p className="text-sm text-slate-500 mt-1">考试结束录入草稿纸回收数据，缺失自动标红锁定</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a5f] text-white text-sm rounded-lg hover:bg-[#163050] transition-colors shadow-sm"
        >
          <Plus size={16} />
          录入回收
        </button>
      </div>

      {(onlyAnomaly || collections.length > 0) && (
        <div className="mb-5 flex items-center gap-3 bg-white rounded-xl shadow-sm border border-slate-100 px-4 py-3">
          <label
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
              onlyAnomaly ? "bg-red-50 text-red-600 border border-red-200" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Filter size={14} />
            <input
              type="checkbox"
              checked={onlyAnomaly}
              onChange={(e) => {
                setOnlyAnomaly(e.target.checked);
                if (!e.target.checked) {
                  const next = new URLSearchParams(searchParams);
                  next.delete("filter");
                  navigate({ search: next.toString() }, { replace: true });
                } else {
                  navigate({ search: "filter=anomaly" }, { replace: true });
                }
              }}
              className="sr-only"
            />
            只看异常
            <span className={`text-xs ${onlyAnomaly ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"} px-1.5 py-0.5 rounded-full font-semibold`}>
              {onlyAnomaly ? filteredCollections.length : collections.length}
            </span>
          </label>

          {onlyAnomaly && (
            <button
              onClick={clearFilter}
              className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X size={12} />
              清空筛选
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {filteredCollections.map((col) => {
          const dist = distributions.find((d) => d.id === col.distributionId);
          const exam = exams.find((e) => e.id === col.examId);
          const totalCount = col.usedCount + col.blankCount + col.missingCount;
          const isMismatch = dist && totalCount !== dist.quantity;

          return (
            <div
              key={col.id}
              className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${
                col.isLocked ? "border-red-200 bg-red-50/30" : "border-slate-100"
              }`}
            >
              <div className="flex items-center p-5">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mr-4 ${
                  col.isLocked ? "bg-red-100" : "bg-emerald-50"
                }`}>
                  {col.isLocked ? <Lock size={22} className="text-red-500" /> : <RotateCcw size={22} className="text-emerald-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[#1e3a5f]">考场 {dist?.roomNumber || "未知"}</h3>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500">{exam?.subject}</span>
                    {col.isLocked && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Lock size={10} /> 已锁定
                      </span>
                    )}
                    {isMismatch && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <AlertTriangle size={10} /> 数量不匹配
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-slate-500">
                      发放 <span className="font-semibold text-slate-700">{dist?.quantity || 0}</span> 张
                    </span>
                    <span className="text-slate-500">
                      已用 <span className="font-semibold text-emerald-600">{col.usedCount}</span>
                    </span>
                    <span className="text-slate-500">
                      空白 <span className="font-semibold text-blue-600">{col.blankCount}</span>
                    </span>
                    <span className={`text-slate-500 ${col.missingCount > 0 ? "text-red-600" : ""}`}>
                      缺失 <span className={`font-semibold ${col.missingCount > 0 ? "text-red-600" : "text-slate-700"}`}>{col.missingCount}</span>
                    </span>
                  </div>
                  {col.abnormalNote && (
                    <p className="text-xs text-amber-600 mt-1.5 bg-amber-50 px-2 py-1 rounded inline-block">
                      异常说明：{col.abnormalNote}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 mb-2">{new Date(col.collectedAt).toLocaleString("zh-CN")}</p>
                  {col.isLocked && (
                    <button
                      onClick={() => unlockCollection(col.id)}
                      className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
                    >
                      <Unlock size={12} />
                      解锁
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCollections.length === 0 && (
        <div className="text-center py-16 text-slate-400 text-sm flex flex-col items-center gap-2">
          <RotateCcw size={32} className="text-slate-300" />
          {onlyAnomaly ? "当前没有异常回收记录" : "暂无回收记录"}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[520px] p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1e3a5f] mb-5">录入回收</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5 font-medium">选择待回收考场</label>
                <select
                  required
                  value={selectedDistId}
                  onChange={(e) => handleSelectDist(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] bg-white"
                >
                  <option value="">请选择发放记录</option>
                  {pendingDistributions.map((d) => {
                    const ex = exams.find((e) => e.id === d.examId);
                    return (
                      <option key={d.id} value={d.id}>
                        考场 {d.roomNumber} - {ex?.subject || "未知"} (发放 {d.quantity} 张)
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedDistId && (() => {
                const dist = distributions.find((d) => d.id === selectedDistId);
                return dist ? (
                  <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500">
                    发放数量：<span className="font-semibold text-[#1e3a5f]">{dist.quantity}</span> 张 · 领取老师：{dist.teacher}
                  </div>
                ) : null;
              })()}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">已用张数</label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.usedCount || ""}
                    onChange={(e) => setForm({ ...form, usedCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">空白张数</label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.blankCount || ""}
                    onChange={(e) => setForm({ ...form, blankCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">缺失张数</label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.missingCount || ""}
                    onChange={(e) => setForm({ ...form, missingCount: Number(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                      form.missingCount > 0
                        ? "border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500"
                        : "border-slate-200 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                    }`}
                  />
                </div>
              </div>

              {form.missingCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-600 flex items-center gap-2 animate-in">
                  <AlertTriangle size={14} />
                  检测到缺失草稿纸，提交后该考场记录将自动标红锁定
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-500 mb-1.5 font-medium">异常说明</label>
                <textarea
                  value={form.abnormalNote}
                  onChange={(e) => setForm({ ...form, abnormalNote: e.target.value })}
                  rows={2}
                  placeholder="如有异常情况请说明..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2 text-white text-sm rounded-lg transition-colors ${
                    form.missingCount > 0
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-[#1e3a5f] hover:bg-[#163050]"
                  }`}
                >
                  确认回收
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
