import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit2, Trash2, Filter, Phone, User, Ruler, Weight, Footprints } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/utils/formatters";
import type { VoicePart } from "@/types";

const VOICE_PARTS: (VoicePart | "全部")[] = ["全部", "女高音", "女低音", "男高音", "男低音", "童声"];

export default function StudentList() {
  const navigate = useNavigate();
  const { students, deleteStudent, distributions } = useAppStore();
  const [search, setSearch] = useState("");
  const [voiceFilter, setVoiceFilter] = useState<VoicePart | "全部">("全部");
  const [classFilter, setClassFilter] = useState("全部");

  const classes = ["全部", ...Array.from(new Set(students.map((s) => s.className)))];

  const filtered = students.filter((s) => {
    const matchSearch = s.name.includes(search) || s.className.includes(search) || s.id.includes(search);
    const matchVoice = voiceFilter === "全部" || s.voicePart === voiceFilter;
    const matchClass = classFilter === "全部" || s.className === classFilter;
    return matchSearch && matchVoice && matchClass;
  });

  const distributedIds = new Set(distributions.map((d) => d.studentId));

  return (
    <div className="space-y-6 animate-fade-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索学生姓名、班级或编号..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <button onClick={() => navigate("/students/new")} className="btn-primary">
          <Plus className="w-5 h-5" />
          新增学生
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600">筛选：</span>
        </div>
        <select
          value={voiceFilter}
          onChange={(e) => setVoiceFilter(e.target.value as VoicePart | "全部")}
          className="input-field !w-auto !py-2 text-sm"
        >
          {VOICE_PARTS.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="input-field !w-auto !py-2 text-sm"
        >
          {classes.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className="text-sm text-slate-500 ml-auto">
          共 <span className="font-semibold text-slate-900">{filtered.length}</span> 名学生
        </span>
      </div>

      <div className="hidden lg:block card-static overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">学生</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">班级</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">声部</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">身高/体重</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">鞋码</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <span className="font-semibold text-primary-700">{s.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.contact}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">{s.className}</td>
                <td className="px-6 py-4">
                  <span className="badge bg-primary-100 text-primary-700">{s.voicePart}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5 text-slate-400" />{s.height}cm</span>
                    <span className="flex items-center gap-1"><Weight className="w-3.5 h-3.5 text-slate-400" />{s.weight}kg</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 text-sm text-slate-700">
                    <Footprints className="w-3.5 h-3.5 text-slate-400" />{s.shoeSize}码
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {distributedIds.has(s.id) ? (
                      <span className="badge bg-green-100 text-green-700 w-fit">已领取</span>
                    ) : (
                      <span className="badge bg-amber-100 text-amber-700 w-fit">待领取</span>
                    )}
                    {s.needAlter && (
                      <span className="badge bg-purple-100 text-purple-700 w-fit">需改裤长</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(`/students/${s.id}`)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`确定删除学生"${s.name}"吗？`)) {
                          deleteStudent(s.id);
                        }
                      }}
                      className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden grid grid-cols-1 gap-4">
        {filtered.map((s) => (
          <div key={s.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <span className="font-semibold text-primary-700 text-lg">{s.name[0]}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{s.name}</p>
                  <p className="text-sm text-slate-500">{s.className}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => navigate(`/students/${s.id}`)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`确定删除学生"${s.name}"吗？`)) {
                      deleteStudent(s.id);
                    }
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <User className="w-4 h-4 text-slate-400" />
                <span className="badge bg-primary-100 text-primary-700">{s.voicePart}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Ruler className="w-4 h-4 text-slate-400" />
                {s.height}cm / {s.weight}kg
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Footprints className="w-4 h-4 text-slate-400" />
                鞋码 {s.shoeSize}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                {s.contact}
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
              {distributedIds.has(s.id) ? (
                <span className="badge bg-green-100 text-green-700">已领取</span>
              ) : (
                <span className="badge bg-amber-100 text-amber-700">待领取</span>
              )}
              {s.needAlter && <span className="badge bg-purple-100 text-purple-700">需改裤长</span>}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card-static p-16 text-center">
          <User className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">未找到匹配的学生</p>
        </div>
      )}
    </div>
  );
}
