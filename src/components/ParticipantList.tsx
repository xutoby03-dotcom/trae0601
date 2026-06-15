import React from 'react';
import { usePlanStore } from '../store/usePlanStore';
import { Avatar } from './Avatar';
import { UserPlus, X, Crown } from 'lucide-react';

export const ParticipantList: React.FC = () => {
  const participants = usePlanStore((s) => s.plan.participants);
  const addParticipant = usePlanStore((s) => s.addParticipant);
  const removeParticipant = usePlanStore((s) => s.removeParticipant);
  const setMainCharacter = usePlanStore((s) => s.setMainCharacter);
  const [showInput, setShowInput] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  const handleAdd = () => {
    const name = newName.trim();
    if (name) {
      addParticipant(name);
      setNewName('');
    }
    setShowInput(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') {
      setShowInput(false);
      setNewName('');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white/90">
          <span className="text-lg">👥</span>
          <span className="font-semibold">参与人</span>
          <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{participants.length}</span>
        </div>
        {!showInput && (
          <button
            onClick={() => setShowInput(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-all hover:scale-105"
          >
            <UserPlus className="w-4 h-4" />
            添加
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {participants.map((p) => (
          <div
            key={p.id}
            className="group relative flex items-center gap-2 bg-white/15 hover:bg-white/25 rounded-full pr-2 pl-1 py-1 border border-white/10 transition-all hover:scale-105"
          >
            <Avatar participant={p} size="md" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white leading-tight">
                {p.name}
              </span>
              {!p.isMainCharacter && (
                <button
                  onClick={() => setMainCharacter(p.id)}
                  className="text-[10px] text-white/60 hover:text-cream-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 leading-tight"
                >
                  <Crown className="w-2.5 h-2.5" />
                  设为主角
                </button>
              )}
            </div>
            {participants.length > 1 && (
              <button
                onClick={() => removeParticipant(p.id)}
                className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 hover:bg-red-500/30 rounded-full transition-all"
                title="移除"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            )}
          </div>
        ))}

        {showInput && (
          <div className="flex items-center gap-2 bg-white rounded-full pl-3 pr-1 py-1 shadow-lg animate-scale-in">
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKey}
              onBlur={handleAdd}
              placeholder="输入名字..."
              className="w-24 text-sm bg-transparent focus:outline-none text-slate2-800 placeholder-slate2-400"
              maxLength={10}
            />
            <button
              onClick={handleAdd}
              className="w-7 h-7 flex items-center justify-center bg-coral-500 text-white rounded-full text-white hover:bg-coral-600 transition-colors"
            >
              ✓
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
