import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Edit2, Trash2, FlaskConical, AlertCircle, Store, User, Calendar } from "lucide-react";
import { productsApi } from "@/services/api";
import type { Product } from "../../shared/types";
import { CATEGORY_NAMES } from "../../shared/types";
import { formatDateTime } from "@/utils/date";
import PageHeader from "@/components/PageHeader";
import { useAppStore } from "@/store/app";

const CATEGORY_OPTIONS = [
  { value: "", label: "全部品类" },
  { value: "chicken_feet", label: "卤鸡爪" },
  { value: "duck_neck", label: "卤鸭脖" },
  { value: "tofu", label: "卤豆干" },
  { value: "other", label: "其他卤味" },
];

const SALE_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "true", label: "已上架" },
  { value: "false", label: "未上架" },
];

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [isOnSale, setIsOnSale] = useState("");
  const [keyword, setKeyword] = useState("");
  const { addToast } = useAppStore();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const data = await productsApi.list({
        category: category || undefined,
        isOnSale: isOnSale === "" ? undefined : isOnSale === "true",
        keyword: keyword || undefined,
      });
      setProducts(data);
    } catch (err) {
      addToast("error", (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [category, isOnSale, keyword]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定删除「${name}」的商品档案吗？`)) return;
    try {
      await productsApi.remove(id);
      addToast("success", "删除成功");
      load();
    } catch (err) {
      addToast("error", (err as Error).message);
    }
  };

  return (
    <div>
      <PageHeader
        title="商品档案管理"
        description="管理每日出锅的卤制品批次档案"
        action={{ label: "新增商品档案", to: "/products/new" }}
      />

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label-field">品类筛选</label>
            <select
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">上架状态</label>
            <select
              className="input-field"
              value={isOnSale}
              onChange={(e) => setIsOnSale(e.target.value)}
            >
              {SALE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label-field">搜索</label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                className="input-field pl-10"
                placeholder="搜索品名、配方批次、加工人..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">加载中...</div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <Store size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-4">暂无商品档案</p>
            <Link to="/products/new" className="btn-primary inline-flex items-center gap-2">
              <Plus size={18} />
              新增第一个商品档案
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header w-20">照片</th>
                  <th className="table-header">品名</th>
                  <th className="table-header">品类</th>
                  <th className="table-header">配方批次</th>
                  <th className="table-header">加工人</th>
                  <th className="table-header">出锅时间</th>
                  <th className="table-header">售卖窗口</th>
                  <th className="table-header">留样</th>
                  <th className="table-header">状态</th>
                  <th className="table-header text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-warm-50 transition-colors">
                    <td className="table-cell">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Store size={18} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell font-medium text-gray-800">{p.name}</td>
                    <td className="table-cell">
                      <span className="badge badge-gray">
                        {CATEGORY_NAMES[p.category]}
                      </span>
                    </td>
                    <td className="table-cell font-mono text-sm">{p.formulaBatch}</td>
                    <td className="table-cell">
                      <span className="inline-flex items-center gap-1.5 text-gray-700">
                        <User size={14} className="text-gray-400" />
                        {p.processor}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center gap-1.5 text-gray-600 text-sm">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDateTime(p.cookTime)}
                      </span>
                    </td>
                    <td className="table-cell text-gray-600">{p.salesWindow}</td>
                    <td className="table-cell">
                      {p.hasSample ? (
                        <span className="badge badge-success">
                          <FlaskConical size={12} className="mr-1" />
                          已留样
                        </span>
                      ) : (
                        <span className="badge badge-danger">
                          <AlertCircle size={12} className="mr-1" />
                          未留样
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      {p.isOnSale ? (
                        <span className="badge badge-success">已上架</span>
                      ) : (
                        <span className="badge badge-gray">未上架</span>
                      )}
                      {!p.hasSample && p.isOnSale && (
                        <div className="text-xs text-danger-600 mt-1">
                          (应下架)
                        </div>
                      )}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!p.hasSample && (
                          <button
                            onClick={() => navigate(`/samples/new?productId=${p.id}`)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="登记留样"
                          >
                            <FlaskConical size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/products/${p.id}`)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
