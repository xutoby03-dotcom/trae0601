import { Edit2, Trash2, Paintbrush } from 'lucide-react';
import type { PaintFormula } from '@/types';

interface PaintFormulaCardProps {
  formula: PaintFormula;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const PaintFormulaCard = ({ formula, onEdit, onDelete }: PaintFormulaCardProps) => {
  return (
    <div className="bg-studio-bg rounded-xl border border-studio-border p-4 hover:border-studio-copper/50 transition-all duration-200 group">
      <div className="flex items-start gap-4">
        <div
          className="w-16 h-16 rounded-xl border-2 border-studio-border flex-shrink-0 shadow-inner"
          style={{ backgroundColor: formula.color }}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-studio-text">{formula.brand}</span>
                <span className="px-2 py-0.5 bg-studio-border rounded text-xs text-studio-muted font-mono">
                  {formula.code}
                </span>
              </div>
              <p className="text-sm text-studio-muted mt-1 flex items-center gap-1">
                <Paintbrush className="w-3.5 h-3.5" />
                稀释比例: <span className="font-medium text-studio-text">{formula.dilutionRatio}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onEdit}
                className="p-1.5 hover:bg-studio-border rounded-lg text-studio-muted hover:text-studio-copper transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 hover:bg-studio-border rounded-lg text-studio-muted hover:text-studio-rust transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-1 bg-studio-copper/10 text-studio-copper rounded-md text-xs font-medium">
              用于: {formula.usedOn}
            </span>
            {formula.notes && (
              <span className="inline-flex items-center px-2.5 py-1 bg-studio-border/50 text-studio-muted rounded-md text-xs">
                {formula.notes}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<PaintFormula, 'id' | 'modelId' | 'stageId'>) => void;
  initialData?: PaintFormula;
}

import { useState, useEffect } from 'react';

export const FormulaModal = ({ isOpen, onClose, onSave, initialData }: FormulaModalProps) => {
  const [formData, setFormData] = useState({
    brand: '',
    code: '',
    color: '#3B82F6',
    dilutionRatio: '1:1',
    usedOn: '',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        brand: initialData.brand,
        code: initialData.code,
        color: initialData.color,
        dilutionRatio: initialData.dilutionRatio,
        usedOn: initialData.usedOn,
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        brand: '',
        code: '',
        color: '#3B82F6',
        dilutionRatio: '1:1',
        usedOn: '',
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-studio-card rounded-2xl border border-studio-border shadow-2xl w-full max-w-md animate-fade-in-up">
        <div className="p-6 border-b border-studio-border">
          <h3 className="font-display text-xl font-semibold text-studio-text">
            {initialData ? '编辑颜色配方' : '添加颜色配方'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-studio-text mb-1.5">品牌</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-2.5 bg-studio-bg border border-studio-border rounded-lg text-studio-text placeholder-studio-muted focus:outline-none focus:border-studio-copper transition-colors"
                placeholder="如: Mr.Hobby"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-studio-text mb-1.5">编号</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2.5 bg-studio-bg border border-studio-border rounded-lg text-studio-text placeholder-studio-muted focus:outline-none focus:border-studio-copper transition-colors font-mono"
                placeholder="如: GX-110"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-studio-text mb-1.5">颜色预览</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-2 border-studio-border"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 px-3 py-2 bg-studio-bg border border-studio-border rounded-lg text-studio-text font-mono text-sm focus:outline-none focus:border-studio-copper"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-studio-text mb-1.5">稀释比例</label>
              <input
                type="text"
                value={formData.dilutionRatio}
                onChange={(e) => setFormData({ ...formData, dilutionRatio: e.target.value })}
                className="w-full px-4 py-2.5 bg-studio-bg border border-studio-border rounded-lg text-studio-text placeholder-studio-muted focus:outline-none focus:border-studio-copper transition-colors font-mono"
                placeholder="如: 1:1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-studio-text mb-1.5">使用部位</label>
            <input
              type="text"
              value={formData.usedOn}
              onChange={(e) => setFormData({ ...formData, usedOn: e.target.value })}
              className="w-full px-4 py-2.5 bg-studio-bg border border-studio-border rounded-lg text-studio-text placeholder-studio-muted focus:outline-none focus:border-studio-copper transition-colors"
              placeholder="如: 主体装甲"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-studio-text mb-1.5">备注</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 bg-studio-bg border border-studio-border rounded-lg text-studio-text placeholder-studio-muted focus:outline-none focus:border-studio-copper transition-colors resize-none"
              rows={2}
              placeholder="可选备注信息..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-studio-border hover:bg-studio-border/80 text-studio-text rounded-lg font-medium transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-studio-copper hover:bg-studio-copperDark text-white rounded-lg font-medium transition-colors"
            >
              {initialData ? '保存修改' : '添加配方'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
