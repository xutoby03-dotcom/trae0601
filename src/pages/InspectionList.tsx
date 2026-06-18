import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Plus, Calendar, User } from 'lucide-react';
import { useAppStore } from '@/store';
import { formatDate, formatDateTime } from '@/utils/helpers';
import { ERASER_STATUS_LABELS, ERASER_STATUS_COLORS } from '@/utils/constants';

export default function InspectionList() {
  const navigate = useNavigate();
  const { rooms, inspections } = useAppStore();

  const roomsNeedingInspection = rooms.filter((r) => {
    const lastInspection = inspections
      .filter((i) => i.roomId === r.id)
      .sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime())[0];
    if (!lastInspection) return true;
    const daysSince = Math.floor(
      (Date.now() - new Date(lastInspection.inspectionDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince >= 3;
  });

  const sortedInspections = [...inspections].sort(
    (a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime()
  );

  return (
    <div className="space-y-6">
      {roomsNeedingInspection.length > 0 && (
        <div className="card p-5 border-accent-200 bg-gradient-to-r from-accent-50 to-white">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-500 flex items-center justify-center flex-shrink-0">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">待巡检会议室</h3>
                <p className="text-slate-600 mt-1">
                  有 {roomsNeedingInspection.length} 个会议室已超过3天未巡检，请及时安排
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {roomsNeedingInspection.map((room) => (
              <button
                key={room.id}
                onClick={() => navigate(`/inspection/${room.id}`)}
                className="p-3 bg-white rounded-lg hover:bg-accent-100 transition-colors text-left border border-accent-200"
              >
                <p className="font-medium text-slate-700 text-sm truncate">{room.name}</p>
                <p className="text-xs text-slate-500">{room.floor}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">快速巡检</h3>
          <p className="text-sm text-slate-500">选择会议室开始巡检</p>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => navigate(`/inspection/${room.id}`)}
              className="p-4 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-left group"
            >
              <div className="aspect-video rounded-lg overflow-hidden mb-3">
                <img
                  src={room.photoUrl}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="font-medium text-slate-700 text-sm truncate">{room.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{room.floor}</p>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">{room.capacity}人</span>
                <Plus className="w-4 h-4 text-primary-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-slate-800">巡检历史记录</h3>
          <span className="text-sm text-slate-500">共 {inspections.length} 条记录</span>
        </div>

        {sortedInspections.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardCheck className="w-16 h-16 mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500">暂无巡检记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">会议室</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">巡检员</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">时间</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">板擦状态</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">清洁液</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">备注</th>
                </tr>
              </thead>
              <tbody>
                {sortedInspections.map((inspection) => {
                  const room = rooms.find((r) => r.id === inspection.roomId);
                  return (
                    <tr
                      key={inspection.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-700">{room?.name || '未知'}</p>
                        <p className="text-xs text-slate-400">{room?.floor}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700">{inspection.inspector}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600 font-mono">
                            {formatDateTime(inspection.inspectionDate)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`badge ${ERASER_STATUS_COLORS[inspection.eraserStatus]}`}>
                          {ERASER_STATUS_LABELS[inspection.eraserStatus]}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-500 rounded-full"
                              style={{ width: `${inspection.cleanerLevel}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-600 font-mono">{inspection.cleanerLevel}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-600 max-w-xs truncate">{inspection.notes || '-'}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
