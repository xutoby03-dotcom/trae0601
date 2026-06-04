import { useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useFormStore } from '../../store/useFormStore';
import { useUIStore } from '../../store/useUIStore';
import { cn } from '@/lib/utils';

interface ImportJSONModalProps {
  open: boolean;
  onClose: () => void;
}

export function ImportJSONModal({ open, onClose }: ImportJSONModalProps) {
  const loadFromJSON = useFormStore((state) => state.loadFromJSON);
  const { showToast, selectField } = useUIStore();
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleClose = () => {
    setJsonText('');
    setError(null);
    onClose();
  };

  const handleImport = async () => {
    if (!jsonText.trim()) {
      setError('请输入JSON内容');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const result = loadFromJSON(jsonText);
      if (result.success) {
        showToast('导入成功');
        selectField(null);
        handleClose();
      } else {
        setError(result.error || '导入失败');
      }
    } catch (e) {
      setError(`导入失败: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSample = () => {
    const sample = {
      id: 'sample_form',
      title: '示例表单',
      description: '这是一个示例表单，用于演示JSON导入功能',
      fields: [
        {
          id: 'field_1',
          type: 'text',
          title: '您的姓名',
          placeholder: '请输入您的姓名',
          required: true,
        },
        {
          id: 'field_2',
          type: 'radio',
          title: '您的性别',
          placeholder: '',
          required: false,
          options: [
            { id: 'opt_1', label: '男', value: 'male' },
            { id: 'opt_2', label: '女', value: 'female' },
          ],
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setJsonText(JSON.stringify(sample, null, 2));
    setError(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonText(text);
      setError(null);
    } catch {
      setError('无法读取剪贴板，请手动粘贴');
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="导入JSON"
      className="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={handleSample}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            填充示例
          </button>
          <button
            onClick={handlePaste}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            从剪贴板粘贴
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            JSON 内容
          </label>
          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setError(null);
            }}
            placeholder='{"id": "...", "title": "...", "fields": [...]}'
            rows={15}
            className={cn(
              'w-full px-4 py-3 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none',
              error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
            )}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">导入失败</p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <CheckCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-700">JSON 结构说明</p>
            <p className="text-sm text-blue-600 mt-0.5">
              必须包含 id (string)、title (string)、description (string)、fields (array) 字段。
              每个 field 必须包含 id、type、title、placeholder、required，
              单选/多选/下拉框还需要 options 数组。
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleImport}
            disabled={isImporting || !jsonText.trim()}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Upload size={16} />
            {isImporting ? '导入中...' : '确认导入'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
