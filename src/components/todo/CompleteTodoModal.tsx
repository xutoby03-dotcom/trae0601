import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Todo } from '@/types';

interface CompleteTodoModalProps {
  open: boolean;
  todo: Todo | null;
  onClose: () => void;
  onSubmit: (todoId: string, resultNote: string) => void;
}

export default function CompleteTodoModal({ open, todo, onClose, onSubmit }: CompleteTodoModalProps) {
  const [resultNote, setResultNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setResultNote('');
      setError('');
    }
  }, [open, todo?.id]);

  if (!open || !todo) return null;

  const handleSubmit = () => {
    const trimmed = resultNote.trim();
    if (!trimmed) {
      setError('请填写完成结果说明');
      return;
    }
    if (trimmed.length < 5) {
      setError('结果说明至少需要 5 个字符');
      return;
    }
    onSubmit(todo.id, trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-card-hover animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-success-50">
              <CheckCircle2 className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">标记完成</h2>
              <p className="text-sm text-gray-500">请填写完成结果说明</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="bg-gray-50 rounded-lg p-4 mb-5">
            <p className="text-sm text-gray-500 mb-1">待办事项</p>
            <p className="text-base font-medium text-gray-900">{todo.title}</p>
            {todo.deliverable && (
              <p className="text-sm text-gray-600 mt-2">
                <span className="text-gray-500">交付物：</span>
                {todo.deliverable}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              完成结果说明 <span className="text-danger-500">*</span>
            </label>
            <textarea
              value={resultNote}
              onChange={(e) => {
                setResultNote(e.target.value);
                if (error) setError('');
              }}
              placeholder="请详细描述待办完成情况、交付成果、遇到的问题等..."
              rows={5}
              className={cn(
                'w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all resize-none',
                error
                  ? 'border-danger-300 focus:ring-danger-500 focus:border-transparent'
                  : 'border-gray-200 focus:ring-primary-500 focus:border-transparent'
              )}
            />
            <div className="flex items-center justify-between mt-2">
              {error ? (
                <div className="flex items-center gap-1 text-sm text-danger-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              ) : (
                <span className="text-xs text-gray-400">至少 5 个字符，建议详细说明完成情况</span>
              )}
              <span className="text-xs text-gray-400">{resultNote.length} / 500</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-accent-500 rounded-lg hover:bg-accent-600 transition-colors shadow-sm"
          >
            确认完成
          </button>
        </div>
      </div>
    </div>
  );
}
