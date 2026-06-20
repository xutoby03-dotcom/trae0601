import { useState } from "react";
import { useDryingStore } from "@/store/dryingStore";
import { useWeatherStore } from "@/store/weatherStore";
import WeatherCard from "@/components/WeatherCard";
import DryingCard from "@/components/DryingCard";
import UrgentList from "@/components/UrgentList";
import MemberStats from "@/components/MemberStats";
import DryingForm from "@/components/DryingForm";
import CollectModal from "@/components/CollectModal";
import { sortByUrgency } from "@/utils/stats";
import { isOverdue24h } from "@/utils/time";
import { getActiveDryingCount, getOverdueCount } from "@/utils/stats";
import type { DryingRecord } from "@/types";
import { Shirt, Package, AlarmClock, CloudRain, Plus, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const { records } = useDryingStore();
  const { weather } = useWeatherStore();
  const [showForm, setShowForm] = useState(false);
  const [collectRecord, setCollectRecord] = useState<DryingRecord | null>(null);

  const drying = records.filter((r) => r.status === "drying");
  const sortedByUrgency = sortByUrgency(records);
  const activeCount = getActiveDryingCount(records);
  const overdueCount = getOverdueCount(records);
  const isHighRisk = weather.riskLevel >= 2;

  const stats = [
    {
      icon: <Shirt className="w-6 h-6" />,
      label: "晾晒中",
      value: activeCount,
      color: "#4A90D9",
      bg: "from-sky-400/20 to-sky-400/5",
    },
    {
      icon: <AlarmClock className="w-6 h-6" />,
      label: "超24h未收",
      value: overdueCount,
      color: "#FECA57",
      bg: "from-warn-yellow/30 to-warn-yellow/5",
      warn: overdueCount > 0,
    },
    {
      icon: <CloudRain className="w-6 h-6" />,
      label: "天气风险",
      value: weather.riskLevel === 1 ? "低" : weather.riskLevel === 2 ? "中" : "高",
      color: weather.riskLevel >= 2 ? "#EE5253" : "#1DD1A1",
      bg:
        weather.riskLevel >= 2 ? "from-warn-red/20 to-warn-red/5" : "from-warn-green/20 to-warn-green/5",
      warn: isHighRisk,
    },
    {
      icon: <Package className="w-6 h-6" />,
      label: "历史记录",
      value: records.length,
      color: "#FF9F43",
      bg: "from-sun-400/20 to-sun-400/5",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-2xl p-4 md:p-5 shadow-sm border border-white/60 bg-gradient-to-br ${s.bg} backdrop-blur-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${s.warn ? "animate-pulse-slow" : ""}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${s.color}25`, color: s.color }}
              >
                {s.icon}
              </div>
              {s.warn && (
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              )}
            </div>
            <div
              className="text-3xl font-display md:text-4xl"
              style={{ color: s.color }}
            >
              {s.value}
            </div>
            <div className="text-xs text-sky-600 mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <WeatherCard />

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-400/15 flex items-center justify-center">
                  <Shirt className="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-sky-800">当前晾晒</h2>
                  <p className="text-xs text-sky-500 mt-0.5">
                    共 {drying.length} 件衣物正在晾晒
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-primary text-sm" onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 inline mr-1" />
                  新增晾晒
                </button>
                <Link
                  to="/records" className="btn-secondary text-sm hidden md:inline-flex">
                  全部记录
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            {drying.length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-6xl mb-4">🌤️</div>
                <p className="text-sky-700 font-medium">当前没有晾晒中的衣物</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary mt-4">
                  <Plus className="w-4 h-4 inline mr-1" />
                  开始晾晒新衣物
                </button>
              </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedByUrgency.map((r) => (
                  <DryingCard key={r.id} record={r} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <UrgentList records={records} onCollect={setCollectRecord} />

          <MemberStats />

          <Link
            to="/balcony"
            className="card block hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sun-400/15 flex items-center justify-center">
                  🏠
                </div>
                <div>
                  <h3 className="font-display text-lg text-sky-800">查看阳台档案</h3>
                  <p className="text-xs text-sky-500 mt-0.5">朝向、遮雨、通风信息</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-sky-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
        </div>

      {showForm && <DryingForm onClose={() => setShowForm(false)} onSuccess={() => setShowForm(false)} />}
      {collectRecord && (
        <CollectModal
          record={collectRecord}
          onClose={() => setCollectRecord(null)}
          onSuccess={() => setCollectRecord(null)}
        />
      )}
    </div>
  );
}
