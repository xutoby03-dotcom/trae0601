import { useState, useMemo } from "react";
import { Search, QrCode, Check, X, User, Package, Hash, Clock, ArrowRight, RotateCcw, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { recommendSize } from "@/utils/recommend";
import { formatDateTime } from "@/utils/formatters";
import type { Student, ClothingCategory, ClothingItem } from "@/types";

const CATEGORIES: ClothingCategory[] = ["上衣", "裙裤", "鞋子", "领结", "发饰"];

export default function DistributeCenter() {
  const {
    students,
    clothingItems,
    distributions,
    addDistribution,
    markReturned,
    updateClothingItem,
    addProcessRecord,
  } = useAppStore();

  const [searchInput, setSearchInput] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isFit, setIsFit] = useState(true);
  const [setNumber, setSetNumber] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchInput.trim()) return [];
    const q = searchInput.toLowerCase();
    return students
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.className.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.contact.includes(q)
      )
      .slice(0, 8);
  }, [searchInput, students]);

  const distributedIds = new Set(distributions.map((d) => d.studentId));
  const studentDistributions = selectedStudent
    ? distributions.filter((d) => d.studentId === selectedStudent.id)
    : [];

  const recommendedSizes = useMemo(() => {
    if (!selectedStudent) return [];
    return CATEGORIES.map((cat) => {
      const recSize = recommendSize(selectedStudent, cat);
      const matchingItems = clothingItems.filter(
        (i) => i.category === cat && i.size === recSize && i.status === "完好"
      );
      const available = matchingItems.reduce((s, i) => s + i.quantity, 0);
      const matchedItem = matchingItems.find((i) => i.quantity > 0) || null;
      return {
        category: cat,
        recommended: recSize,
        available,
        matchedItem,
      };
    });
  }, [selectedStudent, clothingItems]);

  const allInStock = recommendedSizes.length > 0 && recommendedSizes.every((r) => r.available > 0);
  const outOfStockCategories = recommendedSizes.filter((r) => r.available <= 0);

  const todayDistributions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return distributions
      .filter((d) => new Date(d.distributedAt) >= today)
      .sort((a, b) => (a.distributedAt < b.distributedAt ? 1 : -1));
  }, [distributions]);

  const deductInventory = (items: { matchedItem: ClothingItem | null }[]) => {
    items.forEach(({ matchedItem }) => {
      if (matchedItem && matchedItem.quantity > 0) {
        updateClothingItem(matchedItem.id, { quantity: matchedItem.quantity - 1 });
      }
    });
  };

  const restoreInventory = (clothingIds: string[]) => {
    clothingIds.forEach((cid) => {
      const item = clothingItems.find((i) => i.id === cid);
      if (item) {
        updateClothingItem(cid, { quantity: item.quantity + 1 });
      }
    });
  };

  const handleDistribute = () => {
    if (!selectedStudent || !allInStock) return;

    const clothingIds = recommendedSizes
      .map((r) => r.matchedItem?.id)
      .filter(Boolean) as string[];

    const finalSetNumber = setNumber || `SET-${String(distributions.length + 1).padStart(3, "0")}`;

    deductInventory(recommendedSizes);

    addDistribution({
      studentId: selectedStudent.id,
      clothingIds,
      setNumber: finalSetNumber,
      isFit,
      distributedBy: "李老师",
      isReturned: false,
    });

    if (!isFit) {
      const unfitCategories = CATEGORIES.filter((cat) => {
        const rec = recommendedSizes.find((r) => r.category === cat);
        return rec && rec.matchedItem;
      });

      const recordType = selectedStudent.needAlter ? "改衣" : "换码";
      const desc = selectedStudent.needAlter
        ? `${selectedStudent.name}（${selectedStudent.className}）试穿不合身，需改衣处理`
        : `${selectedStudent.name}（${selectedStudent.className}）试穿不合身，需更换尺码`;

      addProcessRecord({
        type: recordType,
        studentId: selectedStudent.id,
        clothingId: unfitCategories.length > 0
          ? recommendedSizes.find((r) => r.category === unfitCategories[0])?.matchedItem?.id
          : undefined,
        description: desc,
        status: "待处理",
        operator: "李老师",
      });
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedStudent(null);
      setSearchInput("");
      setIsFit(true);
      setSetNumber("");
    }, 2000);
  };

  const handleReturn = (distributionId: string) => {
    const dist = distributions.find((d) => d.id === distributionId);
    if (!dist) return;

    const student = students.find((s) => s.id === dist.studentId);

    markReturned(distributionId);

    restoreInventory(dist.clothingIds);

    addProcessRecord({
      type: "归还清洗",
      studentId: dist.studentId,
      clothingId: dist.clothingIds.length > 0 ? dist.clothingIds[0] : undefined,
      description: `${student?.name || "学生"}归还套装 ${dist.setNumber}，待清洗入库`,
      status: "待处理",
      operator: "李老师",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-slide-up">
      <div className="lg:col-span-3 space-y-6">
        <div className="card-static p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shadow-lg shadow-primary-600/30">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">扫码/搜索学生</h2>
              <p className="text-sm text-slate-500">输入学生编号、姓名或班级进行查找</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setSelectedStudent(null);
              }}
              placeholder="请输入学生编号或姓名...  (模拟扫码输入)"
              className="input-field pl-14 !py-4 !text-lg focus:ring-primary-500/40"
              autoFocus
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center animate-pulse-slow">
                <QrCode className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {searchResults.length > 0 && !selectedStudent && (
            <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden">
              {searchResults.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedStudent(s);
                    setSearchInput("");
                  }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-primary-50 transition-colors text-left border-b border-slate-100 last:border-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <span className="font-semibold text-primary-700">{s.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{s.name}</span>
                      <span className="text-xs text-slate-500">{s.id}</span>
                    </div>
                    <p className="text-sm text-slate-500">{s.className} · {s.voicePart} · {s.height}cm/{s.weight}kg</p>
                  </div>
                  {distributedIds.has(s.id) ? (
                    <span className="badge bg-green-100 text-green-700">已领取</span>
                  ) : (
                    <span className="badge bg-amber-100 text-amber-700">待领取</span>
                  )}
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedStudent && (
          <div className="card-static p-6 animate-fade-slide-up">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <span className="text-2xl font-bold text-white">{selectedStudent.name[0]}</span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-slate-900">{selectedStudent.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedStudent.className} · {selectedStudent.voicePart} · {selectedStudent.contact}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge bg-primary-100 text-primary-700">{selectedStudent.height}cm</span>
                    <span className="badge bg-accent-100 text-accent-700">{selectedStudent.weight}kg</span>
                    <span className="badge bg-blue-100 text-blue-700">鞋码 {selectedStudent.shoeSize}</span>
                    {selectedStudent.needAlter && (
                      <span className="badge bg-purple-100 text-purple-700">需改裤长</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600" />
              推荐服装尺码
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {recommendedSizes.map((r) => (
                <div
                  key={r.category}
                  className={`rounded-xl border p-4 text-center transition-colors ${
                    r.available > 0
                      ? "bg-gradient-to-br from-slate-50 to-primary-50/30 border-primary-100"
                      : "bg-gradient-to-br from-red-50 to-red-100/30 border-red-200"
                  }`}
                >
                  <p className="text-xs text-slate-500 mb-1">{r.category}</p>
                  <p className={`text-2xl font-display font-bold ${r.available > 0 ? "text-primary-700" : "text-red-500"}`}>
                    {r.recommended}
                  </p>
                  <p className={`text-xs mt-1 ${r.available > 0 ? "text-green-600" : "text-red-500 font-semibold"}`}>
                    {r.available > 0 ? `库存 ${r.available} 件` : "库存不足"}
                  </p>
                </div>
              ))}
            </div>

            {!allInStock && outOfStockCategories.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">库存不足，无法发放</p>
                  <p className="text-xs text-red-600 mt-1">
                    以下品类缺货：
                    {outOfStockCategories.map((r) => `${r.category}(${r.recommended}码)`).join("、")}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div>
                <label className="label flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  套装编号
                </label>
                <input
                  type="text"
                  value={setNumber}
                  onChange={(e) => setSetNumber(e.target.value)}
                  placeholder={`留空则自动生成 (SET-${String(distributions.length + 1).padStart(3, "0")})`}
                  className="input-field"
                />
              </div>

              <label
                className={`flex items-center gap-3 cursor-pointer p-4 rounded-xl transition-colors ${
                  isFit ? "bg-slate-50 hover:bg-slate-100" : "bg-amber-50 border border-amber-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isFit}
                  onChange={(e) => setIsFit(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <p className="font-medium text-slate-900">试穿合身</p>
                  <p className="text-xs text-slate-500">
                    {isFit
                      ? "取消勾选将自动登记换码或改衣记录"
                      : selectedStudent?.needAlter
                        ? "将自动生成改衣记录"
                        : "将自动生成换码记录"}
                  </p>
                </div>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setSearchInput("");
                  }}
                  className="btn-secondary flex-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  重新选择
                </button>
                <button
                  onClick={handleDistribute}
                  disabled={!allInStock}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 ${
                    allInStock
                      ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-0.5 active:scale-[0.97]"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <Check className="w-5 h-5" />
                  {allInStock ? "确认发放" : "库存不足"}
                </button>
              </div>
            </div>

            {studentDistributions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h5 className="font-semibold text-slate-900 mb-3">历史发放记录</h5>
                <div className="space-y-2">
                  {studentDistributions.map((d) => (
                    <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div>
                        <p className="text-sm font-medium text-slate-900">套装 {d.setNumber}</p>
                        <p className="text-xs text-slate-500">{formatDateTime(d.distributedAt)} · {d.distributedBy}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {d.isFit ? (
                          <span className="badge bg-green-100 text-green-700">合身</span>
                        ) : (
                          <span className="badge bg-amber-100 text-amber-700">需调整</span>
                        )}
                        {d.isReturned ? (
                          <span className="badge bg-slate-100 text-slate-700">已归还</span>
                        ) : (
                          <button
                            onClick={() => handleReturn(d.id)}
                            className="btn-secondary !py-1.5 !px-3 !text-xs"
                          >
                            归还
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {showSuccess && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
            <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-green-500 text-white shadow-xl shadow-green-500/30">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">发放成功</p>
                <p className="text-sm text-white/90">
                  服装已发放给 {selectedStudent?.name}
                  {!isFit && "（已自动登记调整记录）"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        <div className="card-static p-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent-500" />
              今日发放记录
            </h3>
            <span className="badge bg-primary-100 text-primary-700">{todayDistributions.length} 条</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {todayDistributions.length > 0 ? (
              todayDistributions.map((d) => {
                const student = students.find((s) => s.id === d.studentId);
                return (
                  <div key={d.id} className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-700" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{student?.name || "未知学生"}</p>
                        <p className="text-xs text-slate-500">{formatDateTime(d.distributedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="badge bg-slate-100 text-slate-700">{d.setNumber}</span>
                      {d.isFit ? (
                        <span className="badge bg-green-100 text-green-700">合身</span>
                      ) : (
                        <span className="badge bg-amber-100 text-amber-700">需调整</span>
                      )}
                      {d.isReturned ? (
                        <span className="badge bg-slate-100 text-slate-500">已归还</span>
                      ) : (
                        <span className="badge bg-blue-100 text-blue-700">使用中</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center text-slate-400">
                <Clock className="w-12 h-12 mx-auto mb-3" />
                <p className="text-sm">今日暂无发放记录</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
