import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { productsApi } from "@/services/api";
import type { Product, ProductCategory } from "../../shared/types";
import { CATEGORY_NAMES } from "../../shared/types";
import { nowDateTimeLocal, getInputDateTimeLocal } from "@/utils/date";
import ImageUpload from "@/components/ImageUpload";
import { useAppStore } from "@/store/app";

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: "chicken_feet", label: "卤鸡爪" },
  { value: "duck_neck", label: "卤鸭脖" },
  { value: "tofu", label: "卤豆干" },
  { value: "other", label: "其他卤味" },
];

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { addToast } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<Partial<Product>>({
    name: "",
    category: "chicken_feet",
    formulaBatch: "",
    processor: "",
    cookTime: nowDateTimeLocal(),
    salesWindow: "",
    photoUrl: "",
    isOnSale: false,
  });

  useEffect(() => {
    if (isEdit) {
      const load = async () => {
        setLoading(true);
        try {
          const data = await productsApi.get(id!);
          setForm({
            ...data,
            cookTime: getInputDateTimeLocal(data.cookTime),
          });
        } catch (err) {
          addToast("error", (err as Error).message);
          navigate("/products");
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [id, isEdit, navigate, addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      addToast("error", "请填写品名");
      return;
    }
    if (!form.processor?.trim()) {
      addToast("error", "请填写加工人");
      return;
    }

    setSubmitting(true);
    try {
      const data: Partial<Product> = {
        ...form,
        cookTime: new Date(form.cookTime as string).toISOString(),
      };
      if (isEdit) {
        await productsApi.update(id!, data);
        addToast("success", "商品档案更新成功");
      } else {
        await productsApi.create(data);
        addToast("success", "商品档案创建成功");
      }
      navigate("/products");
    } catch (err) {
      addToast("error", (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="card">加载中...</div>;
  }

  const canOnSale = isEdit ? !!form.hasSample : false;

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ArrowLeft size={16} />
          返回商品档案列表
        </Link>
        <h1 className="font-serif text-2xl font-bold text-gray-800">
          {isEdit ? "编辑商品档案" : "新增商品档案"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card">
              <ImageUpload
                label="商品照片"
                value={form.photoUrl}
                onChange={(url) => setForm({ ...form, photoUrl: url })}
                placeholder="上传出锅成品照片"
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h3 className="font-serif font-semibold text-gray-800 mb-4">
                基础信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">
                    品名 <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="例如：招牌卤鸡爪"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-field">
                    品类 <span className="text-danger-500">*</span>
                  </label>
                  <select
                    className="input-field"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as ProductCategory })
                    }
                  >
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-field">配方批次号</label>
                  <input
                    type="text"
                    className="input-field font-mono"
                    placeholder="自动生成，可修改"
                    value={form.formulaBatch}
                    onChange={(e) =>
                      setForm({ ...form, formulaBatch: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label-field">
                    加工人 <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="例如：张师傅"
                    value={form.processor}
                    onChange={(e) => setForm({ ...form, processor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-field">出锅时间</label>
                  <input
                    type="datetime-local"
                    className="input-field"
                    value={form.cookTime}
                    onChange={(e) => setForm({ ...form, cookTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-field">售卖窗口</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="例如：窗口A-1号"
                    value={form.salesWindow}
                    onChange={(e) => setForm({ ...form, salesWindow: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-serif font-semibold text-gray-800 mb-4">
                上架状态
              </h3>
              {isEdit && !canOnSale && (
                <div className="mb-4 p-4 rounded-lg bg-warning-50 border border-warning-200 flex items-start gap-3">
                  <AlertTriangle size={20} className="text-warning-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-warning-700">
                    <p className="font-medium">未完成留样，暂不可上架</p>
                    <p className="mt-1">请先完成该批次的留样登记后方可上架售卖</p>
                  </div>
                </div>
              )}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  checked={!!form.isOnSale}
                  onChange={(e) => setForm({ ...form, isOnSale: e.target.checked })}
                  disabled={!canOnSale}
                />
                <span className={canOnSale ? "text-gray-700" : "text-gray-400"}>
                  设为已上架
                </span>
              </label>
              <p className="text-xs text-gray-400 mt-2">
                {isEdit
                  ? canOnSale
                    ? "勾选后此批次商品将在售卖窗口对外销售"
                    : "完成留样登记后可勾选上架"
                  : "创建商品档案后，完成留样登记即可上架"}
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => navigate("/products")}
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
                {submitting ? "保存中..." : isEdit ? "保存修改" : "创建档案"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
