import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { EnvelopeFormData } from '@/types';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  envelopeId?: string | null;
}

export default function EnvelopeModal({ open, onClose, envelopeId }: Props) {
  const { currentSessionId, sessions, envelopes, addEnvelope, updateEnvelope } = useStore();
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const editingEnvelope = envelopeId ? envelopes.find((e) => e.id === envelopeId) : null;

  const [form, setForm] = useState<EnvelopeFormData>({
    name: '',
    content: '',
    actNumber: 1,
    ownerCharacter: '',
    isKeyEvidence: false,
  });

  useEffect(() => {
    if (editingEnvelope) {
      setForm({
        name: editingEnvelope.name,
        content: editingEnvelope.content,
        actNumber: editingEnvelope.actNumber,
        ownerCharacter: editingEnvelope.ownerCharacter,
        isKeyEvidence: editingEnvelope.isKeyEvidence,
      });
    } else {
      setForm({ name: '', content: '', actNumber: 1, ownerCharacter: '', isKeyEvidence: false });
    }
  }, [editingEnvelope, open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingEnvelope) {
      updateEnvelope(editingEnvelope.id, form);
    } else {
      addEnvelope(form);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-sm animate-fade-in-up">
      <div className="card-parchment w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b-2 border-parchment-200 sticky top-0 bg-parchment-50 rounded-t-lg">
          <h2 className="font-serif text-xl font-bold text-ink-800">
            {editingEnvelope ? '编辑线索封套' : '登记线索封套'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-parchment-200 rounded transition-colors">
            <X className="w-5 h-5 text-ink-700" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="label-text">线索名称 *</label>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="如：带血的手帕"
            />
          </div>

          <div>
            <label className="label-text">线索内容</label>
            <textarea
              className="input-field min-h-[80px] resize-y"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="详细描述线索内容..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">所属幕次</label>
              <select
                className="input-field"
                value={form.actNumber}
                onChange={(e) => setForm({ ...form, actNumber: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>第 {n} 幕</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">所属角色</label>
              <select
                className="input-field"
                value={form.ownerCharacter}
                onChange={(e) => setForm({ ...form, ownerCharacter: e.target.value })}
              >
                <option value="">公开线索</option>
                {currentSession?.characters.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer p-2 bg-parchment-100 rounded border-2 border-parchment-200">
            <input
              type="checkbox"
              checked={form.isKeyEvidence}
              onChange={(e) => setForm({ ...form, isKeyEvidence: e.target.checked })}
              className="w-4 h-4 accent-seal-red"
            />
            <span className="text-sm font-medium text-seal-red">标记为关键证据</span>
          </label>
        </div>

        <div className="flex gap-2 p-4 border-t-2 border-parchment-200 sticky bottom-0 bg-parchment-50 rounded-b-lg">
          <button onClick={onClose} className="btn-secondary flex-1">取消</button>
          <button onClick={handleSubmit} className="btn-primary flex-1">
            {editingEnvelope ? '保存修改' : '确认登记'}
          </button>
        </div>
      </div>
    </div>
  );
}
