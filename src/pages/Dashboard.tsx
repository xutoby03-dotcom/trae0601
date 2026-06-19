import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarClock,
  Users,
  DollarSign,
  Sparkles,
  ArrowRight,
  Skull,
  Car,
  Copy,
  Check,
} from "lucide-react";
import { useSessionStore } from "@/store/sessionStore";
import { usePlayerStore } from "@/store/playerStore";
import { useToast } from "@/components/Toast";
import {
  getNextWeekDates,
  getAvailabilityHeatmap,
  generatePaymentReminder,
} from "@/utils";
import { weekdays, timeSlots } from "@/data/mock";
import type { AvailableSlot, Weekday, TimeSlot, Player, GameSession } from "@/types";

export default function Dashboard() {
  const { sessions, registrations, getCapacityInfo } = useSessionStore();
  const { players } = usePlayerStore();
  const { showToast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const stats = useMemo(() => {
    const pendingSessions = sessions.filter((s) => s.status === "pending");
    const totalGap = pendingSessions.reduce(
      (sum, s) => sum + getCapacityInfo(s.id).gap,
      0
    );
    const unpaid = registrations.filter((r) => !r.isPaid && r.status !== "withdrew").length;

    const themeCount: Record<string, number> = {};
    sessions.forEach((s) => {
      themeCount[s.type] = (themeCount[s.type] ?? 0) + 1;
    });
    const topTheme = Object.entries(themeCount).sort((a, b) => b[1] - a[1])[0];

    return {
      pending: pendingSessions.length,
      totalGap,
      unpaid,
      topTheme: topTheme ? topTheme[0] : "-",
    };
  }, [sessions, registrations, getCapacityInfo]);

  const pendingSessions = useMemo(
    () =>
      sessions
        .filter((s) => s.status === "pending")
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        )
        .slice(0, 4),
    [sessions]
  );

  const unpaidList = useMemo(() => {
    return registrations
      .filter((r) => !r.isPaid && r.status !== "withdrew")
      .slice(0, 6)
      .map((r) => {
        const p = players.find((x) => x.id === r.playerId);
        const s = sessions.find((x) => x.id === r.sessionId);
        return { reg: r, player: p, session: s };
      });
  }, [registrations, players, sessions]);

  const heatmapData = useMemo(() => {
    const allSlots: AvailableSlot[][] = players.map((p) => p.availableSlots);
    return getAvailabilityHeatmap(allSlots);
  }, [players]);

  const nextWeek = getNextWeekDates();

  async function handleCopyReminder(
    e: React.MouseEvent,
    item: { player?: Player; session?: GameSession },
    idx: number
  ) {
    e.stopPropagation();
    e.preventDefault();
    if (!item.player || !item.session) return;
    const text = generatePaymentReminder(item.player, item.session);
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedIndex(idx);
      showToast(`催款文案已复制给 ${item.player.nickname}`);
      setTimeout(() => setCopiedIndex(null), 1800);
    } catch (err) {
      showToast("复制失败，请手动选择文字", "error");
    }
  }

  function heatColor(count: number, total: number) {
    if (count === 0) return "bg-ink-900/40 text-ink-600";
    const ratio = total > 0 ? count / total : 0;
    if (ratio >= 0.7) return "bg-glow-green/50 text-white shadow-glow-green";
    if (ratio >= 0.4) return "bg-glow-green/30 text-glow-green";
    if (ratio >= 0.2) return "bg-glow-amber/30 text-glow-amber";
    return "bg-glow-amber/15 text-ink-300";
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CalendarClock}
          label="待成团场次"
          value={stats.pending}
          color="indigo"
        />
        <StatCard
          icon={Users}
          label="总缺口人数"
          value={stats.totalGap}
          color="amber"
        />
        <StatCard
          icon={DollarSign}
          label="未付款"
          value={stats.unpaid}
          color="rose"
        />
        <StatCard
          icon={Sparkles}
          label="偏好主题"
          value={stats.topTheme}
          color="green"
          isText
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-white">
              待成团场次
            </h3>
            <Link to="/sessions" className="text-sm text-ink-400 hover:text-ink-200 flex items-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {pendingSessions.length === 0 ? (
            <div className="text-center py-10 text-ink-400">
              🎉 目前没有待成团的场次
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSessions.map((s) => {
                const cap = getCapacityInfo(s.id);
                const percent = Math.min(100, (cap.currentCount / s.maxPlayers) * 100);
                return (
                  <Link
                    to={`/sessions/${s.id}`}
                    key={s.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-ink-950/50 border border-ink-800 hover:border-ink-600 hover:bg-ink-900/60 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ink-700 to-ink-900 flex items-center justify-center shrink-0">
                      {s.isHorror ? (
                        <Skull className="w-6 h-6 text-glow-rose" />
                      ) : (
                        <span className="text-2xl">🎭</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-white truncate">
                          {s.theme}
                        </div>
                        <span className="chip bg-ink-800 text-ink-300 text-[10px]">
                          {s.type}
                        </span>
                      </div>
                      <div className="text-xs text-ink-400 mt-0.5">
                        {s.storeName} · {new Date(s.scheduledAt).toLocaleDateString()}
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="progress-bar flex-1 max-w-[200px]">
                          <div
                            className={`progress-fill ${
                              cap.enough ? "bg-glow-green" : "bg-glow-amber"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          cap.enough ? "text-glow-green" : "text-glow-amber"
                        }`}>
                          {cap.currentCount}/{s.minPlayers}-{s.maxPlayers}
                          {!cap.enough && ` · 差${cap.gap}人`}
                        </span>
                        {s.needCarpool && (
                          <span className="chip bg-glow-amber/20 text-glow-amber text-[10px]">
                            <Car className="w-3 h-3" />
                            需拼车
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-ink-500 group-hover:text-ink-200 transition-colors" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-white">
              未付款名单
            </h3>
            <DollarSign className="w-5 h-5 text-glow-amber" />
          </div>
          {unpaidList.length === 0 ? (
            <div className="text-center py-10 text-ink-400">
              ✅ 所有人都已付款
            </div>
          ) : (
            <div className="space-y-2">
              {unpaidList.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-ink-800/60 transition-all group"
                >
                  <Link
                    to={item.session ? `/sessions/${item.session.id}` : "/sessions"}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="w-9 h-9 rounded-lg bg-ink-800 flex items-center justify-center text-lg shrink-0">
                      {item.player?.avatar ?? "👤"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {item.player?.nickname ?? "未知玩家"}
                      </div>
                      <div className="text-xs text-ink-400 truncate">
                        {item.session?.theme ?? "未知场次"} · ¥{item.session?.price ?? 0}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="chip bg-glow-amber/20 text-glow-amber text-[10px]">
                      未付款
                    </span>
                    <button
                      onClick={(e) => handleCopyReminder(e, item, i)}
                      className="p-1.5 rounded-lg hover:bg-ink-700 text-ink-400 hover:text-glow-green transition-all"
                      title="复制催款文案"
                    >
                      {copiedIndex === i ? (
                        <Check className="w-4 h-4 text-glow-green" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-ink-300" />
          下周可约时段（{players.length} 人空档重叠）
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="text-left text-xs text-ink-500 font-medium pb-3 w-20 shrink-0">
                  时段
                </th>
                {nextWeek.map((d) => (
                  <th key={d.label} className="text-center text-xs font-medium pb-3 px-1">
                    <div className="text-ink-400">{d.weekday}</div>
                    <div className="text-ink-300 font-display">{d.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((ts) => (
                <tr key={ts} className="border-t border-ink-800/60">
                  <td className="py-2.5 text-sm text-ink-300 font-medium">{ts}</td>
                  {nextWeek.map((d) => {
                    const slot = `${d.weekday}${ts}` as AvailableSlot;
                    const { weekday, timeSlot } = parseSlotSafe(slot);
                    const count = heatmapData[weekday]?.[timeSlot] ?? 0;
                    return (
                      <td key={d.label} className="px-1 py-2">
                        <div
                          className={`rounded-lg py-2.5 text-center text-xs font-medium transition-all ${heatColor(
                            count,
                            players.length
                          )}`}
                          title={`${count} 人有空`}
                        >
                          {count > 0 ? `${count} 人` : "—"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-ink-400">
          <span>少</span>
          <div className="flex gap-1">
            {[0, 0.2, 0.4, 0.7].map((r) => (
              <div
                key={r}
                className={`w-6 h-4 rounded ${heatColor(
                  Math.ceil(r * players.length),
                  players.length
                )}`}
              />
            ))}
          </div>
          <span>多</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-display text-lg font-bold text-white mb-4">
            主题偏好统计
          </h3>
          <ThemeStats />
        </div>
        <div className="card">
          <h3 className="font-display text-lg font-bold text-white mb-4">
            胆量分布
          </h3>
          <CourageStats />
        </div>
      </div>
    </div>
  );
}

function parseSlotSafe(slot: AvailableSlot): { weekday: Weekday; timeSlot: TimeSlot } {
  for (let i = weekdays.length - 1; i >= 0; i--) {
    if (slot.startsWith(weekdays[i])) {
      return {
        weekday: weekdays[i],
        timeSlot: slot.slice(weekdays[i].length) as TimeSlot,
      };
    }
  }
  return { weekday: "周一", timeSlot: "下午" };
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  isText,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: "indigo" | "amber" | "rose" | "green";
  isText?: boolean;
}) {
  const colorMap = {
    indigo: "from-ink-600/50 to-ink-800/30 text-ink-200 border-ink-600/50",
    amber: "from-glow-amber/20 to-glow-amber/5 text-glow-amber border-glow-amber/30",
    rose: "from-glow-rose/20 to-glow-rose/5 text-glow-rose border-glow-rose/30",
    green: "from-glow-green/20 to-glow-green/5 text-glow-green border-glow-green/30",
  };
  return (
    <div className={`card bg-gradient-to-br ${colorMap[color]} border overflow-hidden`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-ink-300">{label}</span>
        <Icon className="w-5 h-5 opacity-70" />
      </div>
      <div
        className={`font-display font-bold ${
          isText ? "text-2xl" : "text-4xl"
        } tracking-tight`}
      >
        {value}
      </div>
    </div>
  );
}

function ThemeStats() {
  const { players } = usePlayerStore();
  const stats = useMemo(() => {
    const counter: Record<string, number> = {};
    players.forEach((p) => {
      p.tabooThemes.forEach((t) => {
        counter[t] = (counter[t] ?? 0) + 1;
      });
    });
    const entries = Object.entries(counter).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = Math.max(1, ...entries.map((e) => e[1]));
    return { entries, max };
  }, [players]);

  if (stats.entries.length === 0) {
    return <div className="text-center py-6 text-ink-400 text-sm">暂无忌讳主题数据</div>;
  }

  return (
    <div className="space-y-3">
      {stats.entries.map(([theme, count]) => (
        <div key={theme}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-ink-200">⚠️ {theme}（忌讳）</span>
            <span className="text-glow-rose font-medium">{count} 人</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill bg-gradient-to-r from-glow-rose/60 to-glow-rose"
              style={{ width: `${(count / stats.max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function CourageStats() {
  const { players } = usePlayerStore();
  const stats = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    players.forEach((p) => {
      counts[p.courageLevel] = (counts[p.courageLevel] ?? 0) + 1;
    });
    return counts;
  }, [players]);

  const max = Math.max(1, ...Object.values(stats));
  const bars = [
    { level: 1, label: "胆小", color: "bg-glow-rose" },
    { level: 2, label: "怂", color: "bg-glow-rose/70" },
    { level: 3, label: "普通", color: "bg-ink-500" },
    { level: 4, label: "胆大", color: "bg-glow-green/70" },
    { level: 5, label: "坦克", color: "bg-glow-green" },
  ];

  return (
    <div className="flex items-end justify-between gap-2 h-40 pt-4">
      {bars.map((b) => {
        const count = stats[b.level] ?? 0;
        const h = (count / max) * 100;
        return (
          <div key={b.level} className="flex-1 flex flex-col items-center gap-2">
            <div className="text-xs text-ink-300 font-medium">{count}</div>
            <div className="w-full flex-1 flex items-end">
              <div
                className={`w-full rounded-t-lg ${b.color} transition-all duration-700`}
                style={{ height: `${Math.max(h, count > 0 ? 8 : 0)}%` }}
              />
            </div>
            <div className="text-xs text-ink-400 text-center">
              <div className="font-medium text-ink-200">Lv.{b.level}</div>
              <div>{b.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
