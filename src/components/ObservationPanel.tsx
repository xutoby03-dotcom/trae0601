import { useState } from 'react';
import { Eye, CheckCircle, Stethoscope, Calendar, Edit2 } from 'lucide-react';
import type { ObservationNote, ObservationStatus } from '@/types';
import { ABNORMAL_LABELS, OBSERVATION_STATUS_LABELS } from '@/types';
import { useAppStore } from '@/store/useAppStore';

interface ObservationPanelProps {
  notes: ObservationNote[];
}

export default function ObservationPanel({ notes }: ObservationPanelProps) {
  const updateObservationNote = useAppStore(state => state.updateObservationNote);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const statusIcons = {
    watching: Eye,
    recovered: CheckCircle,
    need_vet: Stethoscope,
  };

  const statusColors = {
    watching: 'text-sand-300 bg-sand-100',
    recovered: 'text-forest-300 bg-forest-100',
    need_vet: 'text-coral-300 bg-coral-100',
  };

  const handleStatusChange = (id: string, status: ObservationStatus) => {
    updateObservationNote(id, { status });
  };

  const handleEdit = (note: ObservationNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSave = (id: string) => {
    updateObservationNote(id, { content: editContent });
    setEditingId(null);
  };

  return (
    <div className="bg-cream-50 rounded-2xl p-4">
      <h4 className="font-display text-lg mb-3 flex items-center gap-2">
        <span className="text-xl">📋</span>
        健康观察记录
      </h4>
      
      <div className="space-y-3">
        {notes.map((note, index) => {
          const StatusIcon = statusIcons[note.status];
          return (
            <div
              key={note.id}
              className="bg-white rounded-xl p-4 border border-warm-100"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="px-2 py-1 bg-coral-100 text-coral-400 text-xs rounded-full">
                      {ABNORMAL_LABELS[note.abnormalType]}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${statusColors[note.status]}`}>
                      <StatusIcon size={12} />
                      {OBSERVATION_STATUS_LABELS[note.status]}
                    </span>
                    <span className="text-xs text-warm-300 flex items-center gap-1">
                      <Calendar size={12} />
                      跟进：{note.followUpDate}
                    </span>
                  </div>
                  
                  {editingId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="input-field text-sm min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(note.id)}
                          className="btn-primary text-sm py-2 px-4"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn-secondary text-sm py-2 px-4"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <p className="text-sm text-warm-400 flex-1">{note.content}</p>
                      <button
                        onClick={() => handleEdit(note)}
                        className="p-1 rounded-lg hover:bg-cream-200 transition-colors flex-shrink-0"
                      >
                        <Edit2 size={14} className="text-warm-300" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {editingId !== note.id && (
                <div className="mt-3 pt-3 border-t border-warm-100">
                  <p className="text-xs text-warm-300 mb-2">更新状态：</p>
                  <div className="flex gap-2 flex-wrap">
                    {(['watching', 'recovered', 'need_vet'] as ObservationStatus[]).map(status => {
                      const Icon = statusIcons[status];
                      const isActive = note.status === status;
                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(note.id, status)}
                          className={`px-3 py-1.5 text-xs rounded-xl flex items-center gap-1 transition-all ${
                            isActive
                              ? statusColors[status]
                              : 'bg-warm-100 text-warm-300 hover:bg-warm-200'
                          }`}
                        >
                          <Icon size={12} />
                          {OBSERVATION_STATUS_LABELS[status]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
