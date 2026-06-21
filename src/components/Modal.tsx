import { useEffect } from 'react';
import { X } from 'lucide-react';
import '../styles/components.css';

export interface ModalProps {
  open: boolean;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  closeOnOverlayClick?: boolean;
  showCloseIcon?: boolean;
  className?: string;
}

export function Modal({
  open,
  title,
  children,
  footer,
  onClose,
  closeOnOverlayClick = true,
  showCloseIcon = true,
  className = '',
}: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal ${className}`} onClick={(e) => e.stopPropagation()}>
        {(title || showCloseIcon) && (
          <div className="modal-header">
            {title && <h3 className="modal-title">{title}</h3>}
            {!title && <div />}
            {showCloseIcon && (
              <button className="modal-close" onClick={onClose} aria-label="关闭">
                <X size={18} />
              </button>
            )}
          </div>
        )}
        {children && <div className="modal-body">{children}</div>}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
