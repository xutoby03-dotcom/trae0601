import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  AlertTriangle,
  User,
  Clock,
  Wrench,
  ChevronRight,
} from "lucide-react";
import { useRepairStore } from "@/store/repairStore";
import { useInstrumentStore } from "@/store/instrumentStore";
import { useUserStore } from "@/store/userStore";
import { STATUS_META, type RepairStatus } from "@/types";
import { sortRepairsByPriority } from "@/utils/priority";
import { formatDate } from "@/utils/date";
import { cn } from "@/lib/utils";

const STATUS_TABS: { key: RepairStatus | "all"; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待接单" },
  { key: "processing", label: "处理中" },
  { key: "waiting_parts", label: "待配件" },
  { key: "completed", label: "已修好" },
  { key: "scrapped", label: "报废" },
];

export default function RepairsList() {
  const navigate = useNavigate();
  const repairOrders = useRepairStore((s) => s.repairOrders);
  const getInstrumentById = useInstrumentStore((s) => s.getInstrumentById);
  const getUserById = useUserStore((s) => s.getUserById);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState<RepairStatus | "all">("all");
  const [onlyAffectClass, setOnlyAffectClass] = useState(false);

  const filteredOrders = useMemo(() => {
    let list = [...repairOrders];

    if (activeTab !== "all") {
      list = list.filter((o) => o.status === activeTab);
    }
    if (onlyAffectClass) {
      list = list.filter((o) => o.affectClass);
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      list = list.filter((o) => {
        const ins = getInstrumentById(o.instrumentId);
        const reporter = getUserById(o.reporterId);
        const matchInstrument =
          ins &&
          (ins.id.toLowerCase().includes(kw) ||
            ins.type.toLowerCase().includes(kw) ||
            ins.brand.toLowerCase().includes(kw) ||
            ins.classroom.toLowerCase().includes(kw));
        const matchReporter = reporter?.name.toLowerCase().includes(kw);
        const matchFault = o.faultDescription.toLowerCase().includes(kw);
        const matchId = o.id.toLowerCase().includes(kw);
        return matchInstrument || matchReporter || matchFault || matchId;
      });
    }

    return sortRepairsByPriority(list);
  }, [
    repairOrders,
    activeTab,
    onlyAffectClass,
    searchKeyword,
    getInstrumentById,
    getUserById,
  ]);

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-walnut-800">
              报修单列表
            </h1>
            <p className="mt-1 text-sm text-walnut-500">
              共 {filteredOrders.length} 条记录
            </p>
          </div>
          <button
            onClick={() => navigate("/repairs/new")}
            className="btn-primary"
          >
            <Wrench className="w-4 h-4" />
            新建报修
          </button>
        </div>

        <div className="card space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-walnut-400" />
              <input
                type="text"
                placeholder="搜索报修单号、乐器、报修人、故障描述..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="input pl-10"
              />
            </div>
            <label className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-walnut-50 cursor-pointer select-none transition-colors hover:bg-walnut-100">
              <Filter className="w-4 h-4 text-walnut-600" />
              <span className="text-sm font-medium text-walnut-700">
                仅显示影响上课
              </span>
              <div
                className={cn(
                  "relative w-10 h-5 rounded-full transition-colors",
                  onlyAffectClass ? "bg-brick-500" : "bg-walnut-300"
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                    onlyAffectClass ? "left-[22px]" : "left-0.5"
                  )}
                />
              </div>
              <input
                type="checkbox"
                checked={onlyAffectClass}
                onChange={(e) => setOnlyAffectClass(e.target.checked)}
                className="sr-only"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const count =
                tab.key === "all"
                  ? repairOrders.length
                  : repairOrders.filter((o) => o.status === tab.key).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-walnut-600 text-white shadow-md"
                      : "bg-walnut-50 text-walnut-600 hover:bg-walnut-100"
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-lg text-xs font-semibold",
                      isActive ? "bg-white/20" : "bg-walnut-200/60"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 text-walnut-400">
              <Wrench className="w-12 h-12 mb-3 opacity-40" />
              <p className="font-medium">暂无匹配的报修单</p>
              <p className="text-sm mt-1">尝试调整筛选条件</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const ins = getInstrumentById(order.instrumentId);
              const reporter = getUserById(order.reporterId);
              const statusMeta = STATUS_META[order.status];

              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/repairs/${order.id}`)}
                  className="card cursor-pointer group"
                >
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-walnut-100">
                      {ins?.photo ? (
                        <img
                          src={ins.photo}
                          alt={ins.type}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Wrench className="w-8 h-8 text-walnut-300" />
                        </div>
                      )}
                      {order.affectClass && (
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-xs font-semibold text-white bg-brick-500 animate-urgent-blink shadow-md">
                          <AlertTriangle className="w-3 h-3 inline mr-0.5" />
                          紧急
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-walnut-800 truncate">
                              {ins?.brand} {ins?.type}
                            </h3>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium",
                                statusMeta.bgColor,
                                statusMeta.color
                              )}
                            >
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  statusMeta.dotColor
                                )}
                              />
                              {statusMeta.label}
                            </span>
                          </div>
                          <p className="text-xs text-walnut-500 mt-0.5">
                            {ins?.classroom} · 编号 {ins?.id}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-3.5 h-3.5",
                                i < order.impactLevel
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-walnut-200"
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-sm text-walnut-600 line-clamp-2">
                        {order.faultDescription}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-4 text-xs text-walnut-500">
                          <span className="inline-flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {reporter?.name || "未知"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-walnut-300 group-hover:text-walnut-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
