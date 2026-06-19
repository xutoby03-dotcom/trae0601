import { useState, useMemo } from "react";
import {
  MapPin,
  Package,
  PackageCheck,
  AlertTriangle,
  Camera,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Upload,
  Flame,
  Droplets,
  AlertCircle,
  PackageX,
  Bell,
  Send,
  Calendar,
} from "lucide-react";
import Modal from "@/components/UI/Modal";
import Tag from "@/components/UI/Tag";
import { useOrderStore } from "@/store/order";
import { useEmployeeStore } from "@/store/employee";
import { useExceptionStore } from "@/store/exception";
import {
  PICKUP_POINTS,
  EXCEPTION_TYPES,
  Order,
  ExceptionType,
  PickupPoint,
} from "@/types";
import { cn } from "@/lib/utils";
import {
  todayStr,
  packingStatusColor,
  packingStatusLabel,
  exceptionTypeLabel,
  exceptionStatusColor,
  exceptionStatusLabel,
} from "@/utils/formatters";
import { SPICE_COLOR } from "@/utils/colors";

interface ExceptionForm {
  orderId: string;
  type: ExceptionType;
  description: string;
  photos: string[];
}

export default function PackingPage() {
  const { orders, markPacked, markException } = useOrderStore();
  const { employees, getLeaders } = useEmployeeStore();
  const { exceptions, addException } = useExceptionStore();

  const [dateFilter, setDateFilter] = useState(todayStr());
  const [expanded, setExpanded] = useState<Set<PickupPoint>>(
    new Set(PICKUP_POINTS)
  );
  const [exceptionModal, setExceptionModal] = useState(false);
  const [notifyModal, setNotifyModal] = useState(false);
  const [excepForm, setExcepForm] = useState<ExceptionForm>({
    orderId: "",
    type: "missing",
    description: "",
    photos: [],
  });
  const [notifiedList, setNotifiedList] = useState<Set<string>>(new Set());

  const todayOrders = useMemo(
    () => orders.filter((o) => o.orderDate === dateFilter),
    [orders, dateFilter]
  );

  const grouped = useMemo(() => {
    const result: Record<PickupPoint, Order[]> = {} as any;
    PICKUP_POINTS.forEach((p) => (result[p] = []));
    todayOrders.forEach((o) => {
      const emp = employees.find((e) => e.id === o.employeeId);
      if (emp) result[emp.pickupPoint].push(o);
    });
    return result;
  }, [todayOrders, employees]);

  const pointStats = useMemo(() => {
    const stats: Record<
      PickupPoint,
      { total: number; packed: number; exception: number; pending: number }
    > = {} as any;
    PICKUP_POINTS.forEach((p) => {
      const list = grouped[p];
      stats[p] = {
        total: list.length,
        packed: list.filter((o) => o.packingStatus === "packed").length,
        exception: list.filter((o) => o.packingStatus === "exception").length,
        pending: list.filter((o) => o.packingStatus === "pending").length,
      };
    });
    return stats;
  }, [grouped]);

  const overall = useMemo(() => {
    const total = todayOrders.length;
    const packed = todayOrders.filter((o) => o.packingStatus === "packed").length;
    const excep = todayOrders.filter((o) => o.packingStatus === "exception").length;
    return {
      total,
      packed,
      excep,
      percent: total ? Math.round(((packed + excep) / total) * 100) : 0,
    };
  }, [todayOrders]);

  const toggleExpand = (p: PickupPoint) => {
    setExpanded((prev) => {
      const s = new Set(prev);
      if (s.has(p)) s.delete(p);
      else s.add(p);
      return s;
    });
  };

  const openException = (o: Order) => {
    setExcepForm({ orderId: o.id, type: "missing", description: "", photos: [] });
    setExceptionModal(true);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setExcepForm((f) => ({
          ...f,
          photos: [...f.photos, ev.target?.result as string].slice(0, 3),
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const submitException = () => {
    if (!excepForm.orderId) return;
    markException(excepForm.orderId);
    addException({
      orderId: excepForm.orderId,
      type: excepForm.type,
      description: excepForm.description,
      photos: excepForm.photos,
      handlerId: null,
      refundStatus: excepForm.type === "missing" ? "pending" : "none",
    });
    setExceptionModal(false);
  };

  const empOf = (id: string) => employees.find((e) => e.id === id);
  const leaders = getLeaders();

  const handleNotifyAll = () => {
    const pendingExs = exceptions.filter(
      (e) => e.status === "pending" && !notifiedList.has(e.id)
    );
    pendingExs.forEach((e) => setNotifiedList((s) => new Set(s).add(e.id)));
  };

  const pendingToday = exceptions.filter(
    (e) => e.status === "pending" && e.createdAt === dateFilter
  );

  const ExceptionIcon = (type: ExceptionType) => {
    const map: Record<ExceptionType, any> = {
      missing: PackageX,
      spilled: Droplets,
      wrongSpice: Flame,
      other: AlertCircle,
    };
    const Icon = map[type];
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-800">
            到货分装
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            按取餐点核对清单，发现异常请拍照记录并通知负责人
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-base !w-[150px] !px-3 !py-1.5"
            />
          </div>
          <button
            onClick={() => setNotifyModal(true)}
            className={cn(
              "btn-secondary relative",
              pendingToday.length > 0 && "ring-2 ring-danger-300"
            )}
          >
            <Bell className="w-4 h-4 text-danger-500" />
            异常通知
            {pendingToday.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger-500 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingToday.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="card p-6 bg-gradient-to-br from-brand-50/60 via-white to-success-50/40">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-neutral-500">总体进度</p>
              <p className="mt-1">
                <span className="font-display text-4xl font-bold text-brand-600">
                  {overall.percent}%
                </span>
                <span className="ml-3 text-sm text-neutral-500">
                  ({overall.packed + overall.excep} / {overall.total})
                </span>
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-success-500" />
                <span className="text-neutral-600">已分装</span>
                <span className="font-bold text-success-600">{overall.packed}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-danger-500" />
                <span className="text-neutral-600">异常</span>
                <span className="font-bold text-danger-500">{overall.excep}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-600">待分装</span>
                <span className="font-bold text-neutral-600">
                  {overall.total - overall.packed - overall.excep}
                </span>
              </span>
            </div>
          </div>
          <div className="w-full md:w-80">
            <div className="progress-bar h-3">
              <div
                className="progress-bar-fill bg-gradient-to-r from-success-400 via-brand-400 to-brand-500"
                style={{ width: `${overall.percent}%` }}
              />
            </div>
            <p className="text-xs text-neutral-400 mt-2 text-right">
              {new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })} 开始分装
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {PICKUP_POINTS.map((point, pi) => {
          const stats = pointStats[point];
          const list = grouped[point];
          const isExp = expanded.has(point);
          return (
            <div
              key={point}
              className={cn(
                "card overflow-hidden animate-fade-in-up"
              )}
              style={{ animationDelay: `${pi * 60}ms` }}
            >
              <button
                onClick={() => toggleExpand(point)}
                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-neutral-50/50 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-500 text-white flex items-center justify-center shadow-button shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-neutral-800">
                      {point}
                    </h3>
                    <Tag variant="brand" size="sm">
                      共 {stats.total} 份
                    </Tag>
                    {stats.exception > 0 && (
                      <Tag variant="danger" size="sm" dot>
                        {stats.exception} 异常
                      </Tag>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <PackageCheck className="w-3 h-3 text-success-500" />
                      {stats.packed} 已分装
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3 text-neutral-400" />
                      {stats.pending} 待分装
                    </span>
                    <div className="flex-1 max-w-[180px] progress-bar h-1.5">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: stats.total
                            ? `${(stats.packed / stats.total) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-brand-500">
                    {stats.total
                      ? Math.round((stats.packed / stats.total) * 100)
                      : 0}
                    %
                  </span>
                  {isExp ? (
                    <ChevronUp className="w-5 h-5 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-400" />
                  )}
                </div>
              </button>

              {isExp && (
                <div className="border-t border-neutral-100">
                  {list.length === 0 ? (
                    <div className="py-10 text-center text-sm text-neutral-400">
                      该取餐点暂无订单
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100">
                      {list.map((o, i) => {
                        const emp = empOf(o.employeeId);
                        const excep = exceptions.find((e) => e.orderId === o.id);
                        return (
                          <div
                            key={o.id}
                            className="px-6 py-4 flex items-center gap-4 hover:bg-brand-50/20 transition-colors"
                          >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                              style={{ backgroundColor: emp?.avatarColor }}>
                              {emp?.name.charAt(0)}
                            </div>

                            <div className="flex-1 min-w-0 grid grid-cols-12 gap-3 items-center">
                              <div className="col-span-3 min-w-0">
                                <p className="font-medium text-neutral-800 truncate">
                                  {emp?.name}
                                </p>
                                <p className="text-xs text-neutral-400 truncate">
                                  {emp?.department} · ****{emp?.phoneLast4}
                                </p>
                              </div>

                              <div className="col-span-4 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-neutral-700 truncate max-w-[120px]">
                                    {o.restaurant}
                                  </span>
                                  <span className="text-xs text-neutral-500">
                                    ·
                                  </span>
                                  <span className="text-sm text-neutral-600 truncate">
                                    {o.dish}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Tag size="sm" variant="info">
                                    {o.spec}
                                  </Tag>
                                  <span
                                    className="text-[11px] font-medium inline-flex items-center gap-0.5"
                                    style={{ color: SPICE_COLOR[o.spiceLevel] }}
                                  >
                                    <Flame className="w-3 h-3" />
                                    {o.spiceLevel}
                                  </span>
                                  {o.extraRice && (
                                    <Tag size="sm" variant="brand">
                                      +饭
                                    </Tag>
                                  )}
                                  {o.drink !== "无" && (
                                    <Tag size="sm" variant="purple">
                                      🥤 {o.drink}
                                    </Tag>
                                  )}
                                  {o.remark && (
                                    <Tag size="sm" variant="warning">
                                      💬 {o.remark}
                                    </Tag>
                                  )}
                                </div>
                              </div>

                              <div className="col-span-3">
                                {emp?.dietaryRestrictions && emp.dietaryRestrictions.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {emp.dietaryRestrictions.map((d) => (
                                      <Tag key={d} size="sm" variant="danger">
                                        ⚠️ {d}
                                      </Tag>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-neutral-300">
                                    无忌口
                                  </span>
                                )}
                              </div>

                              <div className="col-span-2 flex items-center justify-end gap-2">
                                {excep ? (
                                  <div className="text-right">
                                    <Tag
                                      variant={
                                        excep.status === "resolved"
                                          ? "success"
                                          : excep.status === "processing"
                                          ? "warning"
                                          : "danger"
                                      }
                                      size="sm"
                                      dot
                                    >
                                      {ExceptionIcon(excep.type)}
                                      {exceptionTypeLabel(excep.type)}
                                    </Tag>
                                    <p className="text-[10px] mt-0.5 text-neutral-400">
                                      {exceptionStatusLabel(excep.status)}
                                    </p>
                                  </div>
                                ) : (
                                  <Tag
                                    className={packingStatusColor(
                                      o.packingStatus
                                    )}
                                    size="sm"
                                  >
                                    {packingStatusLabel(o.packingStatus)}
                                  </Tag>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {!excep && o.packingStatus !== "packed" && (
                                <button
                                  onClick={() => markPacked(o.id)}
                                  className="w-10 h-10 rounded-xl bg-success-50 text-success-500 hover:bg-success-500 hover:text-white transition-all flex items-center justify-center"
                                  title="标记已分装"
                                >
                                  <Check className="w-4.5 h-4.5" />
                                </button>
                              )}
                              {!excep && (
                                <button
                                  onClick={() => openException(o)}
                                  className="w-10 h-10 rounded-xl bg-danger-50 text-danger-500 hover:bg-danger-500 hover:text-white transition-all flex items-center justify-center"
                                  title="上报异常"
                                >
                                  <AlertTriangle className="w-4.5 h-4.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        open={exceptionModal}
        onClose={() => setExceptionModal(false)}
        title="上报异常"
        subtitle="请选择异常类型并说明情况，必要时上传照片留证"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setExceptionModal(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={submitException} className="btn-danger">
              <AlertTriangle className="w-4 h-4" />
              确认上报
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              异常类型
            </label>
            <div className="grid grid-cols-4 gap-3">
              {EXCEPTION_TYPES.map((t) => {
                const active = excepForm.type === t.value;
                const colors: Record<string, any> = {
                  danger: { border: "border-danger-400", bg: "bg-danger-50", text: "text-danger-600" },
                  warning: { border: "border-warning-400", bg: "bg-warning-50", text: "text-warning-600" },
                  info: { border: "border-info-400", bg: "bg-info-50", text: "text-info-600" },
                };
                const c = colors[t.color] ?? colors.info;
                return (
                  <button
                    key={t.value}
                    onClick={() => setExcepForm({ ...excepForm, type: t.value })}
                    className={cn(
                      "py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5",
                      active
                        ? `${c.border} ${c.bg} ${c.text} shadow-sm`
                        : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                    )}
                  >
                    {t.icon === "package-x" && <PackageX className="w-6 h-6" />}
                    {t.icon === "droplets" && <Droplets className="w-6 h-6" />}
                    {t.icon === "flame" && <Flame className="w-6 h-6" />}
                    {t.icon === "alert-circle" && <AlertCircle className="w-6 h-6" />}
                    <span className="text-sm font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              说明描述
            </label>
            <textarea
              value={excepForm.description}
              onChange={(e) =>
                setExcepForm({ ...excepForm, description: e.target.value })
              }
              placeholder="如：商家漏送一份米饭，或汤洒了一半等具体情况"
              rows={3}
              className="input-base resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              拍照留证（最多3张）
            </label>
            <div className="flex items-start gap-3 flex-wrap">
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-neutral-200 hover:border-brand-400 hover:bg-brand-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-neutral-400 hover:text-brand-500 gap-1">
                <Camera className="w-6 h-6" />
                <span className="text-xs">拍照/上传</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  className="hidden"
                  onChange={handlePhoto}
                />
              </label>
              {excepForm.photos.map((p, i) => (
                <div
                  key={i}
                  className="relative w-24 h-24 rounded-xl overflow-hidden border border-neutral-200 group"
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() =>
                      setExcepForm((f) => ({
                        ...f,
                        photos: f.photos.filter((_, idx) => idx !== i),
                      }))
                    }
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={notifyModal}
        onClose={() => setNotifyModal(false)}
        title="异常通知"
        subtitle={`今日共 ${pendingToday.length} 条待处理异常，可一键通知对应部门负责人`}
        size="lg"
        footer={
          <>
            <button
              onClick={() => setNotifyModal(false)}
              className="btn-secondary"
            >
              关闭
            </button>
            {pendingToday.length > 0 && (
              <button onClick={handleNotifyAll} className="btn-primary">
                <Send className="w-4 h-4" />
                一键通知全部负责人
              </button>
            )}
          </>
        }
      >
        <div className="space-y-3">
          {pendingToday.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-sm">
              🎉 今日暂无待处理异常
            </div>
          ) : (
            pendingToday.map((e, i) => {
              const order = orders.find((o) => o.id === e.orderId);
              const emp = order ? empOf(order.employeeId) : null;
              const leader = leaders.find(
                (l) => l.department === emp?.department
              );
              const notified = notifiedList.has(e.id);
              return (
                <div
                  key={e.id}
                  className="p-4 rounded-card border border-neutral-100 bg-neutral-50/50 flex items-start gap-4 animate-fade-in-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      e.type === "missing"
                        ? "bg-danger-50 text-danger-500"
                        : "bg-warning-50 text-warning-500"
                    )}
                  >
                    {ExceptionIcon(e.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag variant="danger" size="sm" dot>
                        {exceptionTypeLabel(e.type)}
                      </Tag>
                      <Tag
                        className={exceptionStatusColor(e.status)}
                        size="sm"
                      >
                        {exceptionStatusLabel(e.status)}
                      </Tag>
                      {notified && (
                        <Tag variant="success" size="sm">
                          ✓ 已通知
                        </Tag>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-neutral-700">
                      <span className="font-medium">{emp?.name}</span> 的{" "}
                      <span className="font-medium text-brand-600">
                        {order?.restaurant} - {order?.dish}
                      </span>
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                      {e.description}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className="text-neutral-400">
                        通知 → {leader?.name ?? "暂无负责人"}（{emp?.department}）
                      </span>
                      {!notified && leader && (
                        <button
                          onClick={() =>
                            setNotifiedList((s) => new Set(s).add(e.id))
                          }
                          className="text-brand-500 hover:text-brand-600 font-medium inline-flex items-center gap-0.5"
                        >
                          <Send className="w-3 h-3" />
                          单独通知
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Modal>
    </div>
  );
}
