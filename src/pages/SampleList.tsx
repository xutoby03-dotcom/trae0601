import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, Plus, Eye, FlaskConical, Refrigerator, Clock, Box } from "lucide-react";
import { samplesApi } from "@/services/api";
import type { Sample, SampleStatus } from "../../shared/types";
import { SAMPLE_STATUS_NAMES, CATEGORY_NAMES } from "../../shared/types";
import { formatDateTime, getTimeRemaining } from "@/utils/date";
import PageHeader from "@/components/PageHeader";
import { useAppStore } from "@/store/app";

const STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "active", label: "留样中" },
  { value: "expiring", label: "即将到期" },
  { value: "expired", label: "已到期" },
  { value: "destroyed", label: "已销毁" },
];

const getStatusBadgeClass = (status: SampleStatus) => {
  switch (status) {
    case "active":
      return "badge-success";
    case "expiring":
      return "badge-warning";
    case "expired":
    case "destroyed":
      return "badge-danger";
    default:
      return "badge-gray";
  }
};

export default function SampleList() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const { addToast } = useAppStore();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const data = await samplesApi.list({
        status: status || undefined,
        keyword: keyword || undefined,
      });
      setSamples(data);
    } catch (err) {
      addToast("error", (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status, keyword]);

  return (
    <div>
      <PageHeader
        title="留样记录管理"
        description="查看和管理所有批次的留样记录"
        action={{ label: "新增留样", to: "/samples/new" }}
      />

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label-field">状态筛选</label>
            <select
              className="input-field"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((o) => (
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
                placeholder="搜索容器编号、冷藏格、商品名称..."
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
        ) : samples.length === 0 ? (
          <div className="py-16 text-center">
            <FlaskConical size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-4">暂无留样记录</p>
            <Link to="/samples/new" className="btn-primary inline-flex items-center gap-2">
              <Plus size={18} />
              登记第一个留样
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header w-16">状态</th>
                  <th className="table-header">商品</th>
                  <th className="table-header">重量(g)</th>
                  <th className="table-header">容器编号</th>
                  <th className="table-header">冷藏格</th>
                  <th className="table-header">留样时间</th>
                  <th className="table-header">到期时间</th>
                  <th className="table-header">剩余时间</th>
                  <th className="table-header text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {samples.map((s) => (
                  <tr key={s.id} className="hover:bg-warm-50 transition-colors">
                    <td className="table-cell">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          s.status === "active"
                            ? "bg-success-500"
                            : s.status === "expiring"
                            ? "bg-warning-500"
                            : s.status === "expired"
                            ? "bg-danger-500"
                            : "bg-gray-400"
                        }`}
                      />
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {s.product?.photoUrl && (
                            <img src={s.product.photoUrl} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {s.product?.name || "未知商品"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {s.product ? CATEGORY_NAMES[s.product.category] : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell font-medium">{s.weight}g</td>
                    <td className="table-cell">
                      <span className="inline-flex items-center gap-1.5">
                        <Box size={14} className="text-gray-400" />
                        <span className="font-mono text-sm">{s.containerNo}</span>
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center gap-1.5">
                        <Refrigerator size={14} className="text-gray-400" />
                        <span className="font-mono text-sm">{s.fridgeSlot}</span>
                      </span>
                    </td>
                    <td className="table-cell text-sm text-gray-600">
                      {formatDateTime(s.startTime)}
                    </td>
                    <td className="table-cell text-sm text-gray-600">
                      {s.status === "destroyed" && s.destructionTime ? (
                        <span className="text-gray-400 line-through">
                          {formatDateTime(s.expireTime)}
                        </span>
                      ) : (
                        formatDateTime(s.expireTime)
                      )}
                    </td>
                    <td className="table-cell">
                      {s.status === "destroyed" ? (
                        <span className={`badge ${getStatusBadgeClass(s.status)}`}>
                          已销毁
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-gray-400" />
                          <span
                            className={`text-sm font-medium ${
                              s.status === "active"
                                ? "text-success-600"
                                : s.status === "expiring"
                                ? "text-warning-600"
                                : "text-danger-600"
                            }`}
                          >
                            {getTimeRemaining(s.expireTime)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/samples/${s.id}`)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="查看详情"
                        >
                          <Eye size={16} />
                        </button>
                        {(s.status === "expiring" || s.status === "expired") && (
                          <Link
                            to="/destruction"
                            className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                            title="去销毁"
                          >
                            销毁
                          </Link>
                        )}
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
