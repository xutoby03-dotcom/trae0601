import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  AlertTriangle,
  MapPin,
  Building2,
  Clock,
  BarChart3,
  ChevronDown,
  ChevronRight,
  CalendarClock,
  AlertCircle,
} from "lucide-react";
import { useStore } from "@/store";
import { getMonthKey, daysBetween, formatDate, daysUntilDeadline, isOverdue } from "@/utils/date";

export default function Statistics() {
  const plants = useStore((s) => s.plants);
  const records = useStore((s) => s.serviceRecords);
  const issues = useStore((s) => s.issues);
  const suppliers = useStore((s) => s.suppliers);
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);
  const [onlyUnresponded, setOnlyUnresponded] = useState(false);

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    records.forEach((r) => {
      const key = getMonthKey(r.createdAt);
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({ month, count }));
  }, [records]);

  const supplierServiceData = useMemo(() => {
    return suppliers.map((sup) => {
      const supPlants = plants.filter((p) => p.supplierId === sup.id);
      const supRecords = records.filter((r) =>
        supPlants.some((p) => p.id === r.plantId)
      );
      return { name: sup.name.slice(0, 6), count: supRecords.length };
    });
  }, [suppliers, plants, records]);

  const locationRank = useMemo(() => {
    const counts: Record<string, number> = {};
    plants
      .filter((p) => p.status !== "healthy")
      .forEach((p) => {
        counts[p.location] = (counts[p.location] || 0) + 1;
      });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));
  }, [plants]);

  const supplierResponseTime = useMemo(() => {
    return suppliers.map((sup) => {
      const supIssues = issues.filter((i) => i.responsibleSupplierId === sup.id);
      const responded = supIssues.filter((i) => i.responseAt);
      const avg = responded.length === 0
        ? 0
        : responded.reduce((sum, i) => sum + daysBetween(i.createdAt, i.responseAt!), 0) / responded.length;

      const overdueCount = supIssues.filter((i) => {
        if (i.status === "closed") return false;
        if (i.responseAt) return false;
        return daysBetween(i.createdAt, new Date().toISOString()) > 2;
      }).length;

      return {
        id: sup.id,
        name: sup.name.slice(0, 6),
        days: Math.round(avg * 10) / 10,
        overdueCount,
      };
    });
  }, [suppliers, issues]);

  const openIssuesBySupplier = useMemo(() => {
    const groups: Record<string, typeof issues> = {};
    suppliers.forEach((s) => (groups[s.id] = []));
    issues
      .filter((i) => i.status !== "closed")
      .forEach((i) => {
        if (!groups[i.responsibleSupplierId]) groups[i.responsibleSupplierId] = [];
        groups[i.responsibleSupplierId].push(i);
      });
    return suppliers
      .map((s) => ({
        supplier: s,
        issues: groups[s.id] || [],
      }))
      .filter((g) => g.issues.length > 0);
  }, [suppliers, issues]);

  const issueStatusData = useMemo(() => {
    return [
      {
        name: "待处理",
        value: issues.filter((i) => i.status === "pending").length,
        color: "#D97706",
      },
      {
        name: "处理中",
        value: issues.filter((i) => i.status === "processing").length,
        color: "#4E7239",
      },
      {
        name: "已闭环",
        value: issues.filter((i) => i.status === "closed").length,
        color: "#9CA3AF",
      },
    ];
  }, [issues]);

  const openIssues = issues.filter((i) => i.status !== "closed");

  const statsCards = [
    {
      label: "月度服务次数",
      value: monthlyData[monthlyData.length - 1]?.count || 0,
      trend: "+12%",
      icon: TrendingUp,
      color: "from-forest-500 to-forest-700",
    },
    {
      label: "问题绿植数",
      value: plants.filter((p) => p.status !== "healthy").length,
      trend: "-3%",
      icon: AlertTriangle,
      color: "from-amber-500 to-amber-600",
    },
    {
      label: "平均响应时长",
      value:
        supplierResponseTime.reduce((s, d) => s + d.days, 0) /
          (supplierResponseTime.length || 1) +
        "天",
      trend: "达标",
      icon: Clock,
      color: "from-moss-500 to-moss-700",
    },
    {
      label: "未闭环问题",
      value: openIssues.length,
      trend: issues.filter((i) => i.status === "closed").length + "已闭环",
      icon: BarChart3,
      color: "from-forest-600 to-forest-800",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl p-6 shadow-card border border-forest-50 animate-slide-up"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-forest-500">{card.label}</p>
                  <p className="font-serif text-3xl font-bold text-forest-800 mt-2">
                    {card.value}
                  </p>
                  <p className="text-xs text-forest-400 mt-2">{card.trend}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-card border border-forest-50 p-6">
          <h3 className="font-serif text-lg font-semibold text-forest-800 mb-1">
            月度服务次数趋势
          </h3>
          <p className="text-sm text-forest-500 mb-6">近 6 个月养护服务统计</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#4E7239", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4E7239", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #DCE8D3",
                    borderRadius: 12,
                    boxShadow: "0 4px 12px rgba(45,90,39,0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="服务次数"
                  fill="url(#forestGradient)"
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="forestGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6B8E4E" />
                    <stop offset="100%" stopColor="#2D5A27" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-forest-50 p-6">
          <h3 className="font-serif text-lg font-semibold text-forest-800 mb-1">
            问题状态分布
          </h3>
          <p className="text-sm text-forest-500 mb-6">当前所有问题的处理状态</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issueStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {issueStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #DCE8D3",
                    borderRadius: 12,
                  }}
                />
                <Legend
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-sm text-forest-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-card border border-forest-50 p-6">
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="w-5 h-5 text-amber-warning" />
            <h3 className="font-serif text-lg font-semibold text-forest-800">
              枯黄最多位置
            </h3>
          </div>
          <div className="space-y-4">
            {locationRank.length === 0 ? (
              <p className="text-forest-400 text-sm text-center py-4">暂无数据</p>
            ) : (
              locationRank.map((item, idx) => (
                <div key={item.location}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-forest-700 flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          idx === 0
                            ? "bg-amber-warning"
                            : idx === 1
                            ? "bg-amber-500"
                            : idx === 2
                            ? "bg-moss-500"
                            : "bg-forest-400"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      {item.location}
                    </span>
                    <span className="text-sm font-semibold text-forest-800">
                      {item.count} 盆
                    </span>
                  </div>
                  <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-forest-400 to-forest-600 rounded-full"
                      style={{
                        width: `${(item.count / (locationRank[0]?.count || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-forest-50 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="w-5 h-5 text-forest-600" />
            <h3 className="font-serif text-lg font-semibold text-forest-800">
              供应商服务次数
            </h3>
          </div>
          <div className="space-y-4">
            {supplierServiceData.map((item, idx) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-forest-700">{item.name}</span>
                  <span className="text-sm font-semibold text-forest-800">
                    {item.count} 次
                  </span>
                </div>
                <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-forest-400 to-forest-700 rounded-full"
                    style={{
                      width: `${(item.count / (Math.max(...supplierServiceData.map((d) => d.count)) || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-forest-50 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-moss-600" />
            <h3 className="font-serif text-lg font-semibold text-forest-800">
              供应商响应时长
            </h3>
          </div>
          <div className="space-y-4">
            {supplierResponseTime.map((item) => (
              <div key={item.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-forest-700">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-forest-800">
                      平均 {item.days} 天
                    </span>
                    {item.overdueCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        超时 {item.overdueCount}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.overdueCount > 0
                        ? "bg-gradient-to-r from-amber-400 to-amber-600"
                        : item.days <= 1
                        ? "bg-gradient-to-r from-forest-400 to-forest-600"
                        : item.days <= 2
                        ? "bg-gradient-to-r from-moss-400 to-moss-600"
                        : "bg-gradient-to-r from-amber-400 to-amber-600"
                    }`}
                    style={{
                      width: `${Math.min((item.days / 3) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-forest-50 p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-serif text-lg font-semibold text-forest-800">
            未闭环问题（按供应商）
          </h3>
          <span className="text-sm text-forest-500">
            共 {openIssues.length} 个待跟进
          </span>
        </div>
        <p className="text-sm text-forest-500 mb-5">
          点击供应商行可展开查看具体问题及截止日
        </p>

        {openIssuesBySupplier.length === 0 ? (
          <div className="text-center py-12 text-forest-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>暂无未闭环问题，做得很好！</p>
          </div>
        ) : (
          <div className="space-y-2">
            {openIssuesBySupplier.map((group) => {
              const isOpen = expandedSupplier === group.supplier.id;
              const overdueInGroup = group.issues.filter((i) => isOverdue(i.deadline)).length;
              return (
                <div key={group.supplier.id} className="border border-forest-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedSupplier(isOpen ? null : group.supplier.id)
                    }
                    className="w-full px-5 py-4 flex items-center justify-between bg-cream-50 hover:bg-cream-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center text-white font-serif font-bold">
                        {group.supplier.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-forest-800">
                          {group.supplier.name}
                        </p>
                        <p className="text-xs text-forest-500">
                          {group.supplier.contact} · {group.supplier.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-forest-800">
                          {group.issues.length} 个未闭环
                        </p>
                        {overdueInGroup > 0 && (
                          <p className="text-xs text-amber-600 flex items-center justify-end gap-1">
                            <AlertCircle className="w-3 h-3" />
                            已超期 {overdueInGroup} 个
                          </p>
                        )}
                      </div>
                      {isOpen ? (
                        <ChevronDown className="w-5 h-5 text-forest-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-forest-500" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-forest-100 bg-white">
                      <div className="flex items-center justify-between px-5 py-3 bg-cream-50/70 border-b border-forest-50">
                        <p className="text-xs text-forest-500">
                          显示{" "}
                          <span className="font-semibold text-forest-700">
                            {onlyUnresponded
                              ? group.issues.filter((i) => !i.responseAt).length
                              : group.issues.length}
                          </span>{" "}
                          / {group.issues.length} 条问题
                        </p>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <span className="text-xs text-forest-600">只看未响应</span>
                          <button
                            type="button"
                            onClick={() => setOnlyUnresponded(!onlyUnresponded)}
                            className={`relative w-9 h-5 rounded-full transition-colors ${
                              onlyUnresponded ? "bg-forest-600" : "bg-forest-200"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                onlyUnresponded ? "translate-x-4" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </label>
                      </div>
                      {(() => {
                        const displayIssues = onlyUnresponded
                          ? group.issues.filter((i) => !i.responseAt)
                          : group.issues;
                        if (displayIssues.length === 0) {
                          return (
                            <div className="py-10 text-center text-sm text-forest-400">
                              没有符合条件的问题
                            </div>
                          );
                        }
                        return (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-forest-50/50">
                                  <th className="text-left text-xs font-medium text-forest-500 py-2.5 px-5">绿植</th>
                                  <th className="text-left text-xs font-medium text-forest-500 py-2.5 px-4">问题类型</th>
                                  <th className="text-left text-xs font-medium text-forest-500 py-2.5 px-4">责任人</th>
                                  <th className="text-left text-xs font-medium text-forest-500 py-2.5 px-4">截止日期</th>
                                  <th className="text-left text-xs font-medium text-forest-500 py-2.5 px-4">响应 / 处理</th>
                                </tr>
                              </thead>
                              <tbody>
                                {displayIssues.map((issue) => {
                                  const plant = plants.find((p) => p.id === issue.plantId);
                                  const staff = useStore.getState().getStaffById(issue.assignedTo);
                                  const overdue = isOverdue(issue.deadline);
                                  const remain = daysUntilDeadline(issue.deadline);
                                  return (
                                    <tr key={issue.id} className="border-t border-forest-50 hover:bg-cream-50">
                                      <td className="py-3 px-5">
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-cream-100">
                                            {plant?.photoUrl && (
                                              <img src={plant.photoUrl} alt="" className="w-full h-full object-cover" />
                                            )}
                                          </div>
                                          <div>
                                            <p className="text-sm text-forest-800">{plant?.species}</p>
                                            <p className="text-xs text-forest-400">{plant?.location}</p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4">
                                        <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs">
                                          {issue.type}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-sm text-forest-600">{staff?.name}</td>
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                          <CalendarClock
                                            className={`w-4 h-4 ${overdue ? "text-amber-600" : "text-forest-400"}`}
                                          />
                                          <div>
                                            <p className="text-sm text-forest-700">{formatDate(issue.deadline)}</p>
                                            <p className={`text-xs ${overdue ? "text-amber-600" : "text-forest-400"}`}>
                                              {overdue ? `已超期 ${Math.abs(remain)} 天` : `还剩 ${remain} 天`}
                                            </p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="flex flex-wrap gap-1.5">
                                          {issue.responseAt ? (
                                            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-forest-100 text-forest-700">
                                              已响应
                                            </span>
                                          ) : (
                                            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                                              <AlertCircle className="w-3 h-3" />
                                              未响应
                                            </span>
                                          )}
                                          <span
                                            className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                              issue.status === "pending"
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-moss-100 text-moss-700"
                                            }`}
                                          >
                                            {issue.status === "pending" ? "待处理" : "处理中"}
                                          </span>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
