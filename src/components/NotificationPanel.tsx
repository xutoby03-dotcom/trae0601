import { X } from 'lucide-react';
import { useStore } from '../store';

export default function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, markNotificationRead } = useStore(s => ({
    notifications: s.notifications,
    markNotificationRead: s.markNotificationRead,
  }));

  return (
    <div className="absolute right-0 top-12 w-80 card shadow-lg border rounded-xl overflow-hidden z-50">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <span className="font-semibold text-gray-800">通知中心</span>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
          <X size={16} />
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">暂无通知</div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${!n.read ? 'bg-indigo-50' : ''}`}
              onClick={() => markNotificationRead(n.id)}
            >
              <div className="text-sm text-gray-800">{n.message}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(n.createdAt).toLocaleString('zh-CN')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
