import { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Building2,
  MapPin,
  Plug,
  Gauge,
  CalendarDays,
  CreditCard,
  Image,
  Activity,
  Hash,
} from "lucide-react";
import { useStationStore } from "../../store/stationStore";
import { StationStatusBadge } from "../../components/ui/StatusBadge";
import { STATION_STATUS_LABELS } from "../../types";
import type { StationStatus, ChargingStation } from "../../types";
import { clsx } from "clsx";

const BUILDINGS = ["1号楼", "2号楼", "3号楼", "4号楼", "5号楼", "6号楼"];
const LOCATIONS = [
  "地下车库B1层",
  "地下车库B2层",
  "地面停车区东侧",
  "地面停车区西侧",
  "单元门口旁",
  "小区入口旁",
  "物业楼前",
];
const FEE_RULES = [
  "1.2元/小时，每日封顶10元",
  "1.5元/小时，每日封顶12元",
  "1.8元/小时，每日封顶14元",
  "2.0元/小时，每日封顶15元",
  "1.0元/小时，每日封顶8元",
];
const SOCKET_OPTIONS = [2, 4, 6, 8];
const POWER_OPTIONS = [3.5, 7, 11, 22];

const STATION_PHOTOS = [
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20electric%20vehicle%20charging%20station%20in%20residential%20parking%20lot%20with%20blue%20LED%20lights%20clean%20design&image_size=landscape_4_3",
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=outdoor%20community%20ebike%20charging%20station%20multiple%20outlets%20green%20energy%20concept&image_size=landscape_4_3",
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=underground%20parking%20garage%20EV%20charger%20row%20with%20illuminated%20screen%20modern%20facility&image_size=landscape_4_3",
];

interface FormData {
  code: string;
  building: string;
  location: string;
  socketCount: number;
  power: number;
  installDate: string;
  feeRule: string;
  feePerHour: number;
  photo: string;
  status: StationStatus;
}

const defaultFormData: FormData = {
  code: "",
  building: "1号楼",
  location: LOCATIONS[0],
  socketCount: 4,
  power: 7,
  installDate: new Date().toISOString().split("T")[0],
  feeRule: FEE_RULES[0],
  feePerHour: 1.5,
  photo: STATION_PHOTOS[0],
  status: "online",
};

export default function StationForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const stations = useStationStore((s: any) => s.stations);
  const addStation = useStationStore((s) => s.addStation);
  const updateStation = useStationStore((s) => s.updateStation);

  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const editingStation = useMemo<ChargingStation | undefined>(() => {
    return id ? stations.find((s: any) => s.id === id) : undefined;
  }, [id, stations]);

  useEffect(() => {
    if (isEdit && editingStation) {
      setFormData({
        code: editingStation.code,
        building: editingStation.building,
        location: editingStation.location.replace(`${editingStation.building} `, ""),
        socketCount: editingStation.socketCount,
        power: editingStation.power,
        installDate: editingStation.installDate.split("T")[0],
        feeRule: editingStation.feeRule,
        feePerHour: editingStation.feePerHour,
        photo: editingStation.photo,
        status: editingStation.status,
      });
    }
  }, [isEdit, editingStation]);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!formData.code.trim()) {
      nextErrors.code = "请输入桩位编号";
    } else if (formData.code.length < 4) {
      nextErrors.code = "编号至少4个字符";
    }
    if (!formData.building) {
      nextErrors.building = "请选择楼栋";
    }
    if (!formData.location.trim()) {
      nextErrors.location = "请输入具体位置";
    }
    if (formData.socketCount <= 0) {
      nextErrors.socketCount = "插座数量必须大于0";
    }
    if (formData.power <= 0) {
      nextErrors.power = "功率必须大于0";
    }
    if (!formData.installDate) {
      nextErrors.installDate = "请选择安装日期";
    }
    if (!formData.feeRule.trim()) {
      nextErrors.feeRule = "请输入收费规则";
    }
    if (formData.feePerHour <= 0) {
      nextErrors.feePerHour = "每小时费用必须大于0";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    const payload = {
      code: formData.code.trim().toUpperCase(),
      building: formData.building,
      location: `${formData.building} ${formData.location.trim()}`,
      socketCount: Number(formData.socketCount),
      power: Number(formData.power),
      installDate: new Date(formData.installDate).toISOString(),
      feeRule: formData.feeRule.trim(),
      feePerHour: Number(formData.feePerHour),
      photo: formData.photo,
      status: formData.status,
      lastInspectionAt: isEdit && editingStation ? editingStation.lastInspectionAt : null,
      usageRate: isEdit && editingStation ? editingStation.usageRate : undefined,
    };

    await new Promise((r) => setTimeout(r, 300));

    if (isEdit && id) {
      updateStation(id, payload);
    } else {
      addStation(payload);
    }

    setSubmitting(false);
    navigate("/stations");
  };

  if (isEdit && !editingStation) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate("/stations")} className="btn-ghost">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>
        <div className="card p-16 text-center">
          <Activity className="w-12 h-12 mx-auto text-danger-400 mb-3" />
          <div className="text-slate-700 font-medium mb-1">桩位不存在</div>
          <div className="text-sm text-slate-400 mb-4">无法找到要编辑的桩位</div>
          <Link to="/stations" className="btn-primary">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/stations")}
            className="btn-ghost"
          >
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </button>
          <div>
            <h1 className="page-title">
              {isEdit ? "编辑桩位档案" : "新增桩位档案"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {isEdit ? "修改充电桩设备信息" : "录入新的充电桩设备信息"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/stations")}
            className="btn-secondary"
          >
            <X className="w-4 h-4" />
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary min-w-[100px]"
          >
            <Save className="w-4 h-4" />
            {submitting ? "保存中..." : isEdit ? "保存修改" : "创建桩位"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Image className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">设备照片</span>
            </div>
            <div className="aspect-[4/3] bg-slate-50 rounded-xl overflow-hidden border border-slate-200 mb-4">
              <img
                src={formData.photo}
                alt="预览"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {STATION_PHOTOS.map((photo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => updateField("photo", photo)}
                  className={clsx(
                    "aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all",
                    formData.photo === photo
                      ? "border-primary-500 ring-2 ring-primary-100"
                      : "border-slate-200 hover:border-primary-200"
                  )}
                >
                  <img
                    src={photo}
                    alt={`选项${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            {isEdit && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">当前状态</span>
                </div>
                <StationStatusBadge status={formData.status} />
              </div>
            )}
          </div>

          {isEdit && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">设备状态</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(STATION_STATUS_LABELS) as StationStatus[]).map(
                  (status) => {
                    const isActive = formData.status === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => updateField("status", status)}
                        className={clsx(
                          "p-2.5 rounded-lg border text-center transition-all",
                          isActive
                            ? "border-primary-300 bg-primary-50 ring-2 ring-primary-100"
                            : "border-slate-200 hover:border-primary-200 hover:bg-slate-50"
                        )}
                      >
                        <StationStatusBadge status={status} />
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-5">
              <Hash className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">基础信息</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                icon={Hash}
                label="桩位编号"
                required
                error={errors.code}
                hint="示例：CDZ-101"
              >
                <input
                  type="text"
                  className={clsx("input", errors.code && "!border-danger-300 !ring-danger-100")}
                  placeholder="请输入桩位编号"
                  value={formData.code}
                  onChange={(e) => updateField("code", e.target.value)}
                  disabled={isEdit}
                />
              </FormField>

              <FormField
                icon={Building2}
                label="所属楼栋"
                required
                error={errors.building}
              >
                <select
                  className={clsx("input", errors.building && "!border-danger-300 !ring-danger-100")}
                  value={formData.building}
                  onChange={(e) => updateField("building", e.target.value)}
                >
                  {BUILDINGS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                icon={MapPin}
                label="具体位置"
                required
                error={errors.location}
                className="md:col-span-2"
              >
                <select
                  className={clsx("input", errors.location && "!border-danger-300 !ring-danger-100")}
                  value={formData.location}
                  onChange={(e) => updateField("location", e.target.value)}
                >
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-5">
              <Gauge className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">设备参数</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                icon={Plug}
                label="插座数量"
                required
                error={errors.socketCount}
              >
                <div className="grid grid-cols-4 gap-2">
                  {SOCKET_OPTIONS.map((n) => {
                    const isActive = formData.socketCount === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => updateField("socketCount", n)}
                        className={clsx(
                          "py-2.5 rounded-lg border text-sm font-medium transition-all",
                          isActive
                            ? "border-primary-500 bg-primary-50 text-primary-600 ring-2 ring-primary-100"
                            : "border-slate-200 text-slate-600 hover:border-primary-200 hover:bg-slate-50"
                        )}
                      >
                        {n} 个
                      </button>
                    );
                  })}
                </div>
              </FormField>

              <FormField
                icon={Gauge}
                label="额定功率"
                required
                error={errors.power}
              >
                <div className="grid grid-cols-4 gap-2">
                  {POWER_OPTIONS.map((p) => {
                    const isActive = formData.power === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => updateField("power", p)}
                        className={clsx(
                          "py-2.5 rounded-lg border text-sm font-medium transition-all",
                          isActive
                            ? "border-primary-500 bg-primary-50 text-primary-600 ring-2 ring-primary-100"
                            : "border-slate-200 text-slate-600 hover:border-primary-200 hover:bg-slate-50"
                        )}
                      >
                        {p} kW
                      </button>
                    );
                  })}
                </div>
              </FormField>

              <FormField
                icon={CalendarDays}
                label="安装日期"
                required
                error={errors.installDate}
              >
                <input
                  type="date"
                  className={clsx("input", errors.installDate && "!border-danger-300 !ring-danger-100")}
                  value={formData.installDate}
                  onChange={(e) => updateField("installDate", e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </FormField>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">收费设置</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                icon={CreditCard}
                label="收费规则"
                required
                error={errors.feeRule}
              >
                <select
                  className={clsx("input", errors.feeRule && "!border-danger-300 !ring-danger-100")}
                  value={formData.feeRule}
                  onChange={(e) => {
                    updateField("feeRule", e.target.value);
                    const match = e.target.value.match(/(\d+\.?\d*)元\/小时/);
                    if (match) {
                      updateField("feePerHour", parseFloat(match[1]));
                    }
                  }}
                >
                  {FEE_RULES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                icon={CreditCard}
                label="每小时费用 (元)"
                required
                error={errors.feePerHour}
              >
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className={clsx("input", errors.feePerHour && "!border-danger-300 !ring-danger-100")}
                  placeholder="请输入每小时费用"
                  value={formData.feePerHour}
                  onChange={(e) => updateField("feePerHour", parseFloat(e.target.value) || 0)}
                />
              </FormField>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/stations")}
              className="btn-secondary min-w-[100px]"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary min-w-[140px]"
            >
              <Save className="w-4 h-4" />
              {submitting ? "保存中..." : isEdit ? "保存修改" : "创建桩位"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function FormField({
  icon: Icon,
  label,
  required,
  error,
  children,
  className,
  hint,
}: {
  icon: typeof Hash;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <div className={className}>
      <label className="input-label flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        {label}
        {required && <span className="text-danger-500">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-slate-400 mt-1">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-danger-500 mt-1 flex items-center gap-1">
          <X className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
