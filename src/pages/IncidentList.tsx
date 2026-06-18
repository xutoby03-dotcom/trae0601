import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, AlertTriangle, MapPin, Clock, User } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { INCIDENT_TYPE_LABELS } from "@/types";
import { formatDateTime } from "@/utils/helpers";

export default function IncidentList() {
  const navigate = useNavigate();
  const { incidents, getDeviceById } = useAppStore();

  const incidentEmojis: Record<string, string> = {
    fall: "😰",
    brake_failure: "🛑",
    noise: "🔊",
    uneven: "↪️",
  };

  const sortedIncidents = [...incidents].sort(
    (a, b) =>
      new Date(b.incidentDate).getTime() - new Date(a.incidentDate).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">⚠️ 异常记录</h1>
            <p className="text-gray-500 text-sm">
              共 {incidents.length} 条异常记录
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/incidents/new")}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          上报异常
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(INCIDENT_TYPE_LABELS).map(([type, label]) => {
          const count = incidents.filter((i) => i.type === type).length;
          return (
            <div
              key={type}
              className="bg-white rounded-2xl p-4 card-shadow text-center"
            >
              <div className="text-3xl mb-2">{incidentEmojis[type]}</div>
              <p className="text-2xl font-bold text-gray-800">{count}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          );
        })}
      </div>

      {sortedIncidents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl card-shadow">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            暂无异常记录
          </h3>
          <p className="text-gray-500 mb-6">设备状态良好，继续保持定期检查</p>
          <button
            onClick={() => navigate("/incidents/new")}
            className="btn-primary"
          >
            上报异常
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedIncidents.map((incident, index) => {
            const device = getDeviceById(incident.deviceId);
            return (
              <div
                key={incident.id}
                className="bg-white rounded-3xl overflow-hidden card-shadow card-hover animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 h-48 md:h-auto relative flex-shrink-0">
                    <img
                      src={incident.photo}
                      alt="异常照片"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold flex items-center gap-1">
                        {incidentEmojis[incident.type]} {INCIDENT_TYPE_LABELS[incident.type]}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {device?.userName || "未知设备"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {device?.serialNumber || ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {formatDateTime(incident.incidentDate)}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-warning-500" />
                        <span>{incident.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4 text-medical-500" />
                        <span>上报人: {incident.reporter}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 bg-gray-50 rounded-xl p-3">
                      {incident.description}
                    </p>
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
