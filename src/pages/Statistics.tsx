import { useMemo } from "react";
import {
  TrendingUp,
  Clock,
  Building2,
  Trophy,
  Medal,
  Award,
  AlertTriangle,
  User,
} from "lucide-react";
import { useCardStore } from "@/store/cardStore";
import CardTypeBadge from "@/components/CardTypeBadge";
import { isOverdue, getRemainingTime } from "@/utils/dateUtils";

export default function Statistics() {
  const { getDailyStats, getDepartmentRanking, getOverdueRecords, records } =
    useCardStore();

  const dailyStats = getDailyStats(14);
  const departmentRanking = getDepartmentRanking();
  const overdueRecords = getOverdueRecords();

  const summary = useMemo(() => {
    const total = records.length;
    const visitorTotal = records.filter((r) => r.cardType === "visitor").length;
    const employeeTotal = records.filter((r) => r.cardType === "employee").length;
    const lostCount = records.filter((r) => r.status === "lost").length;
    const overdueActiveCount = overdueRecords.length;

    return {
      total,
      visitorTotal,
      employeeTotal,
      lostCount,
      overdueActiveCount,
    };
  }, [records, overdueRecords]);

  const chartHeight = 220;
  const chartPadding = { top: 20, right: 20, bottom: 30, left: 36 };
  const maxCount = Math.max(
    1,
    ...dailyStats.map((d) => d.visitorCount + d.employeeCount)
  );

  const chartInnerWidth = 100 - (chartPadding.left + chartPadding.right) / 8;
  const barGroupWidth = chartInnerWidth / dailyStats.length;
  const barWidth = barGroupWidth * 0.35;

  function getY(value: number): number {
    const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom;
    return chartPadding.top + innerHeight * (1 - value / maxCount);
  }

  const rankColors = [
    "from-amber-400 to-amber-500",
    "from-zinc-300 to-zinc-400",
    "from-orange-400 to-orange-500",
  ];
  const rankIcons = [Trophy, Medal, Award];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-5">
        <StatCard
          icon={TrendingUp}
          label="累计借用次数"
          value={summary.total}
          sub={`访客 ${summary.visitorTotal} · 员工 ${summary.employeeTotal}`}
          bgClass="bg-gradient-to-br from-brand-50 to-brand-100/50"
          iconBg="bg-brand-600"
          textClass="text-brand-700"
        />
        <StatCard
          icon={AlertTriangle}
          label="超时未还次数"
          value={summary.overdueActiveCount}
          sub="当前仍未归还"
          bgClass="bg-gradient-to-br from-orange-50 to-orange-100/50"
          iconBg="bg-orange-500"
          textClass="text-orange-700"
        />
        <StatCard
          icon={User}
          label="访客卡借用"
          value={summary.visitorTotal}
          sub={`占比 ${
            summary.total
              ? Math.round((summary.visitorTotal / summary.total) * 100)
              : 0
          }%`}
          bgClass="bg-gradient-to-br from-amber-50 to-amber-100/50"
          iconBg="bg-amber-500"
          textClass="text-amber-700"
        />
        <StatCard
          icon={Building2}
          label="员工临时卡借用"
          value={summary.employeeTotal}
          sub={`占比 ${
            summary.total
              ? Math.round((summary.employeeTotal / summary.total) * 100)
              : 0
          }%`}
          bgClass="bg-gradient-to-br from-teal-50 to-teal-100/50"
          iconBg="bg-teal-600"
          textClass="text-teal-700"
        />
      </div>

      <div className="card-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-zinc-900">每日借用趋势</h2>
            <p className="text-sm text-zinc-500 mt-0.5">最近 14 天借用情况</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-400"></span>
              <span className="text-zinc-600">访客卡</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-brand-600"></span>
              <span className="text-zinc-600">员工临时卡</span>
            </span>
          </div>
        </div>

        <div className="relative w-full" style={{ height: chartHeight }}>
          <svg className="w-full h-full" viewBox={`0 0 800 ${chartHeight}`} preserveAspectRatio="none">
            {Array.from({ length: Math.max(1, maxCount) + 1 }).map((_, i) => {
              const y = getY(i);
              return (
                <line
                  key={i}
                  x1={chartPadding.left}
                  x2={800 - chartPadding.right}
                  y1={y}
                  y2={y}
                  stroke="#f4f4f5"
                  strokeWidth={1}
                />
              );
            })}

            {Array.from({ length: Math.max(1, maxCount) + 1 }).map((_, i) => (
              <text
                key={`label-${i}`}
                x={chartPadding.left - 8}
                y={getY(i) + 4}
                textAnchor="end"
                fontSize={10}
                fill="#a1a1aa"
              >
                {i}
              </text>
            ))}

            {dailyStats.map((d, i) => {
              const groupX =
                chartPadding.left +
                (i * (800 - chartPadding.left - chartPadding.right)) /
                  dailyStats.length +
                barGroupWidth * 0.15;
              const visitorY = getY(d.visitorCount);
              const employeeY = getY(d.employeeCount);
              const baseY = chartHeight - chartPadding.bottom;

              return (
                <g key={d.date}>
                  <rect
                    x={groupX}
                    y={visitorY}
                    width={barWidth * 4.5}
                    height={baseY - visitorY}
                    fill="#fbbf24"
                    rx={3}
                    opacity={0.9}
                  />
                  <rect
                    x={groupX + barWidth * 5}
                    y={employeeY}
                    width={barWidth * 4.5}
                    height={baseY - employeeY}
                    fill="#1e4a7e"
                    rx={3}
                    opacity={0.9}
                  />
                  {i % 2 === 0 && (
                    <text
                      x={
                        chartPadding.left +
                        (i *
                          (800 - chartPadding.left - chartPadding.right)) /
                          dailyStats.length +
                        (800 - chartPadding.left - chartPadding.right) /
                          dailyStats.length /
                          2
                      }
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fontSize={10}
                      fill="#71717a"
                    >
                      {d.date}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card-panel p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900">部门忘带工牌排行</h2>
              <p className="text-sm text-zinc-500 mt-0.5">按借用员工临时卡次数排名</p>
            </div>
          </div>

          {departmentRanking.length > 0 ? (
            <div className="space-y-2.5">
              {departmentRanking.map((dept, index) => {
                const IconComp = rankIcons[index] || Building2;
                const maxCount = departmentRanking[0]?.count || 1;
                const percentage = (dept.count / maxCount) * 100;

                return (
                  <div
                    key={dept.department}
                    className={`rounded-xl p-3.5 transition-all hover:bg-zinc-50 ${
                      index < 3 ? "bg-zinc-50/60" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          index < 3
                            ? `bg-gradient-to-br ${rankColors[index]} text-white`
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-zinc-900 text-sm">
                            {dept.department}
                          </span>
                          <span className="text-sm font-semibold text-zinc-700">
                            {dept.count} 次
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              index === 0
                                ? "bg-gradient-to-r from-amber-400 to-amber-500"
                                : index === 1
                                ? "bg-gradient-to-r from-zinc-400 to-zinc-500"
                                : index === 2
                                ? "bg-gradient-to-r from-orange-400 to-orange-500"
                                : "bg-brand-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-400 text-sm">
              暂无员工临时卡借用数据
            </div>
          )}
        </div>

        <div className="card-panel p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900">超时未还列表</h2>
              <p className="text-sm text-zinc-500 mt-0.5">
                共 {overdueRecords.length} 条超时记录
              </p>
            </div>
          </div>

          {overdueRecords.length > 0 ? (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {overdueRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-3.5 rounded-xl bg-red-50/50 border border-red-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-sm text-zinc-900">
                        {record.cardNumber}
                      </span>
                      <CardTypeBadge type={record.cardType} />
                    </div>
                    <span className="text-xs font-medium text-red-600">
                      超时 {getRemainingTime(record.expectedReturnTime)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-zinc-700">
                    {record.borrowerName} · {record.department}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    借出: {record.borrowTime} · 应还: {record.expectedReturnTime}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-7 h-7 text-teal-600" />
              </div>
              <div className="text-sm text-teal-700 font-medium">
                当前无超时未还卡片
              </div>
              <div className="text-xs text-zinc-400 mt-1">所有卡片均按时归还</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub: string;
  bgClass: string;
  iconBg: string;
  textClass: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  bgClass,
  iconBg,
  textClass,
}: StatCardProps) {
  return (
    <div
      className={`card-panel p-5 ${bgClass} border-0 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-sm font-medium text-zinc-500`}>{label}</div>
          <div className={`text-3xl font-bold mt-2 ${textClass}`}>{value}</div>
        </div>
        <div
          className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center shadow-sm`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/60">
        <span className={`text-xs ${textClass}`}>{sub}</span>
      </div>
    </div>
  );
}
