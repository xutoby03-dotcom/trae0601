import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Save, FlaskConical, User, AlertTriangle } from "lucide-react";
import { incidentsApi, samplesApi } from "@/services/api";
import type { Incident, IncidentType, IncidentStatus, Sample } from "../../shared/types";
import { INCIDENT_TYPE_NAMES, INCIDENT_STATUS_NAMES } from "../../shared/types";
import { nowDateTimeLocal, getInputDateTimeLocal, formatDateTime } from "@/utils/date";
import { useAppStore } from "@/store/app";

const TYPE_OPTIONS: { value: IncidentType; label: string }[] = [
  { value: "complaint", label: "售卖投诉" },
  { value: "odor", label: "异味" },
  { value: "temperature", label: "温度异常" },
  { value: "other", label: "其他异常" },
];

const STATUS_OPTIONS: { value: IncidentStatus; label: string }[] = [
  { value: "pending", label: "待处理" },
  { value: "investigating", label: "调查中" },
  { value: "resolved", label: "已解决" },
];

export default function IncidentForm() {
  const [searchParams] = useSearchParams();
  const preselectedSampleId = searchParams.get("sampleId");
  const editId = searchParams.get("id");
  const isEdit = !!editId;
  const navigate = useNavigate();
  const { addToast } = useAppStore();

  const [samples, setSamples] = useState<Sample[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Incident>>({
    type: "complaint",
    description: "",
    sampleId: preselectedSampleId || "",
    occurTime: nowDateTimeLocal(),
    reporter: "",
    status: "pending",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const sampleData = await samplesApi.list();
        const filtered = sampleData.filter((s) => s.status !== "destroyed");
        setSamples(filtered);

        if (isEdit) {
          setLoading(true);
          const data = await incidentsApi.get(editId!);
          setForm({
            ...data,
            occurTime: getInputDateTimeLocal(data.occurTime),
          });
          setLoading(false);
        }
      } catch (err) {
        addToast("error", (err as Error).message);
      }
    };
    load();
  }, [isEdit, editId, addToast]);

  const selectedSample = samples.find((s) => s.id === form.sampleId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type) {
      addToast("error", "请选择事件类型");
      return;
    }
    if (!form.description?.trim()) {
      addToast("error", "请填写事件描述");
      return;
    }
    if (!form.reporter?.trim()) {
      addToast("error", "请填写上报人");
      return;
    }

    setSubmitting(true);
    try {
      const data: Partial<Incident> = {
        ...form,
        occurTime: new Date(form.occurTime as string).toISOString(),
      };
      if (isEdit) {
        await incidentsApi.update(editId!, data);
        addToast("success", "异常事件更新成功");
      } else {
        await incidentsApi.create(data);
        addToast("success", "异常事件记录成功");
      }
      navigate("/incidents");
    } catch (err) {
      addToast("error", (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="card">加载中...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/incidents"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ArrowLeft size={16} />
          返回异常事件列表
        </Link>
        <h1 className="font-serif text-2xl font-bold text-gray-800">
          {isEdit ? "编辑异常事件" : "新增异常事件"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="card space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">
                事件类型 <span className="text-danger-500">*</span>
              </label>
              <select
                className="input-field"
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as IncidentType })
                }
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
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as IncidentStatus })
                }
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">
                上报人 <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="例如：收银员小王"
                  value={form.reporter}
                  onChange={(e) => setForm({ ...form, reporter: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label-field">发生时间</label>
              <input
                type="datetime-local"
                className="input-field"
                value={form.occurTime}
                onChange={(e) => setForm({ ...form, occurTime: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label-field">
              事件描述 <span className="text-danger-500">*</span>
            </label>
            <textarea
              className="input-field min-h-[120px] resize-y"
              placeholder="请详细描述事件经过..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="label-field">关联留样记录（可选）</label>
            <div className="relative">
              <FlaskConical
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 z-10"
              />
              <select
                className="input-field pl-10"
                value={form.sampleId}
                onChange={(e) => setForm({ ...form, sampleId: e.target.value })}
              >
                <option value="">不关联留样</option>
                {samples.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.product?.name || "未知商品"} - {s.containerNo} ({s.fridgeSlot})
                  </option>
                ))}
              </select>
            </div>
            {selectedSample && (
              <div className="mt-3 p-3 rounded-lg bg-primary-50 border border-primary-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {selectedSample.product?.photoUrl && (
                    <img
                      src={selectedSample.product.photoUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">
                    {selectedSample.product?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    容器 {selectedSample.containerNo} · 冷藏格 {selectedSample.fridgeSlot} · 留样时间{" "}
                    {formatDateTime(selectedSample.startTime)}
                  </p>
                </div>
                <AlertTriangle size={18} className="text-primary-500" />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={() => navigate("/incidents")}
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
            {submitting ? "保存中..." : isEdit ? "保存修改" : "提交事件"}
          </button>
        </div>
      </form>
    </div>
  );
}
