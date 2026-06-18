import {
  ClipboardList,
  Scissors,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { usePetStore } from "@/store/usePetStore";
import StatCard from "@/components/dashboard/StatCard";
import QueueList from "@/components/dashboard/QueueList";
import EmployeeLoad from "@/components/dashboard/EmployeeLoad";
import TopPackages from "@/components/dashboard/TopPackages";

export default function Dashboard() {
  const { orders, employees, packages } = usePetStore();

  const today = new Date();
  const todayOrders = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  });

  const inProgressCount = todayOrders.filter(
    (o) => o.status === "in_progress"
  ).length;
  const completedCount = todayOrders.filter(
    (o) => o.status === "completed"
  ).length;
  const overdueCount = todayOrders.filter((o) => o.status === "overdue").length;

  const avgDuration =
    completedCount > 0
      ? Math.round(
          todayOrders
            .filter((o) => o.status === "completed")
            .reduce((sum, o) => sum + o.package.durationMinutes, 0) /
            completedCount
        )
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="font-display text-3xl font-bold text-brown-900 mb-1">
          今日看板
        </h1>
        <p className="text-brown-700/60">
          {today.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={ClipboardList}
          label="今日订单"
          value={todayOrders.length}
          gradient="bg-gradient-to-br from-primary-400 to-primary-600"
          subText="累计接待"
          delay={0}
        />
        <StatCard
          icon={Scissors}
          label="进行中"
          value={inProgressCount}
          gradient="bg-gradient-to-br from-blue-400 to-blue-600"
          subText="服务中"
          delay={100}
        />
        <StatCard
          icon={CheckCircle}
          label="已完成"
          value={completedCount}
          gradient="bg-gradient-to-br from-success-400 to-success-600"
          subText={`平均 ${avgDuration} 分钟`}
          delay={200}
        />
        <StatCard
          icon={AlertTriangle}
          label="超时订单"
          value={overdueCount}
          gradient="bg-gradient-to-br from-danger-400 to-danger-600"
          subText={overdueCount > 0 ? "需要关注" : "全部按时"}
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QueueList orders={orders} />
        </div>
        <div className="space-y-6">
          <EmployeeLoad employees={employees} orders={orders} />
          <TopPackages packages={packages} />
        </div>
      </div>
    </div>
  );
}
