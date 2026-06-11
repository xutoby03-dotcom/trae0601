import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useHealthStore } from "@/store";
import { useShallow } from "zustand/react/shallow";
import type { Severity, Indicator } from "@/types";
import { severityLabels, severityTextColors, severityColors } from "@/types";
import { formatDateDisplay } from "@/utils/date";
import {
  ArrowLeft,
  Trash2,
  Calendar,
  FileText,
  ChevronRight,
  AlertCircle,
  X,
} from "lucide-react";

const severityOrder: Severity[] = ["urgent", "attention", "mild"];

function IndicatorCard({ indicator }: { indicator: Indicator }) {
  return (
    <Link
      to={`/indicators/${indicator.id}`}
      className="card-hover block relative overflow-hidden"
    >
      <div className={`severity-bar ${severityColors[indicator.severity]}`} />
      <div className="p-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {indicator.name}
              </h3>
              <span
                className={`badge ${
                  indicator.severity === "urgent"
                    ? "bg-red-50 text-red-600"
                    : indicator.severity === "attention"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-green-50 text-green-600"
                }`}
              >
                {severityLabels[indicator.severity]}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span
                className={`text-2xl font-bold ${
                  severityTextColors[indicator.severity]
                }`}
              >
                {indicator.value}
              </span>
              <span className="text-sm text-gray-500">{indicator.unit}</span>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              参考范围：{indicator.referenceRange}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar size={12} />
              下次复查：{formatDateDisplay(indicator.nextFollowUpDate)}
            </p>
          </div>
          <ChevronRight size={20} className="text-gray-300 shrink-0 mt-1" />
        </div>
      </div>
    </Link>
  );
}

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reports, indicators, deleteReport } = useHealthStore(
    useShallow((s) => ({
      reports: s.reports,
      indicators: s.indicators,
      deleteReport: s.deleteReport,
    }))
  );

  const report = useMemo(
    () => (id ? reports.find((r) => r.id === id) : undefined),
    [reports, id]
  );

  const reportIndicators = useMemo(() => {
    if (!id) return [];
    const order: Record<Severity, number> = { urgent: 0, attention: 1, mild: 2 };
    return indicators
      .filter((i) => i.reportId === id)
      .sort((a, b) => order[a.severity] - order[b.severity]);
  }, [indicators, id]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            报告不存在
          </h3>
          <Link to="/reports" className="text-primary-600 hover:text-primary-700">
            返回报告列表
          </Link>
        </div>
      </div>
    );
  }

  const groupedIndicators = severityOrder.reduce(
    (acc, severity) => {
      acc[severity] = reportIndicators.filter((i) => i.severity === severity);
      return acc;
    },
    {} as Record<Severity, Indicator[]>
  );

  const handleDelete = () => {
    if (id) {
      deleteReport(id);
      navigate("/reports");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/reports"
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:shadow-md transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {report.institution}
            </h1>
            <p className="text-gray-500 flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDateDisplay(report.examDate)}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="btn-danger inline-flex items-center gap-2"
        >
          <Trash2 size={18} />
          删除报告
        </button>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0">
            <FileText size={28} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">体检机构</p>
                <p className="font-medium text-gray-900">{report.institution}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">体检日期</p>
                <p className="font-medium text-gray-900">
                  {formatDateDisplay(report.examDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">异常指标</p>
                <p className="font-medium text-gray-900">
                  {reportIndicators.length} 项
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">创建时间</p>
                <p className="font-medium text-gray-900">
                  {formatDateDisplay(report.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
        {report.photoUrl && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-3">报告照片</p>
            <img
              src={report.photoUrl}
              alt="体检报告"
              className="max-w-full rounded-xl border border-gray-200"
            />
          </div>
        )}
      </div>

      {severityOrder.map((severity) => {
        const list = groupedIndicators[severity];
        if (list.length === 0) return null;

        const headerConfig = {
          urgent: {
            bg: "bg-red-50",
            text: "text-red-700",
            icon: <AlertCircle size={18} />,
          },
          attention: {
            bg: "bg-amber-50",
            text: "text-amber-700",
            icon: <AlertCircle size={18} />,
          },
          mild: {
            bg: "bg-green-50",
            text: "text-green-700",
            icon: <AlertCircle size={18} />,
          },
        };

        return (
          <div key={severity} className="mb-6">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${headerConfig[severity].bg} ${headerConfig[severity].text} font-medium text-sm mb-4`}
            >
              {headerConfig[severity].icon}
              {severityLabels[severity]}
              <span className="opacity-70">({list.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {list.map((indicator) => (
                <IndicatorCard key={indicator.id} indicator={indicator} />
              ))}
            </div>
          </div>
        );
      })}

      {reportIndicators.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            暂无异常指标
          </h3>
          <p className="text-gray-500">本次体检所有指标均在正常范围内</p>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">确认删除</h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              确定要删除这份报告吗？此操作将同时删除所有关联的指标、复查记录和健康建议，且无法恢复。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger inline-flex items-center gap-2"
              >
                <Trash2 size={18} />
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
