import { useStore } from '@/store/useStore';
import { FLOW_EVENT_LABELS, FLOW_EVENT_COLORS } from '@/types';
import { FileText, Hand, Eye, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

const EVENT_ICONS: Record<string, React.ReactNode> = {
  created: <FileText className="w-4 h-4" />,
  picked: <Hand className="w-4 h-4" />,
  opened: <Eye className="w-4 h-4" />,
  wrongly_taken: <AlertTriangle className="w-4 h-4" />,
  missed: <XCircle className="w-4 h-4" />,
  reissued: <RefreshCw className="w-4 h-4" />,
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

interface Props {
  envelopeId: string;
}

export default function FlowTimeline({ envelopeId }: Props) {
  const events = useStore((s) => s.getEnvelopeEvents(envelopeId));

  if (events.length === 0) {
    return (
      <p className="text-sm text-ink-700 text-center py-2">
        暂无流转记录
      </p>
    );
  }

  return (
    <div className="relative pl-6">
      <div className="absolute left-2.5 top-1 bottom-1 w-0.5 bg-parchment-300" />
      <div className="space-y-3">
        {events.map((event, idx) => (
          <div
            key={event.id}
            className="relative animate-fade-in-up"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div
              className={`absolute -left-[22px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 ${FLOW_EVENT_COLORS[event.eventType]}`}
            >
              {EVENT_ICONS[event.eventType]}
            </div>
            <div className="bg-parchment-50 rounded-lg border border-parchment-200 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className={`status-badge ${FLOW_EVENT_COLORS[event.eventType]}`}>
                  {FLOW_EVENT_LABELS[event.eventType]}
                </span>
                <span className="text-xs text-ink-700 font-mono">{formatTime(event.timestamp)}</span>
              </div>
              <p className="text-xs text-ink-700 mt-1">
                操作人：<span className="font-medium">{event.triggeredBy}</span>
              </p>
              {event.note && (
                <p className="text-xs text-parchment-400 mt-1 italic">"{event.note}"</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
