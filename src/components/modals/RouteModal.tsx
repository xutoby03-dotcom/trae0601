import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { PatrolRoute } from '@/types/patrol';

interface RouteModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
  editRoute?: PatrolRoute | null;
}

export default function RouteModal({ open, onClose, onSubmit, editRoute }: RouteModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editRoute) {
      setName(editRoute.name);
      setDescription(editRoute.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [editRoute, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name, description);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md card animate-fade-in-up">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">
            {editRoute ? '编辑路线' : '新增巡逻路线'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label-text">路线名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="例如：A区夜间巡逻路线"
              required
            />
          </div>
          <div>
            <label className="label-text">路线描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-[80px] resize-none"
              placeholder="描述路线覆盖范围、注意事项等"
            />
          </div>
          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editRoute ? '保存修改' : '创建路线'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
