import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Camera,
  Save,
  X,
  Building2,
  Phone,
  User,
  Package,
} from "lucide-react";
import { useStationStore } from "../../store/stationStore";
import { useRepairStore } from "../../store/repairStore";
import { StationStatusBadge } from "../../components/ui/StatusBadge";
import { formatMoney } from "../../utils/formatters";
import type { PartItem, StationStatus } from "../../types";
import { STATION_STATUS_LABELS, REPAIR_ISSUE_LABELS } from "../../types";
import { clsx } from "clsx";

const FAULT_CATEGORIES = [
  { value: "hardware", label: "硬件故障" },
  { value: "software", label: "软件故障" },
  { value: "electrical", label: "电路故障" },
  { value: "connector", label: "接口故障" },
  { value: "network", label: "网络故障" },
  { value: "other", label: "其他问题" },
];

const STATION_STATUS_OPTIONS: StationStatus[] = ["online", "offline", "fault", "maintenance"];

interface PartRow extends PartItem {
  id: string;
}

export default function RecordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stationId = searchParams.get("stationId") || "";
  const ticketId = searchParams.get("ticketId") || undefined;

  const stations = useStationStore((s: any) => s.stations);
  const tickets = useRepairStore((s: any) => s.tickets);
  const updateStationStatus = useStationStore((s) => s.updateStationStatus);
  const createMaintenance = useRepairStore((s) => s.createMaintenance);

  const selectedStation = useMemo(() => stationId ? stations.find((s: any) => s.id === stationId) : undefined, [stationId, stations]);
  const relatedTicket = useMemo(() => ticketId ? tickets.find((t: any) => t.id === ticketId) : undefined, [ticketId, tickets]);

  const [formStationId, setFormStationId] = useState(stationId);
  const [faultReason, setFaultReason] = useState(relatedTicket?.description || "");
  const [faultCategory, setFaultCategory] = useState("hardware");
  const [parts, setParts] = useState<PartRow[]>([
    { id: "p1", name: "", quantity: 1, unitPrice: 0 },
  ]);
  const [technician, setTechnician] = useState("");
  const [technicianPhone, setTechnicianPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [stationStatusAfter, setStationStatusAfter] = useState<StationStatus>("online");
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const totalCost = useMemo(
    () => parts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0),
    [parts]
  );

  const addPart = () => {
    setParts((prev) => [
      ...prev,
      { id: `p_${Date.now()}`, name: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removePart = (id: string) => {
    setParts((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev));
  };

  const updatePart = (id: string, field: keyof PartRow, value: string | number) => {
    setParts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addPhoto = (type: "before" | "after") => {
    const url = `https://picsum.photos/seed/${Date.now()}/400/300`;
    if (type === "before") {
      setBeforePhotos((p) => [...p, url]);
    } else {
      setAfterPhotos((p) => [...p, url]);
    }
  };

  const removePhoto = (type: "before" | "after", index: number) => {
    if (type === "before") {
      setBeforePhotos((p) => p.filter((_, i) => i !== index));
    } else {
      setAfterPhotos((p) => p.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    if (!formStationId) {
      alert("请选择充电桩");
      return;
    }
    if (!faultReason.trim()) {
      alert("请填写故障原因");
      return;
    }
    if (!technician.trim()) {
      alert("请填写维修人");
      return;
    }

    setSubmitting(true);

    const validParts = parts.filter((p) => p.name.trim() && p.quantity > 0);

    createMaintenance({
      stationId: formStationId,
      repairTicketId: ticketId,
      faultReason: faultReason.trim(),
      faultCategory,
      partsReplaced: validParts.map(({ id: _id, ...rest }) => rest),
      totalCost,
      technician: technician.trim(),
      technicianPhone: technicianPhone.trim(),
      notes: notes.trim(),
      stationStatusAfter,
    });

    updateStationStatus(formStationId, stationStatusAfter);
    useStationStore.getState().computeStats();

    setTimeout(() => {
      setSubmitting(false);
      if (ticketId) {
        navigate(`/repairs/tickets/${ticketId}`);
      } else {
        navigate("/maintenance/history");
      }
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/maintenance/faults" className="btn-ghost !p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="page-title">创建维修记录</h1>
          <p className="text-slate-500 text-sm mt-1">
            填写故障详情、更换配件和维修信息
          </p>
        </div>
      </div>

      {selectedStation && (
        <div className="card p-5 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-semibold text-slate-800 text-lg">
                  {selectedStation.code}
                </span>
                <StationStatusBadge status={selectedStation.status} />
              </div>
              <div className="text-sm text-slate-500">
                {selectedStation.building} · {selectedStation.location} · {selectedStation.power}kW
              </div>
            </div>
            {relatedTicket && (
              <div className="px-4 py-2 rounded-lg bg-warning-50 border border-warning-100 text-sm">
                <div className="text-xs text-warning-600 mb-0.5">关联工单</div>
                <div className="font-medium text-warning-700">
                  {relatedTicket.ticketNo} · {REPAIR_ISSUE_LABELS[relatedTicket.issueType]}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 space-y-5">
          <h2 className="section-title flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-primary-500" />
            故障信息
          </h2>

          <div>
            <label className="input-label">选择充电桩</label>
            <select
              className="input"
              value={formStationId}
              onChange={(e) => setFormStationId(e.target.value)}
            >
              <option value="">请选择充电桩</option>
              {stations
                .filter((s) => {
                  if (s.id === stationId) return true;
                  return s.status === "fault" || s.status === "maintenance";
                })
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.building} {s.location}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="input-label">故障分类</label>
            <div className="grid grid-cols-3 gap-2">
              {FAULT_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFaultCategory(cat.value)}
                  className={clsx(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                    faultCategory === cat.value
                      ? "bg-primary-50 text-primary-600 border-primary-200 ring-2 ring-primary-500/20"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">故障原因描述</label>
            <textarea
              className="input min-h-[100px] resize-y"
              placeholder="请详细描述故障现象和原因..."
              value={faultReason}
              onChange={(e) => setFaultReason(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label">维修前照片</label>
            <div className="grid grid-cols-4 gap-3">
              {beforePhotos.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto("before", idx)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {beforePhotos.length < 6 && (
                <button
                  type="button"
                  onClick={() => addPhoto("before")}
                  className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-primary-300 hover:text-primary-500 hover:bg-primary-50/50 transition-colors"
                >
                  <Camera className="w-5 h-5 mb-1" />
                  <span className="text-xs">添加</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="input-label">维修后照片</label>
            <div className="grid grid-cols-4 gap-3">
              {afterPhotos.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto("after", idx)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {afterPhotos.length < 6 && (
                <button
                  type="button"
                  onClick={() => addPhoto("after")}
                  className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-primary-300 hover:text-primary-500 hover:bg-primary-50/50 transition-colors"
                >
                  <Camera className="w-5 h-5 mb-1" />
                  <span className="text-xs">添加</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="section-title flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-warning-500" />
                更换配件
              </h2>
              <button
                type="button"
                onClick={addPart}
                className="btn-ghost !py-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                新增一行
              </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-500 text-xs">
                    <th className="px-3 py-2.5 font-medium">配件名称</th>
                    <th className="px-3 py-2.5 font-medium w-20">数量</th>
                    <th className="px-3 py-2.5 font-medium w-28">单价(¥)</th>
                    <th className="px-3 py-2.5 font-medium w-24">小计</th>
                    <th className="px-3 py-2.5 font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parts.map((part) => (
                    <tr key={part.id}>
                      <td className="px-2 py-1.5">
                        <input
                          type="text"
                          className="input !py-1.5 !text-sm border-0 !ring-0 focus:!ring-0 !px-2"
                          placeholder="配件名称"
                          value={part.name}
                          onChange={(e) => updatePart(part.id, "name", e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          min="1"
                          className="input !py-1.5 !text-sm border-0 !ring-0 focus:!ring-0 !px-2"
                          value={part.quantity}
                          onChange={(e) =>
                            updatePart(part.id, "quantity", parseInt(e.target.value) || 1)
                          }
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="input !py-1.5 !text-sm border-0 !ring-0 focus:!ring-0 !px-2"
                          value={part.unitPrice}
                          onChange={(e) =>
                            updatePart(part.id, "unitPrice", parseFloat(e.target.value) || 0)
                          }
                        />
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-700">
                        {formatMoney(part.quantity * part.unitPrice)}
                      </td>
                      <td className="px-2 py-1.5">
                        <button
                          type="button"
                          onClick={() => removePart(part.id)}
                          disabled={parts.length === 1}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-danger-500 hover:bg-danger-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Package className="w-4 h-4" />
                配件总计
              </div>
              <div className="font-display text-2xl font-bold text-danger-600">
                {formatMoney(totalCost)}
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-5">
            <h2 className="section-title flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-success-500" />
              维修信息
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  维修人
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="请输入维修人姓名"
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                />
              </div>
              <div>
                <label className="input-label flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  联系电话
                </label>
                <input
                  type="tel"
                  className="input"
                  placeholder="请输入联系电话"
                  value={technicianPhone}
                  onChange={(e) => setTechnicianPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="input-label">维修备注</label>
              <textarea
                className="input min-h-[80px] resize-y"
                placeholder="维修过程中的备注信息..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div>
              <label className="input-label">维修后充电桩状态</label>
              <div className="grid grid-cols-4 gap-2">
                {STATION_STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStationStatusAfter(status)}
                    className={clsx(
                      "px-2 py-2.5 rounded-lg text-sm font-medium transition-all border text-center",
                      stationStatusAfter === status
                        ? "bg-success-50 text-success-600 border-success-200 ring-2 ring-success-500/20"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    {STATION_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5 flex items-center justify-between bg-gradient-to-r from-slate-50/80 to-white sticky bottom-4">
        <div className="text-sm text-slate-500">
          填写完成后点击提交，维修记录将自动保存
        </div>
        <div className="flex items-center gap-3">
          <Link to="/maintenance/faults" className="btn-secondary">
            取消
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary !px-8"
          >
            <Save className="w-4 h-4" />
            {submitting ? "提交中..." : "提交维修记录"}
          </button>
        </div>
      </div>
    </div>
  );
}
