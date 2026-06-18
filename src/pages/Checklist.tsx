import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Clock,
  History,
  ChevronRight,
  AlertTriangle,
  Wrench,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { CHECK_ITEMS, type CheckItem } from "@/types";
import type { CheckRecord } from "@/types";
import CheckBoxItem from "@/components/CheckBoxItem";
import { formatDateTime, cn } from "@/utils/helpers";

const CRITICAL_ITEMS = ["footPad", "antiSlipCover", "brakeLine"];

export default function Checklist() {
  const navigate = useNavigate();
  const { devices, checkRecords, addCheckRecord, createRepairTaskFromCheck } = useAppStore();

  const [selectedDeviceId, setSelectedDeviceId] = useState(devices[0]?.id || "");
  const [inspector, setInspector] = useState("");
  const [notes, setNotes] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [repairTaskCreated, setRepairTaskCreated] = useState(false);

  const [checks, setChecks] = useState<Record<string, boolean>>({
    footPad: false,
    antiSlipCover: false,
    brakeLine: false,
    armrestSponge: false,
    foldLock: false,
    wheelRotation: false,
  });

  const completedCount = Object.values(checks).filter(Boolean).length;
  const progress = (completedCount / CHECK_ITEMS.length) * 100;
  const allPassed = completedCount === CHECK_ITEMS.length;
  const failedItems = CHECK_ITEMS.filter((item) => !checks[item.key]);
  const criticalFailedItems = failedItems.filter((item) =>
    CRITICAL_ITEMS.includes(item.key)
  );
  const hasCriticalFailures = criticalFailedItems.length > 0;

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

  const handleCheckChange = (key: string, value: boolean) => {
    setChecks((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviceId || !inspector.trim()) return;

    const record: Omit<CheckRecord, "id"> = {
      deviceId: selectedDeviceId,
      checkDate: new Date().toISOString(),
      footPad: checks.footPad,
      antiSlipCover: checks.antiSlipCover,
      brakeLine: checks.brakeLine,
      armrestSponge: checks.armrestSponge,
      foldLock: checks.foldLock,
      wheelRotation: checks.wheelRotation,
      inspector: inspector.trim(),
      notes: notes.trim(),
    };

    addCheckRecord(record);
    setRepairTaskCreated(false);
    setShowSuccess(true);
  };

  const resetForm = () => {
    setChecks({
      footPad: false,
      antiSlipCover: false,
      brakeLine: false,
      armrestSponge: false,
      foldLock: false,
      wheelRotation: false,
    });
    setNotes("");
    setInspector("");
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    resetForm();
  };

  const handleCreateRepairTask = () => {
    if (!selectedDeviceId) return;
    createRepairTaskFromCheck(
      selectedDeviceId,
      criticalFailedItems.map((item) => item.key)
    );
    setRepairTaskCreated(true);
  };

  const handleViewRepairs = () => {
    setShowSuccess(false);
    resetForm();
    navigate("/repairs");
  };

  const deviceCheckHistory = checkRecords
    .filter((r) => r.deviceId === selectedDeviceId)
    .sort(
      (a, b) =>
        new Date(b.checkDate).getTime() - new Date(a.checkDate).getTime()
    );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">✅ 日常检查</h1>
            <p className="text-gray-500 text-sm">逐项检查确保设备安全使用</p>
          </div>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors",
            showHistory
              ? "bg-primary-500 text-white"
              : "bg-white text-primary-600 hover:bg-primary-50"
          )}
        >
          <History className="w-5 h-5" />
          <span className="hidden sm:inline">检查历史</span>
        </button>
      </div>

      {showHistory ? (
        <div className="bg-white rounded-3xl p-6 card-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-500" />
            检查历史记录
          </h2>
          {deviceCheckHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500">该设备暂无检查记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deviceCheckHistory.map((record) => {
                const failedCount = CHECK_ITEMS.filter(
                  (item) => !record[item.key]
                ).length;
                const hasIssues = failedCount > 0;

                return (
                  <div
                    key={record.id}
                    className={cn(
                      "rounded-2xl p-4 border-2 transition-all",
                      hasIssues
                        ? "border-warning-200 bg-warning-50/50"
                        : "border-gray-200 bg-white"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {formatDateTime(record.checkDate)}
                        </span>
                        {hasIssues && (
                          <span className="px-2 py-0.5 bg-warning-100 text-warning-700 text-xs font-semibold rounded-full">
                            {failedCount} 项异常
                          </span>
                        )}
                        {!hasIssues && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            全部正常
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        检查人: {record.inspector}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {CHECK_ITEMS.map((item: CheckItem) => (
                        <div
                          key={item.key}
                          className="flex items-center gap-2 text-sm"
                        >
                          {record[item.key] ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-warning-500 flex-shrink-0" />
                          )}
                          <span
                            className={cn(
                              record[item.key]
                                ? "text-gray-600"
                                : "text-warning-700 font-medium"
                            )}
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    {record.notes && (
                      <p
                        className={cn(
                          "text-sm rounded-lg p-2 mt-3",
                          hasIssues
                            ? "text-warning-700 bg-warning-100/50"
                            : "text-gray-500 bg-gray-50"
                        )}
                      >
                        💬 {record.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 card-shadow">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              选择检查设备
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {devices.map((device) => (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => setSelectedDeviceId(device.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left",
                    selectedDeviceId === device.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-primary-200"
                  )}
                >
                  <img
                    src={device.photo}
                    alt={device.userName}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {device.userName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {device.serialNumber}
                    </p>
                  </div>
                  {selectedDeviceId === device.id && (
                    <CheckCircle2 className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {selectedDevice && (
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedDevice.userName}的助行器
                  </h3>
                  <p className="text-white/80 text-sm">
                    上次检查: {formatDateTime(selectedDevice.lastCheckDate)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {completedCount}/{CHECK_ITEMS.length}
                  </div>
                  <p className="text-white/80 text-sm">已完成</p>
                </div>
              </div>
              <div className="mt-4 h-3 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 text-center text-white/90 font-medium">
                {allPassed ? "✅ 所有检查项已通过" : `⚠️ 还有 ${failedItems.length} 项待确认`}
              </p>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 card-shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              检查项目
            </h2>
            <div className="space-y-4">
              {CHECK_ITEMS.map((item, index) => (
                <div
                  key={item.key}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CheckBoxItem
                    item={item}
                    checked={checks[item.key]}
                    onChange={(value) => handleCheckChange(item.key, value)}
                    disabled={!selectedDeviceId}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 card-shadow space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">检查信息</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                检查人 <span className="text-warning-500">*</span>
              </label>
              <input
                type="text"
                value={inspector}
                onChange={(e) => setInspector(e.target.value)}
                placeholder="请输入检查人姓名"
                className="input-field"
                disabled={!selectedDeviceId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                备注
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="如有特殊情况请在此说明..."
                rows={3}
                className="input-field resize-none"
                disabled={!selectedDeviceId}
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!selectedDeviceId || !inspector.trim()}
              className={cn(
                "btn-primary flex items-center gap-2",
                (!selectedDeviceId || !inspector.trim()) &&
                  "opacity-50 cursor-not-allowed"
              )}
            >
              <Save className="w-5 h-5" />
              提交检查
            </button>
          </div>
        </form>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm mx-4 animate-bounce-in">
            <div
              className={cn(
                "w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center",
                allPassed ? "bg-green-100" : "bg-warning-100"
              )}
            >
              {allPassed ? (
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              ) : (
                <AlertTriangle className="w-12 h-12 text-warning-500" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {allPassed ? "检查完成！" : "检查完成，请注意！"}
            </h3>
            <p className="text-gray-600 mb-4">
              {allPassed
                ? "检查记录已成功保存，设备状态良好"
                : `检查记录已保存，发现 ${failedItems.length} 项异常，请及时处理`}
            </p>
            {!allPassed && failedItems.length > 0 && (
              <div className="bg-warning-50 rounded-2xl p-4 mb-4 text-left">
                <p className="text-sm font-semibold text-warning-700 mb-2">
                  异常项：
                </p>
                <ul className="text-sm text-warning-600 space-y-1">
                  {failedItems.map((item) => (
                  <li key={item.key} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-warning-500 rounded-full" />
                  {item.label}
                </li>
                ))}
                </ul>
              </div>
            )}
            {hasCriticalFailures && !repairTaskCreated && (
              <button
                onClick={handleCreateRepairTask}
                className="w-full mb-3 flex items-center justify-center gap-2 px-6 py-3 bg-warning-500 text-white rounded-2xl font-semibold hover:bg-warning-600 transition-colors"
              >
                <Wrench className="w-5 h-5" />
                生成维修任务
              </button>
            )}
            {hasCriticalFailures && repairTaskCreated && (
              <div className="mb-3 flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-2xl font-semibold">
                <CheckCircle2 className="w-5 h-5" />
                维修任务已生成，待处理
              </div>
            )}
            <div className="flex gap-3">
              {hasCriticalFailures && repairTaskCreated && (
                <button
                  onClick={handleViewRepairs}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2"
                >
                  查看维修
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleCloseSuccess}
                className={cn(
                  "flex items-center justify-center gap-2",
                  hasCriticalFailures && repairTaskCreated ? "flex-1" : "",
                  !hasCriticalFailures || !repairTaskCreated ? "btn-primary mx-auto" : "btn-primary"
                )}
              >
                好的
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
