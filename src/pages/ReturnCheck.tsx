import { useMemo, useState } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Package,
  MapPin,
  Star,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  FileCheck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import type { LendRecord } from "@/types";
import {
  formatDateTime,
  lendStatusLabel,
  lendStatusClass,
  overdueDays,
} from "@/utils/format";

interface CheckState {
  basketDamaged: boolean;
  damageNote: string;
  itemsCleared: boolean;
  returnedToLocation: boolean;
  actualLocation: string;
}

export default function ReturnCheck() {
  const { lendRecords, baskets, returnBasket } = useStore();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [checkStates, setCheckStates] = useState<Record<string, CheckState>>({});
  const [toast, setToast] = useState("");

  const activeRecords = useMemo(
    () =>
      lendRecords
        .filter((r) => r.status === "active" || r.status === "overdue")
        .sort((a, b) => {
          const aOver = a.status === "overdue";
          const bOver = b.status === "overdue";
          if (aOver !== bOver) return aOver ? -1 : 1;
          return +new Date(a.lendTime) - +new Date(b.lendTime);
        }),
    [lendRecords]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return activeRecords;
    const q = search.toLowerCase();
    return activeRecords.filter(
      (r) =>
        r.borrowerName.toLowerCase().includes(q) ||
        (r.basketCode || "").toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q)
    );
  }, [activeRecords, search]);

  const getCheckState = (id: string): CheckState =>
    checkStates[id] || {
      basketDamaged: false,
      damageNote: "",
      itemsCleared: false,
      returnedToLocation: false,
      actualLocation: "",
    };

  const setCheck = (id: string, patch: Partial<CheckState>) => {
    setCheckStates((prev) => ({
      ...prev,
      [id]: { ...getCheckState(id), ...patch },
    }));
  };

  const basket = (rid: string) => {
    const r = lendRecords.find((x) => x.id === rid);
    return r ? baskets.find((b) => b.id === r.basketId) : undefined;
  };

  const handleReturn = (record: LendRecord) => {
    const c = getCheckState(record.id);
    if (!c.itemsCleared) {
      setToast("请确认物品已全部清空");
      setTimeout(() => setToast(""), 2500);
      return;
    }
    if (!c.returnedToLocation && !c.actualLocation.trim()) {
      setToast("未放回原位时，请填写实际放置位置");
      setTimeout(() => setToast(""), 2500);
      return;
    }
    returnBasket({
      lendRecordId: record.id,
      basketDamaged: c.basketDamaged,
      damageNote: c.damageNote.trim() || undefined,
      itemsCleared: c.itemsCleared,
      returnedToLocation: c.returnedToLocation,
      actualLocation: c.actualLocation.trim() || undefined,
      checker: "行政管理员",
    });
    setToast(`篮子 ${record.basketCode} 归还登记成功！`);
    setTimeout(() => {
      setToast("");
      setExpanded(null);
    }, 1500);
  };

  return (
    <div className="space-y-5 animate-slide-up max-w-4xl mx-auto">
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg bg-steel-700 text-white text-sm font-medium animate-slide-up flex items-center gap-2">
          {toast.includes("成功") ? (
            <CheckCircle2 className="w-4 h-4 text-forest-300" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-300" />
          )}
          {toast}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-forest-50 to-white border-b border-slate2-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div>
              <h3 className="font-display font-semibold text-slate2-800 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-forest-600" />
                待归还篮子列表
              </h3>
              <p className="text-xs text-slate2-500 mt-0.5">
                共 <b className="font-mono text-forest-600">{activeRecords.length}</b> 只篮子借出中，请逐一核验后归还
              </p>
            </div>
            <div className="relative sm:min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate2-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索借用人、编号、部门..."
                className="input-base pl-10"
              />
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3 max-h-[calc(100vh-260px)] overflow-y-auto scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              {activeRecords.length === 0 ? (
                <>
                  <CheckCircle2 className="w-14 h-14 text-forest-300 mx-auto mb-3" />
                  <p className="text-slate2-500">当前没有待归还的篮子</p>
                  <p className="text-xs text-slate2-400 mt-1">所有篮子均已归还</p>
                </>
              ) : (
                <p className="text-slate2-500">没有匹配的记录，请调整搜索词</p>
              )}
            </div>
          ) : (
            filtered.map((r) => {
              const isExpanded = expanded === r.id;
              const check = getCheckState(r.id);
              const b = basket(r.id);
              const overdue = overdueDays(r.expectedReturnTime);
              const allOk = check.itemsCleared && (check.returnedToLocation || check.actualLocation.trim());
              return (
                <div
                  key={r.id}
                  className={`rounded-lg border transition-all overflow-hidden ${
                    r.status === "overdue"
                      ? "border-signal-200 bg-gradient-to-r from-signal-50/50 to-white"
                      : "border-slate2-200 bg-white"
                  }`}
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-slate2-50/70 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : r.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className="w-12 h-12 rounded-lg border-2 border-white shadow-md flex-shrink-0"
                          style={{ background: b?.colorHex || "#94a3b8" }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono font-bold text-slate2-800 text-sm">
                              {r.basketCode}
                            </span>
                            <span
                              className={`status-badge !text-[10px] ${lendStatusClass[r.status]}`}
                            >
                              {r.status === "overdue" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-signal-500 animate-blink-dot" />
                              )}
                              {lendStatusLabel[r.status]}
                              {overdue > 0 && ` · ${overdue}天`}
                            </span>
                            {r.hasValuable && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">
                                <Star className="w-2.5 h-2.5 fill-amber-500" />
                                贵重
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate2-700 truncate">
                            {r.borrowerName} · {r.department}
                          </p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-slate2-500">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {r.destination}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              借出 {formatDateTime(r.lendTime).slice(5)}
                            </span>
                            {b?.defaultLocation && (
                              <span className="inline-flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                应归 {b.defaultLocation}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate2-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate2-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate2-200 bg-white animate-fade-in">
                      <div className="p-4 bg-slate2-50/50 border-b border-slate2-100">
                        <p className="text-xs font-semibold text-slate2-600 mb-2 flex items-center gap-1.5">
                          <FileCheck className="w-3.5 h-3.5" />
                          本次借出物品清单（共 {r.items.length} 项）
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {r.items.map((it) => (
                            <div
                              key={it.id}
                              className={`px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 ${
                                it.isValuable
                                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                                  : "bg-white text-slate2-600 border border-slate2-200"
                              }`}
                            >
                              {it.isValuable && (
                                <Star className="w-3 h-3 fill-amber-500 flex-shrink-0" />
                              )}
                              <span className="font-medium truncate flex-1">
                                {it.itemName}
                              </span>
                              <span className="font-mono text-slate2-500">
                                ×{it.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        <h4 className="font-display font-semibold text-slate2-800 text-sm flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-steel-600" />
                          归还三项检查
                        </h4>

                        <CheckItem
                          label="篮子是否破损"
                          desc="检查篮体、把手、网格有无断裂、变形"
                          value={check.basketDamaged}
                          errorValue={true}
                          onChange={(v) => setCheck(r.id, { basketDamaged: v })}
                        />
                        {check.basketDamaged && (
                          <div className="ml-10 pl-4 border-l-2 border-signal-200 space-y-2 animate-slide-up">
                            <label className="label-base !mb-0 text-xs text-signal-600 font-semibold">
                              <AlertTriangle className="w-3 h-3 inline mr-1" />
                              破损情况说明（登记维修）
                            </label>
                            <textarea
                              value={check.damageNote}
                              onChange={(e) =>
                                setCheck(r.id, { damageNote: e.target.value })
                              }
                              rows={2}
                              placeholder="描述破损位置和程度..."
                              className="input-base resize-none text-sm border-signal-200 focus:ring-signal-300 focus:border-signal-400"
                            />
                          </div>
                        )}

                        <CheckItem
                          label="物品是否全部清空"
                          desc="核对清单，确认篮内无遗留物品"
                          value={check.itemsCleared}
                          errorValue={false}
                          onChange={(v) => setCheck(r.id, { itemsCleared: v })}
                          highlightUnchecked
                        />

                        <CheckItem
                          label="是否放回原位"
                          desc={b?.defaultLocation ? `默认位置：${b.defaultLocation}` : "放回指定存放点"}
                          value={check.returnedToLocation}
                          errorValue={false}
                          onChange={(v) =>
                            setCheck(r.id, {
                              returnedToLocation: v,
                              ...(v ? { actualLocation: "" } : {}),
                            })
                          }
                        />
                        {!check.returnedToLocation && (
                          <div className="ml-10 pl-4 border-l-2 border-amber-200 space-y-2 animate-slide-up">
                            <label className="label-base !mb-0 text-xs text-amber-700 font-semibold">
                              请填写实际放置位置
                            </label>
                            <input
                              value={check.actualLocation}
                              onChange={(e) =>
                                setCheck(r.id, { actualLocation: e.target.value })
                              }
                              placeholder="如：A区储物架临时区、维修间等"
                              className="input-base text-sm border-amber-200 focus:ring-amber-300 focus:border-amber-400"
                            />
                          </div>
                        )}
                      </div>

                      <div className="px-5 pb-5">
                        <button
                          disabled={!allOk}
                          onClick={() => handleReturn(r)}
                          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded text-sm font-semibold transition-all ${
                            allOk
                              ? "text-white bg-forest-500 border-b-[3px] border-b-forest-700 hover:bg-forest-600 hover:translate-y-[-1px] active:translate-y-[1px] active:border-b-[1px]"
                              : "text-slate2-400 bg-slate2-100 cursor-not-allowed"
                          }`}
                        >
                          <CheckCircle className="w-5 h-5" />
                          确认归还 · {check.basketDamaged ? "转维修" : "重置为可用"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function CheckItem({
  label,
  desc,
  value,
  errorValue,
  onChange,
  highlightUnchecked,
}: {
  label: string;
  desc?: string;
  value: boolean;
  errorValue: boolean;
  onChange: (v: boolean) => void;
  highlightUnchecked?: boolean;
}) {
  const isError = value === errorValue;
  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
        isError
          ? highlightUnchecked
            ? "border-amber-200 bg-amber-50/60 hover:bg-amber-50"
            : "border-signal-200 bg-signal-50/60 hover:bg-signal-50"
          : "border-forest-200 bg-forest-50/60 hover:bg-forest-50"
      }`}
      onClick={() => onChange(!value)}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 relative w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            !isError
              ? "border-forest-500 bg-forest-500"
              : highlightUnchecked
              ? "border-amber-400 bg-white"
              : "border-signal-500 bg-signal-500"
          }`}
        >
          {!isError ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : (
            <XCircle
              className={`w-5 h-5 ${
                highlightUnchecked ? "text-amber-400" : "text-white"
              }`}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate2-800 text-sm">{label}</p>
          {desc && <p className="text-xs text-slate2-500 mt-0.5">{desc}</p>}
        </div>
        <div className="flex items-center gap-3 pt-0.5">
          <span
            className={`text-xs font-bold uppercase tracking-wide ${
              !isError ? "text-forest-600" : "text-signal-500"
            }`}
          >
            {isError ? "否 / NO" : "是 / YES"}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(!value);
            }}
            className={`relative w-11 h-6 rounded-full transition-all ${
              !isError ? "bg-forest-500" : "bg-slate2-300"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                !isError ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
