import { useMemo } from "react";
import {
  Store,
  AlertTriangle,
  Users,
  Building2,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Award,
  PackageX,
  UserX,
  Clock,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Tag from "@/components/UI/Tag";
import { useOrderStore } from "@/store/order";
import { useEmployeeStore } from "@/store/employee";
import { useExceptionStore } from "@/store/exception";
import { DEPARTMENTS, RESTAURANTS } from "@/types";
import { cn } from "@/lib/utils";
import {
  todayStr,
  lastNDays,
  refundStatusColor,
  refundStatusLabel,
  exceptionTypeLabel,
} from "@/utils/formatters";
import { DEPARTMENT_COLOR } from "@/utils/colors";
import { getHistoryLeakRateData } from "@/utils/mockData";

const CHART_COLORS = [
  "#FF7A45",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EC4899",
  "#14B8A6",
  "#6366F1",
  "#F97316",
  "#06B6D4",
];

export default function StatsPage() {
  const { orders } = useOrderStore();
  const { employees } = useEmployeeStore();
  const { exceptions, getPendingRefunds } = useExceptionStore();

  const today = todayStr();
  const historyDays = useMemo(() => lastNDays(7), []);
  const leakRateHistory = useMemo(() => getHistoryLeakRateData(), []);

  const todayOrders = useMemo(
    () => orders.filter((o) => o.orderDate === today),
    [orders, today]
  );

  const overall = useMemo(() => {
    const allPaid = orders.filter((o) => o.paymentStatus === "paid").length;
    const allUnpaid = orders.filter((o) => o.paymentStatus === "unpaid").length;
    const allPicked = todayOrders.filter(
      (o) => o.pickupStatus === "picked"
    ).length;
    const notPicked = todayOrders.filter(
      (o) => o.pickupStatus === "pending" && o.packingStatus !== "exception"
    );
    const todayExceptions = exceptions.filter((e) => e.createdAt === today);
    const avgLeak =
      leakRateHistory.reduce((sum, d) => sum + d.rate, 0) /
      (leakRateHistory.length || 1);
    return {
      total: orders.length,
      todayTotal: todayOrders.length,
      allPaid,
      allUnpaid,
      allPicked,
      notPicked,
      todayExceptions: todayExceptions.length,
      avgLeak: Number(avgLeak.toFixed(1)),
    };
  }, [orders, todayOrders, exceptions, leakRateHistory]);

  // 常点商家TOP
  const topRestaurants = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      map[o.restaurant] = (map[o.restaurant] ?? 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [orders]);

  // 部门订单量
  const deptOrders = useMemo(() => {
    return DEPARTMENTS.map((d) => {
      const empIds = employees
        .filter((e) => e.department === d)
        .map((e) => e.id);
      const count = orders.filter((o) => empIds.includes(o.employeeId)).length;
      return { name: d, value: count };
    }).filter((d) => d.value > 0);
  }, [orders, employees]);

  // 未取餐员工列表（带部门）
  const notPickedEmployees = useMemo(() => {
    return overall.notPicked.map((o) => {
      const emp = employees.find((e) => e.id === o.employeeId);
      return {
        order: o,
        name: emp?.name ?? "未知",
        dept: emp?.department ?? "",
        color: emp?.avatarColor,
        phone: emp?.phoneLast4,
      };
    }).sort((a, b) => a.dept.localeCompare(b.dept, "zh"));
  }, [overall.notPicked, employees]);

  // 待退款
  const pendingRefunds = getPendingRefunds();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-500" />
          数据统计
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          查看常点商家、漏餐率、部门订单等运营数据，辅助优化团购
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5 bg-gradient-to-br from-brand-50 to-white animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-brand-500/15 text-brand-500 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <Tag variant="brand" size="sm">
              今日
            </Tag>
          </div>
          <p className="font-display text-3xl font-bold text-neutral-800 mt-4">
            {overall.todayTotal}
          </p>
          <p className="text-xs text-neutral-500 mt-1">今日总订单数</p>
          <div className="mt-3 flex items-center gap-1 text-xs text-success-600">
            <TrendingUp className="w-3 h-3" />
            覆盖 {new Set(todayOrders.map((o) => o.restaurant)).size} 家商家
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-danger-50 to-white animate-fade-in-up animate-delay-50">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-danger-500/15 text-danger-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <Tag variant="danger" size="sm">
              周均
            </Tag>
          </div>
          <p className="font-display text-3xl font-bold text-neutral-800 mt-4">
            {overall.avgLeak}%
          </p>
          <p className="text-xs text-neutral-500 mt-1">平均漏餐/异常率</p>
          <div className="mt-3 flex items-center gap-1 text-xs text-warning-600">
            <PackageX className="w-3 h-3" />
            今日 {overall.todayExceptions} 单异常
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-warning-50 to-white animate-fade-in-up animate-delay-100">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-warning-500/15 text-warning-500 flex items-center justify-center">
              <UserX className="w-5 h-5" />
            </div>
            <Tag variant="warning" size="sm">
              今日
            </Tag>
          </div>
          <p className="font-display text-3xl font-bold text-neutral-800 mt-4">
            {notPickedEmployees.length}
          </p>
          <p className="text-xs text-neutral-500 mt-1">人未取餐</p>
          <div className="mt-3 flex items-center gap-1 text-xs text-brand-500">
            <Clock className="w-3 h-3" />
            已取 {overall.allPicked} / {overall.todayTotal}
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-success-50 to-white animate-fade-in-up animate-delay-150">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-success-500/15 text-success-500 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <Tag variant="success" size="sm">
              累计
            </Tag>
          </div>
          <p className="font-display text-3xl font-bold text-neutral-800 mt-4">
            {pendingRefunds.length}
          </p>
          <p className="text-xs text-neutral-500 mt-1">笔退款待处理</p>
          <div className="mt-3 flex items-center gap-1 text-xs text-success-600">
            <TrendingDown className="w-3 h-3" />
            付款率 {orders.length ? Math.round((overall.allPaid / orders.length) * 100) : 0}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card lg:col-span-2 p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-lg font-bold text-neutral-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-500" />
                常点商家 TOP {topRestaurants.length}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                累计各商家订单量统计
              </p>
            </div>
            <Tag variant="brand" size="md">
              共 {topRestaurants.reduce((s, r) => s + r.count, 0)} 单
            </Tag>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topRestaurants}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94A3B8" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    fontSize: 12,
                  }}
                  cursor={{ fill: "#FFF5F0" }}
                  formatter={(val: number) => [`${val} 单`, "订单量"]}
                />
                <Bar
                  dataKey="count"
                  radius={[8, 8, 0, 0]}
                  fill="url(#barGradient)"
                  maxBarSize={48}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF7A45" />
                    <stop offset="100%" stopColor="#FFB080" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 animate-fade-in-up animate-delay-50">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-lg font-bold text-neutral-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-500" />
                部门订单占比
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">各部门团购频次</p>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptOrders}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {deptOrders.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    fontSize: 12,
                  }}
                  formatter={(val: number) => [`${val} 单`, "订单量"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {deptOrders.slice(0, 5).map((d, i) => (
              <span
                key={d.name}
                className="inline-flex items-center gap-1.5 text-[11px] text-neutral-600"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card lg:col-span-2 p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-lg font-bold text-neutral-800 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-danger-500" />
                近 7 天漏餐率趋势
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                异常订单 / 总订单 占比变化
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 text-neutral-500">
                <span className="w-3 h-3 rounded-full bg-danger-500" /> 漏餐率
              </span>
              <span className="inline-flex items-center gap-1 text-neutral-500">
                <span className="w-3 h-3 rounded-full bg-brand-400" /> 总订单量
              </span>
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={leakRateHistory.map((d) => ({
                  ...d,
                  dateShort: d.date.slice(5),
                }))}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="dateShort"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748B" }}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  unit="%"
                  domain={[0, 20]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    fontSize: 12,
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="rate"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{ fill: "#EF4444", r: 4, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6 }}
                  name="漏餐率"
                  unit="%"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="total"
                  stroke="#FF7A45"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#FF7A45", r: 3 }}
                  name="总订单量"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 animate-fade-in-up animate-delay-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-neutral-800 flex items-center gap-2">
                <UserX className="w-5 h-5 text-warning-500" />
                今日未取餐
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                请尽快通知以下员工
              </p>
            </div>
            <Tag variant="warning" size="md">
              {notPickedEmployees.length} 人
            </Tag>
          </div>
          <div className="space-y-2 max-h-[270px] overflow-y-auto scroll-thin pr-1">
            {notPickedEmployees.length === 0 ? (
              <div className="py-10 text-center text-neutral-400 text-sm">
                🎉 所有人都取餐啦
              </div>
            ) : (
              notPickedEmployees.map((p, i) => (
                <div
                  key={p.order.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${i * 25}ms` }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-800 text-sm">
                        {p.name}
                      </span>
                      <Tag
                        size="sm"
                        style={{
                          backgroundColor: `${DEPARTMENT_COLOR[p.dept] ?? "#64748B"}15`,
                          color: DEPARTMENT_COLOR[p.dept] ?? "#64748B",
                        }}
                      >
                        {p.dept}
                      </Tag>
                    </div>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                      {p.order.restaurant} · {p.order.dish}
                    </p>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    ****{p.phone}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-neutral-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-warning-500" />
              退款待处理
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              异常订单退款进度跟踪
            </p>
          </div>
          <Tag variant="warning" size="md" dot>
            {pendingRefunds.length} 笔待处理
          </Tag>
        </div>
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50/80">
              <tr className="text-neutral-500">
                <th className="px-6 py-3 text-left font-medium">员工</th>
                <th className="px-6 py-3 text-left font-medium">商家/菜品</th>
                <th className="px-6 py-3 text-left font-medium">异常类型</th>
                <th className="px-6 py-3 text-left font-medium">备注说明</th>
                <th className="px-6 py-3 text-left font-medium">部门负责人</th>
                <th className="px-6 py-3 text-left font-medium">创建时间</th>
                <th className="px-6 py-3 text-left font-medium">退款状态</th>
              </tr>
            </thead>
            <tbody>
              {pendingRefunds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                    ✨ 没有待处理的退款申请
                  </td>
                </tr>
              ) : (
                pendingRefunds.map((ex, i) => {
                  const order = orders.find((o) => o.id === ex.orderId);
                  const emp = order
                    ? employees.find((e) => e.id === order.employeeId)
                    : null;
                  const leader = employees.find(
                    (e) =>
                      e.department === emp?.department &&
                      (e.role === "leader" || e.role === "admin")
                  );
                  return (
                    <tr
                      key={ex.id}
                      className="border-t border-neutral-100 hover:bg-warning-50/30 transition-colors"
                      style={{ animation: "fade-in-up 0.4s ease-out both", animationDelay: `${i * 20}ms` }}
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: emp?.avatarColor }}
                          >
                            {emp?.name.charAt(0)}
                          </div>
                          <span className="font-medium text-neutral-800">
                            {emp?.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <p className="font-medium text-neutral-700">
                          {order?.restaurant}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {order?.dish}
                        </p>
                      </td>
                      <td className="px-6 py-3">
                        <Tag variant="danger" size="sm" dot>
                          {exceptionTypeLabel(ex.type)}
                        </Tag>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-neutral-600 text-xs line-clamp-1 max-w-[220px]">
                          {ex.description || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-3">
                        {leader ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{ backgroundColor: leader.avatarColor }}
                            >
                              {leader.name.charAt(0)}
                            </div>
                            <span className="text-sm text-neutral-700">
                              {leader.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-xs">未分配</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-xs text-neutral-500">
                        {ex.createdAt}
                      </td>
                      <td className="px-6 py-3">
                        <Tag className={refundStatusColor(ex.refundStatus)} size="sm">
                          {refundStatusLabel(ex.refundStatus)}
                        </Tag>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
