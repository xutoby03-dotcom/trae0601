import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Star,
  AlertTriangle,
  User,
  Image,
  Send,
  MapPin,
  Music,
} from "lucide-react";
import { useRepairStore } from "@/store/repairStore";
import { useInstrumentStore } from "@/store/instrumentStore";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";

export default function NewRepairForm() {
  const navigate = useNavigate();
  const createRepairOrder = useRepairStore((s) => s.createRepairOrder);
  const instruments = useInstrumentStore((s) => s.instruments);
  const users = useUserStore((s) => s.users);
  const currentUserId = useUserStore((s) => s.currentUserId);
  const getUsersByRole = useUserStore((s) => s.getUsersByRole);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId),
    [users, currentUserId]
  );
  const teachers = useMemo(() => getUsersByRole("teacher"), [users, getUsersByRole]);

  const [instrumentKeyword, setInstrumentKeyword] = useState("");
  const [instrumentDropdownOpen, setInstrumentDropdownOpen] = useState(false);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string>("");
  const [faultDescription, setFaultDescription] = useState("");
  const [impactLevel, setImpactLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [affectClass, setAffectClass] = useState(false);
  const [reporterId, setReporterId] = useState(
    currentUser?.role === "teacher" ? currentUser.id : ""
  );
  const [faultPhoto, setFaultPhoto] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filteredInstruments = useMemo(() => {
    if (!instrumentKeyword.trim()) return instruments.slice(0, 8);
    const kw = instrumentKeyword.trim().toLowerCase();
    return instruments
      .filter(
        (ins) =>
          ins.id.toLowerCase().includes(kw) ||
          ins.type.toLowerCase().includes(kw) ||
          ins.brand.toLowerCase().includes(kw) ||
          ins.classroom.toLowerCase().includes(kw)
      )
      .slice(0, 10);
  }, [instruments, instrumentKeyword]);

  const selectedInstrument = useMemo(
    () => instruments.find((i) => i.id === selectedInstrumentId),
    [instruments, selectedInstrumentId]
  );

  const canSubmit =
    selectedInstrumentId &&
    faultDescription.trim() &&
    reporterId &&
    !submitting;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const newOrder = createRepairOrder({
        instrumentId: selectedInstrumentId,
        faultDescription: faultDescription.trim(),
        impactLevel,
        affectClass,
        reporterId,
        faultPhoto: faultPhoto.trim(),
      });
      navigate(`/repairs/${newOrder.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn-ghost p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-3xl font-bold text-walnut-800">
              新建报修单
            </h1>
            <p className="mt-1 text-sm text-walnut-500">
              填写故障信息以便维修人员快速处理
            </p>
          </div>
        </div>

        <div className="card space-y-6">
          <div>
            <label className="label">
              选择乐器 <span className="text-brick-500">*</span>
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-walnut-400" />
                <input
                  type="text"
                  placeholder="搜索乐器编号、类型、品牌、教室..."
                  value={selectedInstrument ? `${selectedInstrument.brand} ${selectedInstrument.type} - ${selectedInstrument.classroom}` : instrumentKeyword}
                  onChange={(e) => {
                    if (selectedInstrumentId) {
                      setSelectedInstrumentId("");
                    }
                    setInstrumentKeyword(e.target.value);
                    setInstrumentDropdownOpen(true);
                  }}
                  onFocus={() => setInstrumentDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setInstrumentDropdownOpen(false), 150)}
                  className="input pl-10"
                />
              </div>
              {instrumentDropdownOpen && (
                <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white rounded-xl border border-walnut-100 shadow-card-hover max-h-80 overflow-y-auto">
                  {filteredInstruments.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-walnut-400">
                      未找到匹配的乐器
                    </div>
                  ) : (
                    filteredInstruments.map((ins) => (
                      <button
                        key={ins.id}
                        type="button"
                        onMouseDown={() => {
                          setSelectedInstrumentId(ins.id);
                          setInstrumentKeyword("");
                          setInstrumentDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                          "hover:bg-walnut-50 border-b border-walnut-50 last:border-b-0",
                          selectedInstrumentId === ins.id && "bg-walnut-50"
                        )}
                      >
                        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-walnut-100">
                          {ins.photo ? (
                            <img
                              src={ins.photo}
                              alt={ins.type}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="w-5 h-5 text-walnut-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-walnut-800 text-sm">
                            {ins.brand} {ins.type}
                          </div>
                          <div className="text-xs text-walnut-500 flex items-center gap-3 mt-0.5">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {ins.classroom}
                            </span>
                            <span>编号 {ins.id}</span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="label">
              故障现象 <span className="text-brick-500">*</span>
            </label>
            <textarea
              placeholder="请详细描述故障情况，如：钢琴中低音区琴弦断了3根，琴键回弹不灵敏..."
              value={faultDescription}
              onChange={(e) => setFaultDescription(e.target.value)}
              rows={4}
              className="input resize-none"
            />
          </div>

          <div>
            <label className="label">影响程度</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setImpactLevel(n as 1 | 2 | 3 | 4 | 5)}
                    className="p-1 transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={cn(
                        "w-7 h-7 transition-colors",
                        n <= impactLevel
                          ? "text-amber-500 fill-amber-500"
                          : "text-walnut-200 hover:text-walnut-300"
                      )}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm text-walnut-500">
                {["", "轻微", "一般", "普通", "严重", "非常严重"][impactLevel]}
              </span>
            </div>
          </div>

          <div>
            <label className="label">是否影响上课</label>
            <label className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-walnut-50 cursor-pointer select-none transition-colors hover:bg-walnut-100 w-full max-w-sm">
              <AlertTriangle
                className={cn(
                  "w-5 h-5 transition-colors",
                  affectClass ? "text-brick-500" : "text-walnut-400"
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium flex-1",
                  affectClass ? "text-brick-600" : "text-walnut-600"
                )}
              >
                {affectClass ? "已标记：影响正常教学使用" : "关闭：不影响正常教学"}
              </span>
              <div
                className={cn(
                  "relative w-11 h-6 rounded-full transition-colors flex-shrink-0",
                  affectClass ? "bg-brick-500" : "bg-walnut-300"
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all",
                    affectClass ? "left-[24px]" : "left-0.5"
                  )}
                />
              </div>
              <input
                type="checkbox"
                checked={affectClass}
                onChange={(e) => setAffectClass(e.target.checked)}
                className="sr-only"
              />
            </label>
          </div>

          <div>
            <label className="label">
              报修人 <span className="text-brick-500">*</span>
            </label>
            {currentUser?.role === "teacher" ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-walnut-50">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-walnut-200 flex-shrink-0">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-walnut-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-walnut-800">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-walnut-500">
                    {currentUser.phone} · 当前登录用户
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={reporterId}
                  onChange={(e) => setReporterId(e.target.value)}
                  className="input appearance-none pr-10"
                >
                  <option value="">请选择报修人</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} · {t.phone}
                    </option>
                  ))}
                </select>
                <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-walnut-400 pointer-events-none" />
              </div>
            )}
          </div>

          <div>
            <label className="label">故障照片（URL）</label>
            <div className="relative">
              <Image className="absolute left-3.5 top-3 w-4 h-4 text-walnut-400 pointer-events-none" />
              <input
                type="url"
                placeholder="输入图片链接地址（可选）"
                value={faultPhoto}
                onChange={(e) => setFaultPhoto(e.target.value)}
                className="input pl-10"
              />
            </div>
            {faultPhoto.trim() && (
              <div className="mt-3 w-40 h-40 rounded-xl overflow-hidden bg-walnut-100 border-2 border-dashed border-walnut-200">
                <img
                  src={faultPhoto.trim()}
                  alt="故障照片预览"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="btn-primary min-w-32"
          >
            <Send className="w-4 h-4" />
            {submitting ? "提交中..." : "提交报修"}
          </button>
        </div>
      </div>
    </div>
  );
}
