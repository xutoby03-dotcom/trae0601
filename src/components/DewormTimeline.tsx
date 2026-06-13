import { Pill, Syringe, Trash2, User, AlertTriangle } from "lucide-react";
import type { DewormRecord } from "../types";
import { formatDateDisplay } from "../utils/date";
import { getTypeColor, getTypeLabel, getTypeDotColor } from "../utils/deworm";
import { usePetStore } from "../store/petStore";
import { Link } from "react-router-dom";

interface DewormTimelineProps {
  records: DewormRecord[];
  petId: string;
}

export default function DewormTimeline({ records, petId }: DewormTimelineProps) {
  const deleteRecord = usePetStore((s) => s.deleteDewormRecord);
  const sorted = [...records]
    .filter((r) => r.petId === petId)
    .sort(
      (a, b) =>
        new Date(b.dateUsed).getTime() - new Date(a.dateUsed).getTime()
    );

  if (sorted.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-ink-50 flex items-center justify-center mb-3">
          <Syringe className="w-7 h-7 text-ink-300" />
        </div>
        <p className="text-ink-500 font-medium">暂无驱虫记录</p>
        <p className="text-sm text-ink-400 mt-1">添加第一条记录开始追踪吧</p>
        <Link to={`/pet/${petId}/deworm/new`} className="btn-primary mt-4">
          添加驱虫记录
        </Link>
      </div>
    );
  }

  return (
    <div className="relative pl-6">
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-ink-100" />
      <div className="space-y-4">
        {sorted.map((r, i) => (
          <div
            key={r.id}
            className="relative animate-fade-in-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div
              className={`absolute -left-[10px] top-4 w-[22px] h-[22px] rounded-full ${getTypeDotColor(
                r.type
              )} flex items-center justify-center ring-4 ring-white`}
            >
              {r.type === "internal" ? (
                <Pill className="w-3 h-3 text-white" />
              ) : (
                <Syringe className="w-3 h-3 text-white" />
              )}
            </div>
            <div className="card-hover p-4 ml-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-ink-800">
                      {r.medicineName}
                    </h4>
                    <span className={`chip ${getTypeColor(r.type)}`}>
                      {getTypeLabel(r.type)}
                    </span>
                    {r.hasAdverseReaction && (
                      <span className="chip bg-alert-100 text-alert-600">
                        <AlertTriangle className="w-3 h-3" />
                        有不良反应
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-ink-500 flex-wrap">
                    <span>
                      剂量: {r.dosage}
                      {r.dosageUnit}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {r.operator}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="text-xs">
                      <span className="text-ink-400">使用日期: </span>
                      <span className="text-ink-600 font-medium">
                        {formatDateDisplay(r.dateUsed)}
                      </span>
                    </div>
                    <div className="text-xs">
                      <span className="text-ink-400">下次: </span>
                      <span className="text-ink-600 font-medium">
                        {formatDateDisplay(r.nextDate)}
                      </span>
                    </div>
                    {r.expiryDate && (
                      <div className="text-xs">
                        <span className="text-ink-400">有效期至: </span>
                        <span className="text-ink-600 font-medium">
                          {formatDateDisplay(r.expiryDate)}
                        </span>
                      </div>
                    )}
                  </div>
                  {r.hasAdverseReaction && r.reactionNote && (
                    <p className="mt-2 text-xs text-alert-600 bg-alert-50 rounded-lg p-2">
                      ⚠️ {r.reactionNote}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteRecord(r.id)}
                  className="p-2 rounded-full text-ink-300 hover:text-alert-500 hover:bg-alert-50 transition-colors"
                  title="删除记录"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
