import { useEffect, useState } from "react";
import Toast, { ToastType } from "@/components/Toast";

interface ToastState {
  open: boolean;
  message: string;
  type: ToastType;
}

let showToastFn: ((msg: string, type?: ToastType) => void) | null = null;

export const showToast = (message: string, type: ToastType = "info") => {
  if (showToastFn) showToastFn(message, type);
};

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ open: false, message: "", type: "info" });

  useEffect(() => {
    showToastFn = (message, type = "info") => {
      setToast({ open: true, message, type });
    };
    return () => {
      showToastFn = null;
    };
  }, []);

  return (
    <>
      {children}
      <Toast
        open={toast.open}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        message={toast.message}
        type={toast.type}
      />
    </>
  );
}
