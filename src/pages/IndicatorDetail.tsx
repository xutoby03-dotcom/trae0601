import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useHealthStore } from "@/store";
import { useShallow } from "zustand/react/shallow";
import type { Severity, AdviceType } from "@/types";
import { severityLabels, severityTextColors, adviceTypeLabels, adviceTypeIcons } from "@/types";
import { formatDate, formatDateDisplay, todayStr } from "@/utils/date";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  Calendar,
  Activity,
  FileText,
  Pill,
  Dumbbell,
  Utensils,
  AlertCircle,
  X,
  Send,
} from "lucide-react";

const adviceTypeIconComponents: Record<AdviceType, React.ReactNode> = {
  medication: <Pill size={16} />,
  exercise: <Dumbbell size={16} />,
  diet: <Utensils size={16} />,
};

const adviceTypeColors: Record<AdviceType, { bg: string; text: string; border: string }> = {
  medication: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  exercise: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  diet: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
};

export default function IndicatorDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    indicators,
    reports,
    followUps,
    advices,
    addFollowUp,
    addAdvice,
    toggleAdvice,
    deleteAdvice,
  } = useHealthStore(
    useShallow((s) => ({
      indicators: s.indicators,
      reports: s.reports,
      followUps: s.followUps,
      advices: s.advices,
      addFollowUp: s.addFollowUp,
      addAdvice: s.addAdvice,
      toggleAdvice: s.toggleAdvice,
      deleteAdvice: s.deleteAdvice,
    }))
  );

  const indicator = useMemo(
    () => (id ? indicators.find((i) => i.id === id) : undefined),
    [indicators, id]
  );

  const report = useMemo(
    () => (indicator ? reports.find((r) => r.id === indicator.reportId) : undefined),
    [reports, indicator]
  );

  const indicatorFollowUps = useMemo(() => {
    if (!id) return [];
    return followUps
      .filter((f) => f.indicatorId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [followUps, id]);

  const indicatorAdvices = useMemo(() => {
    if (!id) return [];
    return advices
      .filter((a) => a.indicatorId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [advices, id]);

  const [followUpDate, setFollowUpDate] = useState(todayStr());
  const [followUpValue, setFollowUpValue] = useState("");
  const [followUpFeedback, setFollowUpFeedback] = useState("");

  const [newAdviceType, setNewAdviceType] = useState<AdviceType>("medication");
  const [newAdviceContent, setNewAdviceContent] = useState("");
  const [showAdviceForm, setShowAdviceForm] = useState(false);

  const chartData = useMemo(() => {
    if (!indicator) return [];
    const data = [
      {
        date: formatDateDisplay(indicator.createdAt),
        value: indicator.value,
      },
      ...[...indicatorFollowUps]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((f) => ({
          date: formatDateDisplay(f.date),
          value: f.value,
        })),
    ];
    return data;
  }, [indicator, indicatorFollowUps]);

  if (!indicator) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            指标不存在
          </h3>
          <Link to="/reports" className="text-primary-600 hover:text-primary-700">
            返回报告列表
          </Link>
        </div>
      </div>
    );
  }

  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !followUpDate || !followUpValue) return;

    addFollowUp({
      indicatorId: id,
      date: followUpDate,
      value: parseFloat(followUpValue),
      doctorFeedback: followUpFeedback.trim(),
    });

    setFollowUpValue("");
    setFollowUpFeedback("");
    setFollowUpDate(todayStr());
  };

  const handleAddAdvice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newAdviceContent.trim()) return;

    addAdvice({
      indicatorId: id,
      type: newAdviceType,
      content: newAdviceContent.trim(),
    });

    setNewAdviceContent("");
    setShowAdviceForm(false);
  };

  const groupedAdvices = useMemo(() => {
    const types: AdviceType[] = ["medication", "exercise", "diet"];
    return types.reduce(
      (acc, type) => {
        acc[type] = indicatorAdvices.filter((a) => a.type === type);
        return acc;
      },
      {} as Record<AdviceType, typeof indicatorAdvices>
    );
  }, [indicatorAdvices]);

  const backPath = report ? `/reports/${report.id}` : "/reports";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to={backPath}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:shadow-md transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{indicator.name}</h1>
          {report && (
            <p className="text-gray-500 flex items-center gap-1.5">
              <FileText size={14} />
              {report.institution}
            </p>
          )}
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Activity size={24} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">指标概况</h2>
              <span
                className={`badge ${
                  indicator.severity === "urgent"
                    ? "bg-red-50 text-red-600"
                    : indicator.severity === "attention"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-green-50 text-green-600"
                } mt-1`}
              >
                {severityLabels[indicator.severity]}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-4xl font-bold ${
                  severityTextColors[indicator.severity]
                }`}
              >
                {indicator.value}
              </span>
              <span className="text-gray-500">{indicator.unit}</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">当前数值</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">参考范围</p>
            <p className="font-medium text-gray-900">{indicator.referenceRange}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">复查周期</p>
            <p className="font-medium text-gray-900">{indicator.followUpCycleDays} 天</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">下次复查</p>
            <p className="font-medium text-gray-900 flex items-center gap-1">
              <Calendar size={14} className="text-primary-500" />
              {formatDateDisplay(indicator.nextFollowUpDate)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl md:col-span-2 col-span-2">
            <p className="text-xs text-gray-500 mb-1">医生建议</p>
            <p className="font-medium text-gray-900">{indicator.doctorAdvice || "暂无"}</p>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Activity size={20} className="text-primary-500" />
          数值趋势
        </h2>
        <div className="h-64">
          {chartData.length >= 2 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  stroke="#d1d5db"
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  stroke="#d1d5db"
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  labelStyle={{ color: "#374151", fontWeight: 500 }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0d9488"
                  strokeWidth={3}
                  dot={{ fill: "#0d9488", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: "#0f766e" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Activity size={40} className="mb-2" />
              <p>至少需要 2 条记录才能显示趋势图</p>
              <p className="text-sm">请在下方添加复查记录</p>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Calendar size={20} className="text-primary-500" />
          复查记录
        </h2>

        <form onSubmit={handleAddFollowUp} className="p-4 bg-gray-50 rounded-xl mb-5">
          <h3 className="text-sm font-medium text-gray-700 mb-3">新增复查记录</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="label-text">复查日期</label>
              <input
                type="date"
                className="input-field"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label-text">
                数值 ({indicator.unit})
              </label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                placeholder="请输入数值"
                value={followUpValue}
                onChange={(e) => setFollowUpValue(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label-text">医生反馈</label>
              <input
                type="text"
                className="input-field"
                placeholder="如：情况稳定"
                value={followUpFeedback}
                onChange={(e) => setFollowUpFeedback(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Send size={16} />
              添加记录
            </button>
          </div>
        </form>

        <div className="relative">
          {indicatorFollowUps.length > 0 ? (
            <div className="space-y-0">
              {indicatorFollowUps.map((followUp, index) => (
                <div key={followUp.id} className="relative pl-8 pb-6 last:pb-0">
                  {index !== indicatorFollowUps.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200" />
                  )}
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary-100 border-2 border-primary-400 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <p className="font-medium text-gray-900">
                          {formatDateDisplay(followUp.date)}
                        </p>
                        <span className="text-2xl font-bold text-primary-600">
                          {followUp.value}
                          <span className="text-sm font-normal text-gray-500 ml-1">
                            {indicator.unit}
                          </span>
                        </span>
                      </div>
                    </div>
                    {followUp.doctorFeedback && (
                      <p className="text-sm text-gray-600">
                        <span className="text-gray-400">医生反馈：</span>
                        {followUp.doctorFeedback}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Calendar size={32} className="mx-auto mb-2" />
              <p>暂无复查记录</p>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertCircle size={20} className="text-primary-500" />
            健康建议
          </h2>
          {!showAdviceForm && (
            <button
              onClick={() => setShowAdviceForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 bg-primary-50 rounded-full font-medium hover:bg-primary-100 transition-colors"
            >
              <Plus size={18} />
              添加建议
            </button>
          )}
        </div>

        {showAdviceForm && (
          <form onSubmit={handleAddAdvice} className="p-4 bg-gray-50 rounded-xl mb-5">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">新增健康建议</h3>
              <button
                type="button"
                onClick={() => {
                  setShowAdviceForm(false);
                  setNewAdviceContent("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="label-text">建议类型</label>
                <select
                  className="input-field"
                  value={newAdviceType}
                  onChange={(e) => setNewAdviceType(e.target.value as AdviceType)}
                >
                  <option value="medication">{adviceTypeIcons.medication} 用药</option>
                  <option value="exercise">{adviceTypeIcons.exercise} 运动</option>
                  <option value="diet">{adviceTypeIcons.diet} 饮食</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="label-text">建议内容</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="请输入建议内容..."
                    value={newAdviceContent}
                    onChange={(e) => setNewAdviceContent(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="btn-primary inline-flex items-center gap-2 shrink-0"
                  >
                    <Send size={16} />
                    添加
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {(["medication", "exercise", "diet"] as AdviceType[]).map((type) => {
          const list = groupedAdvices[type];
          if (list.length === 0) return null;
          const colors = adviceTypeColors[type];

          return (
            <div key={type} className="mb-5 last:mb-0">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.bg} ${colors.text} font-medium text-sm mb-3`}
              >
                {adviceTypeIconComponents[type]}
                {adviceTypeLabels[type]}
                <span className="opacity-70">({list.length})</span>
              </div>
              <div className="space-y-2">
                {list.map((advice) => (
                  <div
                    key={advice.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border ${colors.border} ${
                      advice.completed ? "bg-gray-50" : colors.bg
                    } transition-all`}
                  >
                    <button
                      onClick={() => toggleAdvice(advice.id)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                        advice.completed
                          ? "bg-primary-500 border-primary-500 text-white"
                          : `border-gray-300 hover:border-primary-400 ${colors.text}`
                      }`}
                    >
                      {advice.completed && <Check size={14} />}
                    </button>
                    <span
                      className={`flex-1 ${
                        advice.completed
                          ? "text-gray-400 line-through"
                          : "text-gray-700"
                      }`}
                    >
                      {advice.content}
                    </span>
                    <button
                      onClick={() => deleteAdvice(advice.id)}
                      className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {indicatorAdvices.length === 0 && !showAdviceForm && (
          <div className="text-center py-8 text-gray-400">
            <AlertCircle size={32} className="mx-auto mb-2" />
            <p>暂无健康建议</p>
            <p className="text-sm">点击上方按钮添加用药、运动或饮食建议</p>
          </div>
        )}
      </div>
    </div>
  );
}
