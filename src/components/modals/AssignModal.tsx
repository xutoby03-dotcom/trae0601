import { useState } from 'react';
import { X, Wrench, Shield } from 'lucide-react';
import type { AssigneeType, ExceptionEvent } from '@/types/patrol';
import { usePatrolStore } from '@/store/usePatrolStore';
import { getAssigneeTypeText } from '@/utils/helpers';

interface AssignModalProps {
  open: boolean;
  onClose: () => void;
  event: ExceptionEvent | null;
}

export default function AssignModal({ open, onClose, event }: AssignModalProps) {
  const { officers, assignException } = usePatrolStore();
  const [assigneeType, setAssigneeType] = useState<AssigneeType>('maintenance');
  const [assigneeId, setAssigneeId] = useState('');

  if (!open || !event) return null;

  const filteredOfficers = officers.filter((o) => o.role === assigneeType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigneeId) return;
    assignException(event.id, assigneeType, assigneeId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md card animate-fade-in-up">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">分派异常事件</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/30">
            <p className="text-xs text-slate-400 mb-1">异常描述</p>
            <p className="text-white text-sm">{event.description}</p>
            <p className="text-xs text-slate-500 mt-2">
              {event.routeName} · {event.pointName}
            </p>
          </div>

          <div>
            <label className="label-text">分派给</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setAssigneeType('maintenance'); setAssigneeId(''); }}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  assigneeType === 'maintenance'
                    ? 'bg-primary-700 text-white border-primary-600 shadow-lg shadow-primary-700/30'
                    : 'bg-slate-900/60 text-slate-300 border-slate-600 hover:border-slate-500'
                }`}
              >
                <Wrench className="w-4 h-4" />
                物业维修
              </button>
              <button
                type="button"
                onClick={() => { setAssigneeType('security'); setAssigneeId(''); }}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  assigneeType === 'security'
                    ? 'bg-primary-700 text-white border-primary-600 shadow-lg shadow-primary-700/30'
                    : 'bg-slate-900/60 text-slate-300 border-slate-600 hover:border-slate-500'
                }`}
              >
                <Shield className="w-4 h-4" />
                安保复查
              </button>
            </div>
          </div>

          <div>
            <label className="label-text">选择{getAssigneeTypeText(assigneeType)}人员</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="select-field"
              required
            >
              <option value="">请选择人员</option>
              {filteredOfficers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              确认分派
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
