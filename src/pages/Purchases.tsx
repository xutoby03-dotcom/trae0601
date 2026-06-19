import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Building2, Package, Search, CheckCircle2, Filter } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import Modal from "@/components/Modal";
import { PurchaseStatusBadge } from "@/components/Badges";
import {
  PRODUCT_CATEGORY_LABELS,
  SIZES,
  PURCHASE_STATUS_LABELS,
} from "@/types";
import type { Purchase, PurchaseStatus, Size } from "@/types";

interface PurchaseForm {
  productId: string;
  size: Size;
  quantity: number;
  supplier: string;
}

const emptyForm: PurchaseForm = {
  productId: "",
  size: "M",
  quantity: 10,
  supplier: "",
};

export default function Purchases() {
  const {
    purchases,
    products,
    addPurchase,
    updatePurchase,
    deletePurchase,
    completePurchase,
  } = useAppStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Purchase | null>(null);
  const [form, setForm] = useState<PurchaseForm>(emptyForm);
  const [filterStatus, setFilterStatus] = useState<PurchaseStatus | "">("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return purchases
      .slice()
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .filter((p) => {
        const product = products.find((pr) => pr.id === p.productId);
        const matchStatus = !filterStatus || p.status === filterStatus;
        const matchSearch =
          !search ||
          (product &&
            (product.name.includes(search) ||
              PRODUCT_CATEGORY_LABELS[product.category].includes(search))) ||
          p.supplier.includes(search);
        return matchStatus && matchSearch;
      });
  }, [purchases, products, filterStatus, search]);

  const summary = useMemo(() => {
    const pending = purchases.filter((p) => p.status === "pending");
    return {
      pendingCount: pending.length,
      pendingQty: pending.reduce((a, b) => a + b.quantity, 0),
      completedCount: purchases.filter((p) => p.status === "completed").length,
    };
  }, [purchases]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(p: Purchase) {
    setEditing(p);
    setForm({
      productId: p.productId,
      size: p.size,
      quantity: p.quantity,
      supplier: p.supplier,
    });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.productId) return;
    if (editing) {
      updatePurchase(editing.id, form);
    } else {
      addPurchase(form);
    }
    setModalOpen(false);
  }

  const selectedProduct = products.find((p) => p.id === form.productId);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">待采购</p>
              <p className="text-3xl font-bold text-accent-600 mt-1">
                {summary.pendingCount}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-accent-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-accent-600" />
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            共 {summary.pendingQty} 件需采购
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">已入库</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">
                {summary.completedCount}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-2">本季采购完成</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">采购单总数</p>
              <p className="text-3xl font-bold text-primary-700 mt-1">
                {purchases.length}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-2">自动 + 手动创建</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">采购清单</h3>
            <p className="text-xs text-zinc-500 mt-1">
              库存不足时会自动生成采购单，也可手动新增
            </p>
          </div>
          <button className="btn-primary" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            手动采购
          </button>
        </div>

        <div className="px-6 py-4 border-b border-zinc-100 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              className="pl-9 pr-4 py-2 w-64 input"
              placeholder="搜索商品、供应商..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              className="select w-36"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as PurchaseStatus | "")
              }
            >
              <option value="">全部状态</option>
              {Object.entries(PURCHASE_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>创建时间</th>
                <th>商品</th>
                <th>尺码</th>
                <th>采购数量</th>
                <th>供应商</th>
                <th>状态</th>
                <th>入库时间</th>
                <th className="text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const product = products.find((pr) => pr.id === p.productId);
                return (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap text-zinc-500 text-xs">
                      {new Date(p.createdAt).toLocaleDateString("zh-CN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td>
                      <div>
                        <div className="font-medium">
                          {product?.name || "未知商品"}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {product
                            ? PRODUCT_CATEGORY_LABELS[product.category]
                            : ""}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-primary-50 text-primary-700 border border-primary-100">
                        {p.size}
                      </span>
                    </td>
                    <td>
                      <span className="text-lg font-bold text-zinc-800">
                        {p.quantity}
                      </span>
                      <span className="text-xs text-zinc-500 ml-1">件</span>
                    </td>
                    <td className="text-zinc-600 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                        {p.supplier}
                      </span>
                    </td>
                    <td>
                      <PurchaseStatusBadge status={p.status} />
                    </td>
                    <td className="text-xs text-zinc-500 whitespace-nowrap">
                      {p.completedAt
                        ? new Date(p.completedAt).toLocaleDateString("zh-CN")
                        : "-"}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      {p.status === "pending" && (
                        <button
                          title="确认入库"
                          className="p-1.5 rounded-md text-zinc-500 hover:bg-emerald-50 hover:text-emerald-600 mr-1"
                          onClick={() => {
                            if (
                              confirm(
                                `确认 ${product?.name} ${p.size}码 ${p.quantity}件 已入库？`
                              )
                            ) {
                              completePurchase(p.id);
                            }
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {p.status === "pending" && (
                        <button
                          title="编辑"
                          className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-primary-600 mr-1"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        title="删除"
                        className="p-1.5 rounded-md text-zinc-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => {
                          if (confirm("确定删除该采购单吗？")) {
                            deletePurchase(p.id);
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
                  <td colSpan={8} className="py-16 text-center text-zinc-400">
                    暂无采购记录
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
        title={editing ? "编辑采购单" : "新增采购单"}
        size="md"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>
              取消
            </button>
            <button className="btn-primary" onClick={handleSubmit}>
              {editing ? "保存" : "创建采购单"}
            </button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">选择商品 *</label>
            <select
              className="select"
              value={form.productId}
              onChange={(e) => {
                const pid = e.target.value;
                const pr = products.find((p) => p.id === pid);
                setForm({
                  ...form,
                  productId: pid,
                  supplier: form.supplier || pr?.supplier || "",
                });
              }}
              required
              disabled={!!editing}
            >
              <option value="">请选择校服款式</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">尺码</label>
              <select
                className="select"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value as Size })}
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                    {selectedProduct
                      ? `（${selectedProduct.sizeChart[s]?.height}）`
                      : ""}
                  </option>
                ))}
              </select>
              {selectedProduct && (
                <p className="text-xs text-zinc-500 mt-1">
                  当前库存：{selectedProduct.stock[form.size] || 0} 件
                </p>
              )}
            </div>
            <div>
              <label className="label">采购数量</label>
              <input
                type="number"
                min={1}
                className="input"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: Math.max(1, Number(e.target.value)) })
                }
              />
            </div>
          </div>
          <div>
            <label className="label">供应商</label>
            <input
              className="input"
              placeholder="供应商名称"
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
