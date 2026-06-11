import { useState, useMemo } from "react";
import {
  TrendingUp,
  Clock,
  Building2,
  Trophy,
  Medal,
  Award,
  AlertTriangle,
  User,
  Download,
  Filter,
  X,
  ChevronDown,
} from "lucide-react";
import { useCardStore } from "@/store/cardStore";
import CardTypeBadge from "@/components/CardTypeBadge";
import { isOverdue, getRemainingTime, formatDate, getDateDaysAgo } from "@/utils/dateUtils";
import {
  generateDailyStatsCsv,
  generateOverdueCsv,
  generateDepartmentRankingCsv,
  generateFullExportCsv,
  downloadCsv,
} from "@/utils/csvExport";
import { CardType } from "@/types";

type TypeFilter = "all" | CardType;
type ExportType = "all" | "daily" | "overdue" | "department";

export default function Statistics() {
  const {
    getDailyStats,
    getDepartmentRanking,
    getOverdueRecords,
    getRecordsByFilter,
  } = useCardStore();

  const today = formatDate(new Date());
  const fourteenDaysAgo = formatDate(getDateDaysAgo(13));

  const [startDate, setStartDate] = useState<string>(fourteenDaysAgo);
  const [endDate, setEndDate] = useState<string>(today);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [showExportMenu, setShowExportMenu] = useState(false);

  const hasFilter =
    startDate !== fourteenDaysAgo ||
    endDate !== today ||
    typeFilter !== "all";

  const clearFilter = () => {
    setStartDate(fourteenDaysAgo);
    setEndDate(today);
    setTypeFilter("all");
  };

  const dailyFilter = useMemo(
    () => ({
      startDate,
      endDate,
      cardType: typeFilter === "all" ? undefined : typeFilter,
    }),
    [startDate, endDate, typeFilter]
  );

  const rankingFilter = useMemo(
    () => ({ startDate, endDate }),
    [startDate, endDate]
  );

  const overdueFilter = useMemo(
    () => ({ startDate, endDate }),
    [startDate, endDate]
  );

  const dailyStats = getDailyStats(dailyFilter);
  const departmentRanking = getDepartmentRanking(rankingFilter);
  const overdueRecords = getOverdueRecords(overdueFilter);

  const filteredRecords = useMemo(() => {
    return getRecordsByFilter({
      startDate,
      endDate,
      cardType: typeFilter === "all" ? undefined : typeFilter,
    });
  }, [startDate, endDate, typeFilter, getRecordsByFilter]);

  const summary = useMemo(() => {
    const total = filteredRecords.length;
    const visitorTotal = filteredRecords.filter(
      (r) => r.cardType === "visitor"
    ).length;
    const employeeTotal = filteredRecords.filter(
      (r) => r.cardType === "employee"
    ).length;
    const lostCount = filteredRecords.filter((r) => r.status === "lost").length;
    const overdueActiveCount = overdueRecords.length;

    return {
      total,
      visitorTotal,
      employeeTotal,
      lostCount,
      overdueActiveCount,
    };
  }, [filteredRecords, overdueRecords]);

  const chartHeight = 220;
  const chartPadding = { top: 20, right: 20, bottom: 30, left: 36 };
  const maxCount = Math.max(
    1,
    ...dailyStats.map((d) => d.visitorCount + d.employeeCount)
  );

  const chartInnerWidth = 100 - (chartPadding.left + chartPadding.right) / 8;
  const barGroupWidth = chartInnerWidth / Math.max(1, dailyStats.length);
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

  const cardTypeLabel =
    typeFilter === "all"
      ? "全部卡类型"
      : typeFilter === "visitor"
      ? "访客卡"
      : "员工临时卡";
  const dateRangeLabel = `${startDate} 至 ${endDate}`;
  const filterLabel = `${dateRangeLabel} · ${cardTypeLabel}`;

  const handleExport = (type: ExportType) => {
    const filename = `工牌借用统计_${formatDate(new Date())}`;
    const filters = { cardType: cardTypeLabel, dateRange: dateRangeLabel };

    if (type === "all") {
      const csv = generateFullExportCsv(
        dailyStats,
        overdueRecords,
        departmentRanking,
        filters
      );
      downloadCsv(csv, `${filename}_完整报表.csv`);
    } else if (type === "daily") {
      const csv = generateDailyStatsCsv(dailyStats, cardTypeLabel);
      downloadCsv(csv, `${filename}_每日借用量.csv`);
    } else if (type === "overdue") {
      const csv = generateOverdueCsv(overdueRecords, dateRangeLabel);
      downloadCsv(csv, `${filename}_超时未还.csv`);
    } else if (type === "department") {
      const csv = generateDepartmentRankingCsv(
        departmentRanking,
        dateRangeLabel
      );
      downloadCsv(csv, `${filename}_部门排行.csv`);
    }

    setShowExportMenu(false);
  };

  const typeOptions: { value: TypeFilter; label: string }[] = [
    { value: "all", label: "全部" },
    { value: "employee", label: "员工临时卡" },
    { value: "visitor", label: "访客卡" },
  ];

  const exportOptions: { value: ExportType; label: string; desc: string }[] = [
    { value: "all", label: "完整报表", desc: "包含每日借用、超时未还、部门排行" },
    { value: "daily", label: "每日借用量", desc: "按日期统计借用数量" },
    { value: "overdue", label: "超时未还列表", desc: "超时未还卡片明细" },
    { value: "department", label: "部门忘带排行", desc: "部门忘带工牌次数排行" },
  ];

  return (
    <div className="space-y-6">
      <div className="card-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-zinc-400" />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">日期范围</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field py-1.5 px-2.5 text-xs w-32"
                />
                <span className="text-zinc-400">至</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field py-1.5 px-2.5 text-xs w-32"
                />
              </div>

              <div className="h-6 w-px bg-zinc-200" />

              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">卡类型</span>
                <div className="flex items-center bg-zinc-100 rounded-lg p-0.5">
                  {typeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTypeFilter(opt.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        typeFilter === opt.value
                          ? "bg-white text-brand-700 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {hasFilter && (
              <button
                onClick={clearFilter}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-all"
              >
                <X className="w-3.5 h-3.5" />
                重置
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="btn-primary py-2 px-4 text-sm"
            >
              <Download className="w-4 h-4 mr-1.5" />
              导出 CSV
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-zinc-100 py-2 z-20 animate-slide-up">
                {exportOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleExport(opt.value)}
                    className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-zinc-900">
                      {opt.label}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {hasFilter && (
          <div className="mt-4 pt-4 border-t border-zinc-100">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-700 text-xs font-medium rounded-full">
              <Filter className="w-3.5 h-3.5" />
              筛选条件：{filterLabel}
            </span>
          </div>
        )}
      </div>

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
            <p className="text-sm text-zinc-500 mt-0.5">
              {hasFilter
                ? `${dateRangeLabel} · ${cardTypeLabel}`
                : "最近 14 天借用情况"}
            </p>
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
          <svg
            className="w-full h-full"
            viewBox={`0 0 800 ${chartHeight}`}
            preserveAspectRatio="none"
          >
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
                  Math.max(1, dailyStats.length) +
                barGroupWidth * 0.15;
              const visitorY = getY(d.visitorCount);
              const employeeY = getY(d.employeeCount);
              const baseY = chartHeight - chartPadding.bottom;
              const showLabel = dailyStats.length <= 14 || i % 2 === 0;

              return (
                <g key={d.date}>
                  <rect
                    x={groupX}
                    y={visitorY}
                    width={barWidth * 4.5}
                    height={Math.max(2, baseY - visitorY)}
                    fill="#fbbf24"
                    rx={3}
                    opacity={0.9}
                  />
                  <rect
                    x={groupX + barWidth * 5}
                    y={employeeY}
                    width={barWidth * 4.5}
                    height={Math.max(2, baseY - employeeY)}
                    fill="#1e4a7e"
                    rx={3}
                    opacity={0.9}
                  />
                  {showLabel && (
                    <text
                      x={
                        chartPadding.left +
                        (i *
                          (800 - chartPadding.left - chartPadding.right)) /
                          Math.max(1, dailyStats.length) +
                        (800 - chartPadding.left - chartPadding.right) /
                          Math.max(1, dailyStats.length) /
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
              <h2 className="font-semibold text-zinc-900">
                部门忘带工牌排行
              </h2>
              <p className="text-sm text-zinc-500 mt-0.5">
                {hasFilter
                  ? `${dateRangeLabel} · 按借用员工临时卡次数排名`
                  : "按借用员工临时卡次数排名"}
              </p>
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
              该时间段暂无员工临时卡借用数据
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
                {hasFilter
                  ? `${dateRangeLabel} · 共 ${overdueRecords.length} 条超时记录`
                  : `共 ${overdueRecords.length} 条超时记录`}
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
                    借出: {record.borrowTime} · 应还:{" "}
                    {record.expectedReturnTime}
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
              <div className="text-xs text-zinc-400 mt-1">
                所有卡片均按时归还
              </div>
            </div>
          )}
        </div>
      </div>

      {showExportMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowExportMenu(false)}
        />
      )}
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
