import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Calendar,
  User,
  Tag,
  Ruler,
  Package,
  Clock,
  Footprints,
  ClipboardCheck,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  DEVICE_TYPE_LABELS,
  FOOT_PAD_REPLACE_THRESHOLD,
  CHECK_ITEMS,
} from "@/types";
import { formatDate, formatDateTime, cn } from "@/utils/helpers";

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDeviceById, getCheckRecordsByDevice, getIncidentsByDevice, getRepairTasksByDevice, deleteDevice } = useAppStore();
  const [activeTab, setActiveTab] = useState<'info' | 'checks' | 'incidents' | 'repairs'>('info');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const device = id ? getDeviceById(id) : undefined;
  const checkRecords = id ? getCheckRecordsByDevice(id) : [];
  const incidents = id ? getIncidentsByDevice(id) : [];
  const repairTasks = id ? getRepairTasksByDevice(id) : [];

  if (!device) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">设备不存在</h3>
        <p className="text-gray-500 mb-6">找不到该设备档案</p>
        <button onClick={() => navigate("/devices")} className="btn-primary">
          返回列表
        </button>
      </div>
    );
  }

  const needsFootPadReplace = device.footPadUsageDays >= FOOT_PAD_REPLACE_THRESHOLD;

  const handleDelete = () => {
    if (id) {
      deleteDevice(id);
      navigate("/devices");
    }
  };

  const tabs = [
    { key: 'info', label: '基本信息', icon: Package },
    { key: 'checks', label: '检查记录', icon: ClipboardCheck },
    { key: 'incidents', label: '异常记录', icon: AlertTriangle },
    { key: 'repairs', label: '维修任务', icon: Wrench },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/devices")}
            className="p-2 rounded-xl hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              📋 {device.userName}的助行器
            </h1>
            <p className="text-gray-500 text-sm">{device.serialNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/devices/${id}/edit`)}
            className="btn-secondary flex items-center gap-2"
          >
            <Edit3 className="w-5 h-5" />
            编辑
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded-2xl text-warning-600 border-2 border-warning-200 hover:bg-warning-50 font-semibold transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden card-shadow">
        <div className="relative h-64 overflow-hidden">
          <img
            src={device.photo}
            alt={device.serialNumber}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-6 text-white">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              {DEVICE_TYPE_LABELS[device.type]}
            </span>
            <h2 className="text-2xl font-bold mt-2">{device.userName}</h2>
          </div>
        </div>

        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-4 font-medium transition-colors",
                activeTab === tab.key
                  ? "text-primary-600 border-b-2 border-primary-500 bg-primary-50/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={Tag} label="设备编号" value={device.serialNumber} />
                <InfoItem icon={User} label="使用人" value={device.userName} />
                <InfoItem icon={Ruler} label="身高适配" value={device.heightAdapt} />
                <InfoItem icon={Calendar} label="购买日期" value={formatDate(device.purchaseDate)} />
                <InfoItem icon={Package} label="折叠方式" value={device.foldType} />
                <InfoItem icon={Clock} label="创建时间" value={formatDateTime(device.createdAt)} />
                <InfoItem icon={ClipboardCheck} label="上次检查" value={formatDate(device.lastCheckDate)} />
                <InfoItem
                  icon={Footprints}
                  label="脚垫使用天数"
                  value={`${device.footPadUsageDays} 天`}
                  warning={needsFootPadReplace}
                />
              </div>

              {needsFootPadReplace && (
                <div className="bg-warning-50 border border-warning-200 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-warning-500" />
                    <div>
                      <p className="font-semibold text-warning-700">脚垫需要更换</p>
                      <p className="text-sm text-warning-600">
                        脚垫已使用 {device.footPadUsageDays} 天，建议每 {FOOT_PAD_REPLACE_THRESHOLD} 天更换一次
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'checks' && (
            <div className="space-y-4">
              {checkRecords.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-gray-500">暂无检查记录</p>
                  <Link to="/checklist" className="text-primary-600 hover:underline text-sm">
                    前往进行检查
                  </Link>
                </div>
              ) : (
                checkRecords.map((record) => (
                  <div key={record.id} className="border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">
                        {formatDateTime(record.checkDate)}
                      </span>
                      <span className="text-sm text-gray-600">
                        检查人: {record.inspector}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                      {CHECK_ITEMS.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center gap-2 text-sm"
                        >
                          {record[item.key] ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-warning-500" />
                          )}
                          <span className={record[item.key] ? "text-gray-600" : "text-warning-600 font-medium"}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    {record.notes && (
                      <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-2">
                        💬 {record.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="space-y-4">
              {incidents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-gray-500">暂无异常记录，继续保持！</p>
                </div>
              ) : (
                incidents.map((incident) => (
                  <div key={incident.id} className="border border-warning-200 bg-warning-50/50 rounded-2xl p-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={incident.photo}
                        alt="异常照片"
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="px-2 py-1 bg-warning-100 text-warning-700 text-xs font-semibold rounded-full">
                            {incident.type === 'fall' && '😰 摔倒'}
                            {incident.type === 'brake_failure' && '🛑 刹不住'}
                            {incident.type === 'noise' && '🔊 异响'}
                            {incident.type === 'uneven' && '↪️ 偏斜'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDateTime(incident.incidentDate)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          📍 {incident.location}
                        </p>
                        <p className="text-sm text-gray-700">{incident.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          上报人: {incident.reporter}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'repairs' && (
            <div className="space-y-4">
              {repairTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🔧</div>
                  <p className="text-gray-500">暂无维修任务</p>
                </div>
              ) : (
                repairTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "border rounded-2xl p-4",
                      task.status === 'pending' && "border-warning-200 bg-warning-50/50",
                      task.status === 'in_progress' && "border-primary-200 bg-primary-50/50",
                      task.status === 'completed' && "border-green-200 bg-green-50/50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{task.title}</h4>
                      <span
                        className={cn(
                          "px-2 py-1 text-xs font-semibold rounded-full",
                          task.status === 'pending' && "bg-warning-100 text-warning-700",
                          task.status === 'in_progress' && "bg-primary-100 text-primary-700",
                          task.status === 'completed' && "bg-green-100 text-green-700"
                        )}
                      >
                        {task.status === 'pending' && '待处理'}
                        {task.status === 'in_progress' && '处理中'}
                        {task.status === 'completed' && '已完成'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>负责人: {task.assignee}</span>
                      <span>{formatDateTime(task.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm mx-4 animate-bounce-in">
            <h3 className="text-xl font-bold text-gray-800 mb-2">确认删除</h3>
            <p className="text-gray-600 mb-6">
              删除后将无法恢复该设备的所有数据，包括检查记录、异常记录和维修任务。确定要删除吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-warning-500 text-white rounded-2xl font-semibold hover:bg-warning-600 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  warning,
}: {
  icon: typeof Tag;
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          warning ? "bg-warning-100 text-warning-600" : "bg-primary-100 text-primary-600"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={cn("font-semibold", warning ? "text-warning-600" : "text-gray-800")}>
          {value}
        </p>
      </div>
    </div>
  );
}
