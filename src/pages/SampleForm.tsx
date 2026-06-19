import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Info, Clock } from "lucide-react";
import { samplesApi, productsApi } from "@/services/api";
import type { Product } from "../../shared/types";
import { nowDateTimeLocal, getInputDateTimeLocal, formatDateTime } from "@/utils/date";
import { useAppStore } from "@/store/app";

export default function SampleForm() {
  const [searchParams] = useSearchParams();
  const preselectedProductId = searchParams.get("productId");
  const navigate = useNavigate();
  const { addToast } = useAppStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    productId: preselectedProductId || "",
    weight: 150,
    containerNo: "",
    fridgeSlot: "",
    startTime: nowDateTimeLocal(),
  });

  const expireTime = (() => {
    if (!form.startTime) return "";
    const d = new Date(form.startTime);
    d.setHours(d.getHours() + 48);
    return d;
  })();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await productsApi.list();
        const pending = data.filter((p) => !p.hasSample);
        const all = data.filter((p) => p.hasSample);
        setProducts([...pending, ...all]);
      } catch (err) {
        addToast("error", (err as Error).message);
      }
    };
    load();
  }, [addToast]);

  const selectedProduct = products.find((p) => p.id === form.productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId) {
      addToast("error", "请选择关联商品");
      return;
    }
    if (!form.weight || form.weight <= 0) {
      addToast("error", "请填写有效的留样重量");
      return;
    }
    if (!form.containerNo.trim()) {
      addToast("error", "请填写容器编号");
      return;
    }
    if (!form.fridgeSlot.trim()) {
      addToast("error", "请填写冷藏格位置");
      return;
    }

    setSubmitting(true);
    try {
      await samplesApi.create({
        productId: form.productId,
        weight: form.weight,
        containerNo: form.containerNo,
        fridgeSlot: form.fridgeSlot,
        startTime: new Date(form.startTime).toISOString(),
      });
      addToast("success", "留样登记成功，批次可上架");
      navigate("/samples");
    } catch (err) {
      addToast("error", (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/samples"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ArrowLeft size={16} />
          返回留样记录列表
        </Link>
        <h1 className="font-serif text-2xl font-bold text-gray-800">新增留样记录</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="card space-y-5">
          <div>
            <label className="label-field">
              关联商品批次 <span className="text-danger-500">*</span>
            </label>
            <select
              className="input-field"
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
            >
              <option value="">请选择商品批次</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - {p.formulaBatch}
                  {!p.hasSample ? " (待留样)" : ""}
                </option>
              ))}
            </select>
            {selectedProduct && (
              <div className="mt-3 p-3 rounded-lg bg-warm-50 flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {selectedProduct.photoUrl && (
                    <img
                      src={selectedProduct.photoUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{selectedProduct.name}</p>
                  <p className="text-xs text-gray-500">
                    加工人：{selectedProduct.processor} · 出锅：{formatDateTime(selectedProduct.cookTime)}
                  </p>
                  {!selectedProduct.hasSample && (
                    <p className="text-xs text-warning-600 mt-0.5">
                      ⚠️ 此批次尚未留样，登记后即可上架
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">
                留样重量(g) <span className="text-danger-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                className="input-field"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label-field">
                容器编号 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                className="input-field font-mono"
                placeholder="例如：C-001"
                value={form.containerNo}
                onChange={(e) => setForm({ ...form, containerNo: e.target.value })}
              />
            </div>
            <div>
              <label className="label-field">
                冷藏格位置 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                className="input-field font-mono"
                placeholder="例如：1-A、2-B"
                value={form.fridgeSlot}
                onChange={(e) => setForm({ ...form, fridgeSlot: e.target.value })}
              />
            </div>
            <div>
              <label className="label-field">留样开始时间</label>
              <input
                type="datetime-local"
                className="input-field"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary-50 border border-primary-100 flex items-start gap-3">
            <Info size={20} className="text-primary-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-primary-700">
              <p className="font-medium flex items-center gap-2">
                <Clock size={16} />
                到期时间自动计算
              </p>
              <p className="mt-1">
                留样保存期为48小时，到期时间为：
                <span className="font-bold ml-1">
                  {expireTime ? formatDateTime(expireTime.toISOString()) : "-"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={() => navigate("/samples")}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={18} />
            {submitting ? "保存中..." : "确认登记留样"}
          </button>
        </div>
      </form>
    </div>
  );
}
