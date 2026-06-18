import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquareWarning,
  Zap,
  Upload,
  X,
  MapPin,
  User,
  Phone,
  Building2,
  Send,
  CheckCircle2,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { useRepairStore } from "../../store/repairStore";
import { useStationStore } from "../../store/stationStore";
import { REPAIR_ISSUE_LABELS, type RepairIssueType } from "../../types";
import { clsx } from "clsx";

const issueIcons: Record<RepairIssueType, typeof Zap> = {
  no_charge: Zap,
  fee_error: AlertCircle,
  plug_hot: AlertCircle,
  qrcode_invalid: ImageIcon,
  other: MessageSquareWarning,
};

const issueDescriptions: Record<RepairIssueType, string> = {
  no_charge: "充电桩无法正常充电，连接后无响应",
  fee_error: "扣费金额异常、重复扣费或未使用却扣费",
  plug_hot: "充电时插头或线缆异常发热，有安全隐患",
  qrcode_invalid: "充电桩二维码无法识别或已损坏",
  other: "其他未列出的故障或问题",
};

export default function Submit() {
  const navigate = useNavigate();
  const stations = useStationStore((s) => s.stations);
  const submitRepair = useRepairStore((s) => s.submitRepair);

  const [issueType, setIssueType] = useState<RepairIssueType | null>(null);
  const [stationId, setStationId] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reporterBuilding, setReporterBuilding] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [ticketNo, setTicketNo] = useState("");

  const buildings = Array.from(new Set(stations.map((s) => s.building))).sort();
  const filteredStations = reporterBuilding
    ? stations.filter((s) => s.building === reporterBuilding)
    : stations;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!issueType) newErrors.issueType = "请选择问题类型";
    if (!stationId) newErrors.stationId = "请选择充电桩";
    if (!description.trim()) newErrors.description = "请描述故障情况";
    else if (description.trim().length < 10) newErrors.description = "描述至少10个字符";
    if (!reporterName.trim()) newErrors.reporterName = "请填写联系人姓名";
    if (!reporterPhone.trim()) newErrors.reporterPhone = "请填写联系电话";
    else if (!/^1[3-9]\d{9}$/.test(reporterPhone)) newErrors.reporterPhone = "请输入有效的手机号码";
    if (!reporterBuilding) newErrors.reporterBuilding = "请选择所在楼栋";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoUpload = () => {
    const newPhoto = `https://picsum.photos/400/300?random=${Date.now()}`;
    setPhotos([...photos, newPhoto]);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const ticket = submitRepair({
      stationId,
      issueType: issueType!,
      description: description.trim(),
      photos,
      reporterName: reporterName.trim(),
      reporterPhone: reporterPhone.trim(),
      reporterBuilding,
    });

    setTicketNo(ticket.ticketNo);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-10 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success-100 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-success-500" />
          </div>
          <h1 className="page-title mb-2">提交成功</h1>
          <p className="text-slate-500 mb-6">
            您的报修工单已提交，我们将尽快安排处理
          </p>
          <div className="bg-slate-50 rounded-xl p-5 mb-8 inline-block">
            <div className="text-sm text-slate-500 mb-1">工单编号</div>
            <div className="text-2xl font-bold text-primary-600 font-display tracking-wider">
              {ticketNo}
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate("/repairs/tickets")}
              className="btn-secondary"
            >
              查看工单列表
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setIssueType(null);
                setStationId("");
                setDescription("");
                setPhotos([]);
                setReporterName("");
                setReporterPhone("");
                setReporterBuilding("");
                setErrors({});
              }}
              className="btn-primary"
            >
              继续报修
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-3">
          <MessageSquareWarning className="w-7 h-7 text-danger-500" />
          居民报修
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          请填写以下信息，我们将在第一时间安排维修人员处理
        </p>
      </div>

      <div className="card p-6 space-y-7">
        <div>
          <label className="input-label flex items-center gap-2">
            问题类型 <span className="text-danger-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(Object.keys(REPAIR_ISSUE_LABELS) as RepairIssueType[]).map(
              (type) => {
                const Icon = issueIcons[type];
                const selected = issueType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setIssueType(type)}
                    className={clsx(
                      "p-4 rounded-xl border-2 transition-all duration-200 text-left group",
                      selected
                        ? "border-primary-500 bg-primary-50/50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white",
                      errors.issueType && !selected && "border-danger-300"
                    )}
                  >
                    <div
                      className={clsx(
                        "w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 transition-colors",
                        selected
                          ? "bg-primary-500 text-white"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div
                      className={clsx(
                        "text-sm font-semibold mb-0.5",
                        selected ? "text-primary-700" : "text-slate-700"
                      )}
                    >
                      {REPAIR_ISSUE_LABELS[type]}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                      {issueDescriptions[type]}
                    </div>
                  </button>
                );
              }
            )}
          </div>
          {errors.issueType && (
            <p className="text-danger-500 text-xs mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.issueType}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="input-label flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              所在楼栋 <span className="text-danger-500">*</span>
            </label>
            <select
              value={reporterBuilding}
              onChange={(e) => {
                setReporterBuilding(e.target.value);
                setStationId("");
              }}
              className={clsx("input", errors.reporterBuilding && "border-danger-400")}
            >
              <option value="">请选择楼栋</option>
              {buildings.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            {errors.reporterBuilding && (
              <p className="text-danger-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.reporterBuilding}
              </p>
            )}
          </div>

          <div>
            <label className="input-label flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              充电桩 <span className="text-danger-500">*</span>
            </label>
            <select
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
              className={clsx("input", errors.stationId && "border-danger-400")}
              disabled={!reporterBuilding}
            >
              <option value="">
                {reporterBuilding ? "请选择充电桩" : "请先选择楼栋"}
              </option>
              {filteredStations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.location}
                </option>
              ))}
            </select>
            {errors.stationId && (
              <p className="text-danger-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.stationId}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="input-label">
            问题描述 <span className="text-danger-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="请详细描述故障现象、发生时间、使用场景等信息，便于维修人员快速定位问题..."
            rows={4}
            className={clsx("input resize-none", errors.description && "border-danger-400")}
          />
          <div className="flex items-center justify-between mt-1.5">
            {errors.description ? (
              <p className="text-danger-500 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.description}
              </p>
            ) : (
              <span />
            )}
            <span
              className={clsx(
                "text-xs",
                description.length < 10 ? "text-slate-400" : "text-slate-500"
              )}
            >
              {description.length}/500
            </span>
          </div>
        </div>

        <div>
          <label className="input-label">现场照片（可选）</label>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group"
              >
                <img
                  src={photo}
                  alt={`现场照片${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {photos.length < 6 && (
              <button
                type="button"
                onClick={handlePhotoUpload}
                className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-primary-400 hover:bg-primary-50/30 flex flex-col items-center justify-center gap-1.5 transition-all text-slate-400 hover:text-primary-500"
              >
                <Upload className="w-5 h-5" />
                <span className="text-xs">上传照片</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            最多上传6张照片，支持 JPG、PNG 格式
          </p>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary-500" />
            联系人信息
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="input-label flex items-center gap-2">
                <User className="w-4 h-4" />
                姓名 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="请输入您的姓名"
                className={clsx("input", errors.reporterName && "border-danger-400")}
              />
              {errors.reporterName && (
                <p className="text-danger-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.reporterName}
                </p>
              )}
            </div>
            <div>
              <label className="input-label flex items-center gap-2">
                <Phone className="w-4 h-4" />
                联系电话 <span className="text-danger-500">*</span>
              </label>
              <input
                type="tel"
                value={reporterPhone}
                onChange={(e) => setReporterPhone(e.target.value)}
                placeholder="请输入您的手机号码"
                maxLength={11}
                className={clsx("input", errors.reporterPhone && "border-danger-400")}
              />
              {errors.reporterPhone && (
                <p className="text-danger-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.reporterPhone}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary min-w-32"
          >
            <Send className="w-4 h-4" />
            提交报修
          </button>
        </div>
      </div>
    </div>
  );
}
