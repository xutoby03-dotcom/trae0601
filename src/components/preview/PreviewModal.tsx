import type { FormData } from '../../types/form';
import { FormRenderer } from './FormRenderer';
import { X } from 'lucide-react';

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  formData: FormData;
}

export function PreviewModal({ open, onClose, formData }: PreviewModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-50">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-white shadow-lg rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X size={18} />
          <span className="font-medium">退出预览</span>
        </button>
      </div>
      <FormRenderer formData={formData} />
    </div>
  );
}
