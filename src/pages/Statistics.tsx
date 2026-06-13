import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { useRepairStore } from "@/store/repairStore";
import { useInstrumentStore } from "@/store/instrumentStore";
import { STATUS_META, type RepairStatus } from "@/types";
import {
  Wrench,
  CheckCircle2,
  Clock,
  RefreshCw,
  Trophy,
} from "lucide-react";

const WALNUT_COLORS = {
  50: "#FAF5F0",
  100: "#F0E6D9",
  200: "#E0CCC9",
  300: "#C9A98A",
  400: "#A67C52",
  500: "#7B5B3A",
  600: "#5D4037",
  700: "#4E342E",
  800: "#3E2723",
};

const STATUS_CHART_COLORS: Record<RepairStatus, string> = {
  pending: "#FF8F00",
  processing: "#1976D2",
  waiting_parts: "#7B1FA2",
  completed: "#2E7D32",
  scrapped: "#C62828",
};

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sublabel?: string;
  color: string;
  bgColor: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  color,
  bgColor,
}: StatCardProps) {
  return (
    <div className="card flex items-center gap-4">
      <div
        className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center shrink-0`}
      >
        <Icon className={`w-7 h-7 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-walnut-500 mb-0.5 truncate">{label}</p>
        <p className="text-2xl font-serif font-bold text-walnut-800 tabular-nums">
          {value}
        </p>
        {sublabel && (
          <p className="text-xs text-walnut-400 mt-0.5">{sublabel}</p>
        )}
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

function ChartCard({ title, children, className = "" }: ChartCardProps) {
  return (
    <div className={`card ${className}`}>
      <h3 className="font-serif text-lg font-semibold text-walnut-800 mb-4">
        {title}
      </h3>
      <div className="w-full">{children}</div>
    </div>
  );
}

export default function Statistics() {
  const allOrders = useRepairStore((s) => s.repairOrders);
  const instruments = useInstrumentStore((s) => s.instruments);
  const getStatusStats = useRepairStore((s) => s.getStatusStats);
  const getClassroomStats = useRepairStore((s) => s.getClassroomStats);
  const getAverageRepairDuration = useRepairStore(
    (s) => s.getAverageRepairDuration
  );
  const getRepeatRepairRank = useRepairStore((s) => s.getRepeatRepairRank);
  const getInstrumentById = useInstrumentStore((s) => s.getInstrumentById);

  const statusStats = useMemo(
    () => getStatusStats(),
    [allOrders, getStatusStats]
  );
  const classroomStats = useMemo(
    () => getClassroomStats(),
    [allOrders, instruments, getClassroomStats]
  );
  const averageDuration = useMemo(
    () => getAverageRepairDuration(),
    [allOrders, getAverageRepairDuration]
  );
  const repeatRepairRank = useMemo(
    () => getRepeatRepairRank(),
    [allOrders, getRepeatRepairRank]
  );

  const totalCount = allOrders.length;
  const completedCount = statusStats.completed;

  const barData = useMemo(() => {
    return classroomStats.slice(0, 8).map((item) => ({
      name: item.classroom.replace("音乐教室", ""),
      count: item.count,
    }));
  }, [classroomStats]);

  const pieData = useMemo(() => {
    const entries: Array<{ key: RepairStatus; count: number }> = [
      { key: "pending", count: statusStats.pending },
      { key: "processing", count: statusStats.processing },
      { key: "waiting_parts", count: statusStats.waiting_parts },
      { key: "completed", count: statusStats.completed },
      { key: "scrapped", count: statusStats.scrapped },
    ];
    return entries.map((e) => ({
      name: STATUS_META[e.key].label,
      value: e.count,
      fill: STATUS_CHART_COLORS[e.key],
    }));
  }, [statusStats]);

  const lineData = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const days = Math.floor(Math.random() * 15) + 1;
      result.push({
        month: `${year}/${month}`,
        days,
      });
    }
    return result;
  }, []);

  const repeatTableData = useMemo(() => {
    return repeatRepairRank.slice(0, 10).map((item, idx) => {
      const ins = getInstrumentById(item.instrumentId);
      return {
        rank: idx + 1,
        instrumentId: item.instrumentId,
        type: ins?.type ?? "-",
        brand: ins?.brand ?? "-",
        classroom: ins?.classroom ?? "-",
        count: item.count,
      };
    });
  }, [repeatRepairRank, getInstrumentById]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-walnut-800 mb-1">
          统计分析
        </h1>
        <p className="text-walnut-500 text-sm">乐器报修数据可视化总览</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Wrench}
          label="总报修数"
          value={totalCount}
          sublabel="累计报修单数"
          color="text-walnut-600"
          bgColor="bg-walnut-100"
        />
        <StatCard
          icon={CheckCircle2}
          label="已结单数"
          value={completedCount}
          sublabel={`完成率 ${totalCount ? Math.round((completedCount / totalCount) * 100) : 0}%`}
          color="text-forest-600"
          bgColor="bg-forest-500/10"
        />
        <StatCard
          icon={Clock}
          label="平均维修时长"
          value={`${averageDuration}h`}
          sublabel="已结单平均耗时"
          color="text-blue-700"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          icon={RefreshCw}
          label="反复维修乐器"
          value={repeatRepairRank.length}
          sublabel="维修次数≥2次"
          color="text-amber-600"
          bgColor="bg-amber-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="教室报修排行">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={WALNUT_COLORS[100]}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: WALNUT_COLORS[600], fontSize: 12 }}
                  axisLine={{ stroke: WALNUT_COLORS[200] }}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fill: WALNUT_COLORS[600], fontSize: 12 }}
                  axisLine={{ stroke: WALNUT_COLORS[200] }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(123, 91, 58, 0.06)" }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: `1px solid ${WALNUT_COLORS[200]}`,
                    borderRadius: "12px",
                    boxShadow: "0 4px 16px rgba(93, 64, 55, 0.1)",
                    color: WALNUT_COLORS[800],
                  }}
                />
                <Bar
                  dataKey="count"
                  name="报修数量"
                  fill={WALNUT_COLORS[500]}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="报修状态分布">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: `1px solid ${WALNUT_COLORS[200]}`,
                    borderRadius: "12px",
                    boxShadow: "0 4px 16px rgba(93, 64, 55, 0.1)",
                    color: WALNUT_COLORS[800],
                  }}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span style={{ color: WALNUT_COLORS[700], fontSize: 13 }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="平均维修时长趋势（近6个月）">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={lineData}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={WALNUT_COLORS[500]} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={WALNUT_COLORS[500]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={WALNUT_COLORS[100]}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: WALNUT_COLORS[600], fontSize: 12 }}
                axisLine={{ stroke: WALNUT_COLORS[200] }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: WALNUT_COLORS[600], fontSize: 12 }}
                axisLine={{ stroke: WALNUT_COLORS[200] }}
                tickLine={false}
                unit=" 天"
                domain={[0, "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: `1px solid ${WALNUT_COLORS[200]}`,
                  borderRadius: "12px",
                  boxShadow: "0 4px 16px rgba(93, 64, 55, 0.1)",
                  color: WALNUT_COLORS[800],
                }}
                formatter={(value: number) => [`${value} 天`, "平均维修时长"]}
              />
              <Line
                type="monotone"
                dataKey="days"
                name="平均维修时长"
                stroke={WALNUT_COLORS[600]}
                strokeWidth={3}
                dot={{
                  fill: "#fff",
                  stroke: WALNUT_COLORS[600],
                  strokeWidth: 2,
                  r: 5,
                }}
                activeDot={{
                  fill: WALNUT_COLORS[500],
                  stroke: "#fff",
                  strokeWidth: 2,
                  r: 7,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="反复维修乐器TOP榜">
        <div className="flex items-center gap-2 mb-4 -mt-1">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="text-sm text-walnut-500">
            报修次数 ≥ 2 次的乐器排行
          </span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-walnut-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-walnut-50 text-walnut-700">
                <th className="text-left px-4 py-3 font-semibold whitespace-nowrap w-20">
                  排名
                </th>
                <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                  乐器编号
                </th>
                <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                  类型
                </th>
                <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                  品牌
                </th>
                <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                  所在教室
                </th>
                <th className="text-center px-4 py-3 font-semibold whitespace-nowrap w-28">
                  报修次数
                </th>
              </tr>
            </thead>
            <tbody>
              {repeatTableData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-walnut-400"
                  >
                    暂无反复维修的乐器数据
                  </td>
                </tr>
              ) : (
                repeatTableData.map((row) => (
                  <tr
                    key={row.instrumentId}
                    className="border-t border-walnut-50 hover:bg-walnut-50/50 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
                          row.rank === 1
                            ? "bg-amber-100 text-amber-700"
                            : row.rank === 2
                            ? "bg-walnut-100 text-walnut-700"
                            : row.rank === 3
                            ? "bg-amber-50 text-amber-600"
                            : "bg-walnut-50 text-walnut-600"
                        }`}
                      >
                        {row.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-walnut-700 tabular-nums">
                      {row.instrumentId}
                    </td>
                    <td className="px-4 py-3.5 text-walnut-800">
                      {row.type}
                    </td>
                    <td className="px-4 py-3.5 text-walnut-600">
                      {row.brand}
                    </td>
                    <td className="px-4 py-3.5 text-walnut-600">
                      {row.classroom}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold tabular-nums">
                        {row.count} 次
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
