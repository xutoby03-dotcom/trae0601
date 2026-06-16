import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  AlertTriangle,
  User,
  BookOpen,
  Tag,
  Layers,
  AlertCircle,
  BookCheck,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import StatusBadge from "@/components/StatusBadge";
import Toast from "@/components/Toast";
import { rejectReasonLabel, gradeColor, formatDate, getAvailableSlots } from "@/utils/helpers";
import {
  type RejectReason,
  BOOK_CONDITION_LABEL,
  BOOK_CONDITIONS,
  APPROPRIATE_CATEGORIES,
} from "@/types";

type TabType = "pending" | "approved" | "rejected";

interface BlockingIssue {
  reason: RejectReason;
  label: string;
  detail: string;
}

export default function AdminReview() {
  const donations = useAppStore((state) => state.donations);
  const books = useAppStore((state) => state.books);
  const cabinets = useAppStore((state) => state.cabinets);
  const reviewDonation = useAppStore((state) => state.reviewDonation);

  const [tab, setTab] = useState<TabType>("pending");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [targetCabinetMap, setTargetCabinetMap] = useState<Record<string, string>>({});
  const [rejectReasonMap, setRejectReasonMap] = useState<Record<string, RejectReason>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const filtered = useMemo(
    () => donations.filter((d) => d.status === tab),
    [donations, tab]
  );

  const getDuplicateCount = (title: string, author: string) => {
    return books.filter(
      (b) =>
        b.title.toLowerCase() === title.toLowerCase() &&
        b.author.toLowerCase() === author.toLowerCase()
    ).length;
  };

  const computeBlockingIssues = (d: (typeof filtered)[number]): BlockingIssue[] => {
    const issues: BlockingIssue[] = [];
    const duplicateCount = getDuplicateCount(d.bookTitle, d.bookAuthor);

    if (
      d.bookCondition === "noticeable_damage" ||
      d.bookCondition === "heavy_marking"
    ) {
      issues.push({
        reason: "damaged",
        label: "书籍状况差",
        detail: `当前书况为【${BOOK_CONDITION_LABEL[d.bookCondition]}】`,
      });
    }
    if (duplicateCount >= 3) {
      issues.push({
        reason: "duplicate",
        label: "重复书籍过多",
        detail: `系统中已有 ${duplicateCount} 本相同书籍，超过 2 本上限`,
      });
    }
    if (
      (d.suitableGrade === "一年级" || d.suitableGrade === "二年级") &&
      !(APPROPRIATE_CATEGORIES[d.suitableGrade] || []).includes(d.category)
    ) {
      const appropriate =
        APPROPRIATE_CATEGORIES[d.suitableGrade]?.join("、") || "";
      issues.push({
        reason: "inappropriate",
        label: "低年级内容不匹配",
        detail: `${d.suitableGrade}推荐：${appropriate}；【${d.category}】不适合低龄读者`,
      });
    }
    return issues;
  };

  const getConditionStyle = (cond: keyof typeof BOOK_CONDITION_LABEL) => {
    const cfg = BOOK_CONDITIONS.find((c) => c.value === cond);
    if (!cfg) return "bg-gray-100 text-gray-700 border-gray-200";
    return cfg.level === "good"
      ? "bg-forest-50 text-forest-700 border-forest-200"
      : "bg-red-50 text-red-700 border-red-200";
  };

  const availableCabinet = useMemo(
    () =>
      cabinets.filter((cab) => {
        return getAvailableSlots(books, cab.id, cab.capacity) > 0;
      }),
    [cabinets, books]
  );

  const handleApprove = (id: string, bookTitle: string) => {
    const targetCabinetId =
      targetCabinetMap[id] ||
      (availableCabinet.length > 0 ? availableCabinet[0].id : cabinets[0].id);
    reviewDonation({ donationId: id, approved: true, targetCabinetId });
    const d = donations.find((x) => x.id === id);
    const issues = d ? computeBlockingIssues(d) : [];
    if (issues.length > 0) {
      const reasonLabel = rejectReasonLabel(issues[0].reason);
      setToastMsg(`拦截命中「${issues[0].label}」，《${bookTitle}》已自动拒绝：${reasonLabel}`);
    } else {
      setToastMsg(`《${bookTitle}》审核通过，已上架`);
    }
    setShowToast(true);
    setExpandedId(null);
  };

  const handleReject = (id: string, bookTitle: string) => {
    const reason = rejectReasonMap[id] || "duplicate";
    reviewDonation({ donationId: id, approved: false, rejectReason: reason });
    setToastMsg(`《${bookTitle}》已拒绝：${rejectReasonLabel(reason)}`);
    setShowToast(true);
    setExpandedId(null);
  };

  const tabCounts = {
    pending: donations.filter((d) => d.status === "pending").length,
    approved: donations.filter((d) => d.status === "approved").length,
    rejected: donations.filter((d) => d.status === "rejected").length,
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin"
          className="p-2 rounded-lg hover:bg-cream-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary-500" />
            捐书审核
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            审核学生捐赠的图书，系统已自动标记潜在问题
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-1 shadow-book border border-cream-200 mb-6 flex">
        {(["pending", "approved", "rejected"] as TabType[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              tab === t
                ? t === "pending"
                  ? "bg-amber-500 text-white shadow-md"
                  : t === "approved"
                  ? "bg-forest-500 text-white shadow-md"
                  : "bg-red-500 text-white shadow-md"
                : "text-gray-600 hover:bg-cream-100"
            }`}
          >
            {t === "pending" ? "待审核" : t === "approved" ? "已通过" : "已拒绝"}
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                tab === t ? "bg-white/20" : "bg-cream-200"
              }`}
            >
              {tabCounts[t]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-book border border-cream-200">
          <div className="text-6xl mb-4">
            {tab === "pending" ? "📭" : tab === "approved" ? "✅" : "❌"}
          </div>
          <p className="text-gray-500">
            {tab === "pending"
              ? "暂无待审核的捐书申请"
              : tab === "approved"
              ? "暂无已通过的申请"
              : "暂无已拒绝的申请"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((d) => {
            const duplicateCount = getDuplicateCount(d.bookTitle, d.bookAuthor);
            const blockingIssues = computeBlockingIssues(d);
            const isExpanded = expandedId === d.id;
            return (
              <div
                key={d.id}
                className={`bg-white rounded-2xl shadow-book overflow-hidden transition-all ${
                  d.status === "pending" && blockingIssues.length > 0
                    ? "border-2 border-red-200"
                    : "border border-cream-200"
                }`}
              >
                <div
                  className="p-4 cursor-pointer hover:bg-cream-50 transition-colors"
                  onClick={() =>
                    d.status === "pending" &&
                    setExpandedId(isExpanded ? null : d.id)
                  }
                >
                  <div className="flex gap-4">
                    <img
                      src={d.cover}
                      alt={d.bookTitle}
                      className="w-16 h-22 object-cover rounded-lg shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-serif font-bold text-gray-900 line-clamp-1">
                            {d.bookTitle}
                          </h3>
                          <StatusBadge status={d.status} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {d.bookAuthor}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${gradeColor(
                            d.suitableGrade
                          )}`}
                        >
                          {d.suitableGrade}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-cream-200 text-gray-700 border border-cream-300 flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {d.category}
                        </span>
                        {d.bookCondition && (
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-md border font-medium flex items-center gap-1 ${getConditionStyle(
                              d.bookCondition
                            )}`}
                          >
                            <BookCheck className="w-3 h-3" />
                            {BOOK_CONDITION_LABEL[d.bookCondition]}
                          </span>
                        )}
                        {duplicateCount >= 3 && d.status === "pending" && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            重复 {duplicateCount} 本
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          捐赠者：{d.donorClass} · {d.donorName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(d.submitDate)}
                        </p>
                      </div>

                      {blockingIssues.length > 0 && d.status === "pending" && (
                        <div className="mt-3 p-2.5 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-xs font-semibold text-red-800 flex items-center gap-1.5 mb-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            命中拦截规则（{blockingIssues.length}项），通过按钮将自动拒绝
                          </p>
                          <ul className="space-y-0.5">
                            {blockingIssues.map((b, i) => (
                              <li
                                key={i}
                                className="text-[11px] text-red-700 leading-relaxed"
                              >
                                • <span className="font-medium">{b.label}</span>：{b.detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {d.status === "rejected" && d.rejectReason && (
                        <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          拒绝原因：{rejectReasonLabel(d.rejectReason)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {d.status === "pending" && isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-cream-200 bg-cream-50 animate-slide-up">
                    {blockingIssues.length > 0 ? (
                      <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-200 text-sm text-red-700">
                        <p className="font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          拦截处理建议
                        </p>
                        <p className="text-xs mt-1 leading-relaxed">
                          此申请已命中
                          {blockingIssues.length}
                          项拦截规则：
                          {blockingIssues.map((b) => b.label).join("、")}
                          。点击「通过并上架」会自动转为拒绝，无需手动选原因；如需人工复审可调整拒绝原因后点「拒绝」。
                        </p>
                      </div>
                    ) : (
                      duplicateCount > 0 && (
                        <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-700 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p className="text-xs leading-relaxed">
                            提示：系统中已有 {duplicateCount} 本相同书籍，未达上限但需留意存量
                          </p>
                        </div>
                      )
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                          <Layers className="w-4 h-4" />
                          分配柜格
                          <span className="text-xs text-gray-400 font-normal ml-auto">
                            仅通过时生效
                          </span>
                        </label>
                        <select
                          value={targetCabinetMap[d.id] || ""}
                          onChange={(e) =>
                            setTargetCabinetMap((prev) => ({
                              ...prev,
                              [d.id]: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-lg border border-cream-300 bg-white focus:outline-none focus:ring-2 focus:ring-forest-300 text-sm"
                        >
                          <option value="">
                            自动分配（推荐：
                            {availableCabinet[0]?.name || "已满"}）
                          </option>
                          {availableCabinet.map((cab) => {
                            const slots = getAvailableSlots(
                              books,
                              cab.id,
                              cab.capacity
                            );
                            return (
                              <option key={cab.id} value={cab.id}>
                                {cab.name}（空位 {slots}）
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          拒绝原因（拒绝/拦截时生效）
                        </label>
                        <select
                          value={
                            rejectReasonMap[d.id] ||
                            (blockingIssues.length > 0
                              ? blockingIssues[0].reason
                              : "duplicate")
                          }
                          onChange={(e) =>
                            setRejectReasonMap((prev) => ({
                              ...prev,
                              [d.id]: e.target.value as RejectReason,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-lg border border-cream-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-300 text-sm"
                        >
                          <option value="duplicate">重复太多</option>
                          <option value="damaged">书籍破损</option>
                          <option value="inappropriate">内容不适合低年级</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleApprove(d.id, d.bookTitle)}
                        className={`flex-1 py-2.5 rounded-xl text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                          blockingIssues.length > 0
                            ? "bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600"
                            : "bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700"
                        }`}
                      >
                        {blockingIssues.length > 0 ? (
                          <>
                            <XCircle className="w-4 h-4" />
                            拦截并自动拒绝
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            通过并上架
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(d.id, d.bookTitle)}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium shadow-md hover:shadow-lg hover:from-gray-600 hover:to-gray-700 transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        手动拒绝
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showToast && (
        <Toast
          message={toastMsg}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
