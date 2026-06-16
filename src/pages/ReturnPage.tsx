import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  Home,
  Shuffle,
  CheckCircle2,
  Package,
  Layers,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import Toast from "@/components/Toast";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, isOverdue } from "@/utils/helpers";

type ReturnMode = "original" | "switch";

export default function ReturnPage() {
  const borrowRecords = useAppStore((state) => state.borrowRecords);
  const cabinets = useAppStore((state) => state.cabinets);
  const books = useAppStore((state) => state.books);
  const returnBook = useAppStore((state) => state.returnBook);

  const [selectedRecordId, setSelectedRecordId] = useState<string>("");
  const [returnMode, setReturnMode] = useState<ReturnMode>("original");
  const [targetCabinetId, setTargetCabinetId] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const borrowedRecords = useMemo(
    () =>
      borrowRecords
        .filter((r) => r.status === "borrowed" || r.status === "overdue")
        .map((r) => ({
          ...r,
          status: isOverdue(r.expectedReturnDate) ? "overdue" : r.status,
        })),
    [borrowRecords]
  );

  const selectedRecord = borrowedRecords.find((r) => r.id === selectedRecordId);
  const originalCabinet = cabinets.find(
    (c) => c.id === selectedRecord?.originalCabinetId
  );

  const availableCabinets = useMemo(() => {
    return cabinets.filter((cab) => {
      const count = books.filter((b) => b.cabinetId === cab.id).length;
      return count < cab.capacity;
    });
  }, [cabinets, books]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordId) return;
    if (returnMode === "switch" && !targetCabinetId) return;

    setSubmitting(true);
    setTimeout(() => {
      returnBook({
        recordId: selectedRecordId,
        newCabinetId: returnMode === "switch" ? targetCabinetId : undefined,
      });
      setSubmitting(false);
      setShowToast(true);
      setSelectedRecordId("");
      setTargetCabinetId("");
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ArrowLeftRight className="w-6 h-6 text-primary-500" />
          归还图书
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          选择要归还的图书，放回原柜格或选择其他空位柜格
        </p>
      </div>

      {borrowedRecords.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-book border border-cream-200">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-gray-700 font-medium mb-2">太棒了！</p>
          <p className="text-gray-500 text-sm mb-6">目前没有未归还的图书</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
          >
            去看看有什么好书
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-book border border-cream-200">
            <h3 className="font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-forest-500" />
              选择归还的图书
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin pr-1">
              {borrowedRecords.map((record) => (
                <label
                  key={record.id}
                  className={`flex gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedRecordId === record.id
                      ? "border-primary-400 bg-primary-50 shadow-md"
                      : "border-cream-200 hover:border-cream-300 hover:bg-cream-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="record"
                    value={record.id}
                    checked={selectedRecordId === record.id}
                    onChange={(e) => {
                      setSelectedRecordId(e.target.value);
                      setTargetCabinetId("");
                    }}
                    className="mt-1 accent-primary-500"
                  />
                  <img
                    src={record.bookCover}
                    alt={record.bookTitle}
                    className="w-14 h-20 object-cover rounded-lg shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-gray-900 line-clamp-1">
                        {record.bookTitle}
                      </h4>
                      <StatusBadge status={record.status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {record.className} · {record.studentName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      借阅：{formatDate(record.borrowDate)} · 应还：
                      {formatDate(record.expectedReturnDate)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedRecord && (
            <div className="bg-white rounded-2xl p-5 shadow-book border border-cream-200 animate-slide-up">
              <h3 className="font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-forest-500" />
                选择归还方式
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    returnMode === "original"
                      ? "border-forest-400 bg-forest-50"
                      : "border-cream-200 hover:border-cream-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="returnMode"
                    value="original"
                    checked={returnMode === "original"}
                    onChange={() => setReturnMode("original")}
                    className="hidden"
                  />
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        returnMode === "original"
                          ? "bg-forest-500 text-white"
                          : "bg-cream-200 text-gray-600"
                      }`}
                    >
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">放回原柜</p>
                      <p className="text-sm text-gray-500 mt-1">
                        归还到 {originalCabinet?.name || "原柜格"}
                      </p>
                    </div>
                  </div>
                </label>

                <label
                  className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    returnMode === "switch"
                      ? "border-primary-400 bg-primary-50"
                      : "border-cream-200 hover:border-cream-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="returnMode"
                    value="switch"
                    checked={returnMode === "switch"}
                    onChange={() => setReturnMode("switch")}
                    className="hidden"
                  />
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        returnMode === "switch"
                          ? "bg-primary-500 text-white"
                          : "bg-cream-200 text-gray-600"
                      }`}
                    >
                      <Shuffle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">换柜归还</p>
                      <p className="text-sm text-gray-500 mt-1">
                        选择其他有空位的柜格
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {returnMode === "switch" && (
                <div className="mt-5 animate-slide-up">
                  <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    选择目标柜格
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                    {availableCabinets.length === 0 ? (
                      <p className="col-span-full text-sm text-gray-500 text-center py-4">
                        暂无空位柜格，请选择放回原柜
                      </p>
                    ) : (
                      availableCabinets.map((cab) => {
                        const count = books.filter(
                          (b) => b.cabinetId === cab.id
                        ).length;
                        return (
                          <label
                            key={cab.id}
                            className={`cursor-pointer p-3 rounded-lg border text-sm transition-all ${
                              targetCabinetId === cab.id
                                ? "bg-primary-500 text-white border-primary-500 shadow-md"
                                : "bg-cream-50 border-cream-200 hover:border-primary-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="cabinet"
                              value={cab.id}
                              checked={targetCabinetId === cab.id}
                              onChange={(e) => setTargetCabinetId(e.target.value)}
                              className="hidden"
                            />
                            <p className="font-medium">{cab.name}</p>
                            <p
                              className={`text-xs mt-0.5 ${
                                targetCabinetId === cab.id
                                  ? "text-primary-100"
                                  : "text-gray-500"
                              }`}
                            >
                              空位 {cab.capacity - count}
                            </p>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {(selectedRecordId &&
            (returnMode === "original" || targetCabinetId)) && (
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-forest-500 to-forest-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-forest-600 hover:to-forest-700 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 animate-slide-up"
            >
              {submitting ? (
                "处理中..."
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  确认归还
                </>
              )}
            </button>
          )}
        </form>
      )}

      {showToast && (
        <Toast
          message="归还成功！感谢你让图书继续漂流～"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
