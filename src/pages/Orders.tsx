import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Calendar,
  Store,
  DollarSign,
  CheckSquare,
  Trash2,
  Pencil,
  Flame,
  Cookie,
  CupSoda,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Modal from "@/components/UI/Modal";
import Tag from "@/components/UI/Tag";
import { useOrderStore } from "@/store/order";
import { useEmployeeStore } from "@/store/employee";
import {
  RESTAURANTS,
  DISHES_BY_RESTAURANT,
  SPECS,
  SPICE_LEVELS,
  DRINKS,
  Order,
  Spec,
  SpiceLevel,
  PaymentStatus,
} from "@/types";
import { cn } from "@/lib/utils";
import {
  todayStr,
  paymentStatusColor,
  paymentStatusLabel,
} from "@/utils/formatters";
import { SPICE_COLOR } from "@/utils/colors";

interface FormState {
  employeeId: string;
  restaurant: string;
  dish: string;
  spec: Spec;
  spiceLevel: SpiceLevel;
  extraRice: boolean;
  drink: string;
  paymentStatus: PaymentStatus;
  orderDate: string;
  remark: string;
}

const defaultForm = (): FormState => ({
  employeeId: "",
  restaurant: RESTAURANTS[0],
  dish: DISHES_BY_RESTAURANT[RESTAURANTS[0]][0],
  spec: "中份",
  spiceLevel: "微辣",
  extraRice: false,
  drink: "无",
  paymentStatus: "unpaid",
  orderDate: todayStr(),
  remark: "",
});

export default function OrdersPage() {
  const { orders, addOrder, updateOrder, deleteOrder, markPaid } =
    useOrderStore();
  const { employees } = useEmployeeStore();

  const [dateFilter, setDateFilter] = useState(todayStr());
  const [restaurantFilter, setRestaurantFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">(
    "all"
  );
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortAsc, setSortAsc] = useState(false);

  const restaurantDishes =
    DISHES_BY_RESTAURANT[form.restaurant] ?? ["招牌菜"];

  const filtered = useMemo(() => {
    let list = orders;
    list = list.filter((o) => o.orderDate === dateFilter);
    if (restaurantFilter !== "all")
      list = list.filter((o) => o.restaurant === restaurantFilter);
    if (paymentFilter !== "all")
      list = list.filter((o) => o.paymentStatus === paymentFilter);
    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      list = list.filter((o) => {
        const emp = employees.find((e) => e.id === o.employeeId);
        return (
          o.dish.toLowerCase().includes(kw) ||
          o.restaurant.toLowerCase().includes(kw) ||
          emp?.name.toLowerCase().includes(kw)
        );
      });
    }
    return list.sort((a, b) => {
      const na = employees.find((e) => e.id === a.employeeId)?.name ?? "";
      const nb = employees.find((e) => e.id === b.employeeId)?.name ?? "";
      return sortAsc ? na.localeCompare(nb, "zh") : nb.localeCompare(na, "zh");
    });
  }, [
    orders,
    dateFilter,
    restaurantFilter,
    paymentFilter,
    search,
    employees,
    sortAsc,
  ]);

  const totalAmount = filtered.length;
  const paidCount = filtered.filter((o) => o.paymentStatus === "paid").length;
  const unpaidCount = totalAmount - paidCount;

  const openAdd = () => {
    setEditing(null);
    setForm(defaultForm());
    setModalOpen(true);
  };
  const openEdit = (o: Order) => {
    setEditing(o);
    setForm({
      employeeId: o.employeeId,
      restaurant: o.restaurant,
      dish: o.dish,
      spec: o.spec,
      spiceLevel: o.spiceLevel,
      extraRice: o.extraRice,
      drink: o.drink,
      paymentStatus: o.paymentStatus,
      orderDate: o.orderDate,
      remark: o.remark,
    });
    setModalOpen(true);
  };

  const submitForm = () => {
    if (!form.employeeId) return;
    if (editing) {
      updateOrder(editing.id, form);
    } else {
      addOrder(form);
    }
    setModalOpen(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((o) => o.id)));
    }
  };

  const batchMarkPaid = () => {
    markPaid(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const empOf = (id: string) => employees.find((e) => e.id === id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-800">
            团购订单
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            录入每日团购订单，自动按取餐点分组到分装清单
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> 新增订单
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">今日订单</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display text-3xl font-bold text-neutral-800 mt-3">
            {totalAmount}
          </p>
          <p className="text-xs text-neutral-400 mt-1">份餐食</p>
        </div>
        <div className="card p-5 animate-fade-in-up animate-delay-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">已付款</span>
            <div className="w-9 h-9 rounded-xl bg-success-50 text-success-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display text-3xl font-bold text-success-600 mt-3">
            {paidCount}
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            {totalAmount ? Math.round((paidCount / totalAmount) * 100) : 0}%
          </p>
        </div>
        <div className="card p-5 animate-fade-in-up animate-delay-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">待付款</span>
            <div className="w-9 h-9 rounded-xl bg-warning-50 text-warning-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display text-3xl font-bold text-warning-600 mt-3">
            {unpaidCount}
          </p>
          <p className="text-xs text-neutral-400 mt-1">份待收款</p>
        </div>
        <div className="card p-5 animate-fade-in-up animate-delay-150">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">覆盖商家</span>
            <div className="w-9 h-9 rounded-xl bg-info-50 text-info-500 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display text-3xl font-bold text-info-500 mt-3">
            {new Set(filtered.map((o) => o.restaurant)).size}
          </p>
          <p className="text-xs text-neutral-400 mt-1">家餐厅</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Calendar className="w-4 h-4" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-base !w-[150px] !px-3 !py-1.5"
            />
          </div>
          <select
            value={restaurantFilter}
            onChange={(e) => setRestaurantFilter(e.target.value)}
            className="select-base max-w-[160px] !py-1.5"
          >
            <option value="all">全部商家</option>
            {RESTAURANTS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={paymentFilter}
            onChange={(e) =>
              setPaymentFilter(e.target.value as PaymentStatus | "all")
            }
            className="select-base max-w-[140px] !py-1.5"
          >
            <option value="all">全部付款</option>
            <option value="unpaid">待付款</option>
            <option value="paid">已付款</option>
            <option value="refunded">已退款</option>
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              className="input-base pl-10 !py-1.5"
              placeholder="搜索姓名/商家/菜品"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex-1" />
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <Tag variant="brand" size="md">
                <CheckSquare className="w-3 h-3" />
                已选 {selectedIds.size} 份
              </Tag>
              <button onClick={batchMarkPaid} className="btn-primary !py-1.5 !px-3 text-xs">
                <DollarSign className="w-3.5 h-3.5" />
                批量标记已付款
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto scroll-thin max-h-[62vh]">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50/80 sticky top-0 backdrop-blur-sm z-10">
              <tr className="text-neutral-500">
                <th className="px-4 py-3 text-left w-10">
                  <CheckSquare
                    onClick={toggleSelectAll}
                    className={cn(
                      "w-4 h-4 cursor-pointer transition-colors",
                      selectedIds.size === filtered.length && filtered.length > 0
                        ? "text-brand-500 fill-brand-500"
                        : "text-neutral-300"
                    )}
                  />
                </th>
                <th
                  className="px-4 py-3 text-left font-medium cursor-pointer select-none hover:text-brand-600"
                  onClick={() => setSortAsc((v) => !v)}
                >
                  <span className="inline-flex items-center gap-1">
                    员工
                    {sortAsc ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                </th>
                <th className="px-4 py-3 text-left font-medium">商家</th>
                <th className="px-4 py-3 text-left font-medium">菜品</th>
                <th className="px-4 py-3 text-left font-medium">规格</th>
                <th className="px-4 py-3 text-left font-medium">辣度</th>
                <th className="px-4 py-3 text-center font-medium">加饭</th>
                <th className="px-4 py-3 text-left font-medium">饮料</th>
                <th className="px-4 py-3 text-left font-medium">付款</th>
                <th className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-neutral-400">
                    暂无订单数据，点击右上角「新增订单」录入
                  </td>
                </tr>
              ) : (
                filtered.map((o, i) => {
                  const emp = empOf(o.employeeId);
                  const selected = selectedIds.has(o.id);
                  return (
                    <tr
                      key={o.id}
                      className={cn(
                        "border-t border-neutral-100 transition-colors hover:bg-brand-50/30",
                        selected && "bg-brand-50/50"
                      )}
                      style={{ animation: "fade-in-up 0.4s ease-out both", animationDelay: `${Math.min(i * 20, 200)}ms` }}
                    >
                      <td className="px-4 py-3">
                        <CheckSquare
                          onClick={() => toggleSelect(o.id)}
                          className={cn(
                            "w-4 h-4 cursor-pointer transition-colors",
                            selected
                              ? "text-brand-500 fill-brand-500"
                              : "text-neutral-300 hover:text-neutral-500"
                          )}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: emp?.avatarColor }}
                          >
                            {emp?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-800">
                              {emp?.name}
                            </p>
                            <p className="text-[11px] text-neutral-400">
                              {emp?.department} · {emp?.pickupPoint}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-neutral-700">
                          {o.restaurant}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-700">
                        {o.dish}
                        {o.remark && (
                          <p className="text-[10px] text-brand-500 mt-0.5">
                            💬 {o.remark}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Tag variant="info">{o.spec}</Tag>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1 text-xs font-medium"
                          style={{ color: SPICE_COLOR[o.spiceLevel] }}
                        >
                          <Flame className="w-3 h-3" />
                          {o.spiceLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {o.extraRice ? (
                          <Cookie className="w-4 h-4 mx-auto text-brand-500" />
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-neutral-700">
                        <span className="inline-flex items-center gap-1 text-xs">
                          <CupSoda className="w-3 h-3 text-info-500" />
                          {o.drink}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Tag
                          variant={
                            o.paymentStatus === "paid"
                              ? "success"
                              : o.paymentStatus === "refunded"
                              ? "default"
                              : "warning"
                          }
                        >
                          {paymentStatusLabel(o.paymentStatus)}
                        </Tag>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(o)}
                            className="w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-brand-500 flex items-center justify-center transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteOrder(o.id)}
                            className="w-8 h-8 rounded-lg hover:bg-danger-50 text-neutral-400 hover:text-danger-500 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "编辑订单" : "新增团购订单"}
        size="lg"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">
              取消
            </button>
            <button
              onClick={submitForm}
              disabled={!form.employeeId}
              className="btn-primary disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {editing ? "保存修改" : "确认下单"}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              选择员工 <span className="text-danger-500">*</span>
            </label>
            <select
              className="select-base"
              value={form.employeeId}
              onChange={(e) =>
                setForm({ ...form, employeeId: e.target.value })
              }
            >
              <option value="">请选择点单员工</option>
              {employees
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name, "zh"))
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} · {e.department} · {e.pickupPoint}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                商家
              </label>
              <select
                className="select-base"
                value={form.restaurant}
                onChange={(e) => {
                  const r = e.target.value;
                  setForm({
                    ...form,
                    restaurant: r,
                    dish: (DISHES_BY_RESTAURANT[r] ?? ["招牌菜"])[0],
                  });
                }}
              >
                {RESTAURANTS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                菜品
              </label>
              <select
                className="select-base"
                value={form.dish}
                onChange={(e) => setForm({ ...form, dish: e.target.value })}
              >
                {restaurantDishes.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                规格
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SPECS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm({ ...form, spec: s })}
                    className={cn(
                      "py-2 rounded-xl border text-sm font-medium transition-all",
                      form.spec === s
                        ? "border-brand-400 bg-brand-50 text-brand-600"
                        : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                辣度
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SPICE_LEVELS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm({ ...form, spiceLevel: s })}
                    style={{
                      borderColor:
                        form.spiceLevel === s ? SPICE_COLOR[s] : undefined,
                      backgroundColor:
                        form.spiceLevel === s
                          ? `${SPICE_COLOR[s]}15`
                          : undefined,
                      color:
                        form.spiceLevel === s ? SPICE_COLOR[s] : undefined,
                    }}
                    className={cn(
                      "py-2 rounded-xl border text-sm font-medium transition-all",
                      form.spiceLevel !== s &&
                        "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                饮料
              </label>
              <select
                className="select-base"
                value={form.drink}
                onChange={(e) => setForm({ ...form, drink: e.target.value })}
              >
                {DRINKS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                订单日期
              </label>
              <input
                type="date"
                value={form.orderDate}
                onChange={(e) =>
                  setForm({ ...form, orderDate: e.target.value })
                }
                className="input-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              额外选项
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.extraRice}
                  onChange={(e) =>
                    setForm({ ...form, extraRice: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
                />
                <span className="text-sm text-neutral-700">
                  <Cookie className="w-3.5 h-3.5 inline mr-1 text-brand-500" />
                  多加一份饭 (+饭)
                </span>
              </label>
              <span className="text-neutral-300">|</span>
              {(["unpaid", "paid"] as PaymentStatus[]).map((s) => (
                <label key={s} className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pay"
                    checked={form.paymentStatus === s}
                    onChange={() => setForm({ ...form, paymentStatus: s })}
                    className="w-4 h-4 text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-sm text-neutral-700">
                    {paymentStatusLabel(s)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              备注
            </label>
            <input
              className="input-base"
              placeholder="如：少放盐、不要香菜、多加点汤等"
              value={form.remark}
              onChange={(e) => setForm({ ...form, remark: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
