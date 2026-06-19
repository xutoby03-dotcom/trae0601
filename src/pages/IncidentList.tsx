import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, AlertTriangle, User, FlaskConical, Edit2, AlertCircle, Clock } from "lucide-react";
import { incidentsApi } from "@/services/api";
import type { Incident, IncidentType, IncidentStatus } from "../../shared/types";
import { INCIDENT_TYPE_NAMES, INCIDENT_STATUS_NAMES } from "../../shared/types";
import { formatDateTime } from "@/utils/date";
import PageHeader from "@/components/PageHeader";
import { useAppStore } from "@/store/app";

const TYPE_OPTIONS = [
  { value: "", label: "全部类型" },
  { value: "complaint", label: "售卖投诉" },
  { value: "odor", label: "异味" },
  { value: "temperature", label: "温度异常" },
  { value: "other", label: "其他异常" },
];

const STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "pending", label: "待处理" },
  { value: "investigating", label: "调查中" },
  { value: "resolved", label: "已解决" },
];

const getTypeIconClass = (type: IncidentType) => {
  switch (type) {
    case "complaint":
      return "bg-primary-100 text-primary-600";
    case "odor":
      return "bg-warning-100 text-warning-500";
    case "temperature":
      return "bg-danger-100 text-danger-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getStatusBadgeClass = (status: IncidentStatus) => {
  switch (status) {
    case "pending":
      return "badge-danger";
    case "investigating":
      return "badge-warning";
    case "resolved":
      return "badge-success";
    default:
      return "badge-gray";
  }
};

export default function IncidentList() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const { addToast } = useAppStore();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const data = await incidentsApi.list({
        type: type || undefined,
        status: status || undefined,
      });
      setIncidents(data);
    } catch (err) {
      addToast("error", (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [type, status]);

  const handleResolve = async (id: string) => {
    try {
      await incidentsApi.update(id, { status: "resolved" });
      addToast("success", "已标记为已解决");
      load();
    } catch (err) {
      addToast("error", (err as Error).message);
    }
  };

  return (
    <div>
      <PageHeader
        title="异常事件管理"
        description="记录和追踪投诉、异味、温度异常等食品安全事件"
        action={{ label: "新增异常事件", to: "/incidents/new" }}
      />

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-field">事件类型</label>
            <select
              className="input-field"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">处理状态</label>
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
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="card text-center text-gray-400 py-12">加载中...</div>
        ) : incidents.length === 0 ? (
          <div className="card py-16 text-center">
            <AlertCircle size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-4">暂无异常事件记录</p>
            <Link
              to="/incidents/new"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={18} />
              新增第一个异常事件
            </Link>
          </div>
        ) : (
          incidents.map((inc) => (
            <div key={inc.id} className="card">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeIconClass(
                    inc.type
                  )}`}
                >
                  {inc.type === "complaint" ? (
                    <User size={22} />
                  ) : inc.type === "odor" ? (
                    <AlertTriangle size={22} />
                  ) : inc.type === "temperature" ? (
                    <AlertCircle size={22} />
                  ) : (
                    <AlertTriangle size={22} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-medium text-gray-800">
                      {INCIDENT_TYPE_NAMES[inc.type]}
                    </span>
                    <span className={`badge ${getStatusBadgeClass(inc.status)}`}>
                      {INCIDENT_STATUS_NAMES[inc.status]}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto inline-flex items-center gap-1">
                      <Clock size={12} />
                      {formatDateTime(inc.occurTime)}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{inc.description}</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    {inc.sample?.product && (
                      <Link
                        to={`/samples/${inc.sampleId}`}
                        className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700"
                      >
                        <FlaskConical size={14} />
                        关联留样：{inc.sample.product.name} ({inc.sample.containerNo} · {inc.sample.fridgeSlot})
                      </Link>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                      <User size={14} />
                      上报人：{inc.reporter}
                    </span>
                  </div>
                  {inc.status !== "resolved" && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                      <button
                        onClick={() => handleResolve(inc.id)}
                        className="btn-success text-sm py-2 px-4"
                      >
                        标记已解决
                      </button>
                      <button
                        onClick={() => navigate(`/incidents/new?id=${inc.id}`)}
                        className="btn-secondary text-sm py-2 px-4 inline-flex items-center gap-1.5"
                      >
                        <Edit2 size={14} />
                        编辑
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
