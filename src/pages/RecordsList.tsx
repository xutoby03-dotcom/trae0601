import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ClipboardList } from "lucide-react";
import { useAppStore } from "@/store";
import RecordCard from "@/components/BPRecord/RecordCard";
import RetestAlertBanner from "@/components/BPRecord/RetestAlertBanner";
import { parseISO, format } from "date-fns";
import { cn } from "@/lib/utils";

export default function RecordsList() {
  const navigate = useNavigate();
  const { records, selectedElderId, profiles } = useAppStore();

  const filteredRecords = useMemo(() => {
    let result = records.filter((r) => !r.originalRecordId);
    if (selectedElderId) {
      result = result.filter((r) => r.elderId === selectedElderId);
    }
    return result.sort(
      (a, b) => parseISO(b.measureTime).getTime() - parseISO(a.measureTime).getTime()
    );
  }, [records, selectedElderId]);

  const groupedRecords = useMemo(() => {
    const groups: Record<string, typeof filteredRecords> = {};
    filteredRecords.forEach((record) => {
      const date = format(parseISO(record.measureTime), "yyyy年MM月dd日");
      if (!groups[date]) groups[date] = [];
      groups[date].push(record);
    });
    return groups;
  }, [filteredRecords]);

  const selectedElder = profiles.find((p) => p.id === selectedElderId);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">血压记录</h1>
          <p className="text-gray-500 mt-1">
            {selectedElder ? `${selectedElder.name}的血压记录` : "查看所有血压记录历史"}
          </p>
        </div>
        <button
          onClick={() => navigate("/records/new")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新增记录
        </button>
      </div>

      <RetestAlertBanner />

      {filteredRecords.length === 0 ? (
        <div className="card text-center py-16">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">还没有血压记录</h3>
          <p className="text-gray-500 mb-6">开始记录第一次测量吧</p>
          <button onClick={() => navigate("/records/new")} className="btn-primary">
            记录血压
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedRecords).map(([date, dayRecords], groupIndex) => {
            const dateObj = parseISO(dayRecords[0].measureTime);
            const today = new Date();
            const isToday =
              format(dateObj, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
            const isYesterday =
              format(dateObj, "yyyy-MM-dd") ===
              format(new Date(today.getTime() - 86400000), "yyyy-MM-dd");

            return (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="font-serif text-lg font-semibold text-gray-800">
                    {date}
                  </h2>
                  <span
                    className={cn(
                      "tag",
                      isToday
                        ? "bg-primary-100 text-primary-700"
                        : isYesterday
                        ? "bg-gray-100 text-gray-700"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {isToday ? "今天" : isYesterday ? "昨天" : ""}
                  </span>
                  <span className="text-sm text-gray-400">
                    {dayRecords.length} 条记录
                  </span>
                </div>
                <div className="space-y-4 ml-4 relative">
                  <div
                    className="absolute left-[-20px] top-0 bottom-0 w-px bg-gray-200"
                    style={{
                      display:
                        groupIndex < Object.keys(groupedRecords).length - 1
                          ? "block"
                          : "none",
                    }}
                  />
                  {dayRecords.map((record) => (
                    <div key={record.id} className="relative">
                      <div className="absolute -left-8 top-6 w-3 h-3 rounded-full bg-primary-500 border-2 border-white shadow-md" />
                      <RecordCard record={record} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
