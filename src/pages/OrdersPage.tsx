import { useMemo, useState } from "react";
import { Plus, XCircle, Search, Filter } from "lucide-react";
import { useStore } from "@/store";
import type {
  MealType,
  OrderStatus,
  DeliveryType,
  Order,
} from "@/types";
import {
  MEAL_TYPE_LABELS,
  ORDER_STATUS_LABELS,
  DELIVERY_TYPE_LABELS,
} from "@/types";
import OrderFormModal from "@/components/OrderFormModal";
import Modal from "@/components/Modal";
import DatePickerTabs from "@/components/DatePickerTabs";
import { showToast } from "@/components/ToastProvider";
import {
  formatCurrency,
  formatDateTime,
  formatTime,
  getDateOrders,
  getDeliveryTypeColor,
  getOrderStatusColor,
  orderTotalPrice,
} from "@/utils/format";
import { cn } from "@/lib/utils";

type StatusFilter = OrderStatus | "all";
type DeliveryFilter = DeliveryType | "all";
type MealFilter = MealType | "all";

export default function OrdersPage() {
  const {
    dishes,
    orders,
    selectedDate,
    setSelectedDate,
    addOrder,
    cancelOrder,
    canCancelOrder,
  } = useStore();

  const [formOpen, setFormOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [viewTarget, setViewTarget] = useState<Order | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [mealFilter, setMealFilter] = useState<MealFilter>("all");
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>("all");

  const dateOrders = useMemo(
    () => getDateOrders(orders, selectedDate),
    [orders, selectedDate]
  );

  const filteredOrders = useMemo(() => {
    return dateOrders
      .filter((o) => {
        if (search && !o.elderlyName.includes(search) && !o.phone.includes(search))
          return false;
        if (statusFilter !== "all" && o.status !== statusFilter) return false;
        if (mealFilter !== "all" && o.mealType !== mealFilter) return false;
        if (deliveryFilter !== "all" && o.deliveryType !== deliveryFilter) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [dateOrders, search, statusFilter, mealFilter, deliveryFilter]);

  const stats = useMemo(() => {
    const total = dateOrders.length;
    const cancelled = dateOrders.filter((o) => o.status === "cancelled").length;
    const completed = dateOrders.filter((o) => o.status === "completed").length;
    const delivery = dateOrders.filter(
      (o) => o.deliveryType === "delivery" && o.status !== "cancelled"
    ).length;
    return { total, cancelled, completed, delivery };
  }, [dateOrders]);

  const handleSubmit = (data: Parameters<typeof addOrder>[0]) => {
    addOrder(data);
    setFormOpen(false);
    showToast("订餐登记成功", "success");
  };

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    const result = cancelOrder(cancelTarget.id);
    if (result.success) {
      showToast(result.message, "success");
      setCancelTarget(null);
    } else {
      showToast(result.message, "error");
    }
  };

  const cancelCheckInfo = cancelTarget ? canCancelOrder(cancelTarget) : null;

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-900">📋 订餐管理</h1>
          <p className="mt-1 text-sm text-brand-600">
            登记老人订餐信息，处理取消申请
          </p>
        </div>
        <button onClick={() => setFormOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          新建订餐
        </button>
      </div>

      {/* 数据卡片 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="今日订单" value={stats.total} color="from-brand-400 to-brand-500" emoji="📦" />
        <StatCard
          title="已取消"
          value={stats.cancelled}
          color="from-red-400 to-red-500"
          emoji="❌"
        />
        <StatCard
          title="已完成"
          value={stats.completed}
          color="from-emerald-400 to-emerald-500"
          emoji="✅"
        />
        <StatCard
          title="待配送"
          value={stats.delivery}
          color="from-violet-400 to-violet-500"
          emoji="🚚"
        />
      </div>

      {/* 筛选栏 */}
      <div className="card space-y-4 p-4">
        <DatePickerTabs value={selectedDate} onChange={setSelectedDate} />

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
            <input
              className="input-field pl-9"
              placeholder="搜索姓名或电话..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-brand-500" />
            <SelectFilter
              value={mealFilter}
              onChange={(v) => setMealFilter(v as MealFilter)}
              options={[
                { value: "all", label: "全部餐别" },
                ...(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map((k) => ({
                  value: k,
                  label: MEAL_TYPE_LABELS[k],
                })),
              ]}
            />
            <SelectFilter
              value={deliveryFilter}
              onChange={(v) => setDeliveryFilter(v as DeliveryFilter)}
              options={[
                { value: "all", label: "全部配送" },
                ...(Object.keys(DELIVERY_TYPE_LABELS) as DeliveryType[]).map((k) => ({
                  value: k,
                  label: DELIVERY_TYPE_LABELS[k],
                })),
              ]}
            />
            <SelectFilter
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as StatusFilter)}
              options={[
                { value: "all", label: "全部状态" },
                ...(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((k) => ({
                  value: k,
                  label: ORDER_STATUS_LABELS[k],
                })),
              ]}
            />
          </div>
        </div>
      </div>

      {/* 订单列表 */}
      {filteredOrders.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 text-5xl">📭</div>
          <p className="text-lg font-medium text-brand-700">暂无订单</p>
          <p className="mt-1 text-sm text-brand-500">换个筛选条件或新建订餐试试</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-brand-50/80">
                <tr className="border-b border-brand-100">
                  <th className="px-4 py-3 font-semibold text-brand-800">老人信息</th>
                  <th className="px-4 py-3 font-semibold text-brand-800">餐别</th>
                  <th className="px-4 py-3 font-semibold text-brand-800">菜品</th>
                  <th className="px-4 py-3 font-semibold text-brand-800">配送方式</th>
                  <th className="px-4 py-3 font-semibold text-brand-800">金额</th>
                  <th className="px-4 py-3 font-semibold text-brand-800">下单时间</th>
                  <th className="px-4 py-3 font-semibold text-brand-800">状态</th>
                  <th className="px-4 py-3 text-right font-semibold text-brand-800">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => {
                  const canCancel = canCancelOrder(o).canCancel;
                  return (
                    <tr
                      key={o.id}
                      className="border-b border-brand-50 transition-colors hover:bg-brand-50/50"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-brand-900">{o.elderlyName}</div>
                        <div className="mt-0.5 text-xs text-brand-500">
                          {o.building} · {o.phone}
                        </div>
                        {o.dietaryNote && (
                          <div className="mt-1 inline-flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[11px] text-red-600">
                            ⚠️ {o.dietaryNote}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-brand-700">
                        {MEAL_TYPE_LABELS[o.mealType]}
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-[200px] space-y-0.5">
                          {o.items.map((item, idx) => (
                            <div key={idx} className="truncate text-xs text-brand-600">
                              {item.dishName} × {item.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "badge border",
                            getDeliveryTypeColor(o.deliveryType)
                          )}
                        >
                          {DELIVERY_TYPE_LABELS[o.deliveryType]}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-brand-700">
                        {formatCurrency(orderTotalPrice(o))}
                      </td>
                      <td className="px-4 py-3 text-brand-600">
                        {formatDateTime(o.createdAt)}
                        {o.cancelledAt && (
                          <div className="text-xs text-red-500">
                            取消于 {formatTime(o.cancelledAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn("badge border", getOrderStatusColor(o.status))}
                        >
                          {ORDER_STATUS_LABELS[o.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setViewTarget(o)}
                            className="btn-ghost !px-2 !py-1.5 text-xs"
                          >
                            详情
                          </button>
                          {o.status !== "cancelled" && o.status !== "completed" && (
                            <button
                              onClick={() => setCancelTarget(o)}
                              disabled={!canCancel}
                              className={cn(
                                "!px-2 !py-1.5 text-xs inline-flex items-center justify-center gap-1 rounded-lg transition-all duration-200",
                                canCancel
                                  ? "text-red-600 hover:bg-red-50"
                                  : "text-brand-400 hover:bg-brand-50 cursor-not-allowed"
                              )}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              取消
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 新建订单弹窗 */}
      <OrderFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        dishes={dishes}
        mealDate={selectedDate}
      />

      {/* 取消确认弹窗 */}
      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="取消订单"
        footer={
          <>
            <button onClick={() => setCancelTarget(null)} className="btn-secondary">
              返回
            </button>
            <button
              onClick={handleConfirmCancel}
              className="btn-danger"
              disabled={!cancelCheckInfo?.canCancel}
            >
              确认取消
            </button>
          </>
        }
      >
        {cancelTarget && (
          <div className="space-y-3">
            <p className="text-brand-700">
              确定要取消「<span className="font-semibold">{cancelTarget.elderlyName}</span>
              」的 {MEAL_TYPE_LABELS[cancelTarget.mealType]} 订单吗？
            </p>
            <div className="rounded-lg bg-brand-50 p-3 text-sm">
              <div className="flex justify-between text-brand-600">
                <span>订单编号</span>
                <span className="font-mono">{cancelTarget.id.slice(-8)}</span>
              </div>
              <div className="mt-1 flex justify-between text-brand-600">
                <span>取消截止时间</span>
                <span className="font-medium">{formatTime(cancelTarget.cancelDeadline)}</span>
              </div>
            </div>
            {!cancelCheckInfo?.canCancel && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">无法取消</p>
                  <p className="mt-0.5 text-red-600">{cancelCheckInfo?.reason}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 订单详情弹窗 */}
      <Modal
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="订单详情"
        footer={
          <button onClick={() => setViewTarget(null)} className="btn-primary">
            关闭
          </button>
        }
      >
        {viewTarget && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-brand-900">
                  {viewTarget.elderlyName}
                </h3>
                <p className="text-sm text-brand-500">
                  {viewTarget.building} · {viewTarget.phone}
                </p>
              </div>
              <span
                className={cn("badge border", getOrderStatusColor(viewTarget.status))}
              >
                {ORDER_STATUS_LABELS[viewTarget.status]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl bg-brand-50 p-4 text-sm">
              <InfoRow label="餐别" value={MEAL_TYPE_LABELS[viewTarget.mealType]} />
              <InfoRow
                label="配送方式"
                value={DELIVERY_TYPE_LABELS[viewTarget.deliveryType]}
              />
              <InfoRow label="下单时间" value={formatDateTime(viewTarget.createdAt)} />
              <InfoRow
                label="取消截止"
                value={formatTime(viewTarget.cancelDeadline)}
              />
              {viewTarget.dietaryNote && (
                <div className="col-span-2 rounded-lg bg-red-50 px-3 py-2">
                  <span className="text-xs text-red-500">忌口说明</span>
                  <p className="mt-0.5 font-medium text-red-700">
                    {viewTarget.dietaryNote}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-brand-800">菜品明细</h4>
              <div className="space-y-2">
                {viewTarget.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-brand-100 bg-white px-3 py-2 text-sm"
                  >
                    <span className="text-brand-700">
                      {item.dishName} × {item.quantity}
                    </span>
                    <span className="font-medium text-brand-600">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 text-sm">
                  <span className="font-medium text-brand-800">合计</span>
                  <span className="font-bold text-brand-600">
                    {formatCurrency(orderTotalPrice(viewTarget))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
  emoji,
}: {
  title: string;
  value: number;
  color: string;
  emoji: string;
}) {
  return (
    <div
      className={`card bg-gradient-to-br ${color} p-4 text-white shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/80">{title}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
        </div>
        <span className="text-2xl opacity-80">{emoji}</span>
      </div>
    </div>
  );
}

function SelectFilter({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-field !py-2 !text-xs"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-brand-500">{label}</span>
      <span className="font-medium text-brand-800">{value}</span>
    </div>
  );
}
