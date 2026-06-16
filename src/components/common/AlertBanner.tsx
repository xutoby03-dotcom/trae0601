import {
  AlertTriangle,
  Info,
  XCircle,
  AlertOctagon,
  X,
} from "lucide-react";
import type { Alert } from "@/types";
import { useEffect, useState } from "react";
import { buildAlerts } from "@/utils/alertChecker";

const levelStyles: Record<
  Alert["level"],
  { wrapper: string; icon: string; ring: string; iconComponent: typeof Info }
> = {
  info: {
    wrapper: "from-brand-50 to-water-50 border-brand-200 text-brand-900",
    icon: "bg-brand-500",
    ring: "ring-brand-300/50",
    iconComponent: Info,
  },
  warning: {
    wrapper: "from-coral-50 to-amber-50 border-coral-400/40 text-coral-600",
    icon: "bg-coral-500",
    ring: "ring-coral-300/50",
    iconComponent: AlertTriangle,
  },
  danger: {
    wrapper: "from-red-50 to-rose-50 border-red-300 text-red-700",
    icon: "bg-red-500",
    ring: "ring-red-300/50",
    iconComponent: AlertOctagon,
  },
};

interface Props {
  showAll?: boolean;
  limit?: number;
}

export default function AlertBanner({ showAll = false, limit = 4 }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const tick = () => setAlerts(buildAlerts());
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  const visible = alerts.filter((a) => !dismissed.has(a.id)).slice(0, showAll ? 999 : limit);

  if (visible.length === 0) {
    if (showAll) {
      return (
        <div className="glass-card p-6 text-center">
          <div className="text-5xl mb-2">🌊</div>
          <div className="font-display font-bold text-lg text-brand-800">
            一切安好，状态正常
          </div>
          <div className="text-sm text-brand-600 mt-1">
            目前没有任何需要关注的提醒事项
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="space-y-3">
      {visible.map((a, idx) => {
        const s = levelStyles[a.level];
        const Icon = s.iconComponent;
        return (
          <div
            key={a.id}
            className={`relative flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r ${s.wrapper} border shadow-sm ring-1 ${s.ring} animate-fade-slide-up`}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div
              className={`shrink-0 w-10 h-10 rounded-xl ${s.icon} text-white flex items-center justify-center shadow ${
                a.level !== "info" ? "animate-pulse-soft" : ""
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm md:text-base">{a.title}</div>
              <div className="text-xs md:text-sm opacity-80 mt-0.5">{a.message}</div>
            </div>
            <button
              onClick={() =>
                setDismissed((prev) => new Set(prev).add(a.id))
              }
              className="shrink-0 w-8 h-8 rounded-lg hover:bg-black/5 flex items-center justify-center transition"
              title="关闭"
            >
              <X className="w-4 h-4" />
            </button>
            {a.level === "danger" && (
              <XCircle className="absolute -top-2 -right-2 w-5 h-5 text-red-500 bg-white rounded-full shadow-sm animate-pulse-soft" />
            )}
          </div>
        );
      })}
    </div>
  );
}
