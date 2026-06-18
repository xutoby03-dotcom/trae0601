import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Wrench,
  Clock,
  User,
  CheckCircle2,
  Play,
  RotateCcw,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { RepairStatus } from "@/types";
import { formatDateTime, cn } from "@/utils/helpers";

export default function RepairTasks() {
  const navigate = useNavigate();
  const { repairTasks, getDeviceById, updateRepairStatus, getIncidentById } = useAppStore();

  const statusConfig: Record<
    RepairStatus,
    { color: string; bg: string; text: string }
  > = {
    pending: {
      color: "text-warning-600",
      bg: "bg-warning-100",
      text: "待处理",
    },
    in_progress: {
      color: "text-primary-600",
      bg: "bg-primary-100",
      text: "处理中",
    },
    completed: {
      color: "text-green-600",
      bg: "bg-green-100",
      text: "已完成",
    },
  };

  const sortedTasks = [...repairTasks].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const stats = {
    pending: repairTasks.filter((t) => t.status === "pending").length,
    in_progress: repairTasks.filter((t) => t.status === "in_progress").length,
    completed: repairTasks.filter((t) => t.status === "completed").length,
  };

  const handleStatusChange = (id: string, status: RepairStatus) => {
    updateRepairStatus(id, status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-xl hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🔧 维修任务</h1>
          <p className="text-gray-500 text-sm">
            共 {repairTasks.length} 个维修任务
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 card-shadow text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-warning-100 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-warning-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
          <p className="text-sm text-gray-500">待处理</p>
        </div>
        <div className="bg-white rounded-2xl p-4 card-shadow text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-primary-100 rounded-xl flex items-center justify-center">
            <Wrench className="w-6 h-6 text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.in_progress}</p>
          <p className="text-sm text-gray-500">处理中</p>
        </div>
        <div className="bg-white rounded-2xl p-4 card-shadow text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.completed}</p>
          <p className="text-sm text-gray-500">已完成</p>
        </div>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl card-shadow">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            暂无维修任务
          </h3>
          <p className="text-gray-500">设备状态良好，继续保持</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map((task, index) => {
            const device = getDeviceById(task.deviceId);
            const incident = getIncidentById(task.incidentId);
            const config = statusConfig[task.status];

            return (
              <div
                key={task.id}
                className={cn(
                  "bg-white rounded-3xl overflow-hidden card-shadow card-hover animate-slide-up",
                  task.status === "completed" && "opacity-75"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-800">
                          {task.title}
                        </h3>
                        <span
                          className={cn(
                            "px-3 py-1 text-xs font-semibold rounded-full",
                            config.bg,
                            config.color
                          )}
                        >
                          {config.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {device && (
                          <span>
                            📋 {device.userName} ({device.serialNumber})
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDateTime(task.createdAt)}
                        </span>
                      </div>
                    </div>
                    {device && (
                      <img
                        src={device.photo}
                        alt={device.userName}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    )}
                  </div>

                  <p className="text-gray-600 bg-gray-50 rounded-xl p-3 mb-4">
                    {task.description}
                  </p>

                  {incident && (
                    <div className="bg-warning-50 border border-warning-200 rounded-xl p-3 mb-4">
                      <p className="text-sm text-warning-700">
                        <span className="font-semibold">关联异常：</span>
                        {incident.description}
                      </p>
                      <p className="text-xs text-warning-600 mt-1">
                        📍 {incident.location}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      <span>负责人: {task.assignee}</span>
                    </div>

                    <div className="flex gap-2">
                      {task.status === "pending" && (
                        <button
                          onClick={() =>
                            handleStatusChange(task.id, "in_progress")
                          }
                          className="flex items-center gap-1 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          开始处理
                        </button>
                      )}
                      {task.status === "in_progress" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(task.id, "pending")
                            }
                            className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                            退回
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(task.id, "completed")
                            }
                            className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            完成
                          </button>
                        </>
                      )}
                      {task.status === "completed" && task.completedAt && (
                        <span className="text-sm text-gray-500">
                          完成时间: {formatDateTime(task.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
