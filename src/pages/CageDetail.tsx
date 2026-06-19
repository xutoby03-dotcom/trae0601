import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import {
  SPECIES_LABEL,
  OPERATION_TYPE_LABEL,
  type OperationType,
  type PhotoItem,
} from "@/types";
import { CageStatusTag, TaskStatusTag } from "@/components/StatusTag";
import { Modal } from "@/components/Modal";
import { formatDateTime, formatDate } from "@/utils/date";
import {
  ArrowLeft,
  Trash2,
  CalendarDays,
  ClipboardList,
  FileText,
  AlertTriangle,
  Plus,
  Scale,
  Droplets,
  RefreshCw,
  ShieldAlert,
  Skull,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface LightboxPhoto extends PhotoItem {
  taskDate: string;
  cageNumber: string;
  healthObservation: string | null;
  taskId: string;
  photoIndex: number;
}

export default function CageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cages = useStore((s) => s.cages);
  const groups = useStore((s) => s.researchGroups);
  const opRecords = useStore((s) => s.operationRecords);
  const dailyTasks = useStore((s) => s.dailyTasks);
  const allAlerts = useStore((s) => s.alerts);
  const deleteCage = useStore((s) => s.deleteCage);
  const addOperationRecord = useStore((s) => s.addOperationRecord);
  const updateTask = useStore((s) => s.updateTask);

  const cage = useMemo(() => cages.find((c) => c.id === id), [cages, id]);
  const group = useMemo(() => groups.find((g) => g.id === cage?.researchGroupId), [groups, cage]);
  const records = useMemo(
    () => opRecords.filter((r) => r.cageId === id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [opRecords, id]
  );
  const tasks = useMemo(() => dailyTasks.filter((t) => t.cageId === id), [dailyTasks, id]);
  const alerts = useMemo(() => allAlerts.filter((a) => a.cageId === id), [allAlerts, id]);

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => (a.taskDate < b.taskDate ? 1 : -1)),
    [tasks]
  );

  const lightboxPhotos = useMemo<LightboxPhoto[]>(() => {
    const result: LightboxPhoto[] = [];
    sortedTasks.forEach((task) => {
      if (task.abnormalPhotos && task.abnormalPhotos.length > 0) {
        task.abnormalPhotos.forEach((photo, idx) => {
          result.push({
            url: photo.url,
            label: photo.label,
            taskDate: task.taskDate,
            cageNumber: cage?.cageNumber || "",
            healthObservation: task.healthObservation,
            taskId: task.id,
            photoIndex: idx,
          });
        });
      }
    });
    return result;
  }, [sortedTasks, cage]);

  const [tab, setTab] = useState<"info" | "tasks" | "records" | "alerts">("info");
  const [showRecord, setShowRecord] = useState<OperationType | null>(null);
  const [recordForm, setRecordForm] = useState({
    weight: "",
    fromCage: "",
    toCage: "",
    isolationReason: "",
    deathReason: "",
    notes: "",
    operator: "",
  });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const showLightbox = lightboxIndex !== null;
  const currentPhoto = showLightbox ? lightboxPhotos[lightboxIndex] : null;

  function openLightbox(globalIndex: number) {
    setLightboxIndex(globalIndex);
  }

  function closeLightbox() {
    setLightboxIndex(null);
  }

  function handleLabelChange(newLabel: string) {
    if (!currentPhoto) return;
    const task = dailyTasks.find((t) => t.id === currentPhoto.taskId);
    if (!task) return;
    const updatedPhotos = [...task.abnormalPhotos];
    updatedPhotos[currentPhoto.photoIndex] = {
      ...updatedPhotos[currentPhoto.photoIndex],
      label: newLabel,
    };
    updateTask(currentPhoto.taskId, { abnormalPhotos: updatedPhotos });
  }

  function goPrevPhoto() {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev === null ? null : prev === 0 ? lightboxPhotos.length - 1 : prev - 1
    );
  }

  function goNextPhoto() {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev === null ? null : prev === lightboxPhotos.length - 1 ? 0 : prev + 1
    );
  }

  useEffect(() => {
    if (!showLightbox) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrevPhoto();
      if (e.key === "ArrowRight") goNextPhoto();
    }
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLightbox, lightboxIndex]);

  if (!cage) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">档案不存在</p>
        <Link to="/cages" className="btn-primary mt-4">
          返回列表
        </Link>
      </div>
    );
  }

  function handleDelete() {
    if (confirm("确定删除该档案吗？所有关联记录将一并删除。")) {
      deleteCage(cage.id);
      navigate("/cages");
    }
  }

  function handleAddRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!showRecord) return;
    const base: any = {
      type: showRecord,
      cageId: cage.id,
      operator: recordForm.operator || "管理员",
      notes: recordForm.notes || undefined,
      createdAt: formatDate(new Date()),
    };
    if (showRecord === "weighing") base.weight = parseFloat(recordForm.weight);
    if (showRecord === "cage_change") {
      base.fromCage = recordForm.fromCage || cage.cageNumber;
      base.toCage = recordForm.toCage || cage.cageNumber;
    }
    if (showRecord === "water_change") base.waterChanged = true;
    if (showRecord === "isolation") base.isolationReason = recordForm.isolationReason;
    if (showRecord === "death") base.deathReason = recordForm.deathReason;
    addOperationRecord(base);
    setShowRecord(null);
    setRecordForm({ weight: "", fromCage: "", toCage: "", isolationReason: "", deathReason: "", notes: "", operator: "" });
  }

  const tabs = [
    { key: "info", label: "基本信息", icon: FileText },
    { key: "tasks", label: `饲喂记录 (${tasks.length})`, icon: ClipboardList },
    { key: "records", label: `操作记录 (${records.length})`, icon: RefreshCw },
    { key: "alerts", label: `异常告警 (${alerts.length})`, icon: AlertTriangle },
  ] as const;

  const recordActions: any = {
    weighing: { label: "称重", icon: Scale, color: "primary" },
    cage_change: { label: "换笼", icon: RefreshCw, color: "blue" },
    water_change: { label: "换水", icon: Droplets, color: "cyan" },
    isolation: { label: "隔离", icon: ShieldAlert, color: "warning" },
    death: { label: "死亡记录", icon: Skull, color: "danger" },
  };

  function getAlertTypeLabel(type: string) {
    switch (type) {
      case "overdue_feeding": return "逾期未喂";
      case "temperature_abnormal": return "温度超标";
      case "humidity_abnormal": return "湿度异常";
      case "abnormal_behavior": return "异常行为";
      default: return type;
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/cages" className="btn-ghost -ml-2">
            <ArrowLeft className="w-4 h-4" /> 返回
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <span className="font-mono">{cage.cageNumber}</span>
              <CageStatusTag status={cage.status} />
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {SPECIES_LABEL[cage.species]} · {group?.name}
            </p>
          </div>
        </div>
        <button onClick={handleDelete} className="btn-danger">
          <Trash2 className="w-4 h-4" /> 删除档案
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1 space-y-5">
          <div className="card overflow-hidden">
            <div className="aspect-square bg-slate-100">
              <img
                src={cage.photoUrl}
                alt={cage.cageNumber}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">数量</span>
              <span className="text-sm font-semibold text-slate-900 font-mono">
                {cage.animalCount} 只
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">负责人</span>
              <span className="text-sm font-semibold text-slate-900">
                {cage.responsiblePerson}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">创建日期</span>
              <span className="text-sm font-semibold text-slate-900 font-mono">
                {cage.createdAt}
              </span>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary-600" />
              快速记录
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(recordActions) as OperationType[]).map((type) => {
                const Icon = recordActions[type].icon;
                const color = recordActions[type].color;
                const textColorClass = `text-${color}-600`;
                return (
                  <button
                    key={type}
                    onClick={() => setShowRecord(type)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:border-primary-200 hover:bg-primary-50 transition-colors text-xs font-medium text-slate-700"
                  >
                    <Icon className={`w-4 h-4 ${textColorClass}`} />
                    {recordActions[type].label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <div className="card">
            <div className="flex border-b border-slate-100 px-5">
              {tabs.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                      tab === t.key
                        ? "border-primary-600 text-primary-700"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
            <div className="p-5">
              {tab === "info" && (
                <div className="space-y-4">
                  <InfoRow label="饲养条件" value={cage.housingConditions} />
                  <div>
                    <p className="text-sm text-slate-500 mb-1">所属课题组</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {group?.name}（{group?.leader}）
                    </p>
                  </div>
                </div>
              )}

              {tab === "tasks" && (
                <div className="space-y-3">
                  {sortedTasks.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">
                      暂无饲喂记录
                    </p>
                  ) : (
                    sortedTasks.map((task, taskIdx) => {
                      let startIdx = 0;
                      for (let i = 0; i < taskIdx; i++) {
                        startIdx += sortedTasks[i].abnormalPhotos?.length || 0;
                      }
                      return (
                        <div
                          key={task.id}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-medium text-slate-700 font-mono">
                                {task.taskDate}
                              </span>
                            </div>
                            <TaskStatusTag status={task.status} />
                          </div>
                          {task.status === "completed" && (
                            <div className="space-y-3 text-xs">
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <p className="text-slate-400">饲料量</p>
                                  <p className="font-medium text-slate-700">
                                    {task.feedAmount?.toFixed(1)} g
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-400">温度</p>
                                  <p className="font-medium text-slate-700">
                                    {task.temperature?.toFixed(1)}°C
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-400">湿度</p>
                                  <p className="font-medium text-slate-700">
                                    {task.humidity?.toFixed(0)}%
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="text-slate-400">健康观察</p>
                                <p className="font-medium text-slate-700">
                                  {task.healthObservation}
                                </p>
                              </div>
                              {task.abnormalPhotos && task.abnormalPhotos.length > 0 && (
                                <div>
                                  <p className="text-slate-400 mb-1.5 flex items-center gap-1">
                                    异常照片
                                    <span className="text-danger-500 font-medium">({task.abnormalPhotos.length}张)</span>
                                  </p>
                                  <div className="space-y-2">
                                    {task.abnormalPhotos.map((photo, idx) => (
                                      <div
                                        key={idx}
                                        className="flex gap-2.5 items-start"
                                      >
                                        <button
                                          type="button"
                                          onClick={() => openLightbox(startIdx + idx)}
                                          className="w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-slate-200 hover:border-primary-400 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary-300"
                                        >
                                          <img
                                            src={photo.url}
                                            alt={`异常照片 ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                          />
                                        </button>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                          <p className="text-[11px] text-slate-400 mb-0.5">
                                            图 {idx + 1}
                                          </p>
                                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                                            {photo.label || (
                                              <span className="text-slate-400 italic">
                                                点击查看大图并添加标注...
                                              </span>
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {tab === "records" && (
                <div className="space-y-3">
                  {records.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">
                      暂无操作记录
                    </p>
                  ) : (
                    records.map((r) => {
                      const Icon = recordActions[r.type].icon;
                      const color = recordActions[r.type].color;
                      const textColorClass = `text-${color}-600`;
                      const bgColorClass = `bg-${color}-50`;
                      return (
                        <div
                          key={r.id}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-3"
                        >
                          <div className={`w-9 h-9 rounded-lg ${bgColorClass} flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 ${textColorClass}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <p className="text-sm font-semibold text-slate-900">
                                {OPERATION_TYPE_LABEL[r.type]}
                              </p>
                              <span className="text-xs text-slate-400 font-mono">
                                {r.createdAt}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mb-1">
                              操作人：{r.operator}
                            </p>
                            {r.type === "weighing" && r.weight && (
                              <p className="text-sm text-slate-600">
                                体重：{r.weight} g
                              </p>
                            )}
                            {r.type === "isolation" && r.isolationReason && (
                              <p className="text-sm text-slate-600">
                                隔离原因：{r.isolationReason}
                              </p>
                            )}
                            {r.type === "death" && r.deathReason && (
                              <p className="text-sm text-slate-600">
                                死亡原因：{r.deathReason}
                              </p>
                            )}
                            {r.notes && (
                              <p className="text-sm text-slate-500 mt-1">备注：{r.notes}</p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {tab === "alerts" && (
                <div className="space-y-3">
                  {alerts.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">
                      暂无异常告警
                    </p>
                  ) : (
                    alerts.map((a) => (
                      <div
                        key={a.id}
                        className={`p-4 rounded-xl border ${
                          a.resolved
                            ? "bg-slate-50 border-slate-200"
                            : "bg-danger-50 border-danger-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-900">
                            {getAlertTypeLabel(a.type)}
                          </p>
                          <span className={`text-xs ${a.resolved ? "text-slate-400" : "text-danger-600"}`}>
                            {a.resolved ? "已处理" : "待处理"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {a.message}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {formatDateTime(a.createdAt)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={showRecord !== null}
        onClose={() => setShowRecord(null)}
        title={`新增${showRecord ? OPERATION_TYPE_LABEL[showRecord] : ""}记录`}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setShowRecord(null)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleAddRecord} className="btn-primary">
              确认提交
            </button>
          </div>
        }
      >
        <form onSubmit={handleAddRecord} className="space-y-4">
          {showRecord === "weighing" && (
            <div>
              <label className="label">体重 (g) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={recordForm.weight}
                onChange={(e) => setRecordForm({ ...recordForm, weight: e.target.value })}
                className="input"
                placeholder="输入平均体重"
              />
            </div>
          )}
          {showRecord === "cage_change" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">原笼盒编号</label>
                <input
                  value={recordForm.fromCage}
                  onChange={(e) => setRecordForm({ ...recordForm, fromCage: e.target.value })}
                  className="input font-mono"
                  placeholder={cage.cageNumber}
                />
              </div>
              <div>
                <label className="label">新笼盒编号</label>
                <input
                  value={recordForm.toCage}
                  onChange={(e) => setRecordForm({ ...recordForm, toCage: e.target.value })}
                  className="input font-mono"
                  placeholder={cage.cageNumber}
                />
              </div>
            </div>
          )}
          {showRecord === "isolation" && (
            <div>
              <label className="label">隔离原因 *</label>
              <textarea
                required
                value={recordForm.isolationReason}
                onChange={(e) => setRecordForm({ ...recordForm, isolationReason: e.target.value })}
                rows={3}
                className="input resize-none"
                placeholder="请描述隔离原因"
              />
            </div>
          )}
          {showRecord === "death" && (
            <div>
              <label className="label">死亡原因 *</label>
              <textarea
                required
                value={recordForm.deathReason}
                onChange={(e) => setRecordForm({ ...recordForm, deathReason: e.target.value })}
                rows={3}
                className="input resize-none"
                placeholder="请描述死亡原因"
              />
            </div>
          )}
          <div>
            <label className="label">操作人</label>
            <input
              value={recordForm.operator}
              onChange={(e) => setRecordForm({ ...recordForm, operator: e.target.value })}
              className="input"
              placeholder="默认为管理员"
            />
          </div>
          <div>
            <label className="label">备注</label>
            <textarea
              value={recordForm.notes}
              onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
              rows={2}
              className="input resize-none"
            />
          </div>
        </form>
      </Modal>

      {showLightbox && currentPhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-sm animate-fade-in"
            onClick={closeLightbox}
          />
          <div className="relative z-10 max-w-[90vw] max-h-[95vh] flex flex-col animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 bg-slate-900/60 backdrop-blur rounded-t-xl text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-primary-600/90 rounded-md text-xs font-mono font-medium">
                    {currentPhoto.cageNumber}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-200 text-sm">
                    <CalendarDays className="w-3.5 h-3.5" />
                    拍摄日期：{currentPhoto.taskDate}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400 font-mono">
                    {(lightboxIndex ?? 0) + 1} / {lightboxPhotos.length}
                  </span>
                  <button
                    type="button"
                    onClick={closeLightbox}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                    aria-label="关闭"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-2 p-2.5 bg-white/5 rounded-lg border border-white/10">
                <p className="text-[11px] text-slate-400 mb-0.5 flex items-center gap-1">
                  <ClipboardList className="w-3 h-3" />
                  当日健康观察
                </p>
                <p className="text-sm text-slate-100 leading-relaxed">
                  {currentPhoto.healthObservation || "未填写健康观察"}
                </p>
              </div>
            </div>
            <div className="relative flex items-center justify-center flex-1 bg-black">
              <img
                src={currentPhoto.url}
                alt={`${currentPhoto.cageNumber} 异常照片`}
                className="max-w-[90vw] max-h-[calc(95vh-280px)] object-contain bg-black"
              />
              {lightboxPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm shadow-lg"
                    aria-label="上一张"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={goNextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm shadow-lg"
                    aria-label="下一张"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
            <div className="px-4 py-3 bg-slate-900/60 backdrop-blur space-y-2">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  照片标注（复核意见）
                </label>
                <input
                  type="text"
                  value={currentPhoto.label || ""}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white/10 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/50"
                  placeholder="请输入这张照片的观察说明或复核意见..."
                />
              </div>
              {lightboxPhotos.length > 1 && (
                <p className="text-[10px] text-slate-500 text-center">
                  键盘快捷键：← 上一张 → 下一张 · ESC 关闭
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
