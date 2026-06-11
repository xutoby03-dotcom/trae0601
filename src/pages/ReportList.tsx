import { useMemo } from "react"
import { useHealthStore } from "@/store"
import { useShallow } from "zustand/react/shallow"
import type { Report } from "@/types"
import { formatDateDisplay } from "@/utils/date"
import { Link } from "react-router-dom"
import { FileText, Plus, ChevronRight, Calendar, Stethoscope, AlertCircle } from "lucide-react"

function ReportCard({ report }: { report: Report }) {
  const indicators = useHealthStore((s) => s.indicators)

  const reportIndicators = useMemo(
    () => indicators.filter((i) => i.reportId === report.id),
    [indicators, report.id]
  )

  const abnormalCount = reportIndicators.length
  const hasUrgent = reportIndicators.some((i) => i.severity === "urgent")
  const hasAttention = reportIndicators.some((i) => i.severity === "attention")

  return (
    <Link to={`/reports/${report.id}`} className="card-hover block">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
              <FileText size={24} className="text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate mb-1">
                {report.institution}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
                <Calendar size={14} />
                {formatDateDisplay(report.examDate)}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {abnormalCount > 0 ? (
                  <span className="badge bg-red-50 text-red-600 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {abnormalCount} 项异常
                  </span>
                ) : (
                  <span className="badge bg-green-50 text-green-600">
                    指标正常
                  </span>
                )}
                {hasUrgent && (
                  <span className="badge bg-red-100 text-red-700">
                    需尽快处理
                  </span>
                )}
                {hasAttention && !hasUrgent && (
                  <span className="badge bg-amber-100 text-amber-700">
                    需关注
                  </span>
                )}
                {reportIndicators.length > 0 && !hasUrgent && !hasAttention && (
                  <span className="badge bg-green-100 text-green-700">
                    轻微异常
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-300 shrink-0 mt-2" />
        </div>
      </div>
    </Link>
  )
}

export default function ReportList() {
  const { reports, indicators } = useHealthStore(
    useShallow((s) => ({ reports: s.reports, indicators: s.indicators }))
  )

  const sortedReports = useMemo(
    () =>
      [...reports].sort(
        (a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime()
      ),
    [reports]
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">体检报告</h1>
          <p className="text-gray-500">共 {reports.length} 份报告</p>
        </div>
        <Link to="/reports/new" className="btn-primary inline-flex items-center gap-2">
          <Plus size={18} />
          新增报告
        </Link>
      </div>

      {sortedReports.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Stethoscope size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">暂无体检报告</h3>
          <p className="text-gray-500 mb-6">点击上方按钮添加您的第一份体检报告</p>
          <Link to="/reports/new" className="btn-primary inline-flex items-center gap-2">
            <Plus size={18} />
            新增报告
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  )
}
