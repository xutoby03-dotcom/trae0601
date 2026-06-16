import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAquariumStore } from "@/store/useAquariumStore";
import { useFeedingStore } from "@/store/useFeedingStore";
import { useWaterStore } from "@/store/useWaterStore";
import AlertBanner from "@/components/common/AlertBanner";
import QuickActionButton from "@/components/common/QuickActionButton";
import AquariumCard from "@/components/aquarium/AquariumCard";
import FeedingModal from "@/components/feeding/FeedingModal";
import WaterStockForms from "@/components/water/WaterStockForms";
import {
  Utensils,
  Droplets,
  Beaker,
  PackagePlus,
  Fish,
  CalendarDays,
  Clock,
} from "lucide-react";
import {
  getRecentFeedingLogs,
  calcFeederRanking,
} from "@/utils/statistics";
import {
  formatDate,
  formatTime,
  leftoverMeta,
  fishStatusMeta,
  periodLabel,
} from "@/utils/formatters";
import { useStockStore } from "@/store/useStockStore";

export default function Dashboard() {
  const navigate = useNavigate();
  const aquariums = useAquariumStore((s) => s.aquariums);
  const records = useFeedingStore((s) => s.getAllRecords());
  const waterChanges = useWaterStore((s) => s.getWaterChanges());
  const stocks = useStockStore((s) => s.stocks);

  const [feedModal, setFeedModal] = useState<{
    open: boolean;
    aqId?: string;
    period?: "morning" | "evening";
  }>({ open: false });
  const [showWaterForm, setShowWaterForm] = useState(false);
  const [, forceRerender] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceRerender((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const recentLogs = getRecentFeedingLogs(10);
  const ranking = calcFeederRanking(14);

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-slide-up">
      <section>
        <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-brand-900 via-brand-800 to-water-700 text-white shadow-xl">
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-water-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-20 wave-pattern opacity-40" />
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs mb-4">
                <span className="w-2 h-2 rounded-full bg-water-300 animate-pulse" />
                系统运行正常
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-balance max-w-2xl">
                今天也要好好照顾小鱼们哦 🐟
              </h2>
              <p className="mt-2 text-white/80 max-w-xl">
                当前管理 {aquariums.length} 个鱼缸，{stocks.length} 种鱼粮 · 累计喂食{" "}
                {records.length} 次 · 换水 {waterChanges.length} 次
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-lg w-full">
              {[
                {
                  k: "鱼缸",
                  v: aquariums.length,
                  icon: Fish,
                },
                {
                  k: "今日已喂",
                  v: records.filter((r) =>
                    r.datetime.startsWith(new Date().toISOString().slice(0, 10))
                  ).length,
                  icon: Utensils,
                },
                {
                  k: "库存(总)",
                  v: `${Math.round(
                    stocks.reduce((s, x) => s + x.current_grams, 0)
                  )}g`,
                  icon: PackagePlus,
                },
              ].map((m, i) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.k}
                    className="relative rounded-2xl bg-white/10 border border-white/15 backdrop-blur px-3 py-4 md:px-5 md:py-5"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <Icon className="w-4 h-4 md:w-5 md:h-5 opacity-80 mb-2" />
                    <div className="text-xl md:text-2xl font-bold font-display tabular-nums">
                      {m.v}
                    </div>
                    <div className="text-[11px] md:text-xs opacity-75 mt-0.5">
                      {m.k}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section>
        <AlertBanner />
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionButton
          icon={Utensils}
          label="记录喂食"
          sublabel="记录喂食份量和鱼只状态"
          gradient="from-brand-700 to-water-600"
          onClick={() => setFeedModal({ open: true })}
        />
        <QuickActionButton
          icon={Droplets}
          label="登记换水"
          sublabel="记录换水量与日期"
          gradient="from-sky-600 to-brand-600"
          onClick={() => setShowWaterForm(true)}
        />
        <QuickActionButton
          icon={Beaker}
          label="水质检测"
          sublabel="录入 pH、氨氮等参数"
          gradient="from-purple-600 to-brand-600"
          onClick={() => setShowWaterForm(true)}
        />
        <QuickActionButton
          icon={PackagePlus}
          label="鱼粮入库"
          sublabel="补货或新增鱼粮种类"
          gradient="from-coral-500 to-amber-500"
          onClick={() => setShowWaterForm(true)}
        />
      </section>

      {showWaterForm && (
        <WaterStockForms onDone={() => setShowWaterForm(false)} />
      )}

      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h3 className="font-display text-xl font-bold text-brand-900">
              鱼缸概览
            </h3>
            <div className="text-xs text-brand-600 mt-1">
              点击时段按钮可直接记录喂食
            </div>
          </div>
          <button
            onClick={() => navigate("/aquariums/new")}
            className="btn-outline !py-2 !px-3 !text-xs"
          >
            + 新增鱼缸
          </button>
        </div>

        {aquariums.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <div className="text-5xl mb-3">🐠</div>
            <h4 className="font-display font-bold text-xl text-brand-900 mb-2">
              还没有鱼缸档案
            </h4>
            <p className="text-sm text-brand-600 mb-5">
              先创建第一个鱼缸档案，开启科学养鱼之旅吧
            </p>
            <button
              onClick={() => navigate("/aquariums/new")}
              className="btn-primary"
            >
              创建鱼缸档案
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {aquariums.map((a, i) => (
              <div
                key={a.id}
                style={{ animationDelay: `${i * 80}ms` }}
                className="animate-fade-slide-up"
              >
                <AquariumCard
                  aquarium={a}
                  onFeed={(aqId, period) =>
                    setFeedModal({ open: true, aqId, period })
                  }
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-brand-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-water-600" />
                最近喂食日志
              </h3>
              <div className="text-xs text-brand-600 mt-0.5">
                最新 10 条记录
              </div>
            </div>
            <button
              onClick={() => navigate("/feeding")}
              className="text-xs font-semibold text-brand-700 hover:text-brand-900"
            >
              全部记录 →
            </button>
          </div>

          {recentLogs.length === 0 ? (
            <div className="py-10 text-center text-sm text-brand-500">
              暂无记录，快去喂一次吧 🌱
            </div>
          ) : (
            <div className="divide-y divide-brand-100/60">
              {recentLogs.map((log, idx) => {
                const lo = leftoverMeta[log.leftover_level as keyof typeof leftoverMeta];
                const fs = fishStatusMeta[log.fish_status as keyof typeof fishStatusMeta];
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 py-3 animate-fade-slide-up"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-brand-100 to-water-100 flex items-center justify-center text-xs font-semibold text-brand-700 text-center leading-tight">
                      {log.date_label.split("月")[0]}月
                      <br />
                      {log.date_label.split("月")[1]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-brand-900">
                        <span>{log.aquarium_name}</span>
                        <span className={`chip ${fs.bg} ${fs.color} !py-0.5`}>
                          {fs.emoji} {log.period_cn}
                        </span>
                        <span className="text-xs text-brand-500 font-normal flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.time}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-brand-600">
                        <span>
                          👤 {log.feeder} ·{" "}
                          <span className="font-bold text-brand-800 tabular-nums">
                            {log.actual_grams.toFixed(1)}g
                          </span>
                        </span>
                        <span className={`chip ${lo.bg} ${lo.color} !py-0.5`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${lo.dot}`} />
                          {lo.label}
                        </span>
                        <span className={`chip ${fs.bg} ${fs.color} !py-0.5`}>
                          {fs.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-5 md:p-6">
            <h3 className="font-display text-lg font-bold text-brand-900 mb-4">
              🏆 喂食排行榜（近14天）
            </h3>
            {ranking.length === 0 ? (
              <div className="text-xs text-brand-500 py-4 text-center">
                暂无数据
              </div>
            ) : (
              <div className="space-y-3">
                {ranking.map((r, idx) => (
                  <div key={r.name} className="flex items-center gap-3">
                    <div
                      className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                        idx === 0
                          ? "bg-gradient-to-br from-amber-400 to-coral-500 text-white"
                          : idx === 1
                          ? "bg-gradient-to-br from-brand-200 to-water-200 text-brand-800"
                          : "bg-brand-50 text-brand-700"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-brand-800">
                          {r.name}
                        </span>
                        <span className="text-xs text-brand-600 tabular-nums">
                          {r.count}次 · {r.total_grams.toFixed(1)}g
                        </span>
                      </div>
                      <div className="h-1.5 mt-1.5 rounded-full bg-brand-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-500 to-water-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (r.count / Math.max(1, ranking[0].count)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-5 md:p-6">
            <h3 className="font-display text-lg font-bold text-brand-900 mb-3">
              📦 库存快速查看
            </h3>
            {stocks.length === 0 ? (
              <div className="text-xs text-brand-500 py-2 text-center">
                暂无库存
              </div>
            ) : (
              <div className="space-y-3">
                {stocks.map((s) => (
                  <div key={s.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-brand-800 truncate">
                        {s.food_name}
                      </span>
                      <span className="tabular-nums text-brand-600">
                        {s.current_grams}g
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-brand-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          s.current_grams < 100
                            ? "bg-red-400"
                            : s.current_grams < 300
                            ? "bg-coral-400"
                            : "bg-gradient-to-r from-water-500 to-brand-500"
                        }`}
                        style={{
                          width: `${Math.min(100, (s.current_grams / 1000) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => navigate("/statistics")}
              className="w-full mt-4 text-xs font-semibold text-brand-700 hover:text-brand-900 py-2 rounded-xl hover:bg-brand-50 transition"
            >
              查看完整统计与补货建议 →
            </button>
          </div>
        </div>
      </section>

      <FeedingModal
        open={feedModal.open}
        onClose={() => setFeedModal({ open: false })}
        defaultAquariumId={feedModal.aqId}
        defaultPeriod={feedModal.period}
      />
    </div>
  );
}
