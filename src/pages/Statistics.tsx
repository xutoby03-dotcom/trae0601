import { useMemo } from "react";
import { useStore } from "@/store";
import { today, getLastNDays } from "@/utils/date";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  SPECIES_LABEL,
  CAGE_STATUS_LABEL,
  ALERT_TYPE_LABEL,
} from "@/types";
import { CageStatusTag } from "@/components/StatusTag";
import {
  ShieldAlert,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Users,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Statistics() {
  const cages = useStore((s) => s.cages);
  const groups = useStore((s) => s.researchGroups);
  const tasks = useStore((s) => s.dailyTasks);
  const alerts = useStore((s) => s.alerts);

  const last7Days = getLastNDays(7);

  const groupStats = useMemo(() => {
    return groups.map((g) => {
      const groupCages = cages.filter((c) => c.researchGroupId === g.id);
      const groupTaskIds = groupCages.map((c) => c.id);
      const todayTasks = tasks.filter(
        (t) => t.taskDate === today() && groupTaskIds.includes(t.cageId)
      );
      const completed = todayTasks.filter((t) => t.status === "completed").length;
      const total = todayTasks.length || 1;
      return {
        id: g.id,
        name: g.name,
        leader: g.leader,
        cageCount: groupCages.length,
        animalCount: groupCages.reduce((s, c) => s + c.animalCount, 0),
        completed,
        total: todayTasks.length,
        rate: Math.round((completed / total) * 100),
      };
    });
  }, [groups, cages, tasks]);

  const trendData = useMemo(() => {
    return last7Days.map((date) => {
      const dayTasks = tasks.filter((t) => t.taskDate === date);
      const dayAlerts = alerts.filter((a) => a.createdAt.startsWith(date));
      return {
        date: date.slice(5),
        已完成: dayTasks.filter((t) => t.status === "completed").length,
        总任务: dayTasks.length,
        异常数: dayAlerts.length,
      };
    });
  }, [last7Days, tasks, alerts]);

  const isolationList = useMemo(() => {
    return cages.filter((c) => c.status === "isolated" || c.status === "warning");
  }, [cages]);

  const alertTypeStats = useMemo(() => {
    const counts: Record<string, number> = {};
    alerts.forEach((a) => {
      counts[a.type] = (counts[a.type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      type: ALERT_TYPE_LABEL[type as keyof typeof ALERT_TYPE_LABEL] || type,
      count,
    }));
  }, [alerts]);

  const overall = useMemo(() => {
    const todayTasks = tasks.filter((t) => t.taskDate === today());
    const completed = todayTasks.filter((t) => t.status === "completed").length;
    const total = todayTasks.length || 1;
    return {
      totalCages: cages.length,
      totalAnimals: cages.reduce((s, c) => s + c.animalCount, 0),
      todayTotal: todayTasks.length,
      todayCompleted: completed,
      todayRate: Math.round((completed / total) * 100),
      unresolved: alerts.filter((a) => !a.resolved).length,
    };
  }, [cages, tasks, alerts]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">统计分析</h1>
        <p className="text-sm text-slate-500 mt-1">
          各课题组任务完成率、异常趋势和待隔离清单
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="笼盒/鱼缸总数"
          value={overall.totalCages}
          icon={<Users className="w-5 h-5" />}
          color="text-primary-600 bg-primary-50"
        />
        <KpiCard
          label="动物总数量"
          value={overall.totalAnimals}
          icon={<Users className="w-5 h-5" />}
          color="text-blue-600 bg-blue-50"
        />
        <KpiCard
          label="今日完成率"
          value={`${overall.todayRate}%`}
          sub={`${overall.todayCompleted}/${overall.todayTotal}`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="text-success-600 bg-success-50"
        />
        <KpiCard
          label="未处理告警"
          value={overall.unresolved}
          icon={<AlertTriangle className="w-5 h-5" />}
          color={
            overall.unresolved > 0
              ? "text-danger-600 bg-danger-50"
              : "text-slate-500 bg-slate-100"
          }
          highlight={overall.unresolved > 0}
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-600" />
              各课题组今日任务完成率
            </h2>
          </div>
          <div className="h-64 min-w-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={300}>
              <BarChart data={groupStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v}%`, "完成率"]}
                />
                <Bar
                  dataKey="rate"
                  fill="#0F766E"
                  radius={[6, 6, 0, 0]}
                  name="完成率"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {groupStats.map((g) => (
              <div key={g.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">{g.name}</span>
                    <span className="text-xs font-mono text-slate-600">{g.rate}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        g.rate >= 80
                          ? "bg-success-500"
                          : g.rate >= 50
                            ? "bg-warning-500"
                            : "bg-danger-500"
                      }`}
                      style={{ width: `${g.rate}%` }}
                    />
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 w-20 text-right">
                  {g.completed}/{g.total} 任务
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning-500" />
              近7天异常趋势
            </h2>
          </div>
          <div className="h-64 min-w-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={300}>
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="已完成"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="总任务"
                  stroke="#0F766E"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="异常数"
                  stroke="#DC2626"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {alertTypeStats.map((a) => (
              <div key={a.type} className="p-3 rounded-xl bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{a.type}</span>
                  <span className="text-sm font-bold font-mono text-slate-900">{a.count}</span>
                </div>
              </div>
            ))}
            {alertTypeStats.length === 0 && (
              <div className="col-span-2 text-center text-sm text-slate-400 py-2">
                暂无异常记录
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="card p-5 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-warning-500" />
              待隔离/警告清单
            </h2>
            <Link
              to="/cages"
              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              全部档案 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {isolationList.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              🎉 当前没有需要关注的笼盒/鱼缸
            </div>
          ) : (
            <div className="space-y-2">
              {isolationList.map((c) => {
                const group = groups.find((g) => g.id === c.researchGroupId);
                return (
                  <Link
                    key={c.id}
                    to={`/cages/${c.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <img
                      src={c.photoUrl}
                      alt={c.cageNumber}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono font-semibold text-sm text-slate-900">
                          {c.cageNumber}
                        </span>
                        <CageStatusTag status={c.status} />
                      </div>
                      <p className="text-xs text-slate-500">
                        {SPECIES_LABEL[c.species]} · {c.animalCount}只 · {group?.name} · 负责人：{c.responsiblePerson}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-600" />
            课题组概览
          </h2>
          <div className="space-y-3">
            {groupStats.map((g) => (
              <div key={g.id} className="p-3 rounded-xl bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-800">{g.name}</span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      g.rate >= 80
                        ? "text-success-600"
                        : g.rate >= 50
                          ? "text-warning-600"
                          : "text-danger-600"
                    }`}
                  >
                    {g.rate}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>组长：{g.leader}</span>
                  <span>{g.cageCount}笼 · {g.animalCount}只</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  color,
  highlight,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div className={`card p-5 ${highlight ? "ring-2 ring-danger-200 animate-pulse-border" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold font-mono ${highlight ? "text-danger-600" : "text-slate-900"}`}>
          {value}
        </span>
        {sub && <span className="text-xs text-slate-500">{sub}</span>}
      </div>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}
