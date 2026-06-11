import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { isWithinDays, formatDate } from "@/utils/washUtils";
import { CONFLICT_TYPE_LABELS, CONFLICT_TYPE_COLORS } from "@/types";
import type { ConflictType } from "@/types";
import {
  WashingMachine,
  AlertTriangle,
  Users,
  TrendingUp,
  Shirt,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

const COLORS = ["#03A9F4", "#EF5350", "#66BB6A", "#FFA726", "#AB47BC", "#26A69A"];

interface WeekConflictDetail {
  historyId: string;
  completedAt: string;
  conflictId: string;
  clothing1Name: string;
  clothing2Name: string;
  description: string;
}

export default function SummaryPage() {
  const history = useStore((s) => s.history);
  const members = useStore((s) => s.members);
  const clothings = useStore((s) => s.clothings);
  const navigate = useNavigate();

  const [expandedType, setExpandedType] = useState<ConflictType | null>(null);

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
      memberWeekWashCount,
      weekHistory,
    };
  }, [history]);

  const conflictChartData = useMemo(() => {
    return Object.entries(stats.conflictCount)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({
        type: k as ConflictType,
        name: CONFLICT_TYPE_LABELS[k as ConflictType],
        value: v,
        fill: CONFLICT_TYPE_COLORS[k as ConflictType],
      }))
      .sort((a, b) => b.value - a.value);
  }, [stats.conflictCount]);

  const weekConflictDetails = useMemo(() => {
    const details: WeekConflictDetail[] = [];
    stats.weekHistory.forEach((h) => {
      h.conflicts.forEach((c) => {
        const c1 = clothings.find((cl) => cl.id === c.clothingId1);
        const c2 = clothings.find((cl) => cl.id === c.clothingId2);
        details.push({
          historyId: h.id,
          completedAt: h.completedAt,
          conflictId: c.id,
          clothing1Name: c1?.name || "已删除衣物",
          clothing2Name: c2?.name || "已删除衣物",
          description: c.description,
        });
      });
    });
    return details;
  }, [stats.weekHistory, clothings]);

  const detailsForType = useMemo(() => {
    if (!expandedType) return [];
    return weekConflictDetails.filter((d) => {
      const conflictFromHistory = stats.weekHistory.find((h) =>
        h.conflicts.some((c) => c.id === d.conflictId)
      );
      if (!conflictFromHistory) return false;
      return conflictFromHistory.conflicts.some(
        (c) => c.id === d.conflictId && c.type === expandedType
      );
    });
  }, [expandedType, weekConflictDetails, stats.weekHistory]);

  const handleBarClick = (data: { type: ConflictType }) => {
    setExpandedType((prev) => (prev === data.type ? null : data.type));
  };

  const memberChartData = useMemo(() => {
    return members.map((m, idx) => ({
      name: `${m.avatar} ${m.name}`,
      本周洗涤: stats.memberWeekWashCount[m.id] || 0,
      fill: COLORS[idx % COLORS.length],
    }));
  }, [members, stats.memberWeekWashCount]);

  const pieData = useMemo(() => {
    return members
      .map((m, idx) => ({
        name: `${m.avatar} ${m.name}`,
        value: stats.memberWeekWashCount[m.id] || 0,
        fill: COLORS[idx % COLORS.length],
      }))
      .filter((d) => d.value > 0);
  }, [members, stats.memberWeekWashCount]);

  const hasHistory = history.length > 0;
  const hasWeekData = stats.weekWashCount > 0;

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
            {expandedType && (
              <span className="ml-auto rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-500">
                点击柱子展开/收起明细
              </span>
            )}
          </div>
          {conflictChartData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-neutral-400">
              暂无风险记录，继续保持！
            </div>
          ) : (
            <>
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
                    <Bar
                      dataKey="value"
                      radius={[0, 6, 6, 0]}
                      onClick={(data) => handleBarClick(data as { type: ConflictType })}
                      cursor="pointer"
                    >
                      {conflictChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.fill}
                          opacity={expandedType && expandedType !== entry.type ? 0.4 : 1}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {expandedType && (
                <div className="mt-4 animate-fade-in border-t border-neutral-100 pt-4">
                  <div className="mb-3 flex items-center gap-2">
                    <ChevronDown className="h-4 w-4 text-primary-500" />
                    <span className="text-sm font-semibold text-neutral-700">
                      {CONFLICT_TYPE_LABELS[expandedType]} — 本周相关记录
                    </span>
                  </div>

                  {detailsForType.length === 0 ? (
                    <p className="py-4 text-center text-xs text-neutral-400">
                      本周无此类冲突
                    </p>
                  ) : (
                    <div className="max-h-64 space-y-2 overflow-y-auto scrollbar-thin pr-1">
                      {detailsForType.map((d) => (
                        <div
                          key={d.conflictId}
                          className="group rounded-xl border border-neutral-100 bg-neutral-50/80 p-3 transition-all hover:border-primary-200 hover:bg-primary-50/50"
                        >
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-xs text-neutral-400">
                              {formatDate(d.completedAt)}
                            </span>
                            <button
                              onClick={() => navigate(`/history?historyId=${d.historyId}`)}
                              className="flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-primary-600 opacity-0 shadow-soft transition-all hover:bg-primary-50 group-hover:opacity-100"
                            >
                              <ExternalLink className="h-3 w-3" />
                              查看历史
                            </button>
                          </div>
                          <div className="mb-1 flex items-center gap-1.5 text-xs">
                            <span className="rounded-md bg-white px-1.5 py-0.5 font-medium text-neutral-700 shadow-soft">
                              {d.clothing1Name}
                            </span>
                            <span className="text-neutral-300">vs</span>
                            <span className="rounded-md bg-white px-1.5 py-0.5 font-medium text-neutral-700 shadow-soft">
                              {d.clothing2Name}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed text-neutral-500">
                            {d.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div
          className="animate-fade-in rounded-2xl bg-white p-6 shadow-card"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-neutral-800">
              本周谁的衣服洗得最多
            </h2>
          </div>
          {!hasWeekData ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-neutral-400">
              <WashingMachine className="h-10 w-10 opacity-30" />
              本周暂无洗衣记录
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
              各成员本周洗衣量
            </h2>
          </div>
          {!hasWeekData ? (
            <div className="flex h-72 flex-col items-center justify-center gap-2 text-sm text-neutral-400">
              <WashingMachine className="h-12 w-12 opacity-30" />
              暂无洗衣记录，洗完第一桶后再来看看谁的衣服最多
            </div>
          ) : (
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
                    dataKey="本周洗涤"
                    fill="#03A9F4"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
