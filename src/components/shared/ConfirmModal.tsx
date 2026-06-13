import { useEffect, type ReactNode } from "react";
import { X, AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfirmVariant = "default" | "danger" | "warning" | "success" | "info";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  hideCancel?: boolean;
}

const variantConfig: Record<
  ConfirmVariant,
  { icon: typeof AlertTriangle; iconBg: string; iconColor: string; confirmClass: string }
> = {
  default: {
    icon: AlertCircle,
    iconBg: "bg-walnut-100",
    iconColor: "text-walnut-600",
    confirmClass: "btn-primary",
  },
  danger: {
    icon: AlertTriangle,
    iconBg: "bg-red-50",
    iconColor: "text-brick-500",
    confirmClass: "btn-danger",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    confirmClass: "btn-warning",
  },
  success: {
    icon: CheckCircle2,
    iconBg: "bg-green-50",
    iconColor: "text-forest-500",
    confirmClass: "btn-success",
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    confirmClass: "btn-primary",
  },
};

export default function ConfirmModal({
  open,
  title,
  description,
  children,
  confirmText = "确认",
  cancelText = "取消",
  variant = "default",
  confirmButtonClass,
  cancelButtonClass,
  onConfirm,
  onCancel,
  loading,
  hideCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onCancel]);

  if (!open) return null;

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="absolute inset-0 bg-walnut-900/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-walnut-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-walnut-400 hover:text-walnut-600 hover:bg-walnut-100 transition-colors z-10"
          aria-label="关闭"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          <div className="flex gap-4">
            <div
              className={cn(
                "w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center",
                config.iconBg
              )}
            >
              <Icon className={cn("w-5.5 h-5.5", config.iconColor)} strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h2
                id="confirm-modal-title"
                className="text-lg font-semibold text-walnut-800 font-serif"
              >
                {title}
              </h2>
              {description && (
                <p className="mt-1.5 text-sm text-walnut-500 leading-relaxed">
                  {description}
                </p>
              )}
              {children && (
                <div className="mt-4 text-sm text-walnut-700">{children}</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-walnut-50/60 border-t border-walnut-100">
          {!hideCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className={cn("btn-secondary", cancelButtonClass)}
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(config.confirmClass, confirmButtonClass)}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    opacity="0.25"
                  />
                  <path
                    d="M22 12a10 10 0 0 1-10 10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                处理中...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
