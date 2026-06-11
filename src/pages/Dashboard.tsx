import { useMemo } from "react"
import { useHealthStore } from "@/store"
import { useShallow } from "zustand/react/shallow"
import type { Indicator, Advice } from "@/types"
import { severityLabels, severityColors, adviceTypeIcons, adviceTypeLabels } from "@/types"
import { formatDateDisplay, getDaysUntil, isOverdue } from "@/utils/date"
import { Link } from "react-router-dom"
import {
  AlertCircle,
  TrendingUp,
  ListTodo,
  FileText,
  Calendar,
  Clock,
  ChevronRight,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Circle,
} from "lucide-react"

function CountdownBadge({ date }: { date: string }) {
  const days = getDaysUntil(date)
  const overdue = isOverdue(date)

  if (overdue) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-600 text-xs font-medium">
        <AlertCircle size={12} />
        已逾期 {Math.abs(days)} 天
      </span>
    )
  }

  if (days === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-medium">
        <Clock size={12} />
        今日需复查
      </span>
    )
  }

  if (days <= 7) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-600 text-xs font-medium">
        <Clock size={12} />
        {days} 天后
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
      <Calendar size={12} />
      {days} 天后
    </span>
  )
}

function FollowUpCard({ indicator }: { indicator: Indicator }) {
  const reports = useHealthStore((s) => s.reports)

  const report = useMemo(
    () => reports.find((r) => r.id === indicator.reportId),
    [reports, indicator.reportId]
  )

  return (
    <div className="card relative overflow-hidden p-4 pl-5">
      <div className={`severity-bar ${severityColors[indicator.severity]}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 truncate">{indicator.name}</h4>
            <span className={`badge ${
              indicator.severity === "urgent"
                ? "bg-red-100 text-red-600"
                : indicator.severity === "attention"
                ? "bg-amber-100 text-amber-600"
                : "bg-green-100 text-green-600"
            }`}>
              {severityLabels[indicator.severity]}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            <span className="text-lg font-semibold text-gray-900">{indicator.value}</span>
            <span className="text-gray-400 ml-1">{indicator.unit}</span>
            <span className="text-gray-400 ml-2">参考值: {indicator.referenceRange}</span>
          </p>
          {report && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Stethoscope size={12} />
              {report.institution}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <CountdownBadge date={indicator.nextFollowUpDate} />
          <p className="text-xs text-gray-400">{formatDateDisplay(indicator.nextFollowUpDate)}</p>
          <ChevronRight size={16} className="text-gray-300" />
        </div>
      </div>
    </div>
  )
}

function RisingIndicatorCard({ indicator }: { indicator: Indicator }) {
  return (
    <div className={`card relative overflow-hidden p-4 pl-5`}>
      <div className={`severity-bar ${severityColors[indicator.severity]}`} />
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-red-500" />
            <h4 className="font-semibold text-gray-900 truncate">{indicator.name}</h4>
          </div>
          <p className="text-sm text-gray-500">
            当前值: <span className="font-semibold text-gray-900">{indicator.value}</span>
            <span className="text-gray-400 ml-1">{indicator.unit}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{indicator.doctorAdvice}</p>
        </div>
        <span className={`badge ${
          indicator.severity === "urgent"
            ? "bg-red-100 text-red-600"
            : indicator.severity === "attention"
            ? "bg-amber-100 text-amber-600"
            : "bg-green-100 text-green-600"
        } shrink-0`}>
          {severityLabels[indicator.severity]}
        </span>
      </div>
    </div>
  )
}

function AdviceItem({ advice }: { advice: Advice }) {
  const { indicators, toggleAdvice } = useHealthStore(
    useShallow((s) => ({ indicators: s.indicators, toggleAdvice: s.toggleAdvice }))
  )

  const indicator = useMemo(
    () => indicators.find((i) => i.id === advice.indicatorId),
    [indicators, advice.indicatorId]
  )

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
      <button
        onClick={() => toggleAdvice(advice.id)}
        className="mt-0.5 shrink-0 text-gray-400 hover:text-primary-500 transition-colors"
      >
        {advice.completed ? (
          <CheckCircle2 size={20} className="text-green-500" />
        ) : (
          <Circle size={20} />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{adviceTypeIcons[advice.type]}</span>
          <span className="badge bg-gray-100 text-gray-600 text-xs">
            {adviceTypeLabels[advice.type]}
          </span>
          {indicator && (
            <span className="text-xs text-gray-400 truncate">· {indicator.name}</span>
          )}
        </div>
        <p className={`text-sm ${advice.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>
          {advice.content}
        </p>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  to,
}: {
  icon: typeof AlertCircle
  label: string
  value: number
  color: string
  to?: string
}) {
  const content = (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon size={24} className="text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <ChevronRight size={20} className="text-gray-300" />
    </div>
  )

  if (to) {
    return <Link to={to} className="block">{content}</Link>
  }
  return content
}

export default function Dashboard() {
  const { reports, indicators, followUps, advices } = useHealthStore(
    useShallow((s) => ({
      reports: s.reports,
      indicators: s.indicators,
      followUps: s.followUps,
      advices: s.advices,
    }))
  )

  const pendingFollowUps = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const warningWindow = 30 * 24 * 60 * 60 * 1000
    return indicators
      .filter((i) => {
        const nextDate = new Date(i.nextFollowUpDate).getTime()
        const diff = nextDate - today.getTime()
        return diff <= warningWindow
      })
      .sort((a, b) => {
        const aTime = new Date(a.nextFollowUpDate).getTime()
        const bTime = new Date(b.nextFollowUpDate).getTime()
        return aTime - bTime
      })
  }, [indicators])

  const risingIndicators = useMemo(() => {
    return indicators.filter((indicator) => {
      const indicatorFollowUps = followUps
        .filter((f) => f.indicatorId === indicator.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      if (indicatorFollowUps.length < 2) return false
      const lastTwo = indicatorFollowUps.slice(-2)
      return lastTwo[1].value > lastTwo[0].value
    })
  }, [indicators, followUps])

  const uncompletedAdvices = useMemo(() => {
    return advices.filter((a) => !a.completed)
  }, [advices])

  const stats = [
    {
      icon: Calendar,
      label: "待复查",
      value: pendingFollowUps.length,
      color: "bg-primary-500",
    },
    {
      icon: TrendingUp,
      label: "连续升高",
      value: risingIndicators.length,
      color: "bg-red-500",
    },
    {
      icon: ListTodo,
      label: "未执行建议",
      value: uncompletedAdvices.length,
      color: "bg-amber-500",
    },
    {
      icon: FileText,
      label: "报告总数",
      value: reports.length,
      color: "bg-blue-500",
      to: "/reports",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">健康总览</h1>
        <p className="text-gray-500">管理您的体检数据，跟踪健康指标变化</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-500" />
            近期复查任务
          </h2>
          {pendingFollowUps.length > 0 && (
            <span className="text-sm text-gray-400">共 {pendingFollowUps.length} 项</span>
          )}
        </div>
        {pendingFollowUps.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <CheckCircle2 size={40} className="mx-auto mb-2 text-green-400" />
            <p>暂无待复查项目</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingFollowUps.map((indicator) => (
              <FollowUpCard key={indicator.id} indicator={indicator} />
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-red-500" />
              预警 · 连续升高
            </h2>
            {risingIndicators.length > 0 && (
              <span className="text-sm text-gray-400">{risingIndicators.length} 项</span>
            )}
          </div>
          {risingIndicators.length === 0 ? (
            <div className="card p-8 text-center text-gray-400">
              <CheckCircle2 size={40} className="mx-auto mb-2 text-green-400" />
              <p>指标稳定，无连续升高</p>
            </div>
          ) : (
            <div className="space-y-3">
              {risingIndicators.map((indicator) => (
                <RisingIndicatorCard key={indicator.id} indicator={indicator} />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ListTodo size={20} className="text-amber-500" />
              建议追踪
            </h2>
            {uncompletedAdvices.length > 0 && (
              <span className="text-sm text-gray-400">{uncompletedAdvices.length} 项待执行</span>
            )}
          </div>
          {uncompletedAdvices.length === 0 ? (
            <div className="card p-8 text-center text-gray-400">
              <CheckCircle2 size={40} className="mx-auto mb-2 text-green-400" />
              <p>所有建议均已完成</p>
            </div>
          ) : (
            <div className="card divide-y divide-gray-100">
              {uncompletedAdvices.map((advice) => (
                <AdviceItem key={advice.id} advice={advice} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
