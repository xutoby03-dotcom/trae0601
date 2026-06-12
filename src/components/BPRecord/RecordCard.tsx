import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Clock, AlertTriangle, RefreshCw, Trash2, Camera } from "lucide-react";
import type { BloodPressureRecord, ElderProfile } from "@/types";
import {
  formatDateTime,
  formatTime,
  isRetestOverdue,
  getRetestRemainingMinutes,
  getFeelingEmoji,
} from "@/utils/bpUtils";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";

interface RecordCardProps {
  record: BloodPressureRecord;
  elder?: ElderProfile;
  showRetest?: boolean;
  isRetest?: boolean;
}

export default function RecordCard({ record, elder, showRetest = true, isRetest = false }: RecordCardProps) {
  const navigate = useNavigate();
  const { deleteRecord, profiles } = useAppStore();
  const [, forceUpdate] = useState(0);

  const profile = elder || profiles.find((p) => p.id === record.elderId);
  const overdue = isRetestOverdue(record);
  const remaining = getRetestRemainingMinutes(record);

  useEffect(() => {
    if (record.needsRetest && !record.retestCompleted) {
      const timer = setInterval(() => forceUpdate((x) => x + 1), 60000);
      return () => clearInterval(timer);
    }
  }, [record.needsRetest, record.retestCompleted]);

  const retestRecord = record.retestRecordId
    ? useAppStore.getState().records.find((r) => r.id === record.retestRecordId)
    : null;

  const handleDelete = () => {
    if (confirm("确定要删除这条血压记录吗？")) {
      deleteRecord(record.id);
    }
  };

  return (
    <div
      className={cn(
        "relative animate-fade-in",
        isRetest && "ml-8 mt-3"
      )}
    >
      {isRetest && (
        <div className="absolute -left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-300 to-transparent" />
      )}
      <div
        className={cn(
          "card p-5 transition-all",
          record.isAbnormal && !isRetest && "border-2 border-danger-200 bg-danger-50/30",
          overdue && "animate-pulse-red",
          isRetest && "bg-primary-50/50 border border-primary-100"
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {profile && (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-10 h-10 rounded-xl object-cover"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                {profile && <p className="font-medium text-gray-900">{profile.name}</p>}
                {isRetest && (
                  <span className="tag bg-primary-100 text-primary-700">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    复测结果
                  </span>
                )}
                {record.isAbnormal && !isRetest && (
                  <span className="tag bg-danger-100 text-danger-700">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    异常
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                {formatDateTime(record.measureTime)}
              </div>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-6 mb-4">
          <div className="text-center">
            <p className="text-3xl font-bold font-serif text-gray-900">{record.systolic}</p>
            <p className="text-xs text-gray-500">高压</p>
          </div>
          <div className="text-2xl text-gray-300">/</div>
          <div className="text-center">
            <p className="text-3xl font-bold font-serif text-gray-900">{record.diastolic}</p>
            <p className="text-xs text-gray-500">低压</p>
          </div>
          <div className="h-12 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-danger-500" />
            <div>
              <p className="text-xl font-bold font-serif text-gray-900">{record.heartRate}</p>
              <p className="text-xs text-gray-500">心率 bpm</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getFeelingEmoji(record.feeling)}</span>
            <span className="text-sm text-gray-600">{record.feeling}</span>
            {record.photo && (
              <div className="ml-2 relative group">
                <Camera className="w-4 h-4 text-gray-400" />
                <img
                  src={record.photo}
                  alt="测量照片"
                  className="absolute bottom-full left-0 mb-2 w-32 h-32 object-cover rounded-lg shadow-lg hidden group-hover:block z-10"
                />
              </div>
            )}
          </div>

          {showRetest && record.needsRetest && !record.retestCompleted && (
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "text-sm font-medium",
                  overdue ? "text-danger-600 animate-pulse-red" : "text-amber-600"
                )}
              >
                {overdue ? `已超时！请尽快复测` : remaining > 0 ? `${remaining}分钟内需复测` : `即将超时，请立即复测`}
              </span>
              <button
                onClick={() => navigate(`/records/${record.id}/retest`)}
                className={cn(
                  "px-4 py-2 rounded-xl font-medium text-sm transition-all",
                  overdue
                    ? "bg-danger-500 text-white hover:bg-danger-600 animate-pulse-red"
                    : "bg-primary-600 text-white hover:bg-primary-700"
                )}
              >
                立即复测
              </button>
            </div>
          )}

          {showRetest && record.needsRetest && record.retestCompleted && retestRecord && (
            <span className="tag bg-success-100 text-success-700">
              ✓ 已在 {formatTime(retestRecord.measureTime)} 复测
            </span>
          )}
        </div>
      </div>

      {retestRecord && showRetest && (
        <RecordCard
          key={retestRecord.id}
          record={retestRecord}
          elder={profile}
          showRetest={false}
          isRetest={true}
        />
      )}
    </div>
  );
}
