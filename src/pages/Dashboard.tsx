import { Link } from "react-router-dom";
import { Users, CheckCircle, Scissors, Package, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useAppStore } from "@/store/useAppStore";
import { formatDateTime } from "@/utils/formatters";
import type { VoicePart, RecordType } from "@/types";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

const VOICE_COLORS: Record<VoicePart, string> = {
  "女高音": "#ec4899",
  "女低音": "#8b5cf6",
  "男高音": "#6366f1",
  "男低音": "#0ea5e9",
  "童声": "#f59e0b",
};

const RECORD_COLORS: Record<RecordType, string> = {
  "改衣": "bg-amber-100 text-amber-700",
  "换码": "bg-blue-100 text-blue-700",
  "遗失": "bg-red-100 text-red-700",
  "归还清洗": "bg-green-100 text-green-700",
};

const STATUS_COLORS = {
  "待处理": "bg-red-100 text-red-700",
  "处理中": "bg-amber-100 text-amber-700",
  "已完成": "bg-green-100 text-green-700",
};

export default function Dashboard() {
  const { getDashboardStats, students, processRecords } = useAppStore();
  const stats = getDashboardStats();

  const statCards = [
    { label: "学生总数", value: stats.totalStudents, icon: Users, gradient: "stat-card-gradient-1", suffix: "人" },
    { label: "已发放", value: stats.distributedCount, icon: CheckCircle, gradient: "stat-card-gradient-3", suffix: `/${stats.totalStudents}` },
    { label: "待改衣", value: stats.pendingAlter, icon: Scissors, gradient: "stat-card-gradient-2", suffix: "件" },
    { label: "未归还", value: stats.notReturned, icon: Package, gradient: "stat-card-gradient-4", suffix: "套" },
  ];

  const pieData = stats.voicePartProgress.map((p) => ({
    name: p.part,
    value: p.distributed,
    total: p.total,
  }));

  const barData = stats.sizeShortage.slice(0, 6).map((s) => ({
    name: `${s.category} ${s.size}`,
    缺口: s.needed - s.available,
    库存: s.available,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className={`${card.gradient} rounded-2xl p-5 text-white shadow-lg animate-fade-slide-up`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm">{card.label}</p>
                <p className="text-3xl font-display font-bold mt-2">
                  {card.value}
                  <span className="text-lg font-normal text-white/70 ml-1">{card.suffix}</span>
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-static p-6 lg:col-span-1 animate-fade-slide-up" style={{ animationDelay: "200ms" }}>
          <h3 className="font-display font-bold text-lg text-slate-900 mb-4">声部发放进度</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={VOICE_COLORS[entry.name as VoicePart] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {stats.voicePartProgress.map((p) => (
              <div key={p.part} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: VOICE_COLORS[p.part] }} />
                <span className="text-sm text-slate-600 flex-1">{p.part}</span>
                <span className="text-sm font-semibold text-slate-900">
                  {p.distributed}/{p.total}
                </span>
                <span className="text-xs font-medium text-primary-600 w-12 text-right">
                  {p.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-static p-6 lg:col-span-2 animate-fade-slide-up" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-slate-900">尺码缺口预警</h3>
            {stats.sizeShortage.length > 0 && (
              <span className="badge bg-red-100 text-red-700">
                <AlertTriangle className="w-3.5 h-3.5" />
                {stats.sizeShortage.length} 个缺口
              </span>
            )}
          </div>
          {stats.sizeShortage.length > 0 ? (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barCategoryGap="20%">
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="库存" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="缺口" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                {stats.sizeShortage.map((s, i) => (
                  <Link
                    key={i}
                    to={`/inventory/${encodeURIComponent(s.category)}?size=${encodeURIComponent(s.size)}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 hover:bg-primary-50 hover:border hover:border-primary-200 transition-all group"
                  >
                    <span className="text-sm text-slate-700 group-hover:text-primary-700">
                      {s.category} · <span className="font-medium">{s.size}码</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">需要 {s.needed} 件</span>
                      <span className="text-xs text-slate-500">现有 {s.available} 件</span>
                      <span className="badge bg-red-100 text-red-700 group-hover:bg-red-200">缺 {s.needed - s.available}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <CheckCircle className="w-12 h-12 mb-2 text-green-400" />
              <p className="text-sm">暂无尺码缺口，库存充足</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-static p-6 animate-fade-slide-up" style={{ animationDelay: "400ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-slate-900">待领取学生</h3>
            <span className="text-xs text-slate-500">共 {students.length - stats.distributedCount} 人未领取</span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {stats.pendingStudents.length > 0 ? (
              stats.pendingStudents.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-700">{s.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.className} · {s.voicePart} · {s.height}cm/{s.weight}kg</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-primary-600 text-xs font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    待领取
                  </div>
                </div>
              ))
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                <CheckCircle className="w-10 h-10 mb-2 text-green-400" />
                <p className="text-sm">所有学生已领取服装</p>
              </div>
            )}
          </div>
        </div>

        <div className="card-static p-6 animate-fade-slide-up" style={{ animationDelay: "500ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-slate-900">待处理事项</h3>
            <span className="text-xs text-slate-500">共 {processRecords.filter(r => r.status !== "已完成").length} 项</span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {stats.pendingRecords.length > 0 ? (
              stats.pendingRecords.map((r) => {
                const student = students.find(s => s.id === r.studentId);
                return (
                  <div key={r.id} className="flex items-start justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className={`badge ${RECORD_COLORS[r.type]} shrink-0 mt-0.5`}>{r.type}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-900 truncate">
                          {student ? `${student.name} - ` : ""}{r.description}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatDateTime(r.createdAt)} · {r.operator}
                        </p>
                      </div>
                    </div>
                    <span className={`badge ${STATUS_COLORS[r.status]} shrink-0 ml-2`}>{r.status}</span>
                  </div>
                );
              })
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                <CheckCircle className="w-10 h-10 mb-2 text-green-400" />
                <p className="text-sm">暂无待处理事项</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
