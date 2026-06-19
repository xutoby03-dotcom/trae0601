import { useState, useMemo, useEffect } from "react";
import {
  QrCode,
  Users,
  Check,
  MapPin,
  Clock,
  Flame,
  UserCheck,
  X,
  Bell,
  Calendar,
} from "lucide-react";
import Tag from "@/components/UI/Tag";
import { useOrderStore } from "@/store/order";
import { useEmployeeStore } from "@/store/employee";
import { PICKUP_POINTS, PickupPoint, Order } from "@/types";
import { cn } from "@/lib/utils";
import { todayStr, pickupStatusLabel, pickupStatusColor } from "@/utils/formatters";
import { SPICE_COLOR } from "@/utils/colors";

export default function PickupPage() {
  const { orders, markPicked } = useOrderStore();
  const { employees } = useEmployeeStore();

  const [activePoint, setActivePoint] = useState<PickupPoint | "all">("all");
  const [mode, setMode] = useState<"scan" | "name">("scan");
  const [dateFilter, setDateFilter] = useState(todayStr());
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    order: Order;
    empName: string;
  } | null>(null);
  const [scanError, setScanError] = useState<string>("");

  const todayOrders = useMemo(
    () => orders.filter((o) => o.orderDate === dateFilter),
    [orders, dateFilter]
  );

  const pointFiltered = useMemo(() => {
    if (activePoint === "all") return todayOrders;
    const pointEmpIds = employees
      .filter((e) => e.pickupPoint === activePoint)
      .map((e) => e.id);
    return todayOrders.filter((o) => pointEmpIds.includes(o.employeeId));
  }, [todayOrders, employees, activePoint]);

  const pointStats = useMemo(() => {
    const stats: Record<PickupPoint | "all", { total: number; picked: number }> = {
      all: { total: 0, picked: 0 },
    } as any;
    PICKUP_POINTS.forEach((p) => (stats[p] = { total: 0, picked: 0 }));
    todayOrders.forEach((o) => {
      const emp = employees.find((e) => e.id === o.employeeId);
      if (!emp) return;
      stats.all.total++;
      stats[emp.pickupPoint].total++;
      if (o.pickupStatus === "picked") {
        stats.all.picked++;
        stats[emp.pickupPoint].picked++;
      }
    });
    return stats;
  }, [todayOrders, employees]);

  const empOf = (id: string) => employees.find((e) => e.id === id);

  const pendingList = useMemo(() => {
    return pointFiltered
      .filter((o) => o.pickupStatus === "pending" && o.packingStatus !== "exception")
      .sort((a, b) => {
        const na = empOf(a.employeeId)?.name ?? "";
        const nb = empOf(b.employeeId)?.name ?? "";
        return na.localeCompare(nb, "zh");
      });
  }, [pointFiltered, employees]);

  const pickedList = useMemo(() => {
    return pointFiltered
      .filter((o) => o.pickupStatus === "picked")
      .sort((a, b) => {
        const na = empOf(a.employeeId)?.name ?? "";
        const nb = empOf(b.employeeId)?.name ?? "";
        return na.localeCompare(nb, "zh");
      });
  }, [pointFiltered, employees]);

  const notPickedCount =
    pointStats[activePoint].total - pointStats[activePoint].picked;

  // 模拟扫码
  const startScan = () => {
    setScanning(true);
    setScanResult(null);
    setScanError("");
  };

  useEffect(() => {
    if (!scanning) return;
    const timer = setTimeout(() => {
      const available = pendingList[Math.floor(Math.random() * pendingList.length)];
      if (available) {
        const emp = empOf(available.employeeId);
        markPicked(available.id);
        setScanResult({
          order: available,
          empName: emp?.name ?? "",
        });
      } else {
        setScanError("所有餐品均已取餐完毕！");
      }
      setScanning(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, [scanning]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-800">
            取餐确认
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            扫码或点名确认取餐，未取餐员工会自动提醒
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-base !w-[150px] !px-3 !py-1.5"
            />
          </div>
          {notPickedCount > 0 && (
            <button className="btn-secondary text-warning-600 border-warning-200 bg-warning-50/50 hover:bg-warning-50">
              <Bell className="w-4 h-4" />
              提醒未取餐员工 ({notPickedCount})
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 p-1 rounded-2xl bg-neutral-100/60 w-fit">
        <button
          onClick={() => setMode("scan")}
          className={cn(
            "px-5 py-2 rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2",
            mode === "scan"
              ? "bg-white text-brand-600 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          )}
        >
          <QrCode className="w-4 h-4" />
          扫码取餐
        </button>
        <button
          onClick={() => setMode("name")}
          className={cn(
            "px-5 py-2 rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2",
            mode === "name"
              ? "bg-white text-brand-600 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          )}
        >
          <Users className="w-4 h-4" />
          点名确认
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActivePoint("all")}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2",
            activePoint === "all"
              ? "bg-brand-500 text-white shadow-button"
              : "bg-white border border-neutral-200 text-neutral-600 hover:border-brand-300 hover:text-brand-600"
          )}
        >
          <MapPin className="w-3.5 h-3.5" />
          全部取餐点
          <Tag
            variant={activePoint === "all" ? "default" : "brand"}
            size="sm"
            className={cn(
              activePoint === "all"
                ? "bg-white/25 text-white"
                : "bg-brand-50 text-brand-600"
            )}
          >
            {pointStats.all.total}
          </Tag>
        </button>
        {PICKUP_POINTS.map((p) => {
          const active = activePoint === p;
          const stat = pointStats[p];
          const done = stat.total > 0 && stat.total === stat.picked;
          return (
            <button
              key={p}
              onClick={() => setActivePoint(p)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2",
                active
                  ? "bg-brand-500 text-white shadow-button"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:border-brand-300 hover:text-brand-600"
              )}
            >
              {active ? <MapPin className="w-3.5 h-3.5" /> : done ? <UserCheck className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
              {p}
              <Tag
                size="sm"
                className={cn(
                  active
                    ? "bg-white/25 text-white"
                    : done
                    ? "bg-success-50 text-success-600"
                    : "bg-neutral-100 text-neutral-500"
                )}
              >
                {stat.picked}/{stat.total}
              </Tag>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-5">
          {mode === "scan" ? (
            <div className="card p-6 animate-fade-in-up">
              <h3 className="font-display text-lg font-bold text-neutral-800 mb-1 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-brand-500" />
                扫码取餐
              </h3>
              <p className="text-xs text-neutral-500 mb-5">
                将员工取餐码对准扫描框，识别成功自动确认
              </p>

              <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-800 p-3">
                <div className="absolute inset-3 border-2 rounded-xl z-10">
                  <div className="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-4 border-l-4 border-brand-400 rounded-tl-xl" />
                  <div className="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-4 border-r-4 border-brand-400 rounded-tr-xl" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-4 border-l-4 border-brand-400 rounded-bl-xl" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-4 border-r-4 border-brand-400 rounded-br-xl" />
                </div>
                {scanning && (
                  <div className="absolute left-3 right-3 top-0 h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent animate-scan-line rounded-full shadow-[0_0_12px_#FF7A45] z-20" />
                )}
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 text-center z-0">
                  {scanning ? (
                    <>
                      <QrCode className="w-10 h-10 text-brand-400/80 animate-pulse" />
                      <p className="text-sm text-brand-300/90">正在扫描识别...</p>
                    </>
                  ) : scanResult ? (
                    <>
                      <div className="w-14 h-14 rounded-full bg-success-500 text-white flex items-center justify-center animate-check-in shadow-[0_0_24px_#22C55E]">
                        <Check className="w-8 h-8" />
                      </div>
                      <p className="font-display text-xl font-bold text-success-300 mt-1">
                        取餐成功
                      </p>
                      <p className="text-sm text-white/80 mt-0.5">
                        {scanResult.empName}
                      </p>
                      <p className="text-xs text-white/50">
                        {scanResult.order.restaurant} · {scanResult.order.dish}
                      </p>
                    </>
                  ) : scanError ? (
                    <>
                      <div className="w-14 h-14 rounded-full bg-warning-500 text-white flex items-center justify-center">
                        <Bell className="w-7 h-7" />
                      </div>
                      <p className="text-sm text-warning-300 mt-2">{scanError}</p>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-10 h-10 text-neutral-500" />
                      <p className="text-sm text-neutral-400 mt-1">
                        准备就绪，等待扫码
                      </p>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={startScan}
                disabled={scanning}
                className="w-full btn-primary mt-6 disabled:opacity-50"
              >
                <QrCode className="w-4 h-4" />
                {scanning ? "扫描中..." : scanResult ? "继续扫描下一份" : "开始扫描"}
              </button>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-neutral-50">
                  <p className="font-display text-2xl font-bold text-brand-600">
                    {pointStats[activePoint].total}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">总份数</p>
                </div>
                <div className="p-3 rounded-xl bg-success-50">
                  <p className="font-display text-2xl font-bold text-success-600">
                    {pointStats[activePoint].picked}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">已取餐</p>
                </div>
                <div className="p-3 rounded-xl bg-warning-50">
                  <p className="font-display text-2xl font-bold text-warning-600">
                    {notPickedCount}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">待取餐</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6 animate-fade-in-up">
              <h3 className="font-display text-lg font-bold text-neutral-800 mb-1 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-500" />
                点名进度
              </h3>
              <p className="text-xs text-neutral-500 mb-5">
                点击「已取餐」按钮为员工确认
              </p>
              <div className="w-full progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: pointStats[activePoint].total
                      ? `${(pointStats[activePoint].picked / pointStats[activePoint].total) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <p className="text-sm text-right mt-2 text-neutral-500">
                <span className="font-bold text-brand-600">
                  {pointStats[activePoint].total
                    ? Math.round(
                        (pointStats[activePoint].picked /
                          pointStats[activePoint].total) *
                          100
                      )
                    : 0}
                  %
                </span>{" "}
                完成
              </p>

              <div className="mt-5 space-y-2 max-h-[380px] overflow-y-auto scroll-thin pr-1">
                <div>
                  <p className="text-xs font-medium text-warning-600 mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    待取餐 ({pendingList.length})
                  </p>
                  {pendingList.length === 0 ? (
                    <div className="py-6 text-center text-xs text-neutral-400 rounded-xl bg-neutral-50">
                      所有餐品已取餐完毕 ✅
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingList.map((o) => {
                        const emp = empOf(o.employeeId);
                        return (
                          <div
                            key={o.id}
                            className="p-3 rounded-xl border border-warning-100 bg-warning-50/40 flex items-center gap-3 animate-fade-in-up"
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{ backgroundColor: emp?.avatarColor }}
                            >
                              {emp?.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-neutral-800 text-sm">
                                {emp?.name}
                              </p>
                              <p className="text-[11px] text-neutral-500 truncate">
                                {o.restaurant} · {o.dish}
                              </p>
                            </div>
                            <button
                              onClick={() => markPicked(o.id)}
                              className="px-3 py-1.5 rounded-lg bg-success-500 text-white text-xs font-medium hover:bg-success-600 transition-colors shrink-0 inline-flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              已取餐
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="card">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-neutral-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-warning-500" />
                  待取餐列表
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  共 {pendingList.length} 人等待取餐
                </p>
              </div>
              <Tag variant="warning" size="md" dot>
                {pendingList.length} 份待领
              </Tag>
            </div>
            <div className="p-4 max-h-[320px] overflow-y-auto scroll-thin">
              {pendingList.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 text-sm">
                  🎉 所有餐品已被取走
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pendingList.map((o, i) => {
                    const emp = empOf(o.employeeId);
                    return (
                      <div
                        key={o.id}
                        className="p-4 rounded-card border border-neutral-100 bg-white hover:border-brand-300 hover:shadow-sm transition-all flex items-start gap-3 group animate-fade-in-up"
                        style={{ animationDelay: `${Math.min(i * 30, 240)}ms` }}
                      >
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: emp?.avatarColor }}
                        >
                          {emp?.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-neutral-800">
                              {emp?.name}
                            </p>
                            <button
                              onClick={() => markPicked(o.id)}
                              className="px-2.5 py-1 rounded-lg bg-success-50 text-success-600 text-xs font-medium hover:bg-success-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 inline-flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              已取
                            </button>
                          </div>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {emp?.department} · {emp?.pickupPoint}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <Tag size="sm" variant="brand">
                              {o.restaurant}
                            </Tag>
                            <Tag size="sm">{o.dish}</Tag>
                            <Tag
                              size="sm"
                              className="bg-white"
                              style={{ color: SPICE_COLOR[o.spiceLevel] }}
                            >
                              <Flame className="w-3 h-3 inline mr-0.5" />
                              {o.spiceLevel}
                            </Tag>
                            {o.extraRice && <Tag size="sm" variant="warning">+饭</Tag>}
                            {o.drink !== "无" && <Tag size="sm" variant="info">{o.drink}</Tag>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-neutral-800 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-success-500" />
                  已取餐记录
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  今日已有 {pickedList.length} 人成功取餐
                </p>
              </div>
              <Tag variant="success" size="md" dot>
                {pickedList.length} 份
              </Tag>
            </div>
            <div className="p-4 max-h-[260px] overflow-y-auto scroll-thin">
              {pickedList.length === 0 ? (
                <div className="py-10 text-center text-neutral-400 text-sm">
                  暂无已取餐记录
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {pickedList.map((o, i) => {
                    const emp = empOf(o.employeeId);
                    return (
                      <div
                        key={o.id}
                        className="p-3 rounded-xl bg-neutral-50 flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity animate-fade-in-up"
                        style={{ animationDelay: `${Math.min(i * 15, 180)}ms` }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 relative"
                          style={{ backgroundColor: emp?.avatarColor }}
                        >
                          {emp?.name.charAt(0)}
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success-500 text-white flex items-center justify-center text-[10px] border-2 border-white">
                            ✓
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-700 truncate">
                            {emp?.name}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate">
                            {o.dish}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
