import type { Session } from '../../shared/types';
import { useAppStore } from '@/store/appStore';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function SessionSelector() {
  const { sessions, selectedSessionId, setSelectedSessionId, fetchSessions } = useAppStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = sessions.find(s => s.id === selectedSessionId);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white shadow-card border border-night-teal-100 hover:shadow-card-hover transition-all"
      >
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-warm-orange-400 to-warm-orange-600 flex items-center justify-center text-white font-display text-lg shrink-0">
          🎬
        </div>
        <div className="text-left">
          <p className="font-display text-lg text-night-teal-800 leading-tight">
            {current?.title || '选择场次'}
          </p>
          <p className="text-xs text-night-teal-500">
            {current ? `${current.date} ${current.time} · ${current.venue}` : '请选择电影场次'}
          </p>
        </div>
        <ChevronDown size={18} className={`text-night-teal-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-card-hover border border-night-teal-100 overflow-hidden z-50">
          {sessions.length === 0 ? (
            <p className="p-4 text-sm text-night-teal-500 text-center">暂无场次</p>
          ) : (
            sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSessionId(s.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                  s.id === selectedSessionId ? 'bg-warm-orange-50' : 'hover:bg-night-teal-50'
                }`}
              >
                <SessionCardMini session={s} />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function SessionCardMini({ session }: { session: Session }) {
  const statusMap = {
    upcoming: { label: '即将开场', color: 'bg-forest text-white' },
    ongoing: { label: '进行中', color: 'bg-warm-orange-500 text-white' },
    ended: { label: '已结束', color: 'bg-night-teal-200 text-night-teal-700' },
  };
  const s = statusMap[session.status];

  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-night-teal-100 shrink-0">
        {session.photo ? (
          <img src={session.photo} alt={session.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🎥</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-night-teal-800 truncate">{session.title}</p>
        <p className="text-xs text-night-teal-500">{session.date} {session.time}</p>
      </div>
      <span className={`badge ${s.color}`}>{s.label}</span>
    </div>
  );
}
