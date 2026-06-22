import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { STATUS_LABELS, STATUS_COLORS, EnvelopeStatus, FlowEventType, FLOW_EVENT_LABELS } from '@/types';
import { Plus, Edit3, Trash2, ChevronDown, ChevronUp, Eye, Key, User } from 'lucide-react';
import EnvelopeModal from './EnvelopeModal';
import FlowTimeline from './FlowTimeline';

export default function EnvelopeTable() {
  const {
    currentSessionId,
    sessions,
    envelopes,
    selectedEnvelopeId,
    setSelectedEnvelope,
    deleteEnvelope,
    addFlowEvent,
    updateEnvelopeStatus,
    getEnvelopeEvents,
  } = useStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedActs, setExpandedActs] = useState<number[]>([1, 2, 3]);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!selectedEnvelopeId) return;
    const env = sessionEnvelopes.find((e) => e.id === selectedEnvelopeId);
    if (!env) return;

    if (!expandedActs.includes(env.actNumber)) {
      setExpandedActs((prev) => [...prev, env.actNumber]);
    }

    setTimeout(() => {
      const el = rowRefs.current[selectedEnvelopeId];
      if (el && scrollRef.current) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  }, [selectedEnvelopeId]);

  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const sessionEnvelopes = envelopes.filter((e) => e.sessionId === currentSessionId);

  const envelopesByAct = sessionEnvelopes.reduce<Record<number, typeof sessionEnvelopes>>((acc, env) => {
    if (!acc[env.actNumber]) acc[env.actNumber] = [];
    acc[env.actNumber].push(env);
    return acc;
  }, {});

  const toggleAct = (act: number) => {
    setExpandedActs((prev) => (prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]));
  };

  const handleAction = (envelopeId: string, eventType: FlowEventType, status: EnvelopeStatus, actor: string) => {
    addFlowEvent(envelopeId, eventType, actor);
    updateEnvelopeStatus(envelopeId, status);
    setActionMenuId(null);
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setModalOpen(true);
  };

  if (!currentSession) {
    return (
      <div className="card-parchment p-8 h-full flex items-center justify-center">
        <p className="text-ink-700 text-center">请从左侧选择或创建一个场次</p>
      </div>
    );
  }

  return (
    <div className="card-parchment h-full flex flex-col animate-fade-in-up">
      <div className="flex items-center justify-between p-4 border-b-2 border-parchment-200">
        <div>
          <h2 className="font-serif text-xl font-bold text-ink-800 flex items-center gap-2">
            线索封套登记
          </h2>
          <p className="text-sm text-ink-700 mt-1 flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            {currentSession.roomName} · {currentSession.scriptName} · {currentSession.date}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-1">
          <Plus className="w-4 h-4" />
          登记线索
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.keys(envelopesByAct).length === 0 && (
          <div className="text-center py-12 text-ink-700">
            <p>暂无登记的线索封套</p>
            <p className="text-sm mt-1">点击右上角"登记线索"开始添加</p>
          </div>
        )}

        {Object.entries(envelopesByAct)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([act, actEnvelopes]) => (
            <div key={act} className="rounded-lg border-2 border-parchment-200 overflow-hidden">
              <button
                onClick={() => toggleAct(Number(act))}
                className="w-full flex items-center justify-between p-3 bg-parchment-100 hover:bg-parchment-200 transition-colors"
              >
                <span className="font-serif font-bold text-ink-800">第 {act} 幕 · {actEnvelopes.length} 条线索</span>
                {expandedActs.includes(Number(act)) ? (
                  <ChevronUp className="w-5 h-5 text-ink-700" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-ink-700" />
                )}
              </button>

              {expandedActs.includes(Number(act)) && (
                <div className="divide-y divide-parchment-200">
                  {actEnvelopes.map((env, idx) => {
                    const isSelected = selectedEnvelopeId === env.id;
                    const events = getEnvelopeEvents(env.id);
                    return (
                      <div
                        key={env.id}
                        ref={(el) => { rowRefs.current[env.id] = el; }}
                        style={{ animationDelay: `${idx * 50}ms` }}
                        className={`animate-fade-in-up transition-colors ${isSelected ? 'bg-parchment-100 ring-2 ring-ink-700 ring-inset' : 'bg-parchment-50'}`}
                      >
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-serif font-bold text-ink-800">{env.name}</h4>
                                {env.isKeyEvidence && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-seal-red text-parchment-50 text-[10px] font-bold rounded border-2 border-red-900">
                                    <Key className="w-3 h-3" /> 关键
                                  </span>
                                )}
                                <span className={`status-badge ${STATUS_COLORS[env.status]}`}>
                                  {STATUS_LABELS[env.status]}
                                </span>
                                {env.ownerCharacter && (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-parchment-200 text-ink-800 text-xs rounded border border-parchment-300">
                                    <User className="w-3 h-3" /> {env.ownerCharacter}
                                  </span>
                                )}
                              </div>
                              {env.content && (
                                <p className="text-sm text-ink-700 mt-1.5 line-clamp-2">{env.content}</p>
                              )}
                              <p className="text-xs text-parchment-400 mt-1">
                                已记录 {events.length} 条流转事件
                              </p>
                            </div>

                            <div className="flex items-center gap-1 relative">
                              <button
                                onClick={() => setSelectedEnvelope(isSelected ? null : env.id)}
                                className={`p-1.5 rounded transition-colors ${
                                  isSelected ? 'bg-ink-800 text-parchment-50' : 'hover:bg-parchment-200 text-ink-700'
                                }`}
                                title="查看流转"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEdit(env.id)}
                                className="p-1.5 rounded hover:bg-parchment-200 text-ink-700 transition-colors"
                                title="编辑"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <div className="relative">
                                <button
                                  onClick={() => setActionMenuId(actionMenuId === env.id ? null : env.id)}
                                  className="btn-secondary text-xs"
                                >
                                  标记状态 ▾
                                </button>
                                {actionMenuId === env.id && (
                                  <div className="absolute right-0 top-full mt-1 bg-parchment-50 border-2 border-parchment-300 rounded-lg shadow-card z-10 w-40 overflow-hidden">
                                    {(['picked', 'opened', 'wrongly_taken', 'missed', 'reissued'] as FlowEventType[]).map((et) => (
                                      <button
                                        key={et}
                                        onClick={() =>
                                          handleAction(
                                            env.id,
                                            et,
                                            et === 'wrongly_taken' ? env.status : (et as EnvelopeStatus),
                                            currentSession.characters[0] || 'DM'
                                          )
                                        }
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-parchment-100 text-ink-800 transition-colors"
                                      >
                                        {FLOW_EVENT_LABELS[et]}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => deleteEnvelope(env.id)}
                                className="p-1.5 rounded hover:bg-red-100 text-seal-red transition-colors"
                                title="删除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="border-t-2 border-parchment-200 p-3 bg-parchment-100">
                            <FlowTimeline envelopeId={env.id} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
      </div>

      <EnvelopeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        envelopeId={editingId}
      />
    </div>
  );
}
