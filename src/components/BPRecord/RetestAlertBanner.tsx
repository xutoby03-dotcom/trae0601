import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Clock, X } from "lucide-react";
import type { BloodPressureRecord } from "@/types";
import { isRetestOverdue, getRetestRemainingMinutes, formatTime } from "@/utils/bpUtils";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";

export default function RetestAlertBanner() {
  const navigate = useNavigate();
  const { records, profiles, selectedElderId } = useAppStore();
  const [, forceUpdate] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => forceUpdate((x) => x + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const pendingRecords = records
    .filter(
      (r) =>
        r.needsRetest &&
        !r.retestCompleted &&
        !r.originalRecordId &&
        (!selectedElderId || r.elderId === selectedElderId) &&
        !dismissed.includes(r.id)
    )
    .sort((a, b) => {
      const aOverdue = isRetestOverdue(a);
      const bOverdue = isRetestOverdue(b);
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
      return getRetestRemainingMinutes(a) - getRetestRemainingMinutes(b);
    });

  if (pendingRecords.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {pendingRecords.map((record: BloodPressureRecord) => {
        const elder = profiles.find((p) => p.id === record.elderId);
        const overdue = isRetestOverdue(record);
        const remaining = getRetestRemainingMinutes(record);

        return (
          <div
            key={record.id}
            className={cn(
              "relative flex items-center gap-4 p-5 rounded-2xl overflow-hidden animate-slide-in-right",
              overdue
                ? "bg-gradient-to-r from-danger-500 to-danger-600 text-white"
                : "bg-gradient-to-r from-amber-400 to-amber-500 text-white"
            )}
          >
            {overdue && (
              <div className="absolute inset-0 bg-white/10 animate-pulse-red" />
            )}
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                overdue ? "bg-white/20" : "bg-white/25"
              )}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{elder?.name || "未知"}</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  overdue ? "bg-white/20" : "bg-white/25"
                )}>
                  {overdue ? "复测已超时" : "等待复测"}
                </span>
              </div>
              <p className="text-sm opacity-90 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(record.measureTime)} 测量 ·
                高压 {record.systolic}/低压 {record.diastolic} ·
                {overdue ? "请立即复测" : remaining > 0 ? `剩余 ${remaining} 分钟` : "即将超时"}
              </p>
            </div>

            <button
              onClick={() => navigate(`/records/${record.id}/retest`)}
              className={cn(
                "px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-105 active:scale-95",
                overdue ? "bg-white text-danger-600" : "bg-white text-amber-600"
              )}
            >
              立即复测
            </button>

            <button
              onClick={() => setDismissed([...dismissed, record.id])}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
