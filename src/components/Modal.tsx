import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-lg",
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div
        className={`relative z-10 w-full ${maxWidth} rounded-2xl bg-white shadow-xl animate-in zoom-in-95 duration-200`}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between border-b border-brand-100 px-6 py-4">
          <h3 className="font-serif text-lg font-semibold text-brand-900">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-500 transition-colors hover:bg-brand-50 hover:text-brand-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="px-6 py-5">{children}</div>

        {/* 底部操作 */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-brand-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
