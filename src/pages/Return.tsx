import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RotateCcw,
  Ban,
  CreditCard,
  User,
  Building2,
  Phone,
  MapPin,
  Banknote,
  Clock,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { useCardStore } from "@/store/cardStore";
import { BorrowRecord, DepositRefundType, LostFormData } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import CardTypeBadge from "@/components/CardTypeBadge";
import {
  getRemainingTime,
  isOverdue,
  formatDateTime,
} from "@/utils/dateUtils";

type Mode = "search" | "return" | "lost";

export default function Return() {
  const navigate = useNavigate();
  const {
    getActiveRecordByCardNumber,
    returnCard,
    reportLost,
    getOverdueRecords,
  } = useCardStore();

  const [searchCardNumber, setSearchCardNumber] = useState("");
  const [searchError, setSearchError] = useState("");
  const [foundRecord, setFoundRecord] = useState<BorrowRecord | null>(null);
  const [mode, setMode] = useState<Mode>("search");
  const [showSuccess, setShowSuccess] = useState("");

  const [lostForm, setLostForm] = useState<LostFormData>({
    lostReason: "",
    depositRefundType: "full",
    partialRefundAmount: 0,
  });
  const [lostErrors, setLostErrors] = useState<Record<string, string>>({});

  const overdueRecords = getOverdueRecords();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cardNumber = searchCardNumber.trim().toUpperCase();
    if (!cardNumber) {
      setSearchError("请输入卡号");
      return;
    }
    const record = getActiveRecordByCardNumber(cardNumber);
    if (!record) {
      setSearchError("未找到该卡号的借用记录，或卡片已归还/挂失");
      setFoundRecord(null);
      return;
    }
    setSearchError("");
    setFoundRecord(record);
    setMode("return");
  };

  const handleReturn = () => {
    if (!foundRecord) return;
    returnCard(foundRecord.id);
    setShowSuccess("return");
    setTimeout(() => {
      setShowSuccess("");
      navigate("/");
    }, 1500);
  };

  const handleStartLost = () => {
    setMode("lost");
  };

  const validateLostForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!lostForm.lostReason.trim()) {
      errors.lostReason = "请填写挂失原因";
    }
    if (
      lostForm.depositRefundType === "partial" &&
      (!lostForm.partialRefundAmount || lostForm.partialRefundAmount <= 0)
    ) {
      errors.partialRefundAmount = "请输入退还金额";
    }
    if (
      lostForm.depositRefundType === "partial" &&
      foundRecord &&
      lostForm.partialRefundAmount! > foundRecord.deposit
    ) {
      errors.partialRefundAmount = "退还金额不能超过押金总额";
    }
    setLostErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmLost = () => {
    if (!foundRecord) return;
    if (!validateLostForm()) return;

    const finalData: LostFormData = {
      lostReason: lostForm.lostReason.trim(),
      depositRefundType: lostForm.depositRefundType,
    };
    if (lostForm.depositRefundType === "partial") {
      finalData.partialRefundAmount = lostForm.partialRefundAmount;
    }

    reportLost(foundRecord.id, finalData);
    setShowSuccess("lost");
    setTimeout(() => {
      setShowSuccess("");
      navigate("/");
    }, 1500);
  };

  const handleBackToSearch = () => {
    setMode("search");
    setFoundRecord(null);
    setSearchCardNumber("");
    setSearchError("");
    setLostForm({
      lostReason: "",
      depositRefundType: "full",
      partialRefundAmount: 0,
    });
    setLostErrors({});
  };

  const getRefundAmount = (): number => {
    if (!foundRecord) return 0;
    if (lostForm.depositRefundType === "full") return foundRecord.deposit;
    if (lostForm.depositRefundType === "none") return 0;
    return lostForm.partialRefundAmount || 0;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {showSuccess && (
        <div className="fixed top-24 right-8 z-50 animate-slide-up">
          <div
            className={`${
              showSuccess === "return" ? "bg-teal-600" : "bg-orange-500"
            } text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3`}
          >
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold">
                {showSuccess === "return" ? "归还成功" : "挂失成功"}
              </div>
              <div className="text-sm text-white/80">正在返回首页...</div>
            </div>
          </div>
        </div>
      )}

      {overdueRecords.length > 0 && mode === "search" && (
        <div className="card-panel p-5 bg-red-50/50 border-red-200">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-red-800">
                有 {overdueRecords.length} 张卡片已超时未归还
              </div>
              <div className="text-sm text-red-600 mt-1">
                请及时联系借用人归还或处理
              </div>
              <div className="mt-3 space-y-2">
                {overdueRecords.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-red-100"
                  >
                    <span className="font-mono font-medium text-sm text-zinc-900">
                      {r.cardNumber}
                    </span>
                    <CardTypeBadge type={r.cardType} />
                    <span className="text-sm text-zinc-600">{r.borrowerName}</span>
                    <span className="text-sm text-zinc-500">{r.department}</span>
                    <span className="text-xs text-red-600 ml-auto">
                      超时 {getRemainingTime(r.expectedReturnTime)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === "search" && (
        <div className="card-panel p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">查询卡号</h2>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                value={searchCardNumber}
                onChange={(e) => {
                  setSearchCardNumber(e.target.value);
                  if (searchError) setSearchError("");
                }}
                placeholder="输入卡号，如：E001 或 V001"
                className={`w-full pl-12 pr-32 py-3.5 bg-zinc-50 border-2 ${
                  searchError
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : "border-zinc-200 focus:border-brand-500 focus:ring-brand-100"
                } rounded-xl text-base font-medium text-zinc-800 placeholder-zinc-400 transition-all focus:outline-none focus:ring-2`}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-5"
              >
                查询
              </button>
            </div>
            {searchError && (
              <p className="text-sm text-red-500 mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                {searchError}
              </p>
            )}
          </form>
        </div>
      )}

      {foundRecord && (mode === "return" || mode === "lost") && (
        <>
          <div className="card-panel p-6">
            <div className="flex items-start justify-between mb-5 pb-4 border-b border-zinc-100">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-zinc-900 text-lg">
                    借用详情
                  </h2>
                  <StatusBadge record={foundRecord} />
                  <CardTypeBadge type={foundRecord.cardType} />
                </div>
                {foundRecord.status === "active" &&
                  isOverdue(foundRecord.expectedReturnTime) && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      已超时 {getRemainingTime(foundRecord.expectedReturnTime)}
                    </p>
                  )}
              </div>
              <button
                onClick={handleBackToSearch}
                className="text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <InfoRow icon={CreditCard} label="卡号" value={foundRecord.cardNumber} mono />
              <InfoRow icon={MapPin} label="权限区域" value={foundRecord.accessArea} />
              <InfoRow icon={User} label="借用人" value={foundRecord.borrowerName} />
              <InfoRow icon={Building2} label="部门" value={foundRecord.department} />
              <InfoRow icon={Phone} label="联系方式" value={foundRecord.contact} />
              <InfoRow
                icon={Banknote}
                label="押金"
                value={
                  foundRecord.deposit > 0
                    ? `¥ ${foundRecord.deposit.toFixed(2)}`
                    : "无押金"
                }
              />
              <InfoRow icon={Clock} label="借出时间" value={foundRecord.borrowTime} mono />
              <InfoRow
                icon={Clock}
                label="预计归还"
                value={foundRecord.expectedReturnTime}
                mono
                highlight={isOverdue(foundRecord.expectedReturnTime) ? "red" : undefined}
              />
            </div>
          </div>

          {mode === "return" && (
            <div className="card-panel p-6 bg-teal-50/30 border-teal-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5 text-teal-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-zinc-900">确认归还</h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    {foundRecord.deposit > 0
                      ? `需退还押金 ¥${foundRecord.deposit.toFixed(2)}`
                      : "该卡片无押金，直接确认归还即可"}
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <button onClick={handleReturn} className="btn-success">
                      <Check className="w-4 h-4 mr-1.5" />
                      确认归还并退还押金
                    </button>
                    <button onClick={handleStartLost} className="btn-warning">
                      <Ban className="w-4 h-4 mr-1.5" />
                      卡片丢失，挂失处理
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === "lost" && (
            <div className="card-panel p-6 bg-orange-50/30 border-orange-100">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                  <Ban className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900">挂失登记</h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    请填写挂失原因并选择押金处理方式
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="label-field">
                    挂失原因 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={lostForm.lostReason}
                    onChange={(e) => {
                      setLostForm((p) => ({ ...p, lostReason: e.target.value }));
                      if (lostErrors.lostReason) {
                        setLostErrors((p) => {
                          const n = { ...p };
                          delete n.lostReason;
                          return n;
                        });
                      }
                    }}
                    rows={3}
                    placeholder="请说明卡片丢失原因，如：借用人遗失、损坏等"
                    className={`input-field resize-none ${
                      lostErrors.lostReason ? "border-red-400" : ""
                    }`}
                  />
                  {lostErrors.lostReason && (
                    <p className="text-xs text-red-500 mt-1">{lostErrors.lostReason}</p>
                  )}
                </div>

                {foundRecord.deposit > 0 ? (
                  <div>
                    <label className="label-field">押金处理方式</label>
                    <div className="space-y-2">
                      <label className="flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-zinc-50">
                        <input
                          type="radio"
                          name="refund"
                          checked={lostForm.depositRefundType === "full"}
                          onChange={() =>
                            setLostForm((p) => ({ ...p, depositRefundType: "full" }))
                          }
                          className="mt-0.5 w-4 h-4 text-brand-600"
                        />
                        <div>
                          <div className="font-medium text-zinc-900">全额退还</div>
                          <div className="text-sm text-zinc-500 mt-0.5">
                            退还押金 ¥{foundRecord.deposit.toFixed(2)}
                          </div>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-zinc-50">
                        <input
                          type="radio"
                          name="refund"
                          checked={lostForm.depositRefundType === "partial"}
                          onChange={() =>
                            setLostForm((p) => ({ ...p, depositRefundType: "partial" }))
                          }
                          className="mt-0.5 w-4 h-4 text-brand-600"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-zinc-900">部分退还</div>
                          {lostForm.depositRefundType === "partial" && (
                            <div className="mt-2">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                  ¥
                                </span>
                                <input
                                  type="number"
                                  min={0}
                                  max={foundRecord.deposit}
                                  value={lostForm.partialRefundAmount}
                                  onChange={(e) =>
                                    setLostForm((p) => ({
                                      ...p,
                                      partialRefundAmount: Number(e.target.value) || 0,
                                    }))
                                  }
                                  className={`input-field pl-7 w-40 ${
                                    lostErrors.partialRefundAmount
                                      ? "border-red-400"
                                      : ""
                                  }`}
                                />
                              </div>
                              {lostErrors.partialRefundAmount && (
                                <p className="text-xs text-red-500 mt-1">
                                  {lostErrors.partialRefundAmount}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </label>
                      <label className="flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-zinc-50">
                        <input
                          type="radio"
                          name="refund"
                          checked={lostForm.depositRefundType === "none"}
                          onChange={() =>
                            setLostForm((p) => ({ ...p, depositRefundType: "none" }))
                          }
                          className="mt-0.5 w-4 h-4 text-brand-600"
                        />
                        <div>
                          <div className="font-medium text-zinc-900">不予退还</div>
                          <div className="text-sm text-zinc-500 mt-0.5">
                            没收押金 ¥{foundRecord.deposit.toFixed(2)}
                          </div>
                        </div>
                      </label>
                    </div>
                    <div className="mt-4 p-4 bg-white rounded-xl border border-orange-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">实际退还押金</span>
                        <span className="font-semibold text-zinc-900">
                          ¥{getRefundAmount().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-xl border border-orange-100 text-sm text-zinc-500">
                    该卡片无押金，无需处理押金退还
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setMode("return")}
                    className="btn-secondary"
                  >
                    返回
                  </button>
                  <button onClick={handleConfirmLost} className="btn-warning">
                    <Ban className="w-4 h-4 mr-1.5" />
                    确认挂失
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface InfoRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
  highlight?: "red";
}

function InfoRow({ icon: Icon, label, value, mono, highlight }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-zinc-500" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-zinc-400">{label}</div>
        <div
          className={`text-sm font-medium mt-0.5 ${mono ? "font-mono" : ""} ${
            highlight === "red" ? "text-red-600" : "text-zinc-900"
          }`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
