import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  Wrench,
  Footprints,
  Plus,
  FileText,
  AlertTriangle,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import TrendChart from "@/components/TrendChart";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/utils/helpers";

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    getPendingChecks,
    getPendingRepairs,
    getFootPadWarnings,
    getIncidentTrend,
  } = useAppStore();

  const pendingChecks = getPendingChecks();
  const pendingRepairs = getPendingRepairs();
  const footPadWarnings = getFootPadWarnings();
  const incidentTrend = getIncidentTrend();

  const quickActions = [
    {
      icon: ClipboardCheck,
      label: "开始检查",
      description: "进行日常安全检查",
      path: "/checklist",
      gradient: "bg-gradient-to-br from-primary-400 to-primary-600",
    },
    {
      icon: AlertTriangle,
      label: "上报异常",
      description: "记录设备异常情况",
      path: "/incidents/new",
      gradient: "bg-gradient-to-br from-warning-400 to-warning-600",
    },
    {
      icon: CreditCard,
      label: "生成检查卡",
      description: "复诊/出门快速检查",
      path: "/quick-card",
      gradient: "bg-gradient-to-br from-medical-400 to-medical-600",
    },
    {
      icon: Plus,
      label: "新增设备",
      description: "添加助行器档案",
      path: "/devices/new",
      gradient: "bg-gradient-to-br from-green-400 to-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          👋 欢迎使用助行器维护系统
        </h1>
        <p className="text-gray-500">
          定期检查设备，确保每一步都安全可靠
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="待检查设备"
          value={pendingChecks}
          icon={ClipboardCheck}
          gradient="bg-gradient-to-br from-primary-400 to-primary-500"
          textColor="text-primary-600"
          subtitle="超过7天未检查"
          warning={pendingChecks > 0}
          onClick={() => navigate("/checklist")}
        />
        <StatCard
          title="待维修任务"
          value={pendingRepairs}
          icon={Wrench}
          gradient="bg-gradient-to-br from-warning-400 to-warning-500"
          textColor="text-warning-600"
          subtitle="需要及时处理"
          warning={pendingRepairs > 0}
          onClick={() => navigate("/repairs")}
        />
        <StatCard
          title="脚垫更换提醒"
          value={footPadWarnings.length}
          icon={Footprints}
          gradient="bg-gradient-to-br from-medical-400 to-medical-500"
          textColor="text-medical-600"
          subtitle="使用超过90天"
          warning={footPadWarnings.length > 0}
        />
      </div>

      {footPadWarnings.length > 0 && (
        <div className="bg-gradient-to-r from-warning-50 to-orange-50 rounded-3xl p-6 border border-warning-200">
          <h3 className="text-lg font-bold text-warning-700 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5" />
            脚垫更换提醒
          </h3>
          <div className="space-y-3">
            {footPadWarnings.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between bg-white/60 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={device.photo}
                    alt={device.userName}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {device.userName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {device.serialNumber}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-warning-600">
                    {device.footPadUsageDays} 天
                  </p>
                  <p className="text-xs text-gray-500">已使用</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart data={incidentTrend} />

        <div className="bg-white rounded-3xl p-6 card-shadow">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-500" />
            快捷操作
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="group relative overflow-hidden rounded-2xl p-5 text-left card-hover"
              >
                <div className={`absolute inset-0 ${action.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="relative z-10">
                  <div
                    className={`w-12 h-12 ${action.gradient} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {action.label}
                  </h4>
                  <p className="text-sm text-gray-500 mb-3">
                    {action.description}
                  </p>
                  <div className="flex items-center text-primary-600 text-sm font-medium">
                    立即前往
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-10 -mb-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold mb-2">🛡️ 安全小贴士</h3>
            <p className="text-white/80">
              每天使用前花2分钟检查助行器，及时发现问题可以有效避免意外发生。
              脚垫建议每3个月更换一次，确保防滑效果最佳。
            </p>
          </div>
          <button
            onClick={() => navigate("/checklist")}
            className="px-6 py-3 bg-white text-primary-600 rounded-2xl font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            现在就检查
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 card-shadow">
        <h3 className="text-lg font-bold text-gray-800 mb-4">最近7天异常分布</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "摔倒", value: 1, emoji: "😰", color: "bg-red-100 text-red-600" },
            { label: "刹不住", value: 1, emoji: "🛑", color: "bg-orange-100 text-orange-600" },
            { label: "异响", value: 0, emoji: "🔊", color: "bg-yellow-100 text-yellow-600" },
            { label: "偏斜", value: 0, emoji: "↪️", color: "bg-blue-100 text-blue-600" },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-2xl ${item.color} flex items-center justify-center text-2xl mb-2`}>
                {item.emoji}
              </div>
              <p className="text-2xl font-bold text-gray-800">{item.value}</p>
              <p className="text-sm text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
