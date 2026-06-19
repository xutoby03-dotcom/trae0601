import { useState, useMemo, useRef, useEffect } from "react";
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
  Search,
  AlertCircle,
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
  const [scanInput, setScanInput] = useState<string>("");
  const [scanResult, setScanResult] = useState<{
    order: Order;
    empName: string;
  } | null>(null);
  const [scanError, setScanError] = useState<string>("");
  const [multiMatch, setMultiMatch] = useState<{
    employees: { id: string; name: string }[];
    pendingOrders: Order[];
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (mode === "scan") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [mode, scanResult, scanError, multiMatch]);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = scanInput.trim();
    if (!input) return;

    setScanResult(null);
    setScanError("");
    setMultiMatch(null);

    const isPhoneLast4 = /^\d{4}$/.test(input);
    let matchedEmployees = [];

    if (isPhoneLast4) {
      matchedEmployees = employees.filter((e) => e.phoneLast4 === input);
    } else {
      const matched = employees.find((e) => e.id === input);
      if (matched) matchedEmployees = [matched];
    }

    if (matchedEmployees.length === 0) {
      if (isPhoneLast4) {
        setScanError(`未找到手机号后四位为 ${input} 的员工`);
      } else {
        setScanError(`未找到员工码为 ${input} 的员工`);
      }
      setScanInput("");
      return;
    }

    const pendingOrdersOfMatched = pendingList.filter((o) =>
      matchedEmployees.some((e) => e.id === o.employeeId)
    );

    if (pendingOrdersOfMatched.length === 0) {
      const empNames = matchedEmployees.map((e) => e.name).join("、");
      setScanError(`${empNames} 今日没有待取的餐品`);
      setScanInput("");
      return;
    }

    if (matchedEmployees.length > 1) {
      setMultiMatch({
        employees: matchedEmployees.map((e) => ({ id: e.id, name: e.name })),
        pendingOrders: pendingOrdersOfMatched,
      });
      setScanInput("");
      return;
    }

    if (pendingOrdersOfMatched.length === 1) {
      confirmPickup(pendingOrdersOfMatched[0].id);
      return;
    }

    if (pendingOrdersOfMatched.length > 1) {
      setMultiMatch({
        employees: matchedEmployees.map((e) => ({ id: e.id, name: e.name })),
        pendingOrders: pendingOrdersOfMatched,
      });
      setScanInput("");
    }
  };

  const confirmPickup = (orderId: string) => {
    const order = pendingList.find((o) => o.id === orderId);
    if (!order) return;

    const emp = empOf(order.employeeId);
    markPicked(orderId);
    setScanResult({
      order,
      empName: emp?.name ?? "",
    });
    setScanInput("");
    setMultiMatch(null);
  };

  const clearScanState = () => {
    setScanResult(null);
    setScanError("");
    setMultiMatch(null);
    setScanInput("");
  };

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
                输入或粘贴员工码、手机号后四位，命中订单后确认取餐
              </p>

              {!scanResult && !scanError && !multiMatch && (
                <>
                  <form onSubmit={handleScanSubmit}>
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        placeholder="输入员工码或手机号后四位"
                        className="w-full input-base !pl-11 !pr-24 !py-3 !text-base"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                      />
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary !py-1.5 !px-4 !text-sm"
                      >
                        确认
                      </button>
                    </div>
                  </form>

                  <div className="mt-4 p-3 rounded-xl bg-neutral-50 text-xs text-neutral-500">
                    <p className="mb-1">
                      <span className="font-medium text-neutral-700">使用方式：</span>
                    </p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>扫码枪扫描员工取餐码</li>
                      <li>手动输入员工ID或手机号后四位</li>
                      <li>复制粘贴后按回车确认</li>
                    </ul>
                  </div>
                </>
              )}

              {multiMatch && (
                <div className="space-y-3 animate-fade-in-up">
                  <div className="p-4 rounded-xl bg-warning-50 border border-warning-100">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-warning-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-warning-700">
                          匹配到 {multiMatch.pendingOrders.length} 份待取餐
                        </p>
                        <p className="text-xs text-warning-600 mt-0.5">
                          请选择要确认的订单
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto scroll-thin">
                    {multiMatch.pendingOrders.map((o) => {
                      const emp = empOf(o.employeeId);
                      return (
                        <div
                          key={o.id}
                          className="p-3 rounded-xl border border-neutral-200 bg-white flex items-center gap-3"
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
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
                              {o.extraRice && " · +饭"}
                              {o.drink !== "无" && ` · ${o.drink}`}
                            </p>
                          </div>
                          <button
                            onClick={() => confirmPickup(o.id)}
                            className="px-3 py-1.5 rounded-lg bg-success-500 text-white text-xs font-medium hover:bg-success-600 transition-colors shrink-0 inline-flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            确认取餐
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={clearScanState}
                    className="w-full btn-secondary text-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                    返回重新输入
                  </button>
                </div>
              )}

              {scanResult && (
                <div className="flex flex-col items-center justify-center py-8 animate-fade-in-up">
                  <div className="w-20 h-20 rounded-full bg-success-500 text-white flex items-center justify-center animate-check-in shadow-[0_0_32px_#22C55E]">
                    <Check className="w-10 h-10" />
                  </div>
                  <p className="font-display text-2xl font-bold text-success-600 mt-4">
                    取餐成功
                  </p>
                  <p className="text-base text-neutral-700 mt-1">
                    {scanResult.empName}
                  </p>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {scanResult.order.restaurant} · {scanResult.order.dish}
                    {scanResult.order.extraRice && " · +饭"}
                    {scanResult.order.drink !== "无" &&
                      ` · ${scanResult.order.drink}`}
                  </p>
                  <button
                    onClick={clearScanState}
                    className="mt-6 btn-primary w-full"
                  >
                    <QrCode className="w-4 h-4" />
                    继续扫描下一份
                  </button>
                </div>
              )}

              {scanError && (
                <div className="flex flex-col items-center justify-center py-8 animate-fade-in-up">
                  <div className="w-20 h-20 rounded-full bg-danger-100 text-danger-500 flex items-center justify-center">
                    <X className="w-10 h-10" />
                  </div>
                  <p className="font-display text-lg font-bold text-danger-600 mt-4">
                    取餐失败
                  </p>
                  <p className="text-sm text-neutral-600 mt-2 max-w-[240px] text-center">
                    {scanError}
                  </p>
                  <button
                    onClick={clearScanState}
                    className="mt-6 btn-primary w-full"
                  >
                    <Search className="w-4 h-4" />
                    重新输入
                  </button>
                </div>
              )}

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
