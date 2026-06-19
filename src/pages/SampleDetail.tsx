import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Refrigerator, Box, Clock, AlertTriangle } from "lucide-react";
import { samplesApi, incidentsApi } from "@/services/api";
import type { Sample, Incident } from "../../shared/types";
import { SAMPLE_STATUS_NAMES, INCIDENT_TYPE_NAMES, INCIDENT_STATUS_NAMES, CATEGORY_NAMES } from "../../shared/types";
import { formatDateTime, getTimeRemaining } from "@/utils/date";
import { useAppStore } from "@/store/app";

const getStatusBadgeClass = (status: string) => {
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

export default function SampleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useAppStore();
  const [sample, setSample] = useState<Sample | null>(null);
  const [linkedIncidents, setLinkedIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await samplesApi.get(id!);
        setSample(data);
        const allIncidents = await incidentsApi.list();
        setLinkedIncidents(allIncidents.filter((i) => i.sampleId === id));
      } catch (err) {
        addToast("error", (err as Error).message);
        navigate("/samples");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, addToast]);

  if (loading || !sample) {
    return <div className="card">加载中...</div>;
  }

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
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="font-serif text-2xl font-bold text-gray-800">留样详情</h1>
          <span className={`badge ${getStatusBadgeClass(sample.status)}`}>
            {SAMPLE_STATUS_NAMES[sample.status]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
              {sample.product?.photoUrl ? (
                <img
                  src={sample.product.photoUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  无照片
                </div>
              )}
            </div>
            <h3 className="font-serif font-semibold text-lg text-gray-800 mb-1">
              {sample.product?.name || "未知商品"}
            </h3>
            <p className="text-sm text-gray-500">
              {sample.product ? CATEGORY_NAMES[sample.product.category] : ""}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">配方批次</span>
                <span className="font-mono text-gray-800">{sample.product?.formulaBatch}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">加工人</span>
                <span className="text-gray-800">{sample.product?.processor}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-serif font-semibold text-gray-800 mb-4">留样信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Box size={18} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">留样重量</p>
                  <p className="font-medium text-gray-800">{sample.weight}g</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Box size={18} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">容器编号</p>
                  <p className="font-mono font-medium text-gray-800">{sample.containerNo}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-success-50 flex items-center justify-center flex-shrink-0">
                  <Refrigerator size={18} className="text-success-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">冷藏格</p>
                  <p className="font-mono font-medium text-gray-800">{sample.fridgeSlot}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-warning-50 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-warning-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">剩余时间</p>
                  <p className={`font-medium ${
                    sample.status === "destroyed"
                      ? "text-gray-400"
                      : sample.status === "active"
                      ? "text-success-600"
                      : sample.status === "expiring"
                      ? "text-warning-600"
                      : "text-danger-600"
                  }`}>
                    {sample.status === "destroyed" ? "已销毁" : getTimeRemaining(sample.expireTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">留样开始时间</p>
                  <p className="font-medium text-gray-800">{formatDateTime(sample.startTime)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-danger-50 flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} className="text-danger-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">到期时间</p>
                  <p className="font-medium text-gray-800">{formatDateTime(sample.expireTime)}</p>
                </div>
              </div>
            </div>
          </div>

          {sample.status === "destroyed" && (
            <div className="card border-2 border-danger-200 bg-danger-50/50">
              <h3 className="font-serif font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-danger-500" />
                销毁记录
              </h3>
              <div className="aspect-video max-w-sm rounded-lg overflow-hidden bg-gray-100 mb-4">
                {sample.destructionPhoto && (
                  <img
                    src={sample.destructionPhoto}
                    alt="销毁照片"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">销毁人</p>
                    <p className="font-medium text-gray-800">{sample.destructionPerson}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    <Calendar size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">销毁时间</p>
                    <p className="font-medium text-gray-800">
                      {sample.destructionTime ? formatDateTime(sample.destructionTime) : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="font-serif font-semibold text-gray-800 mb-4 flex items-center justify-between">
              <span>关联异常事件</span>
              <Link
                to={`/incidents/new?sampleId=${sample.id}`}
                className="text-sm text-primary-600 hover:text-primary-700 font-normal"
              >
                + 新增关联事件
              </Link>
            </h3>
            {linkedIncidents.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <AlertTriangle size={28} className="mx-auto mb-2 opacity-50" />
                <p>暂无关联异常事件</p>
              </div>
            ) : (
              <div className="space-y-3">
                {linkedIncidents.map((inc) => (
                  <div key={inc.id} className="p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`badge ${
                          inc.status === "pending"
                            ? "badge-danger"
                            : inc.status === "investigating"
                            ? "badge-warning"
                            : "badge-success"
                        }`}
                      >
                        {INCIDENT_TYPE_NAMES[inc.type]}
                      </span>
                      <span
                        className={`badge badge-${
                          inc.status === "resolved" ? "success" : "warning"
                        }`}
                      >
                        {INCIDENT_STATUS_NAMES[inc.status]}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {formatDateTime(inc.occurTime)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{inc.description}</p>
                    <p className="text-xs text-gray-500 mt-2">上报人：{inc.reporter}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
