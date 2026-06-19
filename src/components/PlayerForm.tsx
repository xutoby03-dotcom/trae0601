import { useState, useEffect } from "react";
import { Star, Sparkles } from "lucide-react";
import type { Player, CourageLevel, AvailableSlot } from "@/types";
import {
  weekdays,
  timeSlots,
  allTabooThemes,
  courageLabels,
} from "@/data/mock";
import { buildSlot } from "@/utils";

interface Props {
  initial?: Player;
  onSubmit: (data: Omit<Player, "id" | "createdAt">) => void;
  onCancel: () => void;
}

const avatars = ["🦹", "🦌", "🎭", "🌸", "🍪", "🐺", "🦊", "🐻", "🦄", "🐲", "👻", "🧙"];

export default function PlayerForm({ initial, onSubmit, onCancel }: Props) {
  const [nickname, setNickname] = useState(initial?.nickname ?? "");
  const [contact, setContact] = useState(initial?.contact ?? "");
  const [courageLevel, setCourageLevel] = useState<CourageLevel>(
    initial?.courageLevel ?? 3
  );
  const [tabooThemes, setTabooThemes] = useState<string[]>(
    initial?.tabooThemes ?? []
  );
  const [isNewbie, setIsNewbie] = useState(initial?.isNewbie ?? false);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>(
    initial?.availableSlots ?? []
  );
  const [avatar, setAvatar] = useState(initial?.avatar ?? avatars[0]);

  useEffect(() => {
    if (!initial && !nickname) {
      setAvatar(avatars[Math.floor(Math.random() * avatars.length)]);
    }
  }, [initial]);

  function toggleTaboo(theme: string) {
    setTabooThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  }

  function toggleSlot(slot: AvailableSlot) {
    setAvailableSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) return;
    onSubmit({
      nickname: nickname.trim(),
      contact: contact.trim(),
      courageLevel,
      tabooThemes,
      isNewbie,
      availableSlots,
      avatar,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="label">头像</label>
        <div className="flex flex-wrap gap-2">
          {avatars.map((a) => (
            <button
              type="button"
              key={a}
              onClick={() => setAvatar(a)}
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all ${
                avatar === a
                  ? "bg-ink-600 ring-2 ring-ink-400 shadow-glow"
                  : "bg-ink-800/50 hover:bg-ink-700"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">昵称 *</label>
          <input
            className="input"
            placeholder="玩家昵称"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
        <div>
          <label className="label">联系方式</label>
          <input
            className="input"
            placeholder="手机号/微信"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label">
          胆量等级：<span className="text-ink-300">{courageLabels[courageLevel]}</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((lvl) => (
            <button
              type="button"
              key={lvl}
              onClick={() => setCourageLevel(lvl as CourageLevel)}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                courageLevel >= lvl
                  ? lvl >= 4
                    ? "bg-glow-green/20 text-glow-green"
                    : lvl <= 2
                    ? "bg-glow-rose/20 text-glow-rose"
                    : "bg-ink-600/40 text-ink-100"
                  : "bg-ink-800/50 text-ink-600"
              }`}
            >
              <Star
                className="w-4 h-4"
                fill={courageLevel >= lvl ? "currentColor" : "none"}
              />
              <span className="text-xs font-medium">{lvl}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">忌讳主题（点击选择）</label>
        <div className="flex flex-wrap gap-2">
          {allTabooThemes.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => toggleTaboo(t)}
              className={`chip transition-all ${
                tabooThemes.includes(t)
                  ? "bg-glow-rose/30 text-glow-rose ring-1 ring-glow-rose/50"
                  : "bg-ink-800/60 text-ink-300 hover:bg-ink-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label flex items-center gap-2">
          <input
            type="checkbox"
            checked={isNewbie}
            onChange={(e) => setIsNewbie(e.target.checked)}
            className="w-4 h-4 rounded border-ink-600 bg-ink-950 text-ink-500 focus:ring-ink-500"
          />
          是否新手（需要照顾）
          <Sparkles className="w-4 h-4 text-glow-amber" />
        </label>
      </div>

      <div>
        <label className="label">常用空档（可多选）</label>
        <div className="space-y-2">
          {weekdays.map((wd) => (
            <div key={wd} className="flex items-center gap-2">
              <span className="w-12 text-sm text-ink-300 shrink-0">{wd}</span>
              <div className="flex gap-1.5 flex-1">
                {timeSlots.map((ts) => {
                  const slot = buildSlot(wd, ts);
                  const active = availableSlots.includes(slot);
                  return (
                    <button
                      type="button"
                      key={ts}
                      onClick={() => toggleSlot(slot)}
                      className={`flex-1 py-1.5 text-xs rounded-lg transition-all ${
                        active
                          ? "bg-glow-green/25 text-glow-green ring-1 ring-glow-green/40"
                          : "bg-ink-800/50 text-ink-400 hover:bg-ink-700"
                      }`}
                    >
                      {ts}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">
          取消
        </button>
        <button type="submit" className="btn-primary">
          {initial ? "保存修改" : "创建玩家"}
        </button>
      </div>
    </form>
  );
}
