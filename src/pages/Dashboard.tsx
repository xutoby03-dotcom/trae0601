import { useMemo } from "react";
import { useAppStore } from "@/store/appStore";
import StatCard from "@/components/StatCard";
import {
  DollarSign,
  ShoppingCart,
  PackageCheck,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  Clock,
  UserPlus,
} from "lucide-react";
import {
  PRODUCT_CATEGORY_LABELS,
  SIZES,
  ORDER_STATUS_LABELS,
} from "@/types";
import type { ProductCategory } from "@/types";

export default function Dashboard() {
  const { orders, purchases, students, products } = useAppStore();

  const stats = useMemo(() => {
    const unpaidCount = orders.filter((o) => o.paymentStatus === "unpaid").length;
    const purchasingCount = purchases.filter((p) => p.status === "pending").length;
    const readyCount = orders.filter(
      (o) => o.orderStatus === "ready" && o.paymentStatus === "paid"
    ).length;
    const totalOrders = orders.length;
    return { unpaidCount, purchasingCount, readyCount, totalOrders };
  }, [orders, purchases]);

  const sizeGapData = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    const categories: ProductCategory[] = ["summer", "autumn", "sports", "vest", "pants"];
    categories.forEach((cat) => {
      result[cat] = {};
      SIZES.forEach((s) => (result[cat][s] = 0));
    });

    orders
      .filter((o) => o.orderStatus === "purchasing")
      .forEach((o) => {
        const product = products.find((p) => p.id === o.productId);
        if (product && result[product.category]) {
          result[product.category][o.size] += o.quantity;
        }
      });

    purchases
      .filter((p) => p.status === "pending")
      .forEach((p) => {
        const product = products.find((pr) => pr.id === p.productId);
        if (product && result[product.category]) {
          const gap = p.quantity - (result[product.category][p.size] || 0);
          if (gap > 0) result[product.category][p.size] = p.quantity;
        }
      });

    return result;
  }, [orders, products, purchases]);

  const classProgress = useMemo(() => {
    const classMap: Record<string, { total: number; completed: number }> = {};
    orders.forEach((o) => {
      const student = students.find((s) => s.id === o.studentId);
      if (!student) return;
      if (!classMap[student.className]) {
        classMap[student.className] = { total: 0, completed: 0 };
      }
      classMap[student.className].total += 1;
      if (o.orderStatus === "completed") {
        classMap[student.className].completed += 1;
      }
    });
    return Object.entries(classMap)
      .map(([className, data]) => ({
        className,
        ...data,
        percent: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      }))
      .sort((a, b) => a.className.localeCompare(b.className));
  }, [orders, students]);

  const recentActivities = useMemo(() => {
    const events: Array<{
      id: string;
      time: string;
      type: "order" | "purchase" | "student";
      text: string;
    }> = [];

    orders
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .forEach((o) => {
        const student = students.find((s) => s.id === o.studentId);
        const product = products.find((p) => p.id === o.productId);
        events.push({
          id: o.id,
          time: o.createdAt,
          type: "order",
          text: `${student?.name || "未知学生"} 提交 ${product?.name || ""} ${o.size}码 ×${o.quantity} [${
            ORDER_STATUS_LABELS[o.orderStatus]
          }]`,
        });
      });

    purchases
      .filter((p) => p.status === "completed")
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .forEach((p) => {
        const product = products.find((pr) => pr.id === p.productId);
        events.push({
          id: p.id,
          time: p.completedAt || p.createdAt,
          type: "purchase",
          text: `${product?.name || ""} ${p.size}码 入库 ${p.quantity} 件`,
        });
      });

    return events
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8);
  }, [orders, purchases, products, students]);

  const maxGap = useMemo(() => {
    let m = 0;
    Object.values(sizeGapData).forEach((sizes) => {
      Object.values(sizes).forEach((v) => {
        if (v > m) m = v;
      });
    });
    return m || 10;
  }, [sizeGapData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-5">
        <StatCard
          title="待付款申请"
          value={stats.unpaidCount}
          icon={<DollarSign className="w-6 h-6" />}
          trend={`${orders.filter((o) => o.paymentStatus === "unpaid").length} 笔订单待确认`}
          gradientFrom="from-red-500"
          gradientTo="to-red-600"
          iconBg="bg-white/20"
        />
        <StatCard
          title="待采购清单"
          value={stats.purchasingCount}
          icon={<ShoppingCart className="w-6 h-6" />}
          trend={`共 ${purchases.filter((p) => p.status === "pending").reduce((a, b) => a + b.quantity, 0)} 件需采购`}
          gradientFrom="from-amber-500"
          gradientTo="to-orange-500"
          iconBg="bg-white/20"
        />
        <StatCard
          title="可发放数量"
          value={stats.readyCount}
          icon={<PackageCheck className="w-6 h-6" />}
          trend="已付款，等待发放"
          gradientFrom="from-emerald-500"
          gradientTo="to-teal-600"
          iconBg="bg-white/20"
        />
        <StatCard
          title="总补订申请"
          value={stats.totalOrders}
          icon={<ClipboardList className="w-6 h-6" />}
          trend="本学期累计"
          gradientFrom="from-primary-600"
          gradientTo="to-primary-800"
          iconBg="bg-white/20"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent-500" />
              尺码缺口分析
            </h3>
            <span className="text-xs text-zinc-500">单位：件</span>
          </div>
          <div className="card-body space-y-5">
            {(["summer", "autumn", "sports", "vest", "pants"] as ProductCategory[]).map(
              (cat) => {
                const total = Object.values(sizeGapData[cat]).reduce((a, b) => a + b, 0);
                if (total === 0) return null;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-zinc-700">
                        {PRODUCT_CATEGORY_LABELS[cat]}
                      </span>
                      <span className="text-xs text-zinc-500">缺口 {total} 件</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {SIZES.map((s) => {
                        const v = sizeGapData[cat][s] || 0;
                        const pct = (v / maxGap) * 100;
                        return (
                          <div key={s} className="text-center">
                            <div className="h-20 bg-zinc-100 rounded-md flex items-end p-1 overflow-hidden">
                              <div
                                className="w-full rounded-sm bg-gradient-to-t from-accent-500 to-accent-400 transition-all duration-500"
                                style={{ height: v > 0 ? `${Math.max(pct, 8)}%` : "0%" }}
                              />
                            </div>
                            <div className="mt-1.5 text-xs">
                              <div className="font-semibold text-zinc-700">{s}</div>
                              <div className="text-zinc-500">{v}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            )}
            {Object.values(sizeGapData).every(
              (sizes) => Object.values(sizes).reduce((a, b) => a + b, 0) === 0
            ) && (
              <div className="py-12 text-center text-zinc-400">
                <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                当前无尺码缺口
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              各班补订进度
            </h3>
          </div>
          <div className="card-body space-y-4">
            {classProgress.map(({ className, total, completed, percent }) => (
              <div key={className}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-zinc-700">{className}</span>
                  <span className="text-xs text-zinc-500">
                    {completed}/{total} · {percent}%
                  </span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            ))}
            {classProgress.length === 0 && (
              <div className="py-8 text-center text-zinc-400 text-sm">暂无数据</div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-600" />
            近期动态
          </h3>
        </div>
        <div className="card-body">
          {recentActivities.length > 0 ? (
            <div className="relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-zinc-200" />
              <ul className="space-y-4">
                {recentActivities.map((e) => (
                  <li key={e.id} className="relative pl-9">
                    <span
                      className={`absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ${
                        e.type === "order"
                          ? "bg-primary-50 text-primary-600"
                          : e.type === "purchase"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {e.type === "order" ? (
                        <ClipboardList className="w-3.5 h-3.5" />
                      ) : e.type === "purchase" ? (
                        <PackageCheck className="w-3.5 h-3.5" />
                      ) : (
                        <UserPlus className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <p className="text-sm text-zinc-700">{e.text}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {new Date(e.time).toLocaleString("zh-CN")}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="py-8 text-center text-zinc-400 text-sm">暂无动态</div>
          )}
        </div>
      </div>
    </div>
  );
}
