import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Camera,
  Trash2,
  Send,
  AlertTriangle,
  MapPin,
  Building2,
  User,
  ClipboardCheck,
} from "lucide-react";
import { useInspectionStore } from "../../store/inspectionStore";
import { useStationStore } from "../../store/stationStore";
import {
  INSPECTION_ITEM_LABELS,
  type InspectionItem,
  type ItemStatus,
} from "../../types";
import { formatDate } from "../../utils/formatters";
import { clsx } from "clsx";

const INSPECTION_ITEMS: InspectionItem[] = [
  "screen",
  "socket",
  "leakage",
  "cable",
  "qrcode",
  "fireSpace",
  "clutter",
];

const ITEM_ICONS: Record<InspectionItem, string> = {
  screen: "🖥️",
  socket: "🔌",
  leakage: "🛡️",
  cable: "🔗",
  qrcode: "📱",
  fireSpace: "🚒",
  clutter: "📦",
};

const STATUS_CONFIG: Record<
  ItemStatus,
  {
    label: string;
    className: string;
    activeClassName: string;
    icon: typeof CheckCircle2;
  }
> = {
  normal: {
    label: "正常",
    className: "text-slate-600 border-slate-200 bg-white",
    activeClassName: "!bg-success-500 !text-white !border-success-500 shadow-success-glow",
    icon: CheckCircle2,
  },
  abnormal: {
    label: "异常",
    className: "text-slate-600 border-slate-200 bg-white",
    activeClassName: "!bg-danger-500 !text-white !border-danger-500 shadow-danger-glow",
    icon: XCircle,
  },
  skipped: {
    label: "跳过",
    className: "text-slate-600 border-slate-200 bg-white",
    activeClassName: "!bg-slate-400 !text-white !border-slate-400",
    icon: MinusCircle,
  },
};

export default function InspectionExecute() {
  const { id: taskId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const task = useInspectionStore((s) => s.getTaskById(taskId || ""));
  const currentInspection = useInspectionStore((s) => s.currentInspection);
  const setCurrentInspection = useInspectionStore(
    (s) => s.setCurrentInspection
  );
  const updateInspectionItem = useInspectionStore(
    (s) => s.updateInspectionItem
  );
  const addAbnormalPhoto = useInspectionStore((s) => s.addAbnormalPhoto);
  const updateInspectionRemarks = useInspectionStore(
    (s) => s.updateInspectionRemarks
  );
  const submitInspection = useInspectionStore((s) => s.submitInspection);
  const completeTaskStation = useInspectionStore(
    (s) => s.completeTaskStation
  );
  const updateLastInspection = useStationStore(
    (s) => s.updateLastInspection
  );
  const updateStationStatus = useStationStore(
    (s) => s.updateStationStatus
  );
  const stations = useStationStore((s) => s.stations);

  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const taskStations = useMemo(() => {
    if (!task) return [];
    return task.stationIds
      .map((sid) => useStationStore.getState().getStationById(sid))
      .filter(Boolean) as typeof stations;
  }, [task]);

  const currentStation = taskStations[currentStationIndex];

  useEffect(() => {
    if (task && currentStation) {
      setCurrentInspection(
        currentStation.id,
        task.id,
        task.inspector
      );
      setRemarks("");
    }
  }, [task, currentStation, setCurrentInspection]);

  const handleStatusChange = (item: InspectionItem, status: ItemStatus) => {
    updateInspectionItem(item, status);
  };

  const handlePhotoUpload = (item: InspectionItem) => {
    const fakePhoto = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=defective%20charging%20station%20${item}%20damage%20close-up&image_size=square`;
    addAbnormalPhoto(item, fakePhoto);
  };

  const handleRemovePhoto = (item: InspectionItem, idx: number) => {
    const current = useInspectionStore.getState().currentInspection;
    if (!current) return;
    const photos = current.abnormalPhotos[item] || [];
    const newPhotos = photos.filter((_, i) => i !== idx);
    useInspectionStore.setState({
      currentInspection: {
        ...current,
        abnormalPhotos: {
          ...current.abnormalPhotos,
          [item]: newPhotos,
        },
      },
    });
  };

  const canSubmit = useMemo(() => {
    if (!currentInspection) return false;
    const values = Object.values(currentInspection.items);
    return values.every((v) => v !== undefined);
  }, [currentInspection]);

  const abnormalItems = useMemo(() => {
    if (!currentInspection) return [] as InspectionItem[];
    return (Object.keys(currentInspection.items) as InspectionItem[]).filter(
      (k) => currentInspection.items[k] === "abnormal"
    );
  }, [currentInspection]);

  const completedCount = useMemo(() => {
    if (!currentInspection) return 0;
    return Object.values(currentInspection.items).filter(
      (v) => v === "normal" || v === "abnormal"
    ).length;
  }, [currentInspection]);

  const progress = (completedCount / INSPECTION_ITEMS.length) * 100;

  const handleSubmit = () => {
    if (!canSubmit || !currentInspection || !task) return;
    const hasAbnormal = abnormalItems.length > 0;
    updateInspectionRemarks(remarks);
    submitInspection();
    completeTaskStation(task.id);
    if (currentStation) {
      updateLastInspection(currentStation.id);
      if (hasAbnormal) {
        updateStationStatus(currentStation.id, "fault");
        useStationStore.getState().computeStats();
      }
    }

    if (currentStationIndex < taskStations.length - 1) {
      setCurrentStationIndex((prev) => prev + 1);
      setRemarks("");
    } else {
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/inspections/tasks");
      }, 2000);
    }
  };

  if (!task) {
    return (
      <div className="space-y-6">
        <Link to="/inspections/tasks" className="btn-ghost w-fit !px-0">
          <ArrowLeft className="w-4 h-4" /> 返回任务列表
        </Link>
        <div className="card p-16 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-warning-400 mb-4" />
          <div className="text-lg font-semibold text-slate-800 mb-2">
            任务不存在
          </div>
          <div className="text-sm text-slate-500">
            找不到对应的巡检任务，请返回列表重新选择
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="card p-12 text-center max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-success-100 flex items-center justify-center mb-6 animate-bounce-soft">
            <CheckCircle2 className="w-10 h-10 text-success-500" />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-800 mb-2">
            巡检完成！
          </h2>
          <p className="text-slate-500 mb-6">
            本次巡检任务已全部提交，正在返回任务列表...
          </p>
          <Link to="/inspections/tasks" className="btn-primary">
            立即返回
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/inspections/tasks"
            className="btn-ghost !px-0 text-primary-600 hover:text-primary-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> 返回任务列表
          </Link>
          <h1 className="page-title">{task.name}</h1>
          <p className="text-slate-500 text-sm mt-1">
            逐项检查并记录充电桩状态
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-500 mb-1">任务进度</div>
            <div className="text-sm font-semibold text-slate-700">
              {currentStationIndex + 1} / {taskStations.length} 桩位
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary-500" />
            当前桩位巡检
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCurrentStationIndex((prev) => Math.max(0, prev - 1))
              }
              disabled={currentStationIndex === 0}
              className="btn-secondary !p-2 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-2 rounded-lg bg-slate-50 text-sm font-medium text-slate-700 min-w-[100px] text-center">
              第 {currentStationIndex + 1} 个
            </div>
            <button
              onClick={() =>
                setCurrentStationIndex((prev) =>
                  Math.min(taskStations.length - 1, prev + 1)
                )
              }
              disabled={currentStationIndex === taskStations.length - 1}
              className="btn-secondary !p-2 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {currentStation && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-gradient-to-br from-primary-50/50 to-slate-50 border border-primary-100/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-xs text-slate-500">桩位编号</div>
                <div className="text-sm font-semibold text-slate-800">
                  {currentStation.code}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-100 text-success-600 flex items-center justify-center shrink-0">
                <Building2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-xs text-slate-500">楼栋位置</div>
                <div className="text-sm font-semibold text-slate-800">
                  {currentStation.building}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning-100 text-warning-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-xs text-slate-500">具体位置</div>
                <div className="text-sm font-semibold text-slate-800">
                  {currentStation.location.split(" ").pop()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <User className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-xs text-slate-500">巡检员</div>
                <div className="text-sm font-semibold text-slate-800">
                  {task.inspector}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">检查进度</span>
            <span className="text-xs font-semibold text-primary-600">
              {completedCount} / {INSPECTION_ITEMS.length} 项
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {INSPECTION_ITEMS.map((item, idx) => {
          const label = INSPECTION_ITEM_LABELS[item];
          const currentStatus = currentInspection?.items[item];
          const photos = currentInspection?.abnormalPhotos[item] || [];
          const isAbnormal = currentStatus === "abnormal";

          return (
            <div
              key={item}
              className={clsx(
                "card p-5 transition-all",
                isAbnormal && "border-danger-200 bg-danger-50/30"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={clsx(
                      "w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0",
                      currentStatus === "normal" &&
                        "bg-success-50 border border-success-100",
                      currentStatus === "abnormal" &&
                        "bg-danger-50 border border-danger-100",
                      currentStatus === "skipped" &&
                        "bg-slate-50 border border-slate-100",
                      !currentStatus &&
                        "bg-slate-100/50 border border-slate-100"
                    )}
                  >
                    {ITEM_ICONS[item]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">
                        {idx + 1}. {label}
                      </span>
                      {isAbnormal && (
                        <span className="badge-danger !py-0 !text-[10px]">
                          <AlertTriangle className="w-3 h-3" />
                          需关注
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      检查{item === "screen" && "显示屏是否完好、显示正常"}
                      {item === "socket" && "插座是否松动、烧蚀、接触不良"}
                      {item === "leakage" && "漏电保护器是否正常工作"}
                      {item === "cable" && "线缆外皮是否破损、裸露"}
                      {item === "qrcode" && "二维码是否清晰、可扫描"}
                      {item === "fireSpace" && "消防通道是否保持畅通"}
                      {item === "clutter" && "周边是否堆放易燃杂物"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {(Object.keys(STATUS_CONFIG) as ItemStatus[]).map((status) => {
                  const config = STATUS_CONFIG[status];
                  const Icon = config.icon;
                  const isActive = currentStatus === status;
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(item, status)}
                      className={clsx(
                        "flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition-all",
                        config.className,
                        isActive && config.activeClassName,
                        !isActive && "hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {config.label}
                    </button>
                  );
                })}
              </div>

              {isAbnormal && (
                <div className="pt-4 border-t border-danger-100/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-danger-700 flex items-center gap-1.5">
                      <Camera className="w-4 h-4" />
                      异常照片凭证
                    </div>
                    <button
                      onClick={() => handlePhotoUpload(item)}
                      className="btn-danger !py-1.5 !px-3 !text-xs"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      拍照上传
                    </button>
                  </div>
                  {photos.length === 0 ? (
                    <div className="border-2 border-dashed border-danger-200 rounded-xl p-6 text-center">
                      <Camera className="w-8 h-8 mx-auto text-danger-300 mb-2" />
                      <div className="text-xs text-danger-500">
                        请上传至少1张异常情况照片
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {photos.map((photo, pIdx) => (
                        <div
                          key={pIdx}
                          className="relative group aspect-square rounded-lg overflow-hidden border border-danger-100"
                        >
                          <img
                            src={photo}
                            alt={`异常照片 ${pIdx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleRemovePhoto(item, pIdx)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handlePhotoUpload(item)}
                        className="aspect-square rounded-lg border-2 border-dashed border-danger-200 bg-danger-50/50 flex flex-col items-center justify-center text-danger-500 hover:bg-danger-50 hover:border-danger-300 transition-colors"
                      >
                        <Camera className="w-5 h-5 mb-1" />
                        <span className="text-[10px]">添加</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="card p-5">
        <h2 className="section-title mb-4">巡检备注</h2>
        <textarea
          rows={3}
          className="input resize-none"
          placeholder="如有特殊情况或补充说明，请在此记录..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>

      {abnormalItems.length > 0 && (
        <div className="card p-5 bg-danger-50/50 border-danger-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-danger-100 text-danger-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-danger-700 mb-1">
                本次巡检发现 {abnormalItems.length} 项异常
              </div>
              <div className="flex flex-wrap gap-2">
                {abnormalItems.map((item) => (
                  <span
                    key={item}
                    className="text-xs px-2.5 py-1 rounded-full bg-white text-danger-600 border border-danger-200"
                  >
                    {INSPECTION_ITEM_LABELS[item]}
                  </span>
                ))}
              </div>
              <div className="text-xs text-danger-600/70 mt-2">
                提交后将自动生成异常告警通知相关人员处理
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-slate-200 p-4 shadow-2xl z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="text-sm">
            <span className="text-slate-500">巡检日期：</span>
            <span className="font-medium text-slate-700">
              {formatDate(new Date().toISOString())}
            </span>
            <span className="mx-3 text-slate-300">|</span>
            <span className="text-slate-500">巡检员：</span>
            <span className="font-medium text-slate-700">{task.inspector}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setCurrentStationIndex((prev) => Math.max(0, prev - 1))
              }
              disabled={currentStationIndex === 0}
              className="btn-secondary disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              上一个
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={clsx(
                "btn-primary !px-6 min-w-[140px]",
                currentStationIndex === taskStations.length - 1 &&
                  "!bg-gradient-to-r from-success-500 to-success-600"
              )}
            >
              <Send className="w-4 h-4" />
              {currentStationIndex === taskStations.length - 1
                ? "完成所有巡检"
                : "提交并下一个"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
