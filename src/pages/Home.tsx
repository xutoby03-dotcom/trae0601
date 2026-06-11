import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Ban,
  ClipboardPlus,
  RotateCcw,
  ArrowRight,
  User,
  Building2,
} from "lucide-react";
import { useCardStore } from "@/store/cardStore";
import StatusBadge from "@/components/StatusBadge";
import CardTypeBadge from "@/components/CardTypeBadge";
import { getRemainingTime, isOverdue } from "@/utils/dateUtils";

export default function Home() {
  const { getStatsByStatus, getRecentRecords } = useCardStore();
  const stats = getStatsByStatus();
  const recentRecords = getRecentRecords(10);

  const statusCards = [
    {
      label: "可借",
      value: stats.available.total,
      visitor: stats.available.visitor,
      employee: stats.available.employee,
      icon: CheckCircle2,
      bgClass: "bg-gradient-to-br from-teal-50 to-teal-100/50",
      iconBg: "bg-teal-500",
      textClass: "text-teal-700",
      subTextClass: "text-teal-600",
    },
    {
      label: "使用中",
      value: stats.inUse.total,
      visitor: stats.inUse.visitor,
      employee: stats.inUse.employee,
      icon: Clock,
      bgClass: "bg-gradient-to-br from-brand-50 to-brand-100/50",
      iconBg: "bg-brand-600",
      textClass: "text-brand-700",
      subTextClass: "text-brand-600",
    },
    {
      label: "即将超时",
      value: stats.soonOverdue.total,
      visitor: stats.soonOverdue.visitor,
      employee: stats.soonOverdue.employee,
      icon: AlertTriangle,
      bgClass: "bg-gradient-to-br from-orange-50 to-orange-100/50",
      iconBg: "bg-orange-500",
      textClass: "text-orange-700",
      subTextClass: "text-orange-600",
    },
    {
      label: "已挂失",
      value: stats.lost.total,
      visitor: stats.lost.visitor,
      employee: stats.lost.employee,
      icon: Ban,
      bgClass: "bg-gradient-to-br from-red-50 to-red-100/50",
      iconBg: "bg-red-500",
      textClass: "text-red-700",
      subTextClass: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-5">
        {statusCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`card-panel p-5 ${card.bgClass} border-0 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className={`text-sm font-medium ${card.subTextClass}`}>
                    {card.label}
                  </div>
                  <div className={`text-3xl font-bold mt-2 ${card.textClass}`}>
                    {card.value}
                  </div>
                </div>
                <div
                  className={`w-11 h-11 ${card.iconBg} rounded-xl flex items-center justify-center shadow-sm`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/60 flex items-center gap-4 text-xs">
                <span className={`${card.subTextClass} flex items-center gap-1`}>
                  <User className="w-3.5 h-3.5" />
                  访客 {card.visitor}
                </span>
                <span className={`${card.subTextClass} flex items-center gap-1`}>
                  <Building2 className="w-3.5 h-3.5" />
                  员工 {card.employee}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-5">
        <Link
          to="/borrow"
          className="card-panel p-5 col-span-2 flex items-center gap-4 group hover:shadow-card-hover transition-all duration-300 cursor-pointer"
        >
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <ClipboardPlus className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-zinc-900">借用登记</div>
            <div className="text-sm text-zinc-500 mt-0.5">
              登记卡号、借用人信息、押金等
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/return"
          className="card-panel p-5 col-span-2 flex items-center gap-4 group hover:shadow-card-hover transition-all duration-300 cursor-pointer"
        >
          <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <RotateCcw className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-zinc-900">归还 / 挂失</div>
            <div className="text-sm text-zinc-500 mt-0.5">
              核对卡号、退还押金、挂失登记
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      <div className="card-panel overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-zinc-900">最近借用记录</h2>
            <p className="text-sm text-zinc-500 mt-0.5">最近 10 条登记记录</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50 text-left">
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  卡号
                </th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  卡类型
                </th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  借用人
                </th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  部门
                </th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  借出时间
                </th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  预计归还
                </th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentRecords.map((record, index) => (
                <tr
                  key={record.id}
                  className={`hover:bg-zinc-50/80 transition-colors animate-slide-up ${
                    index % 2 === 1 ? "bg-zinc-50/40" : ""
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td className="px-6 py-3.5 text-sm font-mono font-medium text-zinc-900">
                    {record.cardNumber}
                  </td>
                  <td className="px-6 py-3.5">
                    <CardTypeBadge type={record.cardType} />
                  </td>
                  <td className="px-6 py-3.5 text-sm text-zinc-700">
                    {record.borrowerName}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-zinc-600">
                    {record.department}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-zinc-600 font-mono text-xs">
                    {record.borrowTime}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="text-sm font-mono text-xs text-zinc-600">
                      {record.expectedReturnTime}
                    </div>
                    {record.status === "active" && (
                      <div
                        className={`text-xs mt-1 ${
                          isOverdue(record.expectedReturnTime)
                            ? "text-red-600"
                            : "text-zinc-400"
                        }`}
                      >
                        {getRemainingTime(record.expectedReturnTime)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusBadge record={record} />
                  </td>
                </tr>
              ))}
              {recentRecords.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-zinc-400 text-sm"
                  >
                    暂无借用记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
