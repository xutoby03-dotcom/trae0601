import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useHealthStore } from "@/store";
import type { Severity } from "@/types";
import { severityLabels, severityTextColors } from "@/types";
import { todayStr } from "@/utils/date";
import { ArrowLeft, Plus, Trash2, Upload, Save } from "lucide-react";

interface IndicatorForm {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  severity: Severity;
  doctorAdvice: string;
  followUpCycleDays: string;
}

const emptyIndicator: IndicatorForm = {
  name: "",
  value: "",
  unit: "",
  referenceRange: "",
  severity: "mild",
  doctorAdvice: "",
  followUpCycleDays: "30",
};

export default function ReportNew() {
  const navigate = useNavigate();
  const addReport = useHealthStore((s) => s.addReport);
  const addIndicator = useHealthStore((s) => s.addIndicator);

  const [institution, setInstitution] = useState("");
  const [examDate, setExamDate] = useState(todayStr());
  const [photoUrl, setPhotoUrl] = useState("");
  const [indicators, setIndicators] = useState<IndicatorForm[]>([
    { ...emptyIndicator },
  ]);

  const addIndicatorRow = () => {
    setIndicators([...indicators, { ...emptyIndicator }]);
  };

  const removeIndicatorRow = (index: number) => {
    if (indicators.length === 1) return;
    setIndicators(indicators.filter((_, i) => i !== index));
  };

  const updateIndicator = (index: number, field: keyof IndicatorForm, value: string) => {
    setIndicators(
      indicators.map((ind, i) => (i === index ? { ...ind, [field]: value } : ind))
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution.trim() || !examDate) return;

    const reportData = {
      institution: institution.trim(),
      examDate,
      ...(photoUrl ? { photoUrl } : {}),
    };
    const reportId = addReport(reportData);

    indicators.forEach((ind) => {
      if (!ind.name.trim() || !ind.value) return;
      addIndicator({
        reportId,
        name: ind.name.trim(),
        value: parseFloat(ind.value),
        unit: ind.unit.trim(),
        referenceRange: ind.referenceRange.trim(),
        severity: ind.severity,
        doctorAdvice: ind.doctorAdvice.trim(),
        followUpCycleDays: parseInt(ind.followUpCycleDays) || 30,
        examDate,
      });
    });

    navigate(`/reports/${reportId}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/reports"
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:shadow-md transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新增体检报告</h1>
          <p className="text-gray-500">填写报告信息和异常指标</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-text">体检机构 *</label>
              <input
                type="text"
                className="input-field"
                placeholder="如：北京协和医院"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label-text">体检日期 *</label>
              <input
                type="date"
                className="input-field"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="label-text">报告照片（可选）</label>
              <div className="flex items-start gap-4">
                {photoUrl ? (
                  <div className="relative">
                    <img
                      src={photoUrl}
                      alt="报告预览"
                      className="w-32 h-32 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl("")}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50 transition-all">
                    <Upload size={24} />
                    <span className="text-xs mt-2">上传照片</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">异常指标</h2>
            <button
              type="button"
              onClick={addIndicatorRow}
              className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 bg-primary-50 rounded-full font-medium hover:bg-primary-100 transition-colors"
            >
              <Plus size={18} />
              添加指标
            </button>
          </div>

          <div className="space-y-5">
            {indicators.map((indicator, index) => (
              <div
                key={index}
                className="p-5 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    指标 {index + 1}
                  </span>
                  {indicators.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIndicatorRow(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="label-text">指标名称</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="如：血压"
                      value={indicator.name}
                      onChange={(e) => updateIndicator(index, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-text">数值</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      placeholder="如：140"
                      value={indicator.value}
                      onChange={(e) => updateIndicator(index, "value", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-text">单位</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="如：mmHg"
                      value={indicator.unit}
                      onChange={(e) => updateIndicator(index, "unit", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-text">参考范围</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="如：90-140"
                      value={indicator.referenceRange}
                      onChange={(e) =>
                        updateIndicator(index, "referenceRange", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="label-text">严重程度</label>
                    <select
                      className="input-field"
                      value={indicator.severity}
                      onChange={(e) =>
                        updateIndicator(index, "severity", e.target.value)
                      }
                    >
                      <option value="mild">轻微</option>
                      <option value="attention">关注</option>
                      <option value="urgent">尽快处理</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-text">复查周期（天）</label>
                    <input
                      type="number"
                      min="1"
                      className="input-field"
                      placeholder="如：30"
                      value={indicator.followUpCycleDays}
                      onChange={(e) =>
                        updateIndicator(index, "followUpCycleDays", e.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="label-text">医生建议</label>
                    <textarea
                      className="input-field min-h-[80px] resize-none"
                      placeholder="请输入医生的建议..."
                      value={indicator.doctorAdvice}
                      onChange={(e) =>
                        updateIndicator(index, "doctorAdvice", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      severityTextColors[indicator.severity]
                    }`}
                  >
                    {severityLabels[indicator.severity]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pb-8">
          <Link
            to="/reports"
            className="btn-secondary"
          >
            取消
          </Link>
          <button
            type="submit"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Save size={18} />
            保存报告
          </button>
        </div>
      </form>
    </div>
  );
}
