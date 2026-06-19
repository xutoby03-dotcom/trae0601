import { useState } from "react";
import { Clock, Users, Coins, Gauge, Skull } from "lucide-react";
import type { GameSession, SessionType, CourageLevel } from "@/types";
import { sessionTypes } from "@/data/mock";

interface Props {
  initial?: GameSession;
  onSubmit: (
    data: Omit<GameSession, "id" | "createdAt" | "status">
  ) => void;
  onCancel: () => void;
}

const defaultScheduled = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  d.setHours(19, 0, 0, 0);
  return d.toISOString().slice(0, 16);
};

export default function SessionForm({ initial, onSubmit, onCancel }: Props) {
  const [storeName, setStoreName] = useState(initial?.storeName ?? "");
  const [theme, setTheme] = useState(initial?.theme ?? "");
  const [type, setType] = useState<SessionType>(initial?.type ?? "恐怖");
  const [durationMinutes, setDurationMinutes] = useState(
    initial?.durationMinutes ?? 120
  );
  const [minPlayers, setMinPlayers] = useState(initial?.minPlayers ?? 4);
  const [maxPlayers, setMaxPlayers] = useState(initial?.maxPlayers ?? 8);
  const [price, setPrice] = useState(initial?.price ?? 168);
  const [difficulty, setDifficulty] = useState<CourageLevel>(
    initial?.difficulty ?? 3);
  const [isHorror, setIsHorror] = useState(initial?.isHorror ?? true);
  const [scheduledAt, setScheduledAt] = useState(
    initial?.scheduledAt.slice(0, 16) ?? defaultScheduled()
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!storeName.trim() || !theme.trim()) return;
    onSubmit({
      storeName: storeName.trim(),
      theme: theme.trim(),
      type,
      durationMinutes,
      minPlayers,
      maxPlayers,
      price,
      difficulty,
      isHorror,
      scheduledAt: new Date(scheduledAt).toISOString(),
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">门店名称 *</label>
          <input
            className="input"
            placeholder="例：迷雾密室"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">主题名称 *</label>
          <input
            className="input"
            placeholder="例：怨灵医院"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">类型</label>
          <select
            className="input"
            value={type}
            onChange={(e) => {
              const v = e.target.value as SessionType;
              setType(v);
              if (v === "恐怖") setIsHorror(true);
            }}
          >
              {sessionTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        <div>
          <label className="label flex items-center gap-2">
            <input
              type="checkbox"
              checked={isHorror}
              onChange={(e) => setIsHorror(e.target.checked)}
              className="w-4 h-4 rounded border-ink-600 bg-ink-950 text-ink-500"
            />
            恐怖本
            <Skull
              className={`w-4 h-4 ${isHorror ? "text-glow-rose" : "text-ink-500"}`}
            />
          </label>
          <div className="mt-2">
            <label className="label">场次时间</label>
            <input
              type="datetime-local"
              className="input"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            时长（分钟）
          </label>
          <input
            type="number"
            min={30}
            step={15}
            className="input"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            最低人数
          </label>
          <input
            type="number"
            min={1}
            className="input"
            value={minPlayers}
            onChange={(e) => {
              const v = Number(e.target.value);
              setMinPlayers(v);
              if (maxPlayers < v) setMaxPlayers(v);
            }}
          />
        </div>
        <div>
          <label className="label flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            满员人数
          </label>
          <input
            type="number"
            min={minPlayers}
            className="input"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label flex items-center gap-1.5">
            <Coins className="w-4 h-4" />
            价格（元/人）
          </label>
          <input
            type="number"
            min={0}
            className="input"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label flex items-center gap-1.5">
            <Gauge className="w-4 h-4" />
            难度等级
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((l) => (
              <button
                type="button"
                key={l}
                onClick={() => setDifficulty(l as CourageLevel)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  difficulty >= l
                    ? l >= 4
                      ? "bg-glow-rose/30 text-glow-rose"
                      : l <= 2
                      ? "bg-glow-green/30 text-glow-green"
                      : "bg-ink-600/50 text-white"
                    : "bg-ink-800/60 text-ink-500"
                }`}
              >
                {l}
              </button>
              ))}
          </div>
        </div>
      </div>

      <div>
        <label className="label">备注</label>
        <textarea
          className="input !min-h-[70px resize-none"
          placeholder="拼场备注..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">
          取消
        </button>
        <button type="submit" className="btn-primary">
          {initial ? "保存修改" : "创建场次"}
        </button>
      </div>
    </form>
  );
}
