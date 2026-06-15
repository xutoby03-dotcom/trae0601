import { useState } from "react"
import { Link } from "react-router-dom"
import { useStore } from "@/store/useStore"
import { SeverityBadge } from "@/components/StatusBadge"
import { format } from "date-fns"
import { AlertTriangle, ShieldAlert, Cpu, Clock, CheckCircle2, ExternalLink } from "lucide-react"
import type { AlertItem } from "@/types"

type AlertType = AlertItem["type"]

const typeConfig: Record<AlertType, { label: string; icon: typeof AlertTriangle; color: string; bgColor: string }> = {
  overdue: {
    label: "逾期未还",
    icon: Clock,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  sensitive_data: {
    label: "敏感数据",
    icon: ShieldAlert,
    color: "text-brand-600",
    bgColor: "bg-brand-50",
  },
  non_standard_firmware: {
    label: "非标准固件",
    icon: Cpu,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
  },
}

const tabs: { key: AlertType | "all"; label: string }[] = [
  { key: "all", label: "全部预警" },
  { key: "overdue", label: "逾期未还" },
  { key: "sensitive_data", label: "敏感数据" },
  { key: "non_standard_firmware", label: "非标准固件" },
]

export default function Alerts() {
  const alerts = useStore((s) => s.alerts)
  const devices = useStore((s) => s.devices)
  const borrowRecords = useStore((s) => s.borrowRecords)
  const resolveAlert = useStore((s) => s.resolveAlert)

  const [activeTab, setActiveTab] = useState<AlertType | "all">("all")
  const [showResolved, setShowResolved] = useState(false)

  const filtered = alerts
    .filter((a) => {
      if (activeTab !== "all" && a.type !== activeTab) return false
      if (!showResolved && a.resolved) return false
      return true
    })
    .sort((a, b) => {
      if (a.resolved !== b.resolved) return a.resolved ? 1 : -1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const unresolvedCount = alerts.filter((a) => !a.resolved).length
  const overdueCount = alerts.filter((a) => !a.resolved && a.type === "overdue").length
  const sensitiveCount = alerts.filter((a) => !a.resolved && a.type === "sensitive_data").length
  const firmwareCount = alerts.filter((a) => !a.resolved && a.type === "non_standard_firmware").length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">异常预警</h2>
          <p className="text-sm text-slate-500 mt-1">
            逾期、含敏感数据、固件非标准的设备预警
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm text-slate-600">显示已处理</span>
        </label>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <AlertTriangle size={16} />
            总预警
          </div>
          <span className="font-display text-2xl font-bold text-slate-900">{unresolvedCount}</span>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-red-500 text-sm mb-1">
            <Clock size={16} />
            逾期未还
          </div>
          <span className="font-display text-2xl font-bold text-red-600">{overdueCount}</span>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-brand-500 text-sm mb-1">
            <ShieldAlert size={16} />
            敏感数据
          </div>
          <span className="font-display text-2xl font-bold text-brand-600">{sensitiveCount}</span>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Cpu size={16} />
            非标准固件
          </div>
          <span className="font-display text-2xl font-bold text-slate-700">{firmwareCount}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            {tab.key === "all" && unresolvedCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">{unresolvedCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((alert) => {
          const device = devices.find((d) => d.id === alert.deviceId)
          const record = borrowRecords.find((r) => r.id === alert.borrowRecordId)
          const cfg = typeConfig[alert.type]
          const Icon = cfg.icon

          return (
            <div
              key={alert.id}
              className={`card p-4 transition-colors ${
                alert.resolved ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${cfg.bgColor}`}>
                  <Icon size={18} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-slate-800">
                      {cfg.label}
                    </span>
                    <SeverityBadge severity={alert.severity} />
                    {alert.resolved && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-200">
                        <CheckCircle2 size={12} />
                        已处理
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>{format(new Date(alert.createdAt), "yyyy-MM-dd HH:mm")}</span>
                    {device && (
                      <Link
                        to={`/devices/${device.id}`}
                        className="inline-flex items-center gap-1 text-brand-500 hover:text-brand-600"
                      >
                        <ExternalLink size={12} />
                        {device.code}
                      </Link>
                    )}
                    {record && (
                      <span>借用人：{record.borrower}</span>
                    )}
                  </div>
                </div>
                {!alert.resolved && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="btn-secondary text-xs shrink-0"
                  >
                    标记已处理
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 size={40} className="mx-auto text-emerald-300 mb-3" />
            <p className="text-slate-400 text-sm">
              {showResolved ? "没有预警记录" : "暂无未处理的预警"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
