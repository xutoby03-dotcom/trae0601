import { useMemo, useState } from "react";
import { BarChart3, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, Trophy, Target, Clock, Weight, RotateCcw } from "lucide-react";
import { useKnotStore } from "@/store/useKnotStore";
import { calculateStudentSummary, formatTime, formatDate } from "@/utils/knotUtils";
import StatusBadge from "./StatusBadge";
import { KNOT_TYPES, KnotRecord } from "@/types/knot";

export default function SummaryPanel() {
  const { records } = useKnotStore();
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [expandedKnot, setExpandedKnot] = useState<string | null>(null);

  const studentSummaries = useMemo(() => {
    const studentNames = [...new Set(records.map((r) => r.studentName))].sort();
    return studentNames.map((name) =>
      calculateStudentSummary(records, name, KNOT_TYPES)
    );
  }, [records]);

  const toggleStudent = (name: string) => {
    if (expandedStudent === name) {
      setExpandedStudent(null);
      setExpandedKnot(null);
    } else {
      setExpandedStudent(name);
      setExpandedKnot(null);
    }
  };

  const toggleKnotDetail = (studentName: string, knotType: string) => {
    const key = `${studentName}-${knotType}`;
    setExpandedKnot(expandedKnot === key ? null : key);
  };

  const getStudentKnotRecords = (studentName: string, knotType: string): KnotRecord[] => {
    return records
      .filter((r) => r.studentName === studentName && r.knotType === knotType)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  };

  const getRecordFailureReasons = (record: KnotRecord): string[] => {
    const reasons: string[] = [];
    if (record.slipped) reasons.push("滑脱");
    if (record.capsized) reasons.push("翻结");
    if (record.sheathWear) reasons.push("绳皮磨损");
    return reasons;
  };

  const totalRecords = records.length;
  const totalStudents = studentSummaries.length;
  const totalReadyKnots = studentSummaries.reduce(
    (sum, s) => sum + s.totalReadyKnots,
    0
  );
  const totalUnreadyKnots = studentSummaries.reduce(
    (sum, s) => sum + s.totalUnreadyKnots,
    0
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-olive-100 overflow-hidden flex flex-col h-full">
      <div className="bg-gradient-to-r from-earth-700 to-earth-600 px-6 py-4">
        <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          学员汇总报告
        </h2>
        <p className="text-earth-200 text-sm mt-1">
          评估绳结是否可用于真实场景
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4 bg-earth-50/50 border-b border-earth-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-earth-700">{totalStudents}</div>
          <div className="text-xs text-earth-500">学员总数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{totalReadyKnots}</div>
          <div className="text-xs text-earth-500">达标绳结</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-rope-600">{totalUnreadyKnots}</div>
          <div className="text-xs text-earth-500">待加强</div>
        </div>
      </div>

      <div className="p-4 border-b border-olive-100 bg-olive-50/30">
        <div className="flex items-center gap-2 text-xs text-olive-600">
          <Target className="w-3.5 h-3.5" />
          <span>判定标准：测试≥3次且无滑脱、翻结率低于30%、磨损率低于30%、复打≤1次</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {studentSummaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-olive-400">
            <BarChart3 className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">暂无学员数据</p>
          </div>
        ) : (
          <div className="divide-y divide-olive-100">
            {studentSummaries.map((summary) => (
              <div key={summary.studentName} className="group">
                <button
                  onClick={() => toggleStudent(summary.studentName)}
                  className="w-full p-4 flex items-center justify-between hover:bg-olive-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-olive-500 to-olive-600 flex items-center justify-center text-white font-bold text-sm">
                      {summary.studentName.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-olive-800">
                        {summary.studentName}
                      </div>
                      <div className="text-xs text-olive-500">
                        {summary.totalRecords} 次练习记录
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <StatusBadge type="success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {summary.totalReadyKnots}
                      </StatusBadge>
                      <StatusBadge type="warning">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {summary.totalUnreadyKnots}
                      </StatusBadge>
                    </div>
                    {expandedStudent === summary.studentName ? (
                      <ChevronUp className="w-5 h-5 text-olive-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-olive-400" />
                    )}
                  </div>
                </button>

                {expandedStudent === summary.studentName && (
                  <div className="px-4 pb-4 space-y-3 animate-fadeIn">
                    {summary.knotStats.map((stat) => (
                      <div
                        key={stat.knotType}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          stat.readyForField
                            ? "bg-emerald-50/50 border-emerald-200"
                            : "bg-amber-50/50 border-amber-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {stat.readyForField ? (
                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-amber-600" />
                            )}
                            <span className="font-semibold text-olive-800">
                              {stat.knotType}
                            </span>
                            <span className="text-xs text-olive-500">
                              {stat.totalTests} 次测试
                            </span>
                          </div>
                          <StatusBadge type={stat.readyForField ? "success" : "warning"}>
                            {stat.readyForField ? "可实战" : "待加强"}
                          </StatusBadge>
                        </div>

                        {stat.totalTests > 0 ? (
                          <>
                            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                              <div className="bg-white/60 rounded-lg p-2 text-center">
                                <div className="font-semibold text-olive-700">
                                  {formatTime(Math.round(stat.avgTieTime))}
                                </div>
                                <div className="text-olive-500">平均耗时</div>
                              </div>
                              <div className="bg-white/60 rounded-lg p-2 text-center">
                                <div className="font-semibold text-olive-700">
                                  {stat.maxTestWeight}kg
                                </div>
                                <div className="text-olive-500">最大承重</div>
                              </div>
                              <div className="bg-white/60 rounded-lg p-2 text-center">
                                <div className="font-semibold text-olive-700">
                                  {stat.avgRetryCount.toFixed(1)}次
                                </div>
                                <div className="text-olive-500">平均复打</div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {stat.slipCount > 0 && (
                                <StatusBadge type="danger">
                                  滑脱 {stat.slipCount} 次
                                </StatusBadge>
                              )}
                              {stat.capsizeCount > 0 && (
                                <StatusBadge type="warning">
                                  翻结 {stat.capsizeCount} 次
                                </StatusBadge>
                              )}
                              {stat.sheathWearCount > 0 && (
                                <StatusBadge type="warning">
                                  磨损 {stat.sheathWearCount} 次
                                </StatusBadge>
                              )}
                              {stat.passCount > 0 && stat.passCount === stat.totalTests && (
                                <StatusBadge type="success">
                                  <Trophy className="w-3 h-3 mr-1" />
                                  全部通过
                                </StatusBadge>
                              )}
                            </div>

                            {!stat.readyForField && (
                              <div className="mt-2 pt-2 border-t border-amber-200/50">
                                <div className="text-xs text-amber-700 font-medium mb-1">
                                  暂不可用于实战的原因：
                                </div>
                                <ul className="text-xs text-amber-600 space-y-0.5 mb-2">
                                  {stat.reasons.map((reason, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span className="text-amber-500">•</span>
                                      {reason}
                                    </li>
                                  ))}
                                </ul>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleKnotDetail(summary.studentName, stat.knotType);
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-amber-700 bg-amber-100/50 hover:bg-amber-100 rounded-lg transition-colors"
                                >
                                  <span className="font-medium flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    查看测试记录明细
                                  </span>
                                  {expandedKnot === `${summary.studentName}-${stat.knotType}` ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </button>

                                {expandedKnot === `${summary.studentName}-${stat.knotType}` && (
                                  <div className="mt-2 space-y-2 animate-fadeIn">
                                    {getStudentKnotRecords(summary.studentName, stat.knotType).map(
                                      (record, idx) => {
                                        const failureReasons = getRecordFailureReasons(record);
                                        const hasIssues = failureReasons.length > 0;
                                        return (
                                          <div
                                            key={record.id}
                                            className={`p-3 rounded-lg border ${
                                              hasIssues
                                                ? "bg-rope-50/80 border-rope-200"
                                                : "bg-emerald-50/80 border-emerald-200"
                                            }`}
                                          >
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="text-xs font-semibold text-olive-800">
                                                {idx === 0 ? "最近一次" : `第 ${idx + 1} 次`}测试
                                              </span>
                                              <span className="text-xs text-olive-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(record.createdAt)}
                                              </span>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-olive-600 mb-2">
                                              <span className="flex items-center gap-1">
                                                <Weight className="w-3.5 h-3.5 text-olive-500" />
                                                <span className="font-semibold">{record.testWeight}kg</span>
                                              </span>
                                              {record.retryCount > 0 && (
                                                <span className="flex items-center gap-1">
                                                  <RotateCcw className="w-3.5 h-3.5 text-rope-500" />
                                                  <span className="font-semibold text-rope-600">
                                                    复打 {record.retryCount} 次
                                                  </span>
                                                </span>
                                              )}
                                            </div>

                                            <div className="flex flex-wrap gap-1">
                                              {hasIssues ? (
                                                failureReasons.map((reason) => (
                                                  <StatusBadge
                                                    key={reason}
                                                    type={reason === "滑脱" ? "danger" : "warning"}
                                                    pulse={hasIssues}
                                                  >
                                                    {reason}
                                                  </StatusBadge>
                                                ))
                                              ) : (
                                                <StatusBadge type="success">
                                                  <CheckCircle className="w-3 h-3 mr-1" />
                                                  通过
                                                </StatusBadge>
                                              )}
                                            </div>

                                            {record.notes && (
                                              <p className="text-xs text-olive-500 mt-2 pt-2 border-t border-olive-100/50">
                                                备注：{record.notes}
                                              </p>
                                            )}
                                          </div>
                                        );
                                      }
                                    )}

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedKnot(null);
                                      }}
                                      className="w-full py-2 text-xs text-olive-500 hover:text-olive-700 hover:bg-olive-50 rounded-lg transition-colors"
                                    >
                                      <span className="flex items-center justify-center gap-1">
                                        <ChevronUp className="w-3 h-3" />
                                        收起明细
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-sm text-olive-400 italic">
                            暂无测试记录
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {totalRecords > 0 && (
        <div className="p-4 bg-gradient-to-r from-olive-50 to-earth-50 border-t border-olive-100">
          <div className="text-center text-xs text-olive-600">
            共记录 <span className="font-semibold text-olive-800">{totalRecords}</span> 条拉力测试数据
          </div>
        </div>
      )}
    </div>
  );
}
