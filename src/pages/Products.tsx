import { useState } from "react";
import { Pencil, Building2, Package, Plus, Minus } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import Modal from "@/components/Modal";
import { StockBadge } from "@/components/Badges";
import {
  PRODUCT_CATEGORY_LABELS,
  SIZES,
} from "@/types";
import type { ProductCategory, Size, Product } from "@/types";

export default function Products() {
  const { products, updateProduct, updateProductStock } = useAppStore();
  const [activeTab, setActiveTab] = useState<ProductCategory | "all">("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [stockModal, setStockModal] = useState<{
    product: Product;
    size: Size;
  } | null>(null);
  const [stockDelta, setStockDelta] = useState(1);

  const displayed =
    activeTab === "all"
      ? products
      : products.filter((p) => p.category === activeTab);

  const tabs: Array<{ key: ProductCategory | "all"; label: string }> = [
    { key: "all", label: "全部" },
    { key: "summer", label: PRODUCT_CATEGORY_LABELS.summer },
    { key: "autumn", label: PRODUCT_CATEGORY_LABELS.autumn },
    { key: "sports", label: PRODUCT_CATEGORY_LABELS.sports },
    { key: "vest", label: PRODUCT_CATEGORY_LABELS.vest },
    { key: "pants", label: PRODUCT_CATEGORY_LABELS.pants },
  ];

  function openStockModal(p: Product, s: Size) {
    setStockModal({ product: p, size: s });
    setStockDelta(1);
  }

  function confirmStockChange() {
    if (!stockModal) return;
    updateProductStock(stockModal.product.id, stockModal.size, stockDelta);
    setStockModal(null);
  }

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="card-header flex-col items-start gap-3">
          <div className="w-full flex items-center justify-between">
            <h3 className="card-title flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600" />
              商品档案
            </h3>
            <span className="text-xs text-zinc-500">共 {products.length} 款商品</span>
          </div>
          <div className="flex gap-1.5 w-full">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === t.key
                    ? "bg-primary-700 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-5">
          {displayed.map((p) => (
            <div
              key={p.id}
              className="border border-zinc-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold text-zinc-800">{p.name}</h4>
                    <span className="badge bg-primary-50 text-primary-700 border border-primary-100">
                      {PRODUCT_CATEGORY_LABELS[p.category]}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-4 text-sm text-zinc-500">
                    <span>单价：<span className="text-accent-600 font-semibold">¥{p.price}</span></span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {p.supplier}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(p)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-primary-600"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              <div className="border-t border-zinc-100 pt-4">
                <p className="text-xs font-medium text-zinc-500 mb-2.5">尺码 / 身高体重参考 / 库存</p>
                <div className="grid grid-cols-5 gap-2">
                  {SIZES.map((s) => {
                    const chart = p.sizeChart[s];
                    const stock = p.stock[s] || 0;
                    const isLow = stock <= 3;
                    return (
                      <button
                        key={s}
                        onClick={() => openStockModal(p, s)}
                        className={`p-2.5 rounded-lg border text-center transition-all hover:shadow-sm ${
                          isLow
                            ? "border-red-200 bg-red-50/50"
                            : "border-zinc-200 bg-zinc-50/50 hover:border-primary-200"
                        }`}
                      >
                        <div className="text-base font-bold text-zinc-800">{s}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5 leading-tight">
                          {chart.height}
                        </div>
                        <div className="text-[10px] text-zinc-500 leading-tight">
                          {chart.weight}
                        </div>
                        <div className="mt-1.5">
                          <StockBadge count={stock} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="编辑商品信息"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setEditing(null)}>
              取消
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                if (editing) {
                  updateProduct(editing.id, editing);
                  setEditing(null);
                }
              }}
            >
              保存
            </button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">商品名称</label>
                <input
                  className="input"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">单价 (元)</label>
                <input
                  type="number"
                  className="input"
                  value={editing.price}
                  onChange={(e) =>
                    setEditing({ ...editing, price: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div>
              <label className="label">供应商</label>
              <input
                className="input"
                value={editing.supplier}
                onChange={(e) => setEditing({ ...editing, supplier: e.target.value })}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!stockModal}
        onClose={() => setStockModal(null)}
        title={
          stockModal
            ? `调整库存 - ${stockModal.product.name} ${stockModal.size}码`
            : ""
        }
        size="sm"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setStockModal(null)}>
              取消
            </button>
            <button className="btn-primary" onClick={confirmStockChange}>
              确认
            </button>
          </>
        }
      >
        {stockModal && (
          <div className="space-y-4">
            <div className="p-4 bg-zinc-50 rounded-lg text-center">
              <p className="text-sm text-zinc-500">当前库存</p>
              <p className="text-3xl font-bold text-primary-700 mt-1">
                {stockModal.product.stock[stockModal.size] || 0}
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                调整后：
                <span className="font-semibold text-zinc-800">
                  {Math.max(0, (stockModal.product.stock[stockModal.size] || 0) + stockDelta)}
                </span>
              </p>
            </div>
            <div>
              <label className="label">调整数量（正数增加，负数减少）</label>
              <div className="flex items-center gap-2">
                <button
                  className="btn-secondary w-10 p-0 justify-center"
                  onClick={() => setStockDelta(stockDelta - 1)}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  className="input text-center"
                  value={stockDelta}
                  onChange={(e) => setStockDelta(Number(e.target.value))}
                />
                <button
                  className="btn-secondary w-10 p-0 justify-center"
                  onClick={() => setStockDelta(stockDelta + 1)}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
