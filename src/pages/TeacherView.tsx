import { useState, useMemo } from "react";
import { GraduationCap, AlertCircle, Copy, CheckCircle2, Users } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { CLASSES } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, daysBetween, isOverdue, getToday } from "@/utils/helpers";
import Toast from "@/components/Toast";

export default function TeacherView() {
  const borrowRecords = useAppStore((state) => state.borrowRecords);
  const [selectedClass, setSelectedClass] = useState(CLASSES[4].name);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const classRecords = useMemo(() => {
    return borrowRecords
      .filter((r) => r.className === selectedClass && r.status !== "returned")
      .map((r) => ({
        ...r,
        status: isOverdue(r.expectedReturnDate) ? "overdue" : r.status,
        overdueDays: isOverdue(r.expectedReturnDate)
          ? daysBetween(r.expectedReturnDate, getToday())
          : 0,
      }))
      .sort((a, b) => {
        if (a.status === "overdue" && b.status !== "overdue") return -1;
        if (a.status !== "overdue" && b.status === "overdue") return 1;
        return a.expectedReturnDate.localeCompare(b.expectedReturnDate);
      });
  }, [borrowRecords, selectedClass]);

  const overdueCount = classRecords.filter((r) => r.status === "overdue").length;

  const copyReminder = () => {
    const overdueList = classRecords.filter((r) => r.status === "overdue");
    if (overdueList.length === 0) {
      setShowToast(true);
      return;
    }
    const text = `${selectedClass} 图书借阅逾期提醒：\n\n${overdueList
      .map(
        (r, i) =>
          `${i + 1}. ${r.studentName}：《${r.bookTitle}》应还日期 ${formatDate(
            r.expectedReturnDate
          )}，已逾期${r.overdueDays}天`
      )
      .join("\n")}\n\n请各位同学尽快归还图书～`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-forest-500" />
          班主任视图
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          查看本班学生图书借阅情况，追踪未归还图书
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-book border border-cream-200 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择班级
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-forest-400 bg-white min-w-[180px]"
            >
              {CLASSES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <div className="text-center px-4 py-2 bg-cream-100 rounded-xl">
              <p className="text-xs text-gray-500">未归还</p>
              <p className="text-2xl font-bold font-serif text-primary-600">
                {classRecords.length}
              </p>
            </div>
            <div className="text-center px-4 py-2 bg-red-50 rounded-xl">
              <p className="text-xs text-gray-500">已逾期</p>
              <p className="text-2xl font-bold font-serif text-red-600">
                {overdueCount}
              </p>
            </div>
            <button
              onClick={copyReminder}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                copied
                  ? "bg-forest-500 text-white"
                  : "bg-forest-100 text-forest-700 hover:bg-forest-200"
              }`}
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "已复制" : "复制逾期提醒"}
            </button>
          </div>
        </div>
      </div>

      {classRecords.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-book border border-cream-200">
          <div className="text-6xl mb-4">🎊</div>
          <p className="text-gray-700 font-medium mb-2">太棒了！</p>
          <p className="text-gray-500 text-sm">
            {selectedClass} 没有未归还的图书
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-book border border-cream-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-cream-100 border-b border-cream-200">
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-5 py-3">
                    <Users className="w-4 h-4 inline mr-1" />
                    学生
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-5 py-3">
                    书籍
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-5 py-3">
                    借阅日期
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-5 py-3">
                    应还日期
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-5 py-3">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {classRecords.map((record, idx) => (
                  <tr
                    key={record.id}
                    className={`transition-colors ${
                      record.status === "overdue"
                        ? "bg-red-50/50 hover:bg-red-50"
                        : idx % 2 === 0
                        ? "bg-white hover:bg-cream-50"
                        : "bg-cream-50/50 hover:bg-cream-100"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <span
                        className={`font-medium ${
                          record.status === "overdue"
                            ? "text-red-800"
                            : "text-gray-900"
                        }`}
                      >
                        {record.studentName}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={record.bookCover}
                          alt={record.bookTitle}
                          className="w-8 h-11 rounded object-cover shadow-sm"
                        />
                        <span
                          className={`font-medium ${
                            record.status === "overdue"
                              ? "text-red-800"
                              : "text-gray-900"
                          }`}
                        >
                          {record.bookTitle}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(record.borrowDate)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-sm ${
                          record.status === "overdue"
                            ? "text-red-600 font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        {formatDate(record.expectedReturnDate)}
                        {record.status === "overdue" && (
                          <span className="ml-1.5 inline-flex items-center gap-1 text-xs text-red-600">
                            <AlertCircle className="w-3 h-3" />
                            逾期{record.overdueDays}天
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={record.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showToast && (
        <Toast
          message="没有逾期的图书，无需提醒"
          type="info"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
