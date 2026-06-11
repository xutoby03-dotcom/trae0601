import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useStore } from "@/store/useStore";
import { isWithinDays } from "@/utils/washUtils";
import { CONFLICT_TYPE_LABELS, CONFLICT_TYPE_COLORS } from "@/types";
import type { ConflictType } from "@/types";
import {
  WashingMachine,
  AlertTriangle,
  Users,
  TrendingUp,
  Shirt,
} from "lucide-react";

const COLORS = ["#03A9F4", "#EF5350", "#66BB6A", "#FFA726", "#AB47BC", "#26A69A"];

export default function SummaryPage() {
  const history = useStore((s) => s.history);
  const members = useStore((s) => s.members);
  const clothings = useStore((s) => s.clothings);

  const stats = useMemo(() => {
    const weekHistory = history.filter((h) => isWithinDays(h.completedAt, 7));
    const totalClothesInWeek = weekHistory.reduce(
      (sum, h) => sum + h.clothingIds.length,
      0
    );

    const conflictCount: Record<ConflictType, number> = {
      color: 0,
      wool: 0,
      towel: 0,
      underwear: 0,
      temperature: 0,
    };

    history.forEach((h) => {
      h.conflicts.forEach((c) => {
        conflictCount[c.type] = (conflictCount[c.type] || 0) + 1;
      });
    });

    const memberClothingCount: Record<string, number> = {};
    clothings.forEach((c) => {
      memberClothingCount[c.memberId] =
        (memberClothingCount[c.memberId] || 0) + 1;
    });

    const memberWeekWashCount: Record<string, number> = {};
    weekHistory.forEach((h) => {
      Object.entries(h.memberStats).forEach(([mid, cnt]) => {
        memberWeekWashCount[mid] = (memberWeekWashCount[mid] || 0) + cnt;
      });
    });

    return {
      weekWashCount: weekHistory.length,
      totalClothesInWeek,
      totalConflicts: Object.values(conflictCount).reduce((a, b) => a + b, 0),
      conflictCount,
      memberClothingCount,
      memberWeekWashCount,
    };
  }, [history, clothings]);

  const conflictChartData = useMemo(() => {
    return Object.entries(stats.conflictCount)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({
        name: CONFLICT_TYPE_LABELS[k as ConflictType],
        value: v,
        fill: CONFLICT_TYPE_COLORS[k as ConflictType],
      }))
      .sort((a, b) => b.value - a.value);
  }, [stats.conflictCount]);

  const memberChartData = useMemo(() => {
    return members.map((m, idx) => ({
      name: `${m.avatar} ${m.name}`,
      衣物总数: stats.memberClothingCount[m.id] || 0,
      本周洗涤: stats.memberWeekWashCount[m.id] || 0,
      fill: COLORS[idx % COLORS.length],
    }));
  }, [members, stats.memberClothingCount, stats.memberWeekWashCount]);

  const pieData = useMemo(() => {
    return members
      .map((m, idx) => ({
        name: `${m.avatar} ${m.name}`,
        value: stats.memberClothingCount[m.id] || 0,
        fill: COLORS[idx % COLORS.length],
      }))
      .filter((d) => d.value > 0);
  }, [members, stats.memberClothingCount]);

  return (
    <div className="container py-6">
      <div className="mb-6 animate-fade-in">
        <h1 className="font-display text-3xl font-bold text-neutral-800">
          📊 数据小结
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          了解家中洗衣习惯，优化洗衣方式
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div
          className="animate-fade-in rounded-2xl bg-white p-5 shadow-card"
          style={{ animationDelay: "0.05s" }}
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
            <WashingMachine className="h-5 w-5 text-primary-600" />
          </div>
          <div className="text-3xl font-bold text-neutral-800">
            {stats.weekWashCount}
          </div>
          <div className="text-sm text-neutral-500">本周洗衣桶数</div>
        </div>

        <div
          className="animate-fade-in rounded-2xl bg-white p-5 shadow-card"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
            <Shirt className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-neutral-800">
            {stats.totalClothesInWeek}
          </div>
          <div className="text-sm text-neutral-500">本周洗涤件数</div>
        </div>

        <div
          className="animate-fade-in rounded-2xl bg-white p-5 shadow-card"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-neutral-800">
            {stats.totalConflicts}
          </div>
          <div className="text-sm text-neutral-500">历史风险总数</div>
        </div>

        <div
          className="animate-fade-in rounded-2xl bg-white p-5 shadow-card"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-neutral-800">
            {members.length}
          </div>
          <div className="text-sm text-neutral-500">家庭成员数</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div
          className="animate-fade-in rounded-2xl bg-white p-6 shadow-card"
          style={{ animationDelay: "0.25s" }}
        >
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-neutral-800">
              最常混错类型
            </h2>
          </div>
          {conflictChartData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-neutral-400">
              暂无风险记录，继续保持！
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={conflictChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {conflictChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div
          className="animate-fade-in rounded-2xl bg-white p-6 shadow-card"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-neutral-800">
              衣物数量分布
            </h2>
          </div>
          {pieData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-neutral-400">
              暂无衣物数据
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div
          className="animate-fade-in rounded-2xl bg-white p-6 shadow-card lg:col-span-2"
          style={{ animationDelay: "0.35s" }}
        >
          <div className="mb-4 flex items-center gap-2">
            <WashingMachine className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-neutral-800">
              各成员衣物 vs 本周洗涤对比
            </h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={memberChartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="衣物总数"
                  fill="#03A9F4"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="本周洗涤"
                  fill="#66BB6A"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
