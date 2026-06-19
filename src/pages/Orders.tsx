import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  DollarSign,
  RefreshCw,
  PackageCheck,
  CheckCircle2,
  RotateCw,
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import Modal from "@/components/Modal";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  StockBadge,
} from "@/components/Badges";
import {
  SIZES,
  CLASSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PRODUCT_CATEGORY_LABELS,
  ORIGINAL_CONDITION_LABELS,
} from "@/types";
import type {
  Order,
  OrderStatus,
  PaymentStatus,
  Size,
  OriginalCondition,
} from "@/types";

interface OrderFormData {
  studentId: string;
  productId: string;
  size: Size;
  quantity: number;
  isExchange: boolean;
  originalSize?: Size;
  originalCondition?: OriginalCondition;
  paymentStatus: PaymentStatus;
  remark: string;
}

const emptyForm: OrderFormData = {
  studentId: "",
  productId: "",
  size: "M",
  quantity: 1,
  isExchange: false,
  paymentStatus: "unpaid",
  remark: "",
};

export default function Orders() {
  const {
    orders,
    students,
    products,
    addOrder,
    updateOrder,
    updateOrderPayment,
    updateOrderStatus,
    deleteOrder,
  } = useAppStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState<OrderFormData>(emptyForm);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "">("");
  const [filterPayment, setFilterPayment] = useState<PaymentStatus | "">("");
  const [filterClass, setFilterClass] = useState("");

  const filtered = useMemo(() => {
    return orders
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((o) => {
        const student = students.find((s) => s.id === o.studentId);
        const product = products.find((p) => p.id === o.productId);
        const matchSearch =
          !search ||
          (student &&
            (student.name.includes(search) ||
              student.className.includes(search))) ||
          (product && product.name.includes(search));
        const matchStatus = !filterStatus || o.orderStatus === filterStatus;
        const matchPayment = !filterPayment || o.paymentStatus === filterPayment;
        const matchClass = !filterClass || student?.className === filterClass;
        return matchSearch && matchStatus && matchPayment && matchClass;
      });
  }, [orders, students, products, search, filterStatus, filterPayment, filterClass]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(o: Order) {
    setEditing(o);
    setForm({
      studentId: o.studentId,
      productId: o.productId,
      size: o.size,
      quantity: o.quantity,
      isExchange: o.isExchange,
      originalSize: o.originalSize,
      originalCondition: o.originalCondition,
      paymentStatus: o.paymentStatus,
      remark: o.remark,
    });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.studentId || !form.productId) return;
    if (editing) {
      updateOrder(editing.id, form);
    } else {
      addOrder(form);
    }
    setModalOpen(false);
  }

  const selectedProduct = products.find((p) => p.id === form.productId);
  const selectedStudent = students.find((s) => s.id === form.studentId);

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">补订申请</h3>
            <p className="text-xs text-zinc-500 mt-1">共 {orders.length} 条申请</p>
          </div>
          <button className="btn-primary" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            新建申请
          </button>
        </div>

        <div className="px-6 py-4 border-b border-zinc-100 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              className="pl-9 pr-4 py-2 w-64 input"
              placeholder="搜索学生姓名、班级..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              className="select w-32"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as OrderStatus | "")}
            >
              <option value="">全部状态</option>
              {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              className="select w-32"
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value as PaymentStatus | "")}
            >
              <option value="">付款状态</option>
              {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              className="select w-36"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">全部班级</option>
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>申请时间</th>
                <th>班级</th>
                <th>学生</th>
                <th>商品</th>
                <th>尺码</th>
                <th>数量</th>
                <th>换码</th>
                <th>付款</th>
                <th>状态</th>
                <th className="text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const student = students.find((s) => s.id === o.studentId);
                const product = products.find((p) => p.id === o.productId);
                return (
                  <tr key={o.id}>
                    <td className="whitespace-nowrap text-zinc-500 text-xs">
                      {new Date(o.createdAt).toLocaleDateString("zh-CN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap">{student?.className || "-"}</td>
                    <td className="font-medium">{student?.name || "-"}</td>
                    <td>
                      <div>
                        <div>{product?.name || "-"}</div>
                        <div className="text-[11px] text-zinc-400">
                          {product
                            ? PRODUCT_CATEGORY_LABELS[product.category]
                            : ""}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-primary-50 text-primary-700 border border-primary-100">
                        {o.size}
                      </span>
                      {o.isExchange && (
                        <div className="text-[11px] text-zinc-500 mt-1">
                          ← {o.originalSize}（
                          {o.originalCondition
                            ? ORIGINAL_CONDITION_LABELS[o.originalCondition]
                            : "-"}
                          ）
                        </div>
                      )}
                    </td>
                    <td>×{o.quantity}</td>
                    <td>
                      {o.isExchange ? (
                        <span className="badge bg-accent-50 text-accent-700 border border-accent-200">
                          <RotateCw className="w-3 h-3 mr-1" />
                          换码
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-xs">新订</span>
                      )}
                    </td>
                    <td>
                      <PaymentStatusBadge status={o.paymentStatus} />
                    </td>
                    <td>
                      <OrderStatusBadge status={o.orderStatus} />
                    </td>
                    <td className="text-right whitespace-nowrap">
                      {o.paymentStatus === "unpaid" && (
                        <button
                          title="标记已付款"
                          className="p-1.5 rounded-md text-zinc-500 hover:bg-emerald-50 hover:text-emerald-600 mr-1"
                          onClick={() => updateOrderPayment(o.id, "paid")}
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      )}
                      {o.orderStatus === "ready" && o.paymentStatus === "paid" && (
                        <button
                          title="确认发放"
                          className="p-1.5 rounded-md text-zinc-500 hover:bg-primary-50 hover:text-primary-600 mr-1"
                          onClick={() => updateOrderStatus(o.id, "completed")}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {o.orderStatus === "purchasing" && (
                        <button
                          title="标记到货"
                          className="p-1.5 rounded-md text-zinc-500 hover:bg-emerald-50 hover:text-emerald-600 mr-1"
                          onClick={() => updateOrderStatus(o.id, "ready")}
                        >
                          <PackageCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        title="编辑"
                        className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-primary-600 mr-1"
                        onClick={() => openEdit(o)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        title="删除"
                        className="p-1.5 rounded-md text-zinc-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => {
                          if (confirm("确定删除该补订申请吗？")) {
                            deleteOrder(o.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-zinc-400">
                    暂无补订申请
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "编辑补订申请" : "新建补订申请"}
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>
              取消
            </button>
            <button className="btn-primary" onClick={handleSubmit}>
              {editing ? "保存修改" : "提交申请"}
            </button>
          </>
        }
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">选择学生 *</label>
              <select
                className="select"
                value={form.studentId}
                onChange={(e) => {
                  const sid = e.target.value;
                  const s = students.find((x) => x.id === sid);
                  setForm({
                    ...form,
                    studentId: sid,
                    originalSize: form.originalSize || s?.originalSize,
                  });
                }}
                required
              >
                <option value="">请选择学生</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.className} - {s.name}（原码 {s.originalSize}）
                  </option>
                ))}
              </select>
              {selectedStudent && (
                <p className="text-xs text-zinc-500 mt-1">
                  身高 {selectedStudent.height}cm / 体重 {selectedStudent.weight}kg /
                  原码 {selectedStudent.originalSize}
                </p>
              )}
            </div>
            <div>
              <label className="label">选择商品 *</label>
              <select
                className="select"
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                required
              >
                <option value="">请选择校服款式</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}（¥{p.price}）
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">新尺码</label>
              <select
                className="select"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value as Size })}
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                    {selectedProduct
                      ? ` - ${selectedProduct.sizeChart[s]?.height}`
                      : ""}
                  </option>
                ))}
              </select>
              {selectedProduct && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-zinc-500">库存：</span>
                  <StockBadge count={selectedProduct.stock[form.size] || 0} />
                </div>
              )}
            </div>
            <div>
              <label className="label">数量</label>
              <input
                type="number"
                min={1}
                max={10}
                className="input"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: Math.max(1, Number(e.target.value)) })
                }
              />
            </div>
            <div>
              <label className="label">付款状态</label>
              <select
                className="select"
                value={form.paymentStatus}
                onChange={(e) =>
                  setForm({
                    ...form,
                    paymentStatus: e.target.value as PaymentStatus,
                  })
                }
              >
                <option value="unpaid">待付款</option>
                <option value="paid">已付款</option>
              </select>
            </div>
          </div>

          <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50/50">
            <label className="flex items-center gap-2.5 cursor-pointer mb-3">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-zinc-300 text-primary-600 focus:ring-primary-500"
                checked={form.isExchange}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isExchange: e.target.checked,
                    originalSize: e.target.checked
                      ? form.originalSize || selectedStudent?.originalSize
                      : undefined,
                    originalCondition: e.target.checked
                      ? form.originalCondition || "good"
                      : undefined,
                  })
                }
              />
              <RefreshCw className="w-4 h-4 text-accent-600" />
              <span className="text-sm font-medium text-zinc-700">
                是否为换码申请
              </span>
            </label>
            {form.isExchange && (
              <div className="grid grid-cols-2 gap-4 ml-6 pt-2 border-t border-zinc-200">
                <div>
                  <label className="label">原尺码</label>
                  <select
                    className="select"
                    value={form.originalSize || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        originalSize: e.target.value as Size,
                      })
                    }
                  >
                    {SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">原衣状态</label>
                  <select
                    className="select"
                    value={form.originalCondition || "good"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        originalCondition: e.target.value as OriginalCondition,
                      })
                    }
                  >
                    {Object.entries(ORIGINAL_CONDITION_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="label">备注</label>
            <textarea
              className="input min-h-[70px]"
              placeholder="例如：学生长高需要换大码、原校服破损等"
              value={form.remark}
              onChange={(e) => setForm({ ...form, remark: e.target.value })}
            />
          </div>

          {selectedProduct && !editing && (
            <div className="p-4 bg-primary-50/60 border border-primary-100 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600">预估金额</p>
                <p className="text-2xl font-bold text-primary-700 mt-0.5">
                  ¥{selectedProduct.price * form.quantity}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-zinc-500">
                  {selectedProduct.name} × {form.quantity}
                </p>
                <p className="text-zinc-500">尺码：{form.size}</p>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
