import { useState } from "react";
import { Bell, X } from "lucide-react";
import { useStore } from "@/store";
import { formatDateTime } from "@/utils/date";
import { useNavigate } from "react-router-dom";

export default function Header({ title }: { title: string }) {
  const [showPanel, setShowPanel] = useState(false);
  const reminders = useStore((s) => s.reminders);
  const unread = reminders.filter((r) => !r.read);
  const markRead = useStore((s) => s.markReminderRead);
  const navigate = useNavigate();

  const handleClick = (r: (typeof reminders)[0]) => {
    markRead(r.id);
    setShowPanel(false);
    if (r.plantId) navigate(`/plants/${r.plantId}`);
    else if (r.issueId) navigate("/issues");
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-forest-100 px-8 flex items-center justify-between sticky top-0 z-40">
      <h2 className="font-serif text-2xl font-semibold text-forest-800">
        {title}
      </h2>

      <div className="relative">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="relative w-11 h-11 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center transition-colors"
        >
          <Bell className="w-5 h-5 text-forest-700" />
          {unread.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-warning text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unread.length > 9 ? "9+" : unread.length}
            </span>
          )}
        </button>

        {showPanel && (
          <div className="absolute right-0 top-14 w-96 bg-white rounded-2xl shadow-card-hover border border-forest-100 overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-forest-100 flex items-center justify-between bg-cream-50">
              <h3 className="font-semibold text-forest-800">消息提醒</h3>
              <button
                onClick={() => setShowPanel(false)}
                className="p-1 hover:bg-cream-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-forest-600" />
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {reminders.length === 0 ? (
                <div className="p-8 text-center text-forest-500">
                  暂无提醒消息
                </div>
              ) : (
                reminders.slice(0, 10).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleClick(r)}
                    className={`w-full p-4 text-left border-b border-forest-50 hover:bg-cream-50 transition-colors ${
                      !r.read ? "bg-cream-50/60" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                          r.type === "missed_service"
                            ? "bg-amber-danger"
                            : r.type === "missing_photo"
                            ? "bg-amber-warning"
                            : "bg-forest-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-forest-800">
                          {r.title}
                        </p>
                        <p className="text-xs text-forest-500 mt-1 line-clamp-2">
                          {r.description}
                        </p>
                        <p className="text-xs text-forest-400 mt-1">
                          {formatDateTime(r.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
