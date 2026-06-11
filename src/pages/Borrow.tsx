import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  User,
  MapPin,
  Banknote,
  Clock,
  Building2,
  Phone,
  Check,
} from "lucide-react";
import { useCardStore } from "@/store/cardStore";
import { BorrowFormData, CardType } from "@/types";
import {
  formatDateTimeLocal,
  addHours,
  parseDateTimeLocal,
} from "@/utils/dateUtils";

export default function Borrow() {
  const navigate = useNavigate();
  const { addBorrowRecord, getCardByNumber } = useCardStore();
  const [showSuccess, setShowSuccess] = useState(false);

  const now = new Date();
  const defaultBorrowTime = formatDateTimeLocal(now);
  const defaultExpectedTime = formatDateTimeLocal(addHours(now, 4));

  const [formData, setFormData] = useState<BorrowFormData>({
    cardNumber: "",
    cardType: "employee",
    accessArea: "全楼层",
    deposit: 0,
    borrowerName: "",
    department: "",
    contact: "",
    borrowTime: defaultBorrowTime,
    expectedReturnTime: defaultExpectedTime,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCardTypeChange = (type: CardType) => {
    setFormData((prev) => ({
      ...prev,
      cardType: type,
      deposit: type === "visitor" ? 50 : 0,
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = "请输入卡号";
    } else {
      const cardNumber = formData.cardNumber.trim().toUpperCase();
      const existingCard = getCardByNumber(cardNumber);
      if (existingCard) {
        if (existingCard.status === "lost") {
          newErrors.cardNumber = "该卡片已挂失，不能借用";
        } else if (existingCard.status !== "available") {
          newErrors.cardNumber = "该卡号当前正在使用中";
        }
      }
    }

    if (!formData.accessArea.trim()) {
      newErrors.accessArea = "请输入权限区域";
    }

    if (!formData.borrowerName.trim()) {
      newErrors.borrowerName = "请输入借用人姓名";
    }

    if (!formData.department.trim()) {
      newErrors.department = "请输入部门";
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "请输入联系方式";
    }

    if (!formData.borrowTime) {
      newErrors.borrowTime = "请选择借出时间";
    }

    if (!formData.expectedReturnTime) {
      newErrors.expectedReturnTime = "请选择预计归还时间";
    } else if (
      formData.borrowTime &&
      new Date(formData.expectedReturnTime) <= new Date(formData.borrowTime)
    ) {
      newErrors.expectedReturnTime = "预计归还时间需晚于借出时间";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData: BorrowFormData = {
      ...formData,
      cardNumber: formData.cardNumber.trim().toUpperCase(),
      borrowTime: parseDateTimeLocal(formData.borrowTime),
      expectedReturnTime: parseDateTimeLocal(formData.expectedReturnTime),
    };

    addBorrowRecord(submitData);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      navigate("/");
    }, 1500);
  };

  const updateField = <K extends keyof BorrowFormData>(
    key: K,
    value: BorrowFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {showSuccess && (
        <div className="fixed top-24 right-8 z-50 animate-slide-up">
          <div className="bg-teal-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold">登记成功</div>
              <div className="text-sm text-teal-100">正在返回首页...</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-panel p-6">
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-zinc-100">
            <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-brand-700" />
            </div>
            <h2 className="font-semibold text-zinc-900">卡片信息</h2>
          </div>

          <div className="mb-5">
            <label className="label-field">卡类型</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleCardTypeChange("employee")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.cardType === "employee"
                    ? "border-brand-600 bg-brand-50"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div
                  className={`font-semibold ${
                    formData.cardType === "employee"
                      ? "text-brand-700"
                      : "text-zinc-900"
                  }`}
                >
                  员工临时卡
                </div>
                <div className="text-sm text-zinc-500 mt-1">
                  内部员工未带工牌使用，无押金
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleCardTypeChange("visitor")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.cardType === "visitor"
                    ? "border-amber-500 bg-amber-50"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div
                  className={`font-semibold ${
                    formData.cardType === "visitor"
                      ? "text-amber-700"
                      : "text-zinc-900"
                  }`}
                >
                  访客卡
                </div>
                <div className="text-sm text-zinc-500 mt-1">
                  外来访客使用，需收取押金
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="label-field">
                卡号 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => updateField("cardNumber", e.target.value)}
                  placeholder="如：E001 或 V001"
                  className={`input-field pl-9 ${
                    errors.cardNumber ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""
                  }`}
                />
              </div>
              {errors.cardNumber && (
                <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>
              )}
            </div>

            <div>
              <label className="label-field">
                权限区域 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <select
                  value={formData.accessArea}
                  onChange={(e) => updateField("accessArea", e.target.value)}
                  className={`input-field pl-9 ${
                    errors.accessArea ? "border-red-400" : ""
                  }`}
                >
                  <option value="全楼层">全楼层</option>
                  <option value="1-3层办公区">1-3层办公区</option>
                  <option value="1-5层办公区">1-5层办公区</option>
                  <option value="仅会议区">仅会议区</option>
                  <option value="仅大堂">仅大堂</option>
                </select>
              </div>
              {errors.accessArea && (
                <p className="text-xs text-red-500 mt-1">{errors.accessArea}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="label-field">
                押金金额（元）
              </label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="number"
                  min={0}
                  value={formData.deposit}
                  onChange={(e) =>
                    updateField("deposit", Number(e.target.value) || 0)
                  }
                  className="input-field pl-9"
                  disabled={formData.cardType === "employee"}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {formData.cardType === "employee"
                  ? "员工临时卡无需收取押金"
                  : "访客卡通常收取 50-100 元押金"}
              </p>
            </div>
          </div>
        </div>

        <div className="card-panel p-6">
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-zinc-100">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-teal-700" />
            </div>
            <h2 className="font-semibold text-zinc-900">借用人信息</h2>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="label-field">
                姓名 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={formData.borrowerName}
                  onChange={(e) => updateField("borrowerName", e.target.value)}
                  placeholder="请输入姓名"
                  className={`input-field pl-9 ${
                    errors.borrowerName ? "border-red-400" : ""
                  }`}
                />
              </div>
              {errors.borrowerName && (
                <p className="text-xs text-red-500 mt-1">{errors.borrowerName}</p>
              )}
            </div>

            <div>
              <label className="label-field">
                部门 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => updateField("department", e.target.value)}
                  placeholder={formData.cardType === "visitor" ? "来访部门（如：技术部来访）" : "所属部门"}
                  className={`input-field pl-9 ${
                    errors.department ? "border-red-400" : ""
                  }`}
                />
              </div>
              {errors.department && (
                <p className="text-xs text-red-500 mt-1">{errors.department}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="label-field">
                联系方式 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="tel"
                  value={formData.contact}
                  onChange={(e) => updateField("contact", e.target.value)}
                  placeholder="手机号或分机号"
                  className={`input-field pl-9 ${
                    errors.contact ? "border-red-400" : ""
                  }`}
                />
              </div>
              {errors.contact && (
                <p className="text-xs text-red-500 mt-1">{errors.contact}</p>
              )}
            </div>
          </div>
        </div>

        <div className="card-panel p-6">
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-zinc-100">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <h2 className="font-semibold text-zinc-900">时间信息</h2>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="label-field">
                借出时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.borrowTime}
                onChange={(e) => updateField("borrowTime", e.target.value)}
                className={`input-field ${errors.borrowTime ? "border-red-400" : ""}`}
              />
              {errors.borrowTime && (
                <p className="text-xs text-red-500 mt-1">{errors.borrowTime}</p>
              )}
            </div>

            <div>
              <label className="label-field">
                预计归还时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.expectedReturnTime}
                onChange={(e) => updateField("expectedReturnTime", e.target.value)}
                className={`input-field ${errors.expectedReturnTime ? "border-red-400" : ""}`}
              />
              {errors.expectedReturnTime && (
                <p className="text-xs text-red-500 mt-1">{errors.expectedReturnTime}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="btn-secondary"
          >
            取消
          </button>
          <button type="submit" className="btn-primary">
            确认登记
          </button>
        </div>
      </form>
    </div>
  );
}
