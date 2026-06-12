import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  open: boolean;
  onClose: () => void;
  message: string;
  type?: ToastType;
  duration?: number;
}

const iconMap = {
  success: { Icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
  error: { Icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 border-red-200" },
  info: { Icon: Info, color: "text-sky-500", bg: "bg-sky-50 border-sky-200" },
};

export default function Toast({
  open,
  onClose,
  message,
  type = "info",
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  const { Icon, color, bg } = iconMap[type];

  return (
    <div className="fixed top-6 left-1/2 z-[100] -translate-x-1/2 animate-in slide-in-from-top duration-300">
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border px-5 py-3 shadow-lg",
          bg
        )}
      >
        <Icon className={cn("h-5 w-5", color)} />
        <p className="text-sm font-medium text-brand-800">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 flex h-6 w-6 items-center justify-center rounded text-brand-500 hover:bg-white/60"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
