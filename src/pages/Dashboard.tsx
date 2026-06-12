import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Plus,
  ClipboardList,
  ChevronRight,
  HeartPulse,
} from "lucide-react";
import { useAppStore } from "@/store";
import {
  getTodayRecords,
  getPendingRetestRecords,
  getRetestStats,
  formatTime,
  getFeelingEmoji,
} from "@/utils/bpUtils";
import RecordCard from "@/components/BPRecord/RecordCard";
import RetestAlertBanner from "@/components/BPRecord/RetestAlertBanner";
import { parseISO } from "date-fns";

export default function Dashboard() {
  const navigate = useNavigate();
  const { records, selectedElderId, profiles } = useAppStore();

  const elderRecords = selectedElderId
    ? records.filter((r) => r.elderId === selectedElderId)
    : records;

  const todayRecords = getTodayRecords(elderRecords);
  const todayAbnormal = todayRecords.filter((r) => r.isAbnormal);
  const pendingRetests = getPendingRetestRecords(elderRecords);
  const retestStats = getRetestStats(elderRecords);
  const selectedElder = profiles.find((p) => p.id === selectedElderId);

  const recentRecords = [...elderRecords]
    .filter((r) => !r.originalRecordId)
    .sort((a, b) => parseISO(b.measureTime).getTime() - parseISO(a.measureTime).getTime())
    .slice(0, 5);

  const stats = [
    {
      label: "今日测量",
      value: todayRecords.length,
      icon: Activity,
      gradient: "from-primary-500 to-primary-600",
    },
    {
      label: "今日异常",
      value: todayAbnormal.length,
      icon: AlertTriangle,
      gradient: "from-amber-400 to-amber-500",
    },
    {
      label: "待复测",
      value: pendingRetests.length,
      icon: HeartPulse,
      gradient: "from-danger-500 to-danger-600",
    },
    {
      label: "复测完成率",
      value: `${retestStats.rate}%`,
      icon: CheckCircle2,
      gradient: "from-success-500 to-success-600",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">
            {selectedElder ? `${selectedElder.name}的健康概览` : "健康概览"}
          </h1>
          <p className="text-gray-500 mt-1">今日血压情况一目了然</p>
        </div>
        <button
          onClick={() => navigate("/records/new")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          记录血压
        </button>
      </div>

      <RetestAlertBanner />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="card p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform"
          >
            <div
              className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10`}
              style={{ transform: "translate(30%, -30%)" }}
            />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">{stat.label}</p>
                <p className="text-3xl font-bold font-serif text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg text-white`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary-600" />
                最近记录
              </h2>
              <button
                onClick={() => navigate("/records")}
                className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:text-primary-700"
              >
                查看全部
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {recentRecords.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">还没有记录，开始测量一下吧</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRecords.map((record) => (
                  <RecordCard key={record.id} record={record} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="section-title mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              复测完成率
            </h2>
            <div className="text-center py-4">
              <div className="relative w-36 h-36 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    fill="none"
                    stroke={
                      retestStats.rate === 100
                        ? "#10B981"
                        : retestStats.rate >= 70
                        ? "#2563EB"
                        : "#EF4444"
                    }
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(retestStats.rate / 100) * 376.99} 376.99`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold font-serif text-gray-900">
                    {retestStats.rate}%
                  </span>
                  <span className="text-sm text-gray-500">完成率</span>
                </div>
              </div>
              <div className="flex justify-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-bold text-gray-900">{retestStats.completed}</p>
                  <p className="text-gray-500">已完成</p>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="text-center">
                  <p className="font-bold text-gray-900">
                    {retestStats.total - retestStats.completed}
                  </p>
                  <p className="text-gray-500">未完成</p>
                </div>
              </div>
            </div>
          </div>

          {pendingRetests.length > 0 && (
            <div className="card bg-amber-50 border border-amber-200">
              <h2 className="section-title mb-3 text-amber-800">⚠️ 待复测提醒</h2>
              <div className="space-y-2">
                {pendingRetests.slice(0, 3).map((record) => {
                  const elder = profiles.find((p) => p.id === record.elderId);
                  return (
                    <div
                      key={record.id}
                      className="flex items-center justify-between py-2 px-3 rounded-xl bg-white"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getFeelingEmoji(record.feeling)}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {elder?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(record.measureTime)} · {record.systolic}/
                            {record.diastolic}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/records/${record.id}/retest`)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
                      >
                        复测
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
