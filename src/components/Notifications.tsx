import { useEffect } from "react";
import { X, PackageCheck, Users } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import type { AppNotification } from "@/store/appStore";

export default function Notifications() {
  const notifications = useAppStore((state) => state.notifications);
  const dismissNotification = useAppStore((state) => state.dismissNotification);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md w-full pointer-events-none">
      {notifications.map((n) => (
        <NotificationCard
          key={n.id}
          notification={n}
          onClose={() => dismissNotification(n.id)}
        />
      ))}
    </div>
  );
}

function NotificationCard({
  notification,
  onClose,
}: {
  notification: AppNotification;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = notification.type === "success";

  return (
    <div
      className={`pointer-events-auto rounded-lg shadow-lg border overflow-hidden transition-all duration-300 ${
        isSuccess
          ? "bg-white border-emerald-200"
          : "bg-white border-zinc-200"
      }`}
    >
      <div
        className={`px-4 py-3 flex items-start gap-3 ${
          isSuccess ? "bg-emerald-50" : "bg-zinc-50"
        }`}
      >
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
            isSuccess ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-600"
          }`}
        >
          <PackageCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-zinc-800 text-sm">
            {notification.title}
          </h4>
          {notification.purchase && (
            <p className="text-xs text-zinc-500 mt-0.5">
              {notification.purchase.productName} {notification.purchase.size}码 · 入库 {notification.purchase.quantity} 件
              {notification.purchase.affectedCount > 0 && (
                <span className="text-emerald-600 font-medium ml-1">
                  · 带动 {notification.purchase.affectedCount} 笔申请可发放
                </span>
              )}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-600 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {notification.orders && notification.orders.length > 0 && (
        <div className="px-4 py-3 max-h-64 overflow-y-auto">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>以下申请已转为可发放</span>
          </div>
          <ul className="space-y-2">
            {notification.orders.map((order) => (
              <li
                key={order.id}
                className="flex items-center justify-between text-sm pl-4 border-l-2 border-emerald-300"
              >
                <div>
                  <div className="font-medium text-zinc-700">
                    {order.studentName || "未知学生"}
                    <span className="text-xs text-zinc-400 font-normal ml-1.5">
                      {order.className || ""}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500">
                    {order.productName || ""} {order.size}码
                  </div>
                </div>
                <div className="text-emerald-600 font-semibold text-sm">
                  ×{order.quantity}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
