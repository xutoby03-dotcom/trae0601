import { useState, useEffect } from 'react';
import { X, UserPlus, Edit3 } from 'lucide-react';
import type { Member, VoicePart } from '@/types';
import { VOICE_PART_CONFIG, VOICE_PARTS } from '@/utils/constants';
import { useMembersStore } from '@/stores/membersStore';

interface MemberFormModalProps {
  open: boolean;
  editingMember: Member | null;
  onClose: () => void;
}

export function MemberFormModal({ open, editingMember, onClose }: MemberFormModalProps) {
  const addMember = useMembersStore((s) => s.addMember);
  const updateMember = useMembersStore((s) => s.updateMember);
  const deleteMember = useMembersStore((s) => s.deleteMember);

  const [name, setName] = useState('');
  const [voicePart, setVoicePart] = useState<VoicePart>('soprano');
  const [vocalPower, setVocalPower] = useState(7);
  const [vocalRange, setVocalRange] = useState(7);
  const [experience, setExperience] = useState(6);

  useEffect(() => {
    if (open) {
      if (editingMember) {
        setName(editingMember.name);
        setVoicePart(editingMember.voicePart);
        setVocalPower(editingMember.vocalPower);
        setVocalRange(editingMember.vocalRange);
        setExperience(editingMember.experience);
      } else {
        setName('');
        setVoicePart('soprano');
        setVocalPower(7);
        setVocalRange(7);
        setExperience(6);
      }
    }
  }, [open, editingMember]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    const data = {
      name: name.trim(),
      voicePart,
      vocalPower,
      vocalRange,
      experience,
    };
    if (editingMember) {
      updateMember(editingMember.id, data);
    } else {
      addMember(data);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!editingMember) return;
    if (confirm(`确定删除成员「${editingMember.name}」吗？`)) {
      deleteMember(editingMember.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1a2e] to-[#12101c] shadow-2xl">
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{
              background: `linear-gradient(90deg, ${VOICE_PART_CONFIG[voicePart].color}, #D4AF37)`,
            }}
          />
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <div className="flex items-center gap-2">
              {editingMember ? (
                <Edit3 className="h-4 w-4 text-amber-400" />
              ) : (
                <UserPlus className="h-4 w-4 text-amber-400" />
              )}
              <h2 className="text-base font-semibold text-white">
                {editingMember ? '编辑成员' : '添加新成员'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">姓名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入成员姓名"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition focus:border-amber-500/50 focus:bg-white/10"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">所属声部</label>
              <div className="grid grid-cols-4 gap-1.5">
                {VOICE_PARTS.map((part) => {
                  const cfg = VOICE_PART_CONFIG[part];
                  const active = voicePart === part;
                  return (
                    <button
                      key={part}
                      type="button"
                      onClick={() => setVoicePart(part)}
                      style={{
                        borderColor: active ? cfg.color : 'rgba(255,255,255,0.1)',
                        backgroundColor: active ? cfg.bgColor : 'rgba(255,255,255,0.03)',
                        color: active ? cfg.textColor : 'rgba(255,255,255,0.6)',
                      }}
                      className="rounded-lg border px-2 py-2.5 text-xs font-medium transition hover:bg-white/5"
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span
                          className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{ backgroundColor: cfg.color }}
                        >
                          {cfg.shortLabel}
                        </span>
                        {cfg.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium text-white/60">音量强度</label>
                <span className="text-xs font-bold text-amber-300">{vocalPower}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={vocalPower}
                onChange={(e) => setVocalPower(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="mt-0.5 flex justify-between text-[9px] text-white/30">
                <span>轻柔</span>
                <span>适中</span>
                <span>洪亮</span>
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium text-white/60">音域广度</label>
                <span className="text-xs font-bold text-amber-300">{vocalRange}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={vocalRange}
                onChange={(e) => setVocalRange(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="mt-0.5 flex justify-between text-[9px] text-white/30">
                <span>窄</span>
                <span>适中</span>
                <span>宽广</span>
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium text-white/60">经验水平</label>
                <span className="text-xs font-bold text-amber-300">{experience}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="mt-0.5 flex justify-between text-[9px] text-white/30">
                <span>新人</span>
                <span>熟练</span>
                <span>资深</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-white/5 bg-black/20 px-5 py-3">
            {editingMember ? (
              <button
                onClick={handleDelete}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20"
              >
                删除成员
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-2 text-xs font-semibold text-[#1a1a2e] shadow-md shadow-amber-500/20 transition hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50"
              >
                {editingMember ? '保存修改' : '添加成员'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
