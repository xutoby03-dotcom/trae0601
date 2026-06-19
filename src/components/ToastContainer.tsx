import { useAppStore } from "@/store/app";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[280px] animate-[slideIn_0.3s_ease] ${
            t.type === "success"
              ? "bg-success-50 border border-success-500/20 text-success-700"
              : t.type === "error"
              ? "bg-danger-50 border border-danger-500/20 text-danger-700"
              : "bg-blue-50 border border-blue-500/20 text-blue-700"
          }`}
        >
          {t.type === "success" && <CheckCircle2 size={20} />}
          {t.type === "error" && <XCircle size={20} />}
          {t.type === "info" && <Info size={20} />}
          <span className="flex-1 text-sm font-medium">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="p-0.5 hover:opacity-70"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
