import { X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles = {
  primary: "bg-primary-500 hover:bg-primary-600 focus:ring-primary-500",
  danger: "bg-danger-500 hover:bg-danger-600 focus:ring-danger-500",
  warning: "bg-warning-500 hover:bg-warning-600 focus:ring-warning-500",
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
  isLoading = false,
  icon,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {icon || (
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  confirmVariant === "danger" ? "bg-danger-100" :
                  confirmVariant === "warning" ? "bg-warning-100" : "bg-primary-100"
                )}>
                  <AlertTriangle className={cn(
                    "w-6 h-6",
                    confirmVariant === "danger" ? "text-danger-600" :
                    confirmVariant === "warning" ? "text-warning-600" : "text-primary-600"
                  )} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {description && (
                <p className="mt-2 text-sm text-gray-500">{description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
              variantStyles[confirmVariant]
            )}
          >
            {isLoading ? "处理中..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
