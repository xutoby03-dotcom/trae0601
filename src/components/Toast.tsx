import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
}: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  const styles: Record<ToastType, { bg: string; icon: JSX.Element; border: string }> = {
    success: {
      bg: "bg-forest-500",
      border: "border-forest-400",
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
    error: {
      bg: "bg-red-500",
      border: "border-red-400",
      icon: <AlertCircle className="w-5 h-5" />,
    },
    info: {
      bg: "bg-primary-500",
      border: "border-primary-400",
      icon: <Info className="w-5 h-5" />,
    },
  };

  const style = styles[type];

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div
        className={`${style.bg} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[280px]`}
      >
        {style.icon}
        <span className="flex-1 text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="p-1 rounded-lg hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
