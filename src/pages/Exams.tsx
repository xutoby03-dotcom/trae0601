import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Plus, Trash2, Search } from "lucide-react";

export default function Exams() {
  const { exams, addExam, deleteExam, distributions, collections } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    subject: "",
    grade: "",
    roomNumber: "",
    invigilator: "",
    candidateCount: 0,
    examTime: "",
  });

  const filtered = exams.filter(
    (e) =>
      e.subject.includes(search) ||
      e.roomNumber.includes(search) ||
      e.invigilator.includes(search) ||
      e.grade.includes(search)
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addExam(form);
    setForm({ subject: "", grade: "", roomNumber: "", invigilator: "", candidateCount: 0, examTime: "" });
    setShowForm(false);
  }

  function getExamStatus(examId: string) {
    const dist = distributions.find((d) => d.examId === examId);
    if (!dist) return "待发放";
    const coll = collections.find((c) => c.examId === examId);
    if (!coll) return "待回收";
    if (coll.isLocked) return "异常锁定";
    return "已完成";
  }

  const statusColors: Record<string, string> = {
    "待发放": "bg-amber-100 text-amber-700",
    "待回收": "bg-blue-100 text-blue-700",
    "异常锁定": "bg-red-100 text-red-700",
    "已完成": "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1e3a5f]">考试档案</h2>
          <p className="text-sm text-slate-500 mt-1">管理考试基本信息</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a5f] text-white text-sm rounded-lg hover:bg-[#163050] transition-colors shadow-sm"
        >
          <Plus size={16} />
          新建档案
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="搜索科目、考场、监考老师、年级..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map((exam) => {
          const status = getExamStatus(exam.id);
          return (
            <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-1.5 ${status === "异常锁定" ? "bg-red-500" : status === "已完成" ? "bg-emerald-500" : status === "待回收" ? "bg-blue-500" : "bg-amber-500"}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-[#1e3a5f]">{exam.subject}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">考场 {exam.roomNumber}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[status]}`}>{status}</span>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">年级</span>
                    <span>{exam.grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">监考老师</span>
                    <span>{exam.invigilator}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">考生人数</span>
                    <span>{exam.candidateCount} 人</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">考试时间</span>
                    <span>{new Date(exam.examTime).toLocaleString("zh-CN")}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => deleteExam(exam.id)}
                    className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={12} />
                    删除
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400 text-sm">暂无考试档案，点击「新建档案」开始</div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[480px] p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1e3a5f] mb-5">新建考试档案</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">科目</label>
                  <input
                    required
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">年级</label>
                  <input
                    required
                    type="text"
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">考场编号</label>
                  <input
                    required
                    type="text"
                    value={form.roomNumber}
                    onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">考生人数</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={form.candidateCount || ""}
                    onChange={(e) => setForm({ ...form, candidateCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5 font-medium">监考老师</label>
                <input
                  required
                  type="text"
                  value={form.invigilator}
                  onChange={(e) => setForm({ ...form, invigilator: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5 font-medium">考试时间</label>
                <input
                  required
                  type="datetime-local"
                  value={form.examTime}
                  onChange={(e) => setForm({ ...form, examTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
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
                  className="px-6 py-2 bg-[#1e3a5f] text-white text-sm rounded-lg hover:bg-[#163050] transition-colors"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
