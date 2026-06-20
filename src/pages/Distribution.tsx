import { useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import { Plus, Trash2, Camera, Send } from "lucide-react";

export default function Distribution() {
  const { exams, inventory, distributions, addDistribution, deleteDistribution, collections } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    examId: "",
    batchId: "",
    quantity: 0,
    teacher: "",
    sealPhotoUrl: "",
  });

  const distributedExamIds = new Set(distributions.map((d) => d.examId));
  const availableExams = exams.filter((e) => !distributedExamIds.has(e.id));

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setPhotoPreview(url);
        setForm((prev) => ({ ...prev, sealPhotoUrl: url }));
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const exam = exams.find((ex) => ex.id === form.examId);
    if (!exam) return;
    addDistribution({
      ...form,
      roomNumber: exam.roomNumber,
    });
    setForm({ examId: "", batchId: "", quantity: 0, teacher: "", sealPhotoUrl: "" });
    setPhotoPreview("");
    setShowForm(false);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1e3a5f]">发放记录</h2>
          <p className="text-sm text-slate-500 mt-1">按考场发放草稿纸并记录封包信息</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a5f] text-white text-sm rounded-lg hover:bg-[#163050] transition-colors shadow-sm"
        >
          <Plus size={16} />
          新增发放
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {distributions.map((dist) => {
          const exam = exams.find((e) => e.id === dist.examId);
          const batch = inventory.find((b) => b.id === dist.batchId);
          const coll = collections.find((c) => c.distributionId === dist.id);
          return (
            <div key={dist.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex">
                <div className="w-20 bg-[#1e3a5f] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">{dist.roomNumber}</span>
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-[#1e3a5f] text-sm">{exam?.subject || "未知科目"}</h3>
                      <p className="text-xs text-slate-400">{exam?.grade} · {exam?.invigilator}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${coll ? (coll.isLocked ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600") : "bg-blue-100 text-blue-600"}`}>
                      {coll ? (coll.isLocked ? "异常锁定" : "已回收") : "待回收"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs text-slate-500 mt-3">
                    <div>
                      <span className="text-slate-400">发放数量</span>
                      <p className="font-semibold text-slate-700 text-sm">{dist.quantity} 张</p>
                    </div>
                    <div>
                      <span className="text-slate-400">领取老师</span>
                      <p className="font-semibold text-slate-700 text-sm">{dist.teacher}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">批次</span>
                      <p className="font-semibold text-slate-700 text-sm">{batch?.batchNumber || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">{new Date(dist.distributedAt).toLocaleString("zh-CN")}</span>
                    {!coll && (
                      <button
                        onClick={() => deleteDistribution(dist.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  {dist.sealPhotoUrl && (
                    <div className="mt-2">
                      <img src={dist.sealPhotoUrl} alt="封包照片" className="h-16 w-24 object-cover rounded-lg border border-slate-200" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {distributions.length === 0 && (
        <div className="text-center py-16 text-slate-400 text-sm flex flex-col items-center gap-2">
          <Send size={32} className="text-slate-300" />
          暂无发放记录
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[500px] p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1e3a5f] mb-5">新增发放</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5 font-medium">选择考试（仅显示未发放考场）</label>
                <select
                  required
                  value={form.examId}
                  onChange={(e) => setForm({ ...form, examId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] bg-white"
                >
                  <option value="">请选择考试</option>
                  {availableExams.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.subject} - 考场 {e.roomNumber} ({e.grade})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5 font-medium">选择批次</label>
                <select
                  required
                  value={form.batchId}
                  onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] bg-white"
                >
                  <option value="">请选择批次</option>
                  {inventory.filter((b) => b.remainingQuantity > 0).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchNumber} (剩余 {b.remainingQuantity} 张)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">发放数量（张）</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={form.quantity || ""}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">领取老师</label>
                  <input
                    required
                    type="text"
                    value={form.teacher}
                    onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5 font-medium">封包照片</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-28 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#1e3a5f]/40 transition-colors overflow-hidden"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="预览" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center text-slate-400">
                      <Camera size={24} className="mx-auto mb-1" />
                      <span className="text-xs">点击上传封包照片</span>
                    </div>
                  )}
                </div>
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
                  className="px-6 py-2 bg-[#1e3a5f] text-white text-sm rounded-lg hover:bg-[#163050] transition-colors"
                >
                  确认发放
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
