import { useMemo } from "react";
import {
  ClipboardList,
  Wrench,
  Package,
  CheckCircle,
  Trash2,
  Plus,
  Music2,
  CalendarClock,
  Flame,
  ChevronRight,
} from "lucide-react";
import { useRepairStore } from "@/store/repairStore";
import { useUserStore } from "@/store/userStore";
import { useInstrumentStore } from "@/store/instrumentStore";
import { STATUS_META } from "@/types";
import { formatDate, relativeTime } from "@/utils/date";
import { getUrgencyLabel, getUrgencyColor } from "@/utils/priority";

export default function Dashboard() {
  const users = useUserStore((s) => s.users);
  const currentUserId = useUserStore((s) => s.currentUserId);
  const repairOrders = useRepairStore((s) => s.repairOrders);
  const instruments = useInstrumentStore((s) => s.instruments);
  const getStatusStats = useRepairStore((s) => s.getStatusStats);
  const getTodayNewCount = useRepairStore((s) => s.getTodayNewCount);
  const getUserById = useUserStore((s) => s.getUserById);
  const getInstrumentById = useInstrumentStore((s) => s.getInstrumentById);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId),
    [users, currentUserId]
  );
  const statusStats = useMemo(
    () => getStatusStats(),
    [repairOrders, getStatusStats]
  );
  const todayNewCount = useMemo(
    () => getTodayNewCount(),
    [repairOrders, getTodayNewCount]
  );

  const recentRepairs = useMemo(() => {
    return [...repairOrders]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [repairOrders]);

  const totalInstruments = instruments.length;

  const today = formatDate(new Date(), "YYYY年MM月DD日");
  const weekDay = ["日", "一", "二", "三", "四", "五", "六"][new Date().getDay()];

  const statCards = [
    {
      label: "待接单",
      value: statusStats.pending,
      icon: ClipboardList,
      textColor: "text-amber-600",
      bgColor: "bg-amber-500/10",
      iconBg: "bg-amber-500",
      borderColor: "border-amber-200",
    },
    {
      label: "处理中",
      value: statusStats.processing,
      icon: Wrench,
      textColor: "text-blue-700",
      bgColor: "bg-blue-500/10",
      iconBg: "bg-blue-600",
      borderColor: "border-blue-200",
    },
    {
      label: "待配件",
      value: statusStats.waiting_parts,
      icon: Package,
      textColor: "text-violetpurple-500",
      bgColor: "bg-violetpurple-500/10",
      iconBg: "bg-violetpurple-500",
      borderColor: "border-purple-200",
    },
    {
      label: "已修好",
      value: statusStats.completed,
      icon: CheckCircle,
      textColor: "text-forest-600",
      bgColor: "bg-forest-500/10",
      iconBg: "bg-forest-500",
      borderColor: "border-green-200",
    },
    {
      label: "报废",
      value: statusStats.scrapped,
      icon: Trash2,
      textColor: "text-brick-600",
      bgColor: "bg-brick-500/10",
      iconBg: "bg-brick-500",
      borderColor: "border-red-200",
    },
  ];

  return (
    <div className="space-y-6 p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-walnut-800">
            你好，{currentUser?.name || "老师"}
            <span className="text-walnut-400 text-xl ml-2">欢迎回来</span>
          </h1>
          <div className="flex items-center gap-2 mt-2 text-walnut-500 text-sm">
            <CalendarClock className="w-4 h-4" />
            <span>{today} 星期{weekDay}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`card relative overflow-hidden border-l-4 ${stat.borderColor}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className={`text-xs font-medium ${stat.textColor} ${stat.bgColor} px-2 py-1 rounded-lg inline-flex items-center gap-1`}>
                    <span className="w-1.5 h-1.5 rounded-full currentColor bg-current"></span>
                    {stat.label}
                  </div>
                  <div className="mt-3 text-3xl font-bold text-walnut-800 font-serif">
                    {stat.value}
                  </div>
                </div>
                <div className={`w-11 h-11 ${stat.iconBg} rounded-xl flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-walnut-500 rounded-full"></div>
            <h2 className="section-title">今日新增</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 via-walnut-400 to-walnut-600 flex items-center justify-center shadow-lg">
                <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center flex-col">
                  <div className="text-4xl font-bold text-walnut-700 font-serif">
                    {todayNewCount}
                  </div>
                  <div className="text-xs text-walnut-400 mt-1">报修单</div>
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-brick-500 rounded-full flex items-center justify-center shadow-md animate-pulse-ring">
                <Flame className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-walnut-50">
                <span className="text-walnut-600 text-sm">乐器总数</span>
                <div className="flex items-center gap-2">
                  <Music2 className="w-4 h-4 text-walnut-500" />
                  <span className="font-semibold text-walnut-800">
                    {totalInstruments} 件
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-walnut-50">
                <span className="text-walnut-600 text-sm">累计报修</span>
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-walnut-500" />
                  <span className="font-semibold text-walnut-800">
                    {repairOrders.length} 单
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-walnut-50">
                <span className="text-walnut-600 text-sm">处理中占比</span>
                <span className="font-semibold text-walnut-800">
                  {repairOrders.length > 0
                    ? Math.round(
                        (statusStats.processing / repairOrders.length) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-walnut-500 rounded-full"></div>
            <h2 className="section-title">快捷入口</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full btn-primary !py-4 text-base group">
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              新建报修
            </button>
            <button className="w-full btn-secondary !py-4 text-base group">
              <Music2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              乐器档案
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-walnut-500 rounded-full"></div>
            <h2 className="section-title">最近报修</h2>
          </div>
          <button className="text-sm text-walnut-500 hover:text-walnut-700 flex items-center gap-1 transition-colors">
            查看全部
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-walnut-100">
                <th className="text-left py-3 px-4 text-xs font-medium text-walnut-500 uppercase tracking-wider">
                  报修单号
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-walnut-500 uppercase tracking-wider">
                  乐器
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-walnut-500 uppercase tracking-wider">
                  故障描述
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-walnut-500 uppercase tracking-wider">
                  紧急度
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-walnut-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-walnut-500 uppercase tracking-wider">
                  报修人
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-walnut-500 uppercase tracking-wider">
                  提交时间
                </th>
              </tr>
            </thead>
            <tbody>
              {recentRepairs.map((repair) => {
                const instrument = getInstrumentById(repair.instrumentId);
                const reporter = getUserById(repair.reporterId);
                const statusMeta = STATUS_META[repair.status];
                const urgencyLabel = getUrgencyLabel(repair);
                const urgencyColor = getUrgencyColor(repair);
                const isUrgent = urgencyLabel === "紧急";

                return (
                  <tr
                    key={repair.id}
                    className="border-b border-walnut-50 hover:bg-walnut-50/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm font-medium text-walnut-700">
                        {repair.id}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {instrument?.photo && (
                          <img
                            src={instrument.photo}
                            alt={instrument.type}
                            className="w-10 h-10 rounded-lg object-cover border border-walnut-100"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-walnut-800">
                            {instrument?.type || "-"}
                          </div>
                          <div className="text-xs text-walnut-400">
                            {instrument?.brand || ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-sm text-walnut-600 truncate">
                        {repair.faultDescription}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${urgencyColor} ${
                          isUrgent ? "animate-urgent-blink" : ""
                        }`}
                      >
                        <Flame className="w-3 h-3" />
                        {urgencyLabel}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusMeta.bgColor} ${statusMeta.color}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${statusMeta.dotColor}`}
                        ></span>
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {reporter?.avatar && (
                          <img
                            src={reporter.avatar}
                            alt={reporter.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        )}
                        <span className="text-sm text-walnut-700">
                          {reporter?.name || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-walnut-400" title={formatDate(repair.createdAt)}>
                        {relativeTime(repair.createdAt)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {recentRepairs.length === 0 && (
            <div className="py-12 text-center text-walnut-400">
              暂无报修记录
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
