import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Calendar, MapPin, BookOpen, Plus, ChevronRight, FileText } from 'lucide-react';

export default function SessionSelector() {
  const { sessions, currentSessionId, setCurrentSession, addSession } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [scriptName, setScriptName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [charactersInput, setCharactersInput] = useState('');

  const handleCreate = () => {
    if (!roomName.trim() || !scriptName.trim()) return;
    const characters = charactersInput
      .split(/[,，、\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    addSession({ roomName: roomName.trim(), scriptName: scriptName.trim(), date, characters });
    setRoomName('');
    setScriptName('');
    setCharactersInput('');
    setShowCreate(false);
  };

  return (
    <div className="card-parchment p-4 h-full flex flex-col animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold text-ink-800 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          场次档案
        </h2>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-secondary flex items-center gap-1">
          <Plus className="w-4 h-4" />
          新建
        </button>
      </div>

      {showCreate && (
        <div className="mb-4 p-3 bg-parchment-100 rounded-lg border-2 border-parchment-300 animate-fade-in-up space-y-3">
          <div>
            <label className="label-text">房间</label>
            <input className="input-field" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="如：雾隐阁" />
          </div>
          <div>
            <label className="label-text">剧本</label>
            <input className="input-field" value={scriptName} onChange={(e) => setScriptName(e.target.value)} placeholder="如：古堡惊魂" />
          </div>
          <div>
            <label className="label-text">日期</label>
            <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label-text">角色（逗号分隔）</label>
            <input className="input-field" value={charactersInput} onChange={(e) => setCharactersInput(e.target.value)} placeholder="如：管家, 大小姐, 医生" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="btn-primary flex-1">创建场次</button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">取消</button>
          </div>
        </div>
      )}

      <div className="space-y-2 overflow-y-auto flex-1">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => setCurrentSession(session.id)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
              currentSessionId === session.id
                ? 'bg-ink-800 text-parchment-50 border-ink-900 shadow-stamp'
                : 'bg-parchment-50 text-ink-800 border-parchment-200 hover:border-parchment-400 hover:bg-parchment-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base">{session.scriptName}</h3>
              <ChevronRight className="w-4 h-4" />
            </div>
            <div className={`mt-1.5 space-y-1 text-xs ${currentSessionId === session.id ? 'text-parchment-200' : 'text-ink-700'}`}>
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />{session.roomName}
              </p>
              <p className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />{session.date}
              </p>
              <p className="flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" />{session.characters.length} 位角色
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
