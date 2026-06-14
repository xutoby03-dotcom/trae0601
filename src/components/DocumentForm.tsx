import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Document, DocumentType, DOCUMENT_TYPES } from '@/types';

interface DocumentFormProps {
  personId: string;
  document?: Document | null;
  onSubmit: (data: Omit<Document, 'id'>) => void;
  onCancel: () => void;
}

export default function DocumentForm({
  personId,
  document,
  onSubmit,
  onCancel,
}: DocumentFormProps) {
  const [formData, setFormData] = useState({
    personId,
    type: '身份证' as DocumentType,
    number: '',
    expiryDate: '',
    photoBackup: false,
    inLuggage: false,
    notes: '',
  });

  useEffect(() => {
    if (document) {
      setFormData({
        personId: document.personId,
        type: document.type,
        number: document.number,
        expiryDate: document.expiryDate,
        photoBackup: document.photoBackup,
        inLuggage: document.inLuggage,
        notes: document.notes,
      });
    }
  }, [document, personId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {document ? '编辑证件' : '添加证件'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              证件类型
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as DocumentType })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 outline-none transition-all bg-white"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              证件号码
            </label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              placeholder="请输入证件号码"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 outline-none transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              有效期至
            </label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.photoBackup}
                onChange={(e) =>
                  setFormData({ ...formData, photoBackup: e.target.checked })
                }
                className="w-4 h-4 rounded text-slate-600 focus:ring-slate-500"
              />
              <span className="text-sm text-gray-700">已拍照备份</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inLuggage}
                onChange={(e) =>
                  setFormData({ ...formData, inLuggage: e.target.checked })
                }
                className="w-4 h-4 rounded text-slate-600 focus:ring-slate-500"
              />
              <span className="text-sm text-gray-700">已放进行李</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="可选"
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-colors font-medium"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
