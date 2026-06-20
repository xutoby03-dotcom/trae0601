import React, { useState, useEffect } from 'react';
import { useHoldStore, useRouteStore, useUserStore } from '@/store';
import type { IssueType, Severity, Hold } from '@/types';
import { ISSUE_TYPE_LABELS, SEVERITY_LABELS } from '@/data/mockData';
import { cn } from '@/utils/helpers';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

interface IssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  hold?: Hold | null;
}

export const IssueModal: React.FC<IssueModalProps> = ({ isOpen, onClose, hold }) => {
  const { addIssue, getIssuesByHold } = useHoldStore();
  const { getRouteById } = useRouteStore();
  const { userName } = useUserStore();

  const [issueType, setIssueType] = useState<IssueType>('loose');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const existingIssues = hold ? getIssuesByHold(hold.id) : [];
  const route = hold?.routeId ? getRouteById(hold.routeId) : null;

  useEffect(() => {
    if (isOpen) {
      setIssueType('loose');
      setSeverity('medium');
      setNote('');
      setSubmitted(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hold) return;

    addIssue({
      holdId: hold.id,
      routeId: hold.routeId,
      type: issueType,
      severity,
      note,
      reporter: userName,
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (!isOpen || !hold) return null;

  const issueTypes: IssueType[] = ['loose', 'worn', 'missing_screw', 'slippery', 'broken'];
  const severities: Severity[] = ['low', 'medium', 'high'];

  const severityColors: Record<Severity, string> = {
    low: 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20',
    high: 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">问题已记录</h3>
            <p className="text-slate-400">巡场记录已提交，会尽快安排维修</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">记录岩点问题</h3>
                  <p className="text-xs text-slate-400">
                    {route ? route.name : '未分配岩点'} · {hold.type}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-5">
              {existingIssues.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  <p className="text-sm text-amber-400">
                    该岩点已有 {existingIssues.length} 条未解决的问题记录
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  问题类型
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {issueTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setIssueType(type)}
                      className={cn(
                        'px-3 py-2.5 rounded-lg text-sm font-medium border transition-all',
                        issueType === type
                          ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20'
                          : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700'
                      )}
                    >
                      {ISSUE_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  严重程度
                </label>
                <div className="flex gap-2">
                  {severities.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverity(s)}
                      className={cn(
                        'flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all',
                        severity === s
                          ? severityColors[s] + ' ring-2 ring-offset-1 ring-offset-slate-800'
                          : 'bg-slate-700/30 text-slate-400 border-slate-700 hover:bg-slate-700/50'
                      )}
                    >
                      {SEVERITY_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  备注说明
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="描述具体情况..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-600 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                >
                  提交记录
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
