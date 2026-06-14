import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Boxes,
  ArrowRightLeft,
  Clock,
  AlertTriangle,
  Plus,
  ClipboardList,
  RotateCcw,
  Phone,
  Send,
  CheckCircle2,
  TrendingUp,
  History,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import {
  formatRelative,
  basketStatusLabel,
  basketStatusClass,
  lendStatusLabel,
  lendStatusClass,
  overdueDays,
} from "@/utils/format";
import type { LendRecord, ReminderChannel } from "@/types";
import ReminderModal from "@/components/ReminderModal";

export default function Dashboard() {
  const { baskets, lendRecords, reminderRecords, sendReminder } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LendRecord | null>(null);

  const stats = useMemo(() => {
    const available = baskets.filter((b) => b.status === "available").length;
    const lent = lendRecords.filter(
      (r) => r.status === "active" || r.status === "overdue"
    ).length;
    const overdue = lendRecords.filter((r) => r.status === "overdue").length;
    const damaged = baskets.filter((b) => b.status === "repair").length;
    const total = baskets.filter((b) => b.status !== "scrapped").length;
    const damageRate = total > 0 ? ((damaged / total) * 100).toFixed(1) : "0";
    return { available, lent, overdue, damageRate, total };
  }, [baskets, lendRecords]);

  const overdueRecords = useMemo(
    () => lendRecords.filter((r) => r.status === "overdue"),
    [lendRecords]
  );

  const timeline = useMemo(() => {
    const events: {
      id: string;
      type: "lend" | "return";
      time: string;
      title: string;
      desc: string;
    }[] = [];
    lendRecords.forEach((r) => {
      events.push({
        id: `l-${r.id}`,
        type: "lend",
        time: r.lendTime,
        title: `${r.borrowerName} 借出 ${r.basketCode}`,
        desc: `${r.department} · ${r.destination}`,
      });
      if (r.actualReturnTime) {
        events.push({
          id: `r-${r.id}`,
          type: "return",
          time: r.actualReturnTime,
          title: `${r.basketCode} 已归还`,
          desc: `检查人：系统管理员`,
        });
      }
    });
    return events.sort((a, b) => +new Date(b.time) - +new Date(a.time)).slice(0, 10);
  }, [lendRecords]);

  const kpiCards = [
    {
      label: "可用篮子",
      value: stats.available,
      total: stats.total,
      icon: Boxes,
      accent: "from-forest-500 to-forest-600",
      bg: "bg-forest-50",
      text: "text-forest-600",
      sub: `共 ${stats.total} 只在库`,
    },
    {
      label: "借出中",
      value: stats.lent,
      total: stats.total,
      icon: ArrowRightLeft,
      accent: "from-steel-500 to-steel-700",
      bg: "bg-steel-50",
      text: "text-steel-600",
      sub: "流动中数量",
    },
    {
      label: "逾期未还",
      value: stats.overdue,
      icon: AlertTriangle,
      accent: "from-signal-500 to-signal-700",
      bg: "bg-signal-50",
      text: "text-signal-500",
      sub: stats.overdue > 0 ? "需立即跟进" : "暂无逾期",
    },
    {
      label: "破损率",
      value: `${stats.damageRate}%`,
      icon: Clock,
      accent: "from-amber-500 to-amber-700",
      bg: "bg-amber-50",
      text: "text-amber-600",
      sub: "本月维修占比",
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          const percent =
            typeof card.value === "number" && card.total
              ? Math.round((card.value / card.total) * 100)
              : 0;
          return (
            <div
              key={card.label}
              className="card card-hover relative overflow-hidden"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div
                className={`absolute top-0 right-0 w-28 h-28 rounded-full bg-gradient-to-br ${card.accent} opacity-5 -mr-8 -mt-8`}
              />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-11 h-11 rounded-lg ${card.bg} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${card.text}`} />
                  </div>
                  {typeof card.value === "number" && (
                    <span className="text-xs font-mono text-slate2-400">
                      {percent}%
                    </span>
                  )}
                </div>
                <div className="font-display font-bold text-3xl text-slate2-800 mb-1 tabular-nums">
                  {card.value}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate2-500">{card.label}</span>
                  <span className="text-xs text-slate2-400">{card.sub}</span>
                </div>
                {typeof card.value === "number" && card.total && (
                  <div className="mt-3 h-1.5 rounded-full bg-slate2-100 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${card.accent} rounded-full transition-all duration-700`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Link
          to="/lend"
          className="card card-hover group relative overflow-hidden"
        >
          <div className="p-6 bg-gradient-to-br from-steel-50 via-white to-steel-50">
            <div className="w-14 h-14 rounded-xl bg-steel-600 text-white flex items-center justify-center mb-4 shadow-industrial group-hover:scale-105 transition-transform">
              <ClipboardList className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate2-800 mb-1">
              快速借出
            </h3>
            <p className="text-sm text-slate2-500">登记借用信息 · 选择篮子</p>
          </div>
        </Link>
        <Link
          to="/return"
          className="card card-hover group relative overflow-hidden"
        >
          <div className="p-6 bg-gradient-to-br from-forest-50 via-white to-forest-50">
            <div className="w-14 h-14 rounded-xl bg-forest-500 text-white flex items-center justify-center mb-4 shadow-industrial group-hover:scale-105 transition-transform">
              <RotateCcw className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate2-800 mb-1">
              归还检查
            </h3>
            <p className="text-sm text-slate2-500">破损·清空·归位核验</p>
          </div>
        </Link>
        <Link
          to="/baskets/new"
          className="card card-hover group relative overflow-hidden"
        >
          <div className="p-6 bg-gradient-to-br from-amber-50 via-white to-amber-50">
            <div className="w-14 h-14 rounded-xl bg-amber-500 text-steel-900 flex items-center justify-center mb-4 shadow-industrial group-hover:scale-105 transition-transform">
              <Plus className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate2-800 mb-1">
              新增篮子
            </h3>
            <p className="text-sm text-slate2-500">录入档案 · 拍摄照片</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-signal-50 to-white border-b border-slate2-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <AlertTriangle className="w-5 h-5 text-signal-500" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-signal-500 animate-blink-dot" />
              </div>
              <h3 className="font-display font-semibold text-slate2-800">
                逾期提醒
              </h3>
            </div>
            <span className="text-xs font-mono text-signal-500 bg-signal-50 px-2 py-0.5 rounded-full">
              {overdueRecords.length} 笔待处理
            </span>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
            {overdueRecords.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-forest-300 mx-auto mb-3" />
                <p className="text-slate2-400 text-sm">当前没有逾期记录</p>
                <p className="text-xs text-slate2-300 mt-1">所有篮子均按时归还</p>
              </div>
            ) : (
              overdueRecords.map((r) => {
                const days = overdueDays(r.expectedReturnTime);
                const basket = baskets.find((b) => b.id === r.basketId);
                const count = reminderRecords.filter(
                  (rm) => rm.lendRecordId === r.id
                ).length;
                return (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-lg bg-signal-50/60 border border-signal-100 hover:bg-signal-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-semibold text-sm text-slate2-800">
                            {r.basketCode}
                          </span>
                          {r.hasValuable && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">
                              ⭐ 贵重
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate2-700 font-medium truncate">
                          {r.borrowerName} · {r.department}
                        </p>
                        <p className="text-xs text-slate2-500 mt-0.5 truncate">
                          📱 {r.borrowerPhone}
                        </p>
                        <p className="text-xs text-slate2-500 mt-0.5 truncate">
                          目的地：{r.destination}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="text-right">
                          <div className="font-display font-bold text-signal-500 text-lg tabular-nums leading-none">
                            {days}
                          </div>
                          <div className="text-[10px] text-signal-400 mt-0.5">
                            天逾期
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedRecord(r);
                            setModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-signal-200 text-signal-600 hover:bg-signal-500 hover:text-white hover:border-signal-500 transition-all"
                          title="打开催还详情"
                        >
                          {count > 0 ? (
                            <>
                              <History className="w-3 h-3" />
                              催还 ({count})
                            </>
                          ) : (
                            <>
                              <Phone className="w-3 h-3" />
                              催还
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-signal-100">
                      <div className="flex items-center gap-2 text-[11px] text-slate2-500">
                        <span className="inline-flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          借出 {formatRelative(r.lendTime)}
                        </span>
                        {basket && (
                          <span
                            className={`status-badge ${basketStatusClass[basket.status]}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                basket.status === "available"
                                  ? "bg-forest-500"
                                  : basket.status === "repair"
                                  ? "bg-amber-500"
                                  : "bg-steel-500"
                              }`}
                            />
                            {basketStatusLabel[basket.status]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-3 card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate2-200 flex items-center justify-between">
            <h3 className="font-display font-semibold text-slate2-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-steel-500" />
              近期操作流水
            </h3>
            <Link
              to="/stats"
              className="text-xs text-steel-600 hover:text-steel-700 font-medium"
            >
              查看全部 →
            </Link>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto scrollbar-thin">
            <div className="relative pl-6">
              <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gradient-to-b from-steel-200 via-steel-100 to-transparent" />
              {timeline.length === 0 ? (
                <p className="py-12 text-center text-slate2-400 text-sm">
                  暂无操作记录
                </p>
              ) : (
                <ul className="space-y-4">
                  {timeline.map((ev, i) => (
                    <li key={ev.id} className="relative">
                      <span
                        className={`absolute -left-[18px] top-1.5 w-3 h-3 rounded-full border-2 border-white ring-2 ${
                          ev.type === "lend"
                            ? "bg-steel-500 ring-steel-100"
                            : "bg-forest-500 ring-forest-100"
                        }`}
                      />
                      <div
                        className="p-3 rounded-lg border border-slate2-100 hover:border-slate2-200 transition-colors"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-slate2-800">
                            {ev.title}
                          </p>
                          <span
                            className={`status-badge text-[10px] ${
                              ev.type === "lend"
                                ? lendStatusClass.active
                                : lendStatusClass.returned
                            }`}
                          >
                            {ev.type === "lend"
                              ? lendStatusLabel.active
                              : lendStatusLabel.returned}
                          </span>
                        </div>
                        <p className="text-xs text-slate2-500 mb-1.5">
                          {ev.desc}
                        </p>
                        <p className="text-[11px] text-slate2-400 font-mono">
                          {formatRelative(ev.time)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      <ReminderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        record={selectedRecord}
        reminders={reminderRecords}
        onConfirm={({ channel, note }) => {
          if (!selectedRecord) return;
          sendReminder({
            lendRecordId: selectedRecord.id,
            channel: channel as ReminderChannel,
            note,
          });
        }}
      />
    </div>
  );
}
