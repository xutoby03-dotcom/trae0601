import { useState } from "react";
import { Plus, Clock, Weight, Ruler, User, FileText } from "lucide-react";
import { useKnotStore } from "@/store/useKnotStore";
import { KNOT_TYPES, ROPE_MATERIALS } from "@/types/knot";

interface FormData {
  knotType: string;
  ropeDiameter: string;
  ropeMaterial: string;
  studentName: string;
  tieTimeSeconds: string;
  testWeight: string;
  slipped: boolean;
  capsized: boolean;
  sheathWear: boolean;
  retryCount: string;
  notes: string;
}

const initialFormData: FormData = {
  knotType: KNOT_TYPES[0],
  ropeDiameter: "10.5",
  ropeMaterial: ROPE_MATERIALS[0],
  studentName: "",
  tieTimeSeconds: "",
  testWeight: "",
  slipped: false,
  capsized: false,
  sheathWear: false,
  retryCount: "0",
  notes: "",
};

export default function RecordForm() {
  const { addRecord, knotTypes, ropeMaterials } = useKnotStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentName.trim()) {
      alert("请输入学员姓名");
      return;
    }
    if (!formData.tieTimeSeconds || Number(formData.tieTimeSeconds) <= 0) {
      alert("请输入有效的打结耗时");
      return;
    }
    if (!formData.testWeight || Number(formData.testWeight) <= 0) {
      alert("请输入有效的测试重量");
      return;
    }

    addRecord({
      knotType: formData.knotType,
      ropeDiameter: Number(formData.ropeDiameter),
      ropeMaterial: formData.ropeMaterial,
      studentName: formData.studentName.trim(),
      tieTimeSeconds: Number(formData.tieTimeSeconds),
      testWeight: Number(formData.testWeight),
      slipped: formData.slipped,
      capsized: formData.capsized,
      sheathWear: formData.sheathWear,
      retryCount: Number(formData.retryCount),
      notes: formData.notes,
    });

    setFormData({
      ...initialFormData,
      studentName: formData.studentName,
      knotType: formData.knotType,
      ropeDiameter: formData.ropeDiameter,
      ropeMaterial: formData.ropeMaterial,
    });
  };

  const hasAnyIssue = formData.slipped || formData.capsized || formData.sheathWear;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-olive-100 overflow-hidden">
      <div className="bg-gradient-to-r from-olive-700 to-olive-600 px-6 py-4">
        <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
          <Plus className="w-5 h-5" />
          登记练习记录
        </h2>
        <p className="text-olive-200 text-sm mt-1">
          记录绳结测试结果，跟踪学员进步
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-olive-800 uppercase tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 bg-earth-100 rounded-full flex items-center justify-center text-earth-700 text-xs font-bold">
              1
            </span>
            绳索信息
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-olive-700 mb-1.5">
                绳结类型
              </label>
              <select
                name="knotType"
                value={formData.knotType}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-olive-200 rounded-xl bg-olive-50/50 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all text-olive-800"
              >
                {knotTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-olive-700 mb-1.5 flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5" />
                绳径 (mm)
              </label>
              <input
                type="number"
                name="ropeDiameter"
                value={formData.ropeDiameter}
                onChange={handleInputChange}
                step="0.1"
                min="1"
                className="w-full px-4 py-2.5 border border-olive-200 rounded-xl bg-olive-50/50 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-olive-700 mb-1.5">
                绳索材质
              </label>
              <select
                name="ropeMaterial"
                value={formData.ropeMaterial}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-olive-200 rounded-xl bg-olive-50/50 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all text-olive-800"
              >
                {ropeMaterials.map((mat) => (
                  <option key={mat} value={mat}>
                    {mat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-olive-200 to-transparent" />

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-olive-800 uppercase tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 bg-earth-100 rounded-full flex items-center justify-center text-earth-700 text-xs font-bold">
              2
            </span>
            学员与测试
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-olive-700 mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                学员姓名
              </label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                placeholder="请输入学员姓名"
                className="w-full px-4 py-2.5 border border-olive-200 rounded-xl bg-olive-50/50 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-olive-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                打结耗时 (秒)
              </label>
              <input
                type="number"
                name="tieTimeSeconds"
                value={formData.tieTimeSeconds}
                onChange={handleInputChange}
                min="1"
                placeholder="60"
                className="w-full px-4 py-2.5 border border-olive-200 rounded-xl bg-olive-50/50 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-olive-700 mb-1.5 flex items-center gap-1">
                <Weight className="w-3.5 h-3.5" />
                测试重量 (kg)
              </label>
              <input
                type="number"
                name="testWeight"
                value={formData.testWeight}
                onChange={handleInputChange}
                min="1"
                placeholder="50"
                className="w-full px-4 py-2.5 border border-olive-200 rounded-xl bg-olive-50/50 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-olive-200 to-transparent" />

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-olive-800 uppercase tracking-wide flex items-center gap-2">
            <span className="w-6 h-6 bg-earth-100 rounded-full flex items-center justify-center text-earth-700 text-xs font-bold">
              3
            </span>
            测试状态
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <label
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                formData.slipped
                  ? "border-rope-500 bg-rope-50 text-rope-700"
                  : "border-olive-200 bg-white hover:border-olive-300 text-olive-600"
              }`}
            >
              <input
                type="checkbox"
                name="slipped"
                checked={formData.slipped}
                onChange={handleInputChange}
                className="sr-only"
              />
              <span className="text-2xl mb-1">⚠️</span>
              <span className="text-sm font-medium">滑脱</span>
            </label>

            <label
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                formData.capsized
                  ? "border-rope-500 bg-rope-50 text-rope-700"
                  : "border-olive-200 bg-white hover:border-olive-300 text-olive-600"
              }`}
            >
              <input
                type="checkbox"
                name="capsized"
                checked={formData.capsized}
                onChange={handleInputChange}
                className="sr-only"
              />
              <span className="text-2xl mb-1">🔄</span>
              <span className="text-sm font-medium">翻结</span>
            </label>

            <label
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                formData.sheathWear
                  ? "border-rope-500 bg-rope-50 text-rope-700"
                  : "border-olive-200 bg-white hover:border-olive-300 text-olive-600"
              }`}
            >
              <input
                type="checkbox"
                name="sheathWear"
                checked={formData.sheathWear}
                onChange={handleInputChange}
                className="sr-only"
              />
              <span className="text-2xl mb-1">🧵</span>
              <span className="text-sm font-medium">绳皮磨损</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-olive-700 mb-1.5">
              复打次数
            </label>
            <input
              type="number"
              name="retryCount"
              value={formData.retryCount}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-2.5 border border-olive-200 rounded-xl bg-olive-50/50 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-olive-200 to-transparent" />

        <div className="space-y-3">
          <label className="block text-sm font-medium text-olive-700 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            备注
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={2}
            placeholder="记录观察或改进建议..."
            className="w-full px-4 py-2.5 border border-olive-200 rounded-xl bg-olive-50/50 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
            hasAnyIssue
              ? "bg-gradient-to-r from-rope-600 to-rope-500 hover:from-rope-700 hover:to-rope-600 shadow-rope-500/30"
              : "bg-gradient-to-r from-olive-600 to-olive-500 hover:from-olive-700 hover:to-olive-600 shadow-olive-500/30"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            {hasAnyIssue ? "记录问题测试" : "记录成功测试"}
          </span>
        </button>
      </form>
    </div>
  );
}
