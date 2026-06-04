import { FileText, Asterisk, EyeOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormField } from '../../types/form';
import { Modal } from '../common/Modal';
import { useFormStore } from '../../store/useFormStore';
import { useUIStore } from '../../store/useUIStore';
import { cn } from '@/lib/utils';

interface FormStatsProps {
  fields: FormField[];
}

interface ClearConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fieldCount: number;
}

function ClearConfirmModal({ open, onClose, onConfirm, fieldCount }: ClearConfirmModalProps) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="清空画布">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 size={24} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">确认清空所有字段？</h3>
            <p className="text-gray-500">
              此操作将删除当前画布上的 <span className="font-semibold text-red-500">{fieldCount}</span> 个字段，
              删除后无法恢复。表单标题和描述将保留。
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            确认清空
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function FormStats({ fields }: FormStatsProps) {
  const { clearAllFields } = useFormStore();
  const { selectField, showToast } = useUIStore();
  const [showClearModal, setShowClearModal] = useState(false);

  const totalFields = fields.length;
  const requiredFields = fields.filter((f) => f.required).length;
  const conditionalFields = fields.filter((f) => f.condition).length;

  const handleClear = () => {
    clearAllFields();
    selectField(null);
    showToast('画布已清空');
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6 px-6 py-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">总题数</p>
              <p className="text-xl font-bold text-gray-800">{totalFields}</p>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-100" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <Asterisk size={18} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">必填题数</p>
              <p className="text-xl font-bold text-gray-800">{requiredFields}</p>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-100" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <EyeOff size={18} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">条件显示</p>
              <p className="text-xl font-bold text-gray-800">{conditionalFields}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowClearModal(true)}
          disabled={totalFields === 0}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
            totalFields === 0
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-red-50 text-red-500 hover:bg-red-100'
          )}
        >
          <Trash2 size={16} />
          清空画布
        </button>
      </div>

      <ClearConfirmModal
        open={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClear}
        fieldCount={totalFields}
      />
    </>
  );
}
