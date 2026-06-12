import ElderSelector from "./ElderSelector";
import { Bell, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";
import { getPendingRetestRecords } from "@/utils/bpUtils";

export default function Header() {
  const navigate = useNavigate();
  const { records, selectedElderId } = useAppStore();

  const elderRecords = selectedElderId
    ? records.filter((r) => r.elderId === selectedElderId)
    : records;
  const pendingRetests = getPendingRetestRecords(elderRecords);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40 px-8 flex items-center justify-between">
      <div>
        <h2 className="font-serif text-lg font-semibold text-gray-900">
          {new Date().toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <ElderSelector />

        <button
          onClick={() => navigate("/records/new")}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          记录血压
        </button>

        <button className="relative p-2.5 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          {pendingRetests.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse-red">
              {pendingRetests.length}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
