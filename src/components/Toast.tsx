import { useState, useCallback, createContext, useContext } from "react";
import { CheckCircle2 } from "lucide-react";

interface ToastState {
  message: string;
  type: "success" | "error";
}

interface ToastContextType {
  showToast: (msg: string, type?: ToastState["type"]) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast 必须在 ToastProvider 内使用");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastState["type"] = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 1800);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-[60] animate-float" style={{ animationDuration: "400ms" }}>
          <div className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl border ${
            toast.type === "success"
              ? "bg-glow-green/20 border-glow-green/40 text-glow-green backdrop-blur-md shadow-glow-green"
              : "bg-glow-rose/20 border-glow-rose/40 text-glow-rose backdrop-blur-md shadow-glow-rose"
          }`}>
            <CheckCircle2 className="w-4.5 h-4.5" />
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
