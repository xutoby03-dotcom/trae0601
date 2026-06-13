import { AlertTriangle, Clock, CalendarCheck, X } from "lucide-react";
import { usePetStore } from "../store/petStore";
import { getPetLatestRecords, getStatusColor, getStatusLabel } from "../utils/deworm";
import { daysUntil, formatDateDisplay } from "../utils/date";
import type { Pet, ReminderStatus } from "../types";
import { Link } from "react-router-dom";

interface ReminderSummaryCardsProps {
  onClose?: () => void;
  showBanner?: boolean;
}

interface ReminderItem {
  pet: Pet;
  nextDate: string;
  status: ReminderStatus;
  type: "internal" | "external";
}

export function getReminders(): ReminderItem[] {
  const { pets, records } = usePetStore.getState();
  const items: ReminderItem[] = [];
  for (const pet of pets) {
    const latest = getPetLatestRecords(pet.id, records);
    if (latest.nextInternalDate && latest.nextInternalStatus !== "normal") {
      items.push({
        pet,
        nextDate: latest.nextInternalDate,
        status: latest.nextInternalStatus as ReminderStatus,
        type: "internal",
      });
    }
    if (latest.nextExternalDate && latest.nextExternalStatus !== "normal") {
      items.push({
        pet,
        nextDate: latest.nextExternalDate,
        status: latest.nextExternalStatus as ReminderStatus,
        type: "external",
      });
    }
  }
  return items.sort(
    (a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime()
  );
}

export default function ReminderSummaryCards({
  showBanner = true,
}: ReminderSummaryCardsProps) {
  const pets = usePetStore((s) => s.pets);
  const records = usePetStore((s) => s.records);
  const dismissWeightAlert = usePetStore((s) => s.dismissWeightAlert);
  const checkNeedsDoseReview = usePetStore((s) => s.checkNeedsDoseReview);

  let overdue = 0;
  let urgent = 0;
  let upcoming = 0;

  for (const pet of pets) {
    const latest = getPetLatestRecords(pet.id, records);
    if (latest.nextInternalStatus === "overdue") overdue++;
    if (latest.nextInternalStatus === "urgent") urgent++;
    if (latest.nextInternalStatus === "upcoming") upcoming++;
    if (latest.nextExternalStatus === "overdue") overdue++;
    if (latest.nextExternalStatus === "urgent") urgent++;
    if (latest.nextExternalStatus === "upcoming") upcoming++;
  }

  const weightAlertPets = pets.filter((p) => checkNeedsDoseReview(p.id));

  const cards = [
    {
      label: "已逾期",
      count: overdue,
      color: "bg-gradient-to-br from-alert-500 to-alert-600",
      textColor: "text-white",
      icon: AlertTriangle,
      filter: "overdue" as ReminderStatus,
    },
    {
      label: "3天内到期",
      count: urgent,
      color: "bg-gradient-to-br from-warm-400 to-warm-600",
      textColor: "text-white",
      icon: Clock,
      filter: "urgent" as ReminderStatus,
    },
    {
      label: "7天内到期",
      count: upcoming,
      color: "bg-gradient-to-br from-mint-400 to-mint-600",
      textColor: "text-white",
      icon: CalendarCheck,
      filter: "upcoming" as ReminderStatus,
    },
  ];

  return (
    <div className="space-y-4">
      {showBanner && weightAlertPets.length > 0 && (
        <div className="card p-4 border-l-4 border-l-warm-500 bg-warm-50/50 animate-slide-down">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-warm-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4.5 h-4.5 text-warm-600" />
              </div>
              <div>
                <p className="font-semibold text-warm-700">
                  体重变化提醒
                </p>
                <p className="text-sm text-warm-600 mt-0.5">
                  {weightAlertPets.map((p) => p.name).join("、")}
                  的体重变化超过 10%，建议复核驱虫剂量
                </p>
              </div>
            </div>
            <button
              onClick={() => weightAlertPets.forEach((p) => dismissWeightAlert(p.id))}
              className="text-warm-400 hover:text-warm-600 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {cards.map((c, i) => (
          <Link
            to="/"
            key={c.label}
            className={`card-hover p-4 ${c.color} ${c.textColor} animate-fade-in-up`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs opacity-90 font-medium">{c.label}</p>
                <p className="text-3xl font-bold mt-1 font-display">
                  {c.count}
                </p>
              </div>
              <c.icon className="w-5 h-5 opacity-90" />
            </div>
          </Link>
        ))}
      </div>

      {(overdue > 0 || urgent > 0 || upcoming > 0) && (
        <div className="card p-4 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <h3 className="font-semibold text-ink-700 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warm-500" />
            待处理提醒
          </h3>
          <div className="space-y-2">
            {getReminders().slice(0, 5).map((r, i) => (
              <Link
                to={`/pet/${r.pet.id}/deworm/new`}
                key={i}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-ink-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={r.pet.photoUrl}
                    alt={r.pet.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-ink-700 text-sm group-hover:text-warm-600 transition-colors">
                      {r.pet.name}
                      <span className={`chip ml-2 ${getStatusColor(r.status)}`}>
                        {getStatusLabel(r.status)}
                      </span>
                    </p>
                    <p className="text-xs text-ink-400 mt-0.5">
                      {r.type === "internal" ? "体内" : "体外"}驱虫 ·{" "}
                      {formatDateDisplay(r.nextDate)}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-ink-400">
                  {daysUntil(r.nextDate) < 0
                    ? `逾期 ${Math.abs(daysUntil(r.nextDate))} 天`
                    : `还有 ${daysUntil(r.nextDate)} 天`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
